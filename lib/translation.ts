// Функция для определения является ли текст русским
// Проверяет наличие кириллических символов в тексте
function isRussianText(text: string): boolean {
    // Регулярное выражение для поиска кириллических символов
    const cyrillicPattern = /[\u0400-\u04FF]/;
    return cyrillicPattern.test(text);
}

// Функция для перевода текста с русского на английский
// Использует Google Translate API
async function translateToEnglish(text: string): Promise<string> {
    try {
        // Проверяем, является ли текст русским
        if (!isRussianText(text)) {
            return text; // Возвращаем исходный текст, если он не на русском
        }

        // URL для Google Translate API
        const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;

        // Отправляем запрос на перевод
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'ru',
                target: 'en',
                format: 'text'
            })
        });

        if (!response.ok) {
            throw new Error('Translation API request failed');
        }

        const data = await response.json();
        
        // Извлекаем переведенный текст из ответа
        const translatedText = data.data.translations[0].translatedText;
        
        console.log('Translation successful:', {
            original: text,
            translated: translatedText
        });

        return translatedText;

    } catch (error) {
        console.error('Translation error:', error);
        // В случае ошибки возвращаем исходный текст
        return text;
    }
}

export { isRussianText, translateToEnglish };
