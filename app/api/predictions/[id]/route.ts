import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import Replicate from "replicate";
import prisma from "@/lib/prisma";
import { getFileStream, uploadFile } from "@/lib/s3";
import path from "path";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
    noStore();
  
    try {
        if (!params.id) {
            throw new Error("ID предсказания не указан");
        }

        if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error("REPLICATE_API_TOKEN не настроен");
        }

        console.log("Getting prediction status for ID:", params.id);

        // Получаем актуальный статус предсказания от Replicate
        const prediction = await replicate.predictions.get(params.id);

        console.log("Replicate prediction response:", prediction);

        // Если генерация успешно завершена и есть URL изображения
        if (prediction.status === "succeeded" && prediction.output) {
            const outputUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
            
            try {
                // Загружаем изображение из URL
                console.log("Downloading image from:", outputUrl);
                const imageBuffer = await getFileStream(outputUrl);
                
                // Определяем расширение файла из URL или используем .webp по умолчанию
                const fileExtension = path.extname(outputUrl) || '.webp';
                const fileName = `${params.id}${fileExtension}`;
                const objectKey = `generations/${fileName}`;

                console.log("Uploading to Yandex Cloud:", objectKey);
                
                // Загружаем в Yandex Cloud S3
                const s3Url = await uploadFile({
                    FileName: fileName,
                    fileBuffer: imageBuffer,
                    objectKey: objectKey
                });

                if (!s3Url) {
                    throw new Error("Ошибка загрузки в облачное хранилище");
                }

                console.log("Successfully uploaded to Yandex Cloud:", s3Url);

                // Сначала находим запись по predictionId
                const generation = await prisma.generation.findFirst({
                    where: {
                        predictionId: params.id
                    }
                });

                if (generation) {
                    // Обновляем найденную запись по id с URL из облачного хранилища
                    await prisma.generation.update({
                        where: {
                            id: generation.id
                        },
                        data: {
                            imgUrl: s3Url,
                            generation: prediction.status
                        }
                    });
                    console.log("Database updated with cloud URL:", s3Url);
                }
            } catch (uploadError) {
                console.error("Error uploading to cloud storage:", uploadError);
                // Даже если загрузка в облако не удалась, сохраняем оригинальный URL
                const generation = await prisma.generation.findFirst({
                    where: {
                        predictionId: params.id
                    }
                });

                if (generation) {
                    await prisma.generation.update({
                        where: {
                            id: generation.id
                        },
                        data: {
                            imgUrl: outputUrl,
                            generation: prediction.status
                        }
                    });
                    console.log("Database updated with original URL as fallback");
                }
            }
        }

        return NextResponse.json({ prediction }, { status: 200 });
    } catch (error: any) {
        // Подробное логирование ошибки
        console.error("Error getting prediction:", {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.response?.status
        });

        return NextResponse.json(
            { 
                error: error.message,
                details: error.response?.data || "Нет дополнительных деталей"
            },
            { status: error.response?.status || 500 }
        );
    }
}
