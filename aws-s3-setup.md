# Инструкции по настройке AWS S3 (Cloudflare R2)

## 1. Создание бакета в Cloudflare R2:

* Перейдите на сайт Cloudflare R2 (https://dash.cloudflare.com/r2).
* Нажмите на кнопку "Create Bucket".
* Введите имя для вашего бакета (например, `my-bucket`).
* Выберите регион (например, `US-Central`).
* Нажмите на кнопку "Create Bucket".


## 2. Настройка доступа к бакету (ключи доступа):

* В разделе "Access Keys" нажмите на кнопку "Create Access Key".
* Введите имя для ключа доступа (например, `my-access-key`).
* Скопируйте Access Key ID и Secret Access Key.


## 3. Настройка переменных окружения в проекте:

* Откройте файл `.env` в вашем проекте.
* Добавьте следующие переменные окружения:
```
R2_ACCOUNT_ID=ваш_R2_ACCOUNT_ID
R2_ACCESS_KEY_ID=ваш_Access_Key_ID
R2_SECRET_ACCESS_KEY=ваш_Secret_Access_Key
R2_BUCKET=my-bucket
R2_DOMAIN_URL=ваш_R2_DOMAIN_URL
```
* Замените `ваш_R2_ACCOUNT_ID`, `ваш_Access_Key_ID`, `ваш_Secret_Access_Key` и `ваш_R2_DOMAIN_URL` на ваши значения.


## 4. Проверка корректности настроек:

* Запустите приложение.
* Попробуйте загрузить или скачать файл, используя функции из `lib/s3.ts`.
* Если все настроено правильно, файл должен быть успешно загружен или скачан.


## Дополнительные рекомендации:

* Вы можете настроить политику доступа к бакету, чтобы ограничить доступ к вашим данным.
* Вы можете использовать Cloudflare R2 для хранения статических файлов, таких как изображения, видео и другие ресурсы.
* Вы можете использовать Cloudflare R2 для резервного копирования данных.


# Российские альтернативы AWS S3

## 1. VK Cloud Solutions Object Storage

VK Cloud Solutions предоставляет S3-совместимое объектное хранилище, которое полностью соответствует российскому законодательству.

### Настройка VK Cloud Solutions:

1. Зарегистрируйтесь на [VK Cloud Solutions](https://mcs.mail.ru/)
2. Создайте проект в панели управления
3. В разделе "Объектное хранилище" создайте бакет
4. Получите ключи доступа (Access Key и Secret Key)
5. Измените переменные окружения:
```
VK_STORAGE_ENDPOINT=https://hb.bizmrg.com
VK_ACCESS_KEY=ваш_access_key
VK_SECRET_KEY=ваш_secret_key
VK_BUCKET=имя_вашего_бакета
```

### Изменения в коде:
```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const S3 = new S3Client({
    region: "ru-msk",
    endpoint: process.env.VK_STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: process.env.VK_ACCESS_KEY || "",
        secretAccessKey: process.env.VK_SECRET_KEY || "",
    },
});
```

## 2. Selectel Object Storage

Selectel предоставляет надежное объектное хранилище с серверами в России.

### Настройка Selectel:

1. Зарегистрируйтесь на [Selectel](https://selectel.ru/)
2. Создайте проект в панели управления
3. В разделе "Объектное хранилище" создайте бакет
4. Получите ключи доступа
5. Измените переменные окружения:
```
SELECTEL_AUTH_URL=https://api.selcdn.ru/auth/v1.0
SELECTEL_USERNAME=ваш_username
SELECTEL_PASSWORD=ваш_password
SELECTEL_CONTAINER=имя_контейнера
```

### Изменения в коде:
```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const S3 = new S3Client({
    region: "ru-1",
    endpoint: process.env.SELECTEL_AUTH_URL,
    credentials: {
        accessKeyId: process.env.SELECTEL_USERNAME || "",
        secretAccessKey: process.env.SELECTEL_PASSWORD || "",
    },
});
```

## 3. Yandex Object Storage

Yandex Cloud предоставляет S3-совместимое хранилище с серверами в России.

### Настройка Yandex Object Storage:

1. Зарегистрируйтесь в [Yandex Cloud](https://cloud.yandex.ru/)
2. Создайте сервисный аккаунт
3. Создайте статический ключ доступа
4. Создайте бакет
5. Измените переменные окружения:
```
YANDEX_ACCESS_KEY=ваш_access_key
YANDEX_SECRET_KEY=ваш_secret_key
YANDEX_BUCKET=имя_бакета
YANDEX_REGION=ru-central1
```

### Изменения в коде:
```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const S3 = new S3Client({
    region: process.env.YANDEX_REGION,
    endpoint: "https://storage.yandexcloud.net",
    credentials: {
        accessKeyId: process.env.YANDEX_ACCESS_KEY || "",
        secretAccessKey: process.env.YANDEX_SECRET_KEY || "",
    },
});
```

## 4. Mail.ru Cloud Solutions

Mail.ru Cloud Solutions предлагает объектное хранилище с поддержкой S3 API.

### Настройка Mail.ru Cloud Solutions:

1. Зарегистрируйтесь в [Mail.ru Cloud Solutions](https://cloud.mail.ru/)
2. Создайте проект
3. В разделе "Объектное хранилище" создайте бакет
4. Получите ключи доступа
5. Измените переменные окружения:
```
MAILRU_ACCESS_KEY=ваш_access_key
MAILRU_SECRET_KEY=ваш_secret_key
MAILRU_BUCKET=имя_бакета
```

### Изменения в коде:
```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const S3 = new S3Client({
    region: "ru-msk",
    endpoint: "https://hb.bizmrg.com",
    credentials: {
        accessKeyId: process.env.MAILRU_ACCESS_KEY || "",
        secretAccessKey: process.env.MAILRU_SECRET_KEY || "",
    },
});
```

## Рекомендации по миграции:

1. **Выбор провайдера:**
   * Оцените стоимость хранения и передачи данных
   * Проверьте географическое расположение серверов
   * Изучите SLA и техническую поддержку
   * Убедитесь в соответствии требованиям законодательства

2. **Процесс миграции:**
   * Создайте резервную копию всех данных
   * Настройте новое хранилище
   * Протестируйте функциональность на тестовых данных
   * Выполните поэтапную миграцию
   * Обновите конфигурацию приложения
   * Проведите тестирование после миграции

3. **Мониторинг:**
   * Настройте мониторинг доступности
   * Отслеживайте производительность
   * Контролируйте расходы
   * Регулярно проверяйте резервные копии
