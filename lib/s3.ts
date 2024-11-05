import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import axios from "axios";
import { Readable } from "stream";
import fs from "fs";
import { lookup } from "mime-types";
import to from "await-to-js";

export interface UploadParams {
    FileName: string;
    fileBuffer: Buffer;
    objectKey: string;
}

export interface UploadImageParams {
    fileObject: File;
    objectKey: string;
}

export interface DownloadParams {
    objectKey: string;
    localFilePath: string;
}

// export const S3 = new S3Client({
//    region: "auto",
//    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//    credentials: {
//        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
//        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
//    },
//});
export const S3 = new S3Client({
    region: process.env.YANDEX_REGION,
    endpoint: "https://storage.yandexcloud.net",
    credentials: {
        accessKeyId: process.env.YANDEX_ACCESS_KEY || "",
        secretAccessKey: process.env.YANDEX_SECRET_KEY || "",
    },
    forcePathStyle: true // Важно для совместимости с Yandex Cloud
});

export async function getFileStream(
    url: string,
    responseType: string = "arraybuffer"
) {
    try {
        const [err, response] = await to(
            axios({
                method: "GET",
                url,
                responseType: "arraybuffer",
            })
        );

        if (err) return Promise.reject({ message: "Ошибка загрузки" });

        if (responseType === "arraybuffer") {
            return Buffer.from(response.data, "binary");
        } else {
            return response.data;
        }
    } catch (e) {
        console.log("download failed:", e);
        throw e;
    }
}

export async function downloadImage(params: DownloadParams) {
    const { localFilePath, objectKey } = params;
    const command = new GetObjectCommand({
        Bucket: process.env.YANDEX_BUCKET,
        Key: objectKey,
    });

    let data;

    try {
        data = await S3.send(command);
        const fileStream = Readable.from(data.Body as any);
        const writeStream = fs.createWriteStream(localFilePath);
        fileStream.pipe(writeStream);

        console.log("Файл успешно загружен:", localFilePath);
    } catch (error) {
        console.error("Ошибка загрузки файла:", error);
    }

    return data;
}

export async function uploadFile(params: UploadParams) {
    const { FileName, fileBuffer, objectKey } = params;

    try {
        const command = new PutObjectCommand({
            Bucket: process.env.YANDEX_BUCKET,
            Key: objectKey,
            Body: fileBuffer,
            ContentType: lookup(FileName) || 'application/octet-stream'
        });

        console.log("[UPLOADING]", objectKey);
        const data = await S3.send(command);
        console.log("Файл успешно загружен:", objectKey);

        // Формируем публичный URL для доступа к файлу
        return `https://${process.env.YANDEX_BUCKET}.storage.yandexcloud.net/${objectKey}`;
    } catch (error) {
        console.error("Ошибка загрузки файла:", error);
        throw error; // Пробрасываем ошибку дальше для обработки
    }
}
