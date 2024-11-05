export const yookassaConfig = {
    // Тестовые данные магазина
    testShopId: '485017',
    testSecretKey: 'test_IotV7QAqY98T1n_TXe7Gh8H08PprTbTrl3i46M5tslI',
    
    // Боевые данные магазина
    shopId: process.env.YOOKASSA_SHOP_ID || '',
    secretKey: process.env.YOOKASSA_SECRET_KEY || '',
    
    // Общие настройки
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/payment/status`, // Убираем жестко заданную локаль
    webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/payment/webhook`,
    currency: 'RUB',
    locale: 'ru_RU',
    capture: true,

    // Тестовые карты
    testCards: {
        success: {
            number: '4111 1111 1111 1111',
            expiry: '12/24',
            cvc: '000'
        },
        failure: {
            number: '5555 5555 5555 5599',
            expiry: '12/24',
            cvc: '000'
        },
        threeDSecure: {
            number: '4111 1111 1111 1026',
            expiry: '12/24',
            cvc: '000'
        }
    },

    // Пакеты кредитов
    plans: {
        basic: {
            amount: 999,
            credits: 100,
            description: '100 кредитов для генерации изображений'
        },
        pro: {
            amount: 1999,
            credits: 300,
            description: '300 кредитов для генерации изображений'
        },
        premium: {
            amount: 2999,
            credits: 500,
            description: '500 кредитов для генерации изображений'
        }
    }
};

// Режим тестирования
export const isTestMode = process.env.NODE_ENV !== 'production';

// Получение актуальных учетных данных в зависимости от режима
export const getYooKassaCredentials = () => {
    if (isTestMode) {
        return {
            shopId: yookassaConfig.testShopId,
            secretKey: yookassaConfig.testSecretKey
        };
    }
    return {
        shopId: yookassaConfig.shopId,
        secretKey: yookassaConfig.secretKey
    };
};
