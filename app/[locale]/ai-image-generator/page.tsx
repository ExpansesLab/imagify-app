import { getServerAuthSession } from "@/auth";
import { Toaster } from "sonner";
import { getUserInfo } from "@/models/user";
import FooterSection from "@/components/Footer/FooterSection";
import { getTranslations } from "next-intl/server";
import ImageGeneratorWrapper from "@/components/Generator/ImageGeneratorWrapper";
import { languages, siteConfig } from "@/config/site";

export async function generateMetadata({ params }: any) {
    const t = await getTranslations("Generation");
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
            }/ai-image-generator`,
            languages: {
                ...Object.fromEntries(
                    languages.map((item) => [item.hrefLang, `/${item.lang}`])
                ),
                "x-default": "/ai-image-generator",
            },
        },
    };
}

export default async function GenerationPage({
    params: { locale },
}: {
    params: { locale: string };
}) {
    let user;
    const session: any = await getServerAuthSession();
    if (!session || !session.user) {
        user = null;
    } else {
        user = session?.user;
        const userInfo = await getUserInfo(user?.email || "");
        if (userInfo) {
            // Обновляем credits из базы данных
            user.credits = userInfo.credits;
        }
        const userId = userInfo ? userInfo.id : "";
        console.info("userId", userId);
        console.info("GenerationPage locale:", locale);
    }

    const t = await getTranslations("Generation");

    return (
        <main className="pt-4 relative z-50">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16">
                <div className="text-center mx-auto">
                    <div className="mt-5">
                        <h1 className="block font-semibold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
                            {t("pageTitle")}
                        </h1>
                    </div>

                    <div className="mt-5 max-w-5xl mx-auto">
                        <p className="text-lg text-gray-600 dark:text-neutral-400">
                            {t("pageDescription")}
                        </p>
                    </div>
                </div>
            </div>

            <ImageGeneratorWrapper initialUser={user} />
            <FooterSection />
            <Toaster position="top-center" richColors />
        </main>
    );
}
