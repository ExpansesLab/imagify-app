import to from "await-to-js";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Prediction {
    id: string;
    status: "starting" | "processing" | "succeeded" | "failed";
    output?: string[];
    error?: string;
}

export function usePrediction() {
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [generation, setGeneration] = useState<any>(null);
    const [translatedPrompt, setTranslatedPrompt] = useState<string | null>(null);
    const [generatedList, setGeneratedList] = useState<any[]>([]);
    const [error, setError] = useState<any>(null);
    const [isPolling, setIsPolling] = useState(false);

    // Функция для проверки статуса предсказания
    const checkPredictionStatus = async (predictionId: string) => {
        console.log("Checking prediction status for ID:", predictionId);
        
        const [err, response] = await to(fetch(`/api/predictions/${predictionId}`));
        
        if (err) {
            console.error("Error checking prediction status:", err);
            throw new Error("Не удалось проверить статус генерации");
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Prediction status check failed:", errorData);
            throw new Error(errorData.error || 'Ошибка при проверке статуса генерации');
        }

        const data = await response.json();
        console.log("Prediction status response:", data);
        
        return data.prediction;
    };

    // Функция для периодической проверки статуса
    const pollPredictionStatus = async (predictionId: string) => {
        console.log("Starting polling for prediction:", predictionId);
        setIsPolling(true);
        let attempts = 0;
        const maxAttempts = 60; // Максимум 1 минута при интервале в 1 секунду
        
        try {
            while (attempts < maxAttempts) {
                const prediction = await checkPredictionStatus(predictionId);
                setPrediction(prediction);
                console.log("Current prediction status:", prediction.status);

                if (prediction.status === "succeeded") {
                    console.log("Generation succeeded:", prediction.output);
                    const outputUrl = Array.isArray(prediction.output) 
                        ? prediction.output[0] 
                        : prediction.output;
                    setGeneration({ url: outputUrl });
                    break;
                }

                if (prediction.status === "failed") {
                    console.error("Generation failed:", prediction.error);
                    throw new Error(prediction.error || "Ошибка при генерации изображения");
                }

                attempts++;
                await sleep(1000);
            }

            if (attempts >= maxAttempts) {
                throw new Error("Превышено время ожидания генерации");
            }
        } catch (err: any) {
            console.error("Polling error:", err);
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsPolling(false);
        }
    };

    function resetState() {
        setPrediction(null);
        setGeneration(null);
        setTranslatedPrompt(null);
        setGeneratedList([]);
        setError(null);
        setIsPolling(false);
    }

    const handleSubmit = async (params: any) => {
        console.log("Starting generation with params:", params);
        resetState();
        
        try {
            // Создаем предсказание
            const [err1, response1] = await to(fetch("/api/predictions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            }));

            if (err1) {
                console.error("Failed to connect to server:", err1);
                throw new Error("Не удалось подключиться к серверу");
            }

            if (!response1.ok) {
                const errorData = await response1.json();
                console.error("Prediction creation failed:", errorData);
                throw new Error(errorData.error || 'Не удалось создать запрос на генерации');
            }

            const data = await response1.json();
            console.log("Prediction created:", data);
            
            if (!data.prediction?.id) {
                console.error("No prediction ID received:", data);
                throw new Error("Не получен ID предсказания от сервера");
            }

            // Сохраняем переведенный промпт, если он есть
            if (data.translatedPrompt) {
                setTranslatedPrompt(data.translatedPrompt);
                console.log("Translated prompt:", data.translatedPrompt);
            }

            // Начинаем проверять статус предсказания
            await pollPredictionStatus(data.prediction.id);

            // Возвращаем обновленное количество кредитов
            return { credits: data.credits };
        } catch (err: any) {
            console.error("Prediction error:", err);
            const errorMessage = err.message || "Произошла неизвестная ошибка";
            toast.error(errorMessage);
            setError(errorMessage);
            return Promise.reject(err);
        }
    };

    return {
        prediction,
        error,
        generatedList,
        setGeneratedList,
        generation,
        translatedPrompt,
        handleSubmit,
        isPolling,
    };
}

