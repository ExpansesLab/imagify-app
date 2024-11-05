# Imagify

Imagify это платформа для генерации изображений на основе Next.js, созданная с использованием AI моделей Flux и Stable Diffusion. Платформа даёт пользователям возможность создавать изображения высокого качества с помощью простых промтов.

[imagify.ru](https://imagify.ru)

## Технологический стек

### Основные технологии
- **Next.js 14** - Фреймворк для React приложений с серверным рендерингом
- **React 18** - JavaScript библиотека для построения пользовательских интерфейсов
- **TypeScript** - Типизированный JavaScript для более надежного кода
- **Prisma** - ORM для работы с базой данных
- **NextAuth.js** - Система аутентификации для Next.js приложений

### Стилизация и UI
- **Tailwind CSS** - Утилитарный CSS фреймворк
- **Preline** - UI компоненты для Tailwind CSS
- **Framer Motion** - Библиотека для анимаций
- **Radix UI** - Примитивы для построения доступных компонентов
- **Lucide React** - Набор иконок

### Интеграции и API
- **AWS S3** (@aws-sdk/client-s3) - Хранение изображений
- **YooKassa** (@a2seven/yoo-checkout) - Платежная система
- **Replicate** - API для генерации изображений
- **Gradio Client** - Интеграция с Gradio API

### Интернационализация
- **next-intl** - Библиотека для мультиязычности

### Работа с изображениями
- **react-grid-gallery** - Галерея изображений
- **react-medium-image-zoom** - Зум изображений
- **react-dropzone** - Загрузка файлов
- **image-size** - Определение размеров изображений

### Утилиты
- **clsx** и **tailwind-merge** - Утилиты для работы с классами
- **nanoid** - Генерация уникальных ID
- **axios** - HTTP клиент
- **lodash** - Утилиты для работы с данными

### Разработка
- **ESLint** - Линтер для JavaScript/TypeScript
- **PostCSS** - Инструмент для трансформации CSS
- **MDX** - Markdown с поддержкой JSX компонентов

## Реализованные функции

### 1. Генерация изображений
- Генерация изображений с помощью ИИ
- Галерея сгенерированных изображений
- Просмотр и управление изображениями
- Автоматический перевод русскоязычных промптов

### 2. Система аутентификации
- Регистрация пользователей
- Авторизация
- Управление профилем пользователя

### 3. Платежная система
- Интеграция с YooKassa
- Система подписок
- Обработка платежей
- Webhook для обработки статусов платежей

### 4. Мультиязычность
- Поддержка русского и английского языков
- Автоматическое определение языка
- Возможность переключения языков
- Автоматический перевод промптов для генерации

### 5. Хранение данных
- Хранение изображений в AWS S3
- База данных с использованием Prisma ORM

## Структура проекта

### Основные директории
- `/app` - Основные страницы и роуты приложения
- `/components` - React компоненты
- `/config` - Конфигурационные файлы
- `/hooks` - Пользовательские React хуки
- `/lib` - Вспомогательные функции и утилиты
- `/public` - Статические файлы
- `/styles` - Глобальные стили
- `/types` - TypeScript типы
- `/messages` - Файлы локализации

### Ключевые компоненты
- `ImageGenerator` - Компонент генерации изображений
- `ImageGallery` - Галерея изображений
- `ImageToolbar` - Панель инструментов для работы с изображениями
- `SubscribeButton` - Компонент для оформления подписки
- `SignButtonGroup` - Компоненты авторизации
- `SessionProvider` - Провайдер сессии пользователя

## API Endpoints

### Аутентификация
- `/api/auth/*` - Endpoints NextAuth.js
- `/api/auth/signup` - Регистрация пользователей

### Генерация изображений
- `/api/predictions` - Создание новой генерации
- `/api/predictions/[id]` - Получение статуса генерации

### Платежи
- `/api/payment/create` - Создание платежа
- `/api/payment/webhook` - Webhook для обработки статусов платежей

## Система перевода промптов

### Общая информация
Система автоматически определяет русскоязычные промпты и переводит их на английский язык перед отправкой в API генерации изображений. Это позволяет пользователям вводить промпты на русском языке, получая при этом качественные результаты.

### Компоненты системы перевода
1. **Определение языка** (`lib/translation.ts`):
   ```typescript
   function isRussianText(text: string): boolean
   ```
   Функция определяет наличие кириллических символов в тексте.

2. **Перевод текста** (`lib/translation.ts`):
   ```typescript
   async function translateToEnglish(text: string): Promise<string>
   ```
   Функция выполняет перевод текста с русского на английский.

3. **Хранение переводов** (`prisma/schema.prisma`):
   ```prisma
   model Generation {
     translatedPrompt String? @default("") @map("translated_prompt")
   }
   ```
   База данных хранит как оригинальный, так и переведенный промпт.

### Смена сервиса перевода

#### Текущая реализация (Google Translate)
```typescript
// lib/translation.ts
async function translateToEnglish(text: string): Promise<string> {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            q: text,
            source: 'ru',
            target: 'en',
            format: 'text'
        })
    });
    const data = await response.json();
    return data.data.translations[0].translatedText;
}
```

#### Переход на Яндекс.Переводчик
Для перехода на Яндекс.Переводчик необходимо:

1. Получить API-ключ в [Яндекс.Cloud](https://cloud.yandex.ru/docs/translate/)

2. Добавить переменную окружения:
```env
YANDEX_TRANSLATE_API_KEY=ваш-ключ
```

3. Изменить функцию перевода:
```typescript
// lib/translation.ts
async function translateToEnglish(text: string): Promise<string> {
    const url = 'https://translate.api.cloud.yandex.net/translate/v2/translate';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Api-Key ${process.env.YANDEX_TRANSLATE_API_KEY}`
        },
        body: JSON.stringify({
            texts: [text],
            sourceLanguageCode: 'ru',
            targetLanguageCode: 'en',
            format: 'PLAIN_TEXT'
        })
    });
    const data = await response.json();
    return data.translations[0].text;
}
```

#### Переход на другие сервисы перевода
Для интеграции любого другого сервиса перевода:

1. Создайте новую функцию перевода в `lib/translation.ts`
2. Обеспечьте тот же интерфейс:
   - Вход: строка на русском языке
   - Выход: Promise со строкой на английском языке
3. Обработайте ошибки и edge cases
4. Обновите переменные окружения
5. При необходимости обновите типы в `types/translation.d.ts`

## Настройка стоимости генерации

### Текущая реализация
Система использует фиксированную стоимость генерации - 1 кредит за каждое изображение независимо от выбранной модели. Доступны следующие модели для генерации:

- **flux.1 schnell** - Быстрая модель для базовой генерации
- **flux.1 dev** - Модель для разработки
- **flux.1 pro** - Профессиональная модель
- **flux 1.1 pro** - Улучшенная профессиональная модель
- **SD 3.5 medium** - Stable Diffusion 3.5 средней мощности
- **SD 3.5 large turbo** - Ускоренная версия большой модели SD 3.5
- **SD 3** - Stable Diffusion 3
- **SDXL** - Stable Diffusion XL

### Компоненты системы
1. **Списание кредитов** (`app/api/predictions/route.ts`):
   ```typescript
   // Проверка наличия кредитов
   if (userInfo.credits < 1) {
     throw new Error("Недостаточно кредитов для генерации изображения");
   }

   // Списание кредита
   await prisma.user.update({
     where: { id: userInfo.id },
     data: { credits: { decrement: 1 } }
   });
   ```

2. **Отображение стоимости** (`components/Generator/ImageGenerator.tsx`):
   ```typescript
   <span className="py-1 px-4 flex items-center gap-x-1 text-xs font-medium text-gray-100 rounded-full">
     <Icons.CreditsIcon />1
   </span>
   ```

3. **Хранение кредитов** (`prisma/schema.prisma`):
   ```prisma
   model User {
     credits Int @default(5)
   }
   ```

### Изменение стоимости
Для изменения стоимости генерации необходимо обновить:

1. Логику списания кредитов в `app/api/predictions/route.ts`
2. Отображение стоимости в компоненте `ImageGenerator`
3. При необходимости, начальное количество кредитов в схеме базы данных

## Кастомизация и вайтлейблинг

### Настройка брендинга

#### 1. Основные настройки сайта
Отредактируйте файл `config/site.ts`:
```typescript
export const siteConfig = {
  name: "Ваше название", // Название сайта
  url: "https://ваш-домен.com", // URL сайта
  domain: "ваш-домен.com", // Домен
  mail: "support@ваш-домен.com" // Email поддержки
};
```

#### 2. Визуальная идентичность
- **Логотип**: Замените файлы в директории `/public`:
  - `fluximage.svg` - векторный логотип
  - `fluximage.png` - растровый логотип
  - `favicon.png` - иконка сайта

#### 3. Цветовая схема
Настройте цвета в файле `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#ваш-цвет',
        // Добавьте оттенки
        light: '#ваш-светлый-оттенок',
        dark: '#ваш-темный-оттенок'
      },
      // Другие цвета бренда
    }
  }
}
```

### Кастомизация интерфейса

#### 1. Навигация
Отредактируйте файл `lib/navigation.ts` для изменения структуры меню:
```typescript
export const navigation = {
  main: [
    { name: "Ваш пункт меню", href: "/ваш-путь" },
    // Добавьте другие пункты меню
  ]
};
```

#### 2. Футер
Измените содержимое футера в `components/Footer/footerNavs.ts`:
```typescript
export const footerNavs = [
  {
    label: "Ваша категория",
    items: [
      { label: "Ваша ссылка", href: "/ваш-путь" },
      // Добавьте другие ссылки
    ]
  }
];
```

#### 3. Локализация
Отредактируйте файлы локализации в директории `/messages`:
- `ru.json` - для русского языка
- `en.json` - для английского языка

### Дополнительные возможности кастомизации

#### 1. Тарифные планы
Настройте тарифы в `config/pricing.ts`:
```typescript
export const pricingPlans = [
  {
    name: "Название тарифа",
    price: "Цена",
    features: ["Функция 1", "Функция 2"]
  }
];
```

#### 2. Интеграция платежной системы
В файле `config/yookassa.ts` настройте параметры YooKassa:
```typescript
export const yookassaConfig = {
  shopId: "ваш-shop-id",
  secretKey: "ваш-secret-key"
};
```

#### 3. Настройка SEO
Отредактируйте метаданные в файлах страниц (`app/[locale]/*/page.tsx`):
```typescript
export const metadata = {
  title: "Ваш заголовок",
  description: "Ваше описание"
};
```

## Запуск проекта

### Режим разработки
```bash
npm run dev
```

### Продакшн сборка
```bash
npm run build
npm run start
```

## Контакты
- **Email**: dev@expanses.co
