# Базовый образ для сборки
FROM node:20-alpine AS builder

# Установка системных зависимостей
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    linux-headers \
    binutils-gold \
    gnupg

# Установка pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Рабочая директория
WORKDIR /app

# Копирование файлов package.json и pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Установка зависимостей
RUN pnpm install --frozen-lockfile

# Копирование исходного кода
COPY . .

# Генерация Prisma клиента
RUN pnpm prisma generate

# Сборка приложения
RUN pnpm build

# Продакшн образ
FROM node:20-alpine AS runner

# Установка системных зависимостей
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    linux-headers

# Установка pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Установка только production зависимостей
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Копирование необходимых файлов из builder
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Копирование Prisma схемы и миграций
COPY --from=builder /app/prisma ./prisma

# Переменные окружения
ENV NODE_ENV=production
ENV PORT=3000

# База данных
ENV POSTGRES_PRISMA_URL=postgresql://POSTGRES_USERNAME:POSTGRES_PASSWORD@POSTGRES_HOST:POSTGRES_PORT
ENV POSTGRES_URL_NON_POOLING=postgresql://POSTGRES_USERNAME:POSTGRES_PASSWORD@POSTGRES_HOST:POSTGRES_PORT

# NextAuth конфигурация
ENV NEXTAUTH_URL=NEXTAUTH_DEPLOYMENT_URL
ENV NEXTAUTH_SECRET=NEXTAUTH_RANDOM_SECRET

# Email провайдер
ENV EMAIL_SERVER=smtp://EMAIL_USERNAME:EMAIL_PASSWORD@EMAIL_SMTP_HOST:EMAIL_SMTP_PORT
ENV EMAIL_FROM=EMAIL_SENDER_ADDRESS

# Replicate API
ENV REPLICATE_API_TOKEN=REPLICATE_API_TOKEN_PLACEHOLDER

# YooKassa
ENV YOOKASSA_SHOP_ID=YOOKASSA_SHOP_ID_PLACEHOLDER
ENV YOOKASSA_SECRET_KEY=YOOKASSA_SECRET_KEY_PLACEHOLDER
ENV NEXT_PUBLIC_APP_URL=APP_DEPLOYMENT_URL

# Google Translate API
ENV GOOGLE_TRANSLATE_API_KEY=GOOGLE_TRANSLATE_API_KEY_PLACEHOLDER

# Yandex Cloud
ENV YANDEX_ACCESS_KEY=YANDEX_ACCESS_KEY_PLACEHOLDER
ENV YANDEX_SECRET_KEY=YANDEX_SECRET_KEY_PLACEHOLDER
ENV YANDEX_BUCKET=YANDEX_BUCKET_NAME_PLACEHOLDER
ENV YANDEX_REGION=YANDEX_REGION_PLACEHOLDER

# Экспозиция порта
EXPOSE 3000

# Запуск приложения
CMD ["node", "server.js"]
