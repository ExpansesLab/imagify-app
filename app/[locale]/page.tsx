import { getServerAuthSession } from "@/auth";
import CTASection from "@/components/CTA/CTASection";
import FAQSection from "@/components/FAQ/FAQSection";
import FeatureSection from "@/components/Feature/FeatureSection";
import FooterSection from "@/components/Footer/FooterSection";
import HeroSection from "@/components/Hero/heroSection";
import HowItWorks from "@/components/How/HowItWorks";
import { Toaster } from "sonner";
import { getTranslations } from "next-intl/server";
import TestimonialsSection from "@/components/Testimonials/TestimonialsSection";
import TechnologySection from "@/components/Technology/TechnologySection";
import CarouselSection from "@/components/Carousel/CarouselSection";
import { languages, siteConfig } from "@/config/site";
import { getHomeGallery } from "@/services/handleImage";
import to from "await-to-js";

export async function generateMetadata({ params }: any) {
    const t = await getTranslations("Home");

    return {
        title: t("layoutTitle"),
        description: t("layoutDescription"),
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon.png",
            apple: "/favicon.png",
        },
        alternates: {
            canonical: `${siteConfig.url}${
                params.locale === "en" ? "" : `/${params.locale}`
            }`,
            languages: {
                ...Object.fromEntries(
                    languages.map((item) => [item.hrefLang, `/${item.lang}`])
                ),
                "x-default": "/",
            },
        },
    };
}

export default async function Home() {
    const [err, res] = await to(
        getHomeGallery([
            "cm329ct410009uth4sfcmtz0f",  // красивый пейзаж заката
            "cm329b5sw0007uth4mpansxbf",  // красивый закат на набережной
            "cm328vysx0005uth4qk4qzp9w",  // a beautiful sunset
            "cm31r28800003uth4c0q58jw9"   // buenos aires in a rainy day
        ])
    );

    if (err) {
        console.error(err)
    }

    const gallery = res?.generationList || []

    return (
        <main className="pt-4 relative z-50">
            <HeroSection />
            <FeatureSection />
            <HowItWorks />
            <CarouselSection gallery={gallery} />
            <TestimonialsSection />
            <TechnologySection />
            <CTASection />
            <FAQSection />
            <FooterSection />
            <Toaster position="top-center" richColors />
        </main>
    );
}
