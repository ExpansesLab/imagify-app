import { Inter } from "next/font/google";
import { getServerAuthSession } from "@/auth";
import Navbar from "@/components/Nav/Navbar";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "@/styles/globals.css";
import { getUserInfo } from "@/models/user";
import { languages, siteConfig } from "@/config/site";
import PrelineScript from "@/components/PrelineScript";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getMessages } from "next-intl/server";
import { cn } from "@/lib/utils";
import GradientBg from "@/components/Gradients/GradientBg";
import { AppContextProvider } from "@/contexts/AppContext";
import SessionProvider from "@/components/Providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata({ params }: any) {
    const t = await getTranslations("Home");

    return {
        title: t("mainTitle"),
        description: t("layoutDescription"),
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon.png",
            apple: "/favicon.png",
        },
        alternates: {
            canonical: `${siteConfig.url}${
                params.locale === "en" ? "" : `/${params.locale}`
            }/`,
            languages: {
                ...Object.fromEntries(
                    languages.map((item) => [item.hrefLang, `/${item.lang}`])
                ),
                "x-default": "/",
            },
        },
    };
}

const getSeverData = async (email: string) => {
    const userInfo = await getUserInfo(email);
    return {
        userInfo,
    };
};

export default async function RootLayout({
    children,
    params: { locale },
}: Readonly<{
    children: React.ReactNode;
    params: { locale: string };
}>) {
    let data: any = {};

    const session = await getServerAuthSession();
    if (session && session.user) {
        data = await getSeverData(session?.user?.email || "");
    }
    const user = session
        ? {
              ...session.user,
              ...data.userInfo,
          }
        : null;

    console.info(session);
    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={cn(`dark:bg-neutral-800`, inter.className)}>
                <Script
                    src="/themeSwitcher.js"
                    strategy="beforeInteractive"
                ></Script>
                <Script src="/spaghetti.js"></Script>
                <SessionProvider>
                    <NextIntlClientProvider messages={messages}>
                        <AppContextProvider user={user}>
                            <div className="relative overflow-x-hidden">
                                <GradientBg />
                                <Navbar user={user} />
                                {children}
                            </div>
                        </AppContextProvider>
                    </NextIntlClientProvider>
                </SessionProvider>
                {process.env.NODE_ENV !== "development" ? (
                    <>
                        <GoogleAnalytics />
                    </>
                ) : (
                    <></>
                )}
                <PrelineScript />
            </body>
        </html>
    );
}
