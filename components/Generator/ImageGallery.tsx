/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useTranslations } from "next-intl";
import React from "react";
import { Download } from "lucide-react";
import { Gallery } from "../ReactGridGallery";
import { formatDate } from "@/lib/utils";
import Pagination from "../Pagination/Pagination";

const ImageGallery = ({
    generationList,
    pageNo,
    total,
    pageSize,
    urlPrefix,
}: any) => {
    const t = useTranslations("Generation");

    function formatGenerationList(list: any[]) {
        if (list && list.length) {
            return list
                .filter((item) => item.imgUrl && item.isPublic) // Изменено с generation на imgUrl
                .map((item) => {
                    return {
                        id: item.id,
                        caption: item.prompt,
                        aspect_ratio: item.aspect_ratio,
                        isPublic: item.isPublic,
                        src: item.imgUrl, // Используем imgUrl для отображения
                        model: item.model || "schnell",
                        createdAt: formatDate(item.createdAt),
                        width: item.width ? Number(item.width) / 3 : 340,
                        height: item.height ? Number(item.height) / 3 : 340,
                        href: `/image/${item.id}`,

                        customOverlay: (
                            <div className="inset-0 absolute bg-black bg-opacity-60 flex items-end justify-center p-3 transition-all duration-300">
                                <span className="absolute top-3 right-3 inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/80 dark:text-blue-100">
                                    Flux.1 {item.model || "schnell"}
                                </span>
                                <div className="text-sm text-white">
                                    {item.prompt}
                                </div>
                            </div>
                        ),
                    };
                });
        } else {
            return [];
        }
    }

    const imageList = formatGenerationList(generationList);

    return (
        <>
            <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16">
                <Gallery
                    images={imageList}
                    enableImageSelection={false}
                    rowHeight={340}
                    defaultContainerWidth={340}
                    margin={4}
                    tagStyle={{}}
                />
            </section>
            <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16 flex justify-center">
                <Pagination
                    urlPrefix={urlPrefix}
                    total={total}
                    page={pageNo}
                    pageSize={pageSize}
                />
            </section>
        </>
    );
};

export default ImageGallery;