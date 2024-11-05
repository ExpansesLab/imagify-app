import { NextResponse } from "next/server";
import Replicate from "replicate";
import prisma from "@/lib/prisma";
import { translateToEnglish } from "@/lib/translation";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

type ModelType = 'schnell' | 'dev' | 'pro' | '1.1-pro' | 'sd-3.5-medium' | 'sd-3.5-large-turbo' | 'sd-3' | 'sdxl';

interface PredictionParams {
    prompts: string;
    ratio: string;
    model: ModelType;
    isPublic: boolean;
    user: any;
}

interface ModelConfig {
    name: string;
    version: string;
}

const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
    'schnell': {
        name: 'black-forest-labs/flux-schnell',
        version: 'bf53bdb93d739c9c915091cfa5f49ca662d11273a5eb30e7a2ec1939bcf27a00'
    },
    'dev': {
        name: 'black-forest-labs/flux-dev',
        version: '93d72f81bd019dde2bfcba9585a6f74e600b13a43a96eb01a42da54f5ab4df6a'
    },
    'pro': {
        name: 'black-forest-labs/flux-pro',
        version: 'caf8d6bf110808c53bb90767ea81e1bbd0f0690ba37a4a24b27b17e2f9a5c011'
    },
    '1.1-pro': {
        name: 'black-forest-labs/flux-1.1-pro',
        version: 'a91bed9b0301d9d10b34b89b1f4d0255f2e2499c59576bfcd13405575dacdb25'
    },
    'sd-3.5-medium': {
        name: 'stability-ai/stable-diffusion-3.5-medium',
        version: '382c03890d801cb8950e2223983ab2f05383800473c1765a9211af752206d2ae'
    },
    'sd-3.5-large-turbo': {
        name: 'stability-ai/stable-diffusion-3.5-large-turbo',
        version: '342351808b401109da250c5998d4299f9e1cbcab566c12bb42785f21414a2321'
    },
    'sd-3': {
        name: 'stability-ai/stable-diffusion-3',
        version: 'a8d1db0fc9cd083dbbda86a399e2bf3c384df661479c9353c68fb6afb4436999'
    },
    'sdxl': {
        name: 'stability-ai/sdxl',
        version: '7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc'
    }
};

export async function POST(request: Request) {
    try {
        const { prompts, ratio, model, isPublic, user }: PredictionParams = await request.json();

        // Проверяем наличие необходимых переменных окружения
        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error("REPLICATE_API_TOKEN is not configured");
        }

        if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
            throw new Error("GOOGLE_TRANSLATE_API_KEY is not configured");
        }

        if (!user?.email) {
            throw new Error("Пользователь не авторизован");
        }

        const modelConfig = MODEL_CONFIGS[model];
        if (!modelConfig) {
            throw new Error("Неподдерживаемая модель");
        }

        // Получаем информацию о пользователе по email
        const userInfo = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, credits: true }
        });

        if (!userInfo) {
            throw new Error("Пользователь не найден");
        }

        if (userInfo.credits < 1) {
            throw new Error("Недостаточно кредитов для генерации изображения");
        }

        // Переводим промпт на английский язык, если он на русском
        const translatedPrompt = await translateToEnglish(prompts);

        // Логируем оригинальный и переведенный промпты для отладки
        console.log("Prompt translation:", {
            original: prompts,
            translated: translatedPrompt
        });

        console.log("Creating prediction with params:", {
            model: modelConfig.name,
            version: modelConfig.version,
            input: {
                prompt: translatedPrompt, // Используем переведенный промпт
                aspect_ratio: ratio
            }
        });

        // Создаем предсказание с конкретной версией модели
        const prediction = await replicate.predictions.create({
            version: modelConfig.version,
            model: modelConfig.name,
            input: {
                prompt: translatedPrompt, // Используем переведенный промпт
                aspect_ratio: ratio
            }
        });

        // Списываем кредит и создаем запись в БД в рамках транзакции
        const [updatedUser] = await prisma.$transaction([
            // Списываем 1 кредит
            prisma.user.update({
                where: { id: userInfo.id },
                data: { credits: { decrement: 1 } },
                select: { credits: true }
            }),
            // Создаем запись о генерации
            prisma.generation.create({
                data: {
                    predictionId: prediction.id,
                    prompt: prompts, // Сохраняем оригинальный промпт
                    translatedPrompt, // Добавляем переведенный промпт
                    aspect_ratio: ratio,
                    isPublic,
                    model: modelConfig.name,
                    userId: userInfo.id
                }
            })
        ]);

        console.log("Prediction created successfully:", prediction);

        // Возвращаем предсказание, обновленное количество кредитов и переведенный промпт
        return NextResponse.json({
            prediction,
            credits: updatedUser.credits,
            translatedPrompt // Возвращаем переведенный промпт для отображения пользователю
        }, { status: 201 });
    } catch (error: any) {
        // Подробное логирование ошибки
        console.error("Detailed error in predictions API:", {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.response?.status
        });

        // Возвращаем более информативную ошибку клиенту
        return NextResponse.json(
            { 
                error: error.message,
                details: error.response?.data || "No additional details available"
            },
            { status: error.response?.status || 500 }
        );
    }
}
