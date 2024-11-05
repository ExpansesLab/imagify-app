"use client";

import { useTranslations } from "next-intl";
import React from "react";

const EmptyGallery = () => {
    const t = useTranslations("Explore");

    return (
        <div className="text-center py-10 px-4 sm:px-6 lg:px-8">
            <div className="block text-2xl font-bold text-gray-800 dark:text-white">
                {t("emptyGallery.title")}
            </div>
            <p className="mt-3 text-gray-600 dark:text-neutral-400">
                {t("emptyGallery.description")}
            </p>
            <div className="mt-5 flex flex-col justify-center items-center gap-2 sm:flex-row sm:gap-3">
                <a
                    className="w-full sm:w-auto py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    href="/ai-image-generator"
                    title="Flux ai image generator"
                >
                    <svg
                        className="shrink-0 size-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    {t("emptyGallery.buttonText")}
                </a>
            </div>
        </div>
    );
};

export default EmptyGallery;
