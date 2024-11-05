/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useTranslations } from "next-intl";
import { Carousel, Card } from "@/components/AppleCardsCarousel";
import Image from "next/image";

const CarouselSection = ({ gallery }: { gallery: any[] }) => {
    const t = useTranslations("Home");

    console.log("CarouselSection gallery:", gallery);

    const data = gallery.map(item => ({
        category: "Made by Flux.1 " + item.model,
        title: item.prompt || "",
        src: item.imgUrl,
        content: (
            <div className="w-full h-full">
                <Image
                    src={item.imgUrl}
                    alt={item.prompt || "Generated image"}
                    width={800}
                    height={800}
                    className="w-full h-full object-contain"
                />
            </div>
        )
    }))

    console.log("CarouselSection data:", data);

    const cards = data.map((card, index) => (
        <Card key={card.src} card={card} index={index} />
    ));

    return (
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h2 className="pl-4 mx-auto text-xl md:text-5xl font-bold text-neutral-800 dark:text-neutral-200 font-sans">
                {t("gallery.title")}
            </h2>
            <Carousel items={cards} />
        </div>
    );
};

export default CarouselSection;
