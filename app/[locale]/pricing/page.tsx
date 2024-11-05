import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import BuyCreditsButton from "@/components/Pricing/SubscribeButton";
import Link from "next/link";

export default async function PricingPage() {
    const t = await getTranslations("Pricing");
    const session = await getServerSession();

    const plans = {
        free: {
            title: t("pricingPlans.free.planName"),
            price: 0,
            credits: 5,
        },
        basic: {
            title: t("pricingPlans.basic.planName"),
            price: 999,
            credits: 100,
        },
        pro: {
            title: t("pricingPlans.pro.planName"),
            price: 1999,
            credits: 300,
        },
        premium: {
            title: t("pricingPlans.premium.planName"),
            price: 2999,
            credits: 500,
        }
    };

    return (
        <main className="pt-4 relative z-50">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-16">
                {/* Header */}
                <div className="max-w-2xl mx-auto text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                        {t("pageTitle")}
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        {t("pageDescription")}
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
                    {/* Free Plan */}
                    <div className="flex flex-col border-2 border-blue-600 dark:border-blue-500 text-center rounded-xl p-8">
                        <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
                            {t("pricingPlans.free.planName")}
                        </h4>
                        <span className="mt-5 font-bold text-5xl text-gray-800 dark:text-gray-200">
                            ₽{plans.free.price}
                        </span>
                        <p className="mt-2 text-sm text-gray-500">RUB</p>
                        <div className="mt-5 text-gray-800 dark:text-gray-200">
                            <span className="font-bold text-2xl">{plans.free.credits}</span> кредитов
                        </div>
                        <ul className="mt-7 space-y-2.5 text-sm flex-grow">
                            {[...Array(Number(t("pricingPlans.free.features.length")))].map((_, index) => (
                                <li key={index} className="flex items-center gap-x-2">
                                    <svg className="w-3 h-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                    </svg>
                                    <span className="text-gray-800 dark:text-gray-200">{t(`pricingPlans.free.features.${index + 1}`)}</span>
                                </li>
                            ))}
                        </ul>
                        {!session?.user && (
                            <Link 
                                href="/sign-up"
                                className="mt-5 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800"
                            >
                                {t("SignBtn")}
                            </Link>
                        )}
                    </div>

                    {/* Basic Plan */}
                    <div className="flex flex-col border border-gray-200 dark:border-gray-700 text-center rounded-xl p-8 hover:border-blue-600 dark:hover:border-blue-500">
                        <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
                            {t("pricingPlans.basic.planName")}
                        </h4>
                        <span className="mt-5 font-bold text-5xl text-gray-800 dark:text-gray-200">
                            ₽{plans.basic.price}
                        </span>
                        <p className="mt-2 text-sm text-gray-500">RUB</p>
                        <div className="mt-5 text-gray-800 dark:text-gray-200">
                            <span className="font-bold text-2xl">{plans.basic.credits}</span> кредитов
                        </div>
                        <ul className="mt-7 space-y-2.5 text-sm flex-grow">
                            {[...Array(Number(t("pricingPlans.basic.features.length")))].map((_, index) => (
                                <li key={index} className="flex items-center gap-x-2">
                                    <svg className="w-3 h-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                    </svg>
                                    <span className="text-gray-800 dark:text-gray-200">{t(`pricingPlans.basic.features.${index + 1}`)}</span>
                                </li>
                            ))}
                        </ul>
                        <BuyCreditsButton
                            planId="basic"
                            className="mt-5 w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-blue-600 font-semibold text-blue-600 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                        >
                            Купить {plans.basic.credits} кредитов
                        </BuyCreditsButton>
                    </div>

                    {/* Pro Plan */}
                    <div className="flex flex-col border border-gray-200 dark:border-gray-700 text-center rounded-xl p-8 hover:border-blue-600 dark:hover:border-blue-500">
                        <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
                            {t("pricingPlans.pro.planName")}
                        </h4>
                        <span className="mt-5 font-bold text-5xl text-gray-800 dark:text-gray-200">
                            ₽{plans.pro.price}
                        </span>
                        <p className="mt-2 text-sm text-gray-500">RUB</p>
                        <div className="mt-5 text-gray-800 dark:text-gray-200">
                            <span className="font-bold text-2xl">{plans.pro.credits}</span> кредитов
                        </div>
                        <ul className="mt-7 space-y-2.5 text-sm flex-grow">
                            {[...Array(Number(t("pricingPlans.pro.features.length")))].map((_, index) => (
                                <li key={index} className="flex items-center gap-x-2">
                                    <svg className="w-3 h-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                    </svg>
                                    <span className="text-gray-800 dark:text-gray-200">{t(`pricingPlans.pro.features.${index + 1}`)}</span>
                                </li>
                            ))}
                        </ul>
                        <BuyCreditsButton
                            planId="pro"
                            className="mt-5 w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-blue-600 font-semibold text-blue-600 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                        >
                            Купить {plans.pro.credits} кредитов
                        </BuyCreditsButton>
                    </div>

                    {/* Premium Plan */}
                    <div className="flex flex-col border border-gray-200 dark:border-gray-700 text-center rounded-xl p-8 hover:border-blue-600 dark:hover:border-blue-500">
                        <h4 className="font-medium text-lg text-gray-800 dark:text-gray-200">
                            {t("pricingPlans.premium.planName")}
                        </h4>
                        <span className="mt-5 font-bold text-5xl text-gray-800 dark:text-gray-200">
                            ₽{plans.premium.price}
                        </span>
                        <p className="mt-2 text-sm text-gray-500">RUB</p>
                        <div className="mt-5 text-gray-800 dark:text-gray-200">
                            <span className="font-bold text-2xl">{plans.premium.credits}</span> кредитов
                        </div>
                        <ul className="mt-7 space-y-2.5 text-sm flex-grow">
                            {[...Array(Number(t("pricingPlans.premium.features.length")))].map((_, index) => (
                                <li key={index} className="flex items-center gap-x-2">
                                    <svg className="w-3 h-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                                    </svg>
                                    <span className="text-gray-800 dark:text-gray-200">{t(`pricingPlans.premium.features.${index + 1}`)}</span>
                                </li>
                            ))}
                        </ul>
                        <BuyCreditsButton
                            planId="premium"
                            className="mt-5 w-full py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border-2 border-blue-600 font-semibold text-blue-600 hover:text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                        >
                            Купить {plans.premium.credits} кредитов
                        </BuyCreditsButton>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
                    <div className="max-w-2xl mx-auto text-center mb-10">
                        <h2 className="text-2xl font-bold md:text-3xl text-gray-800 dark:text-gray-200">
                            {t("faqTitle")}
                        </h2>
                    </div>

                    <div className="max-w-2xl mx-auto">
                        <div className="hs-accordion-group">
                            {[...Array(Number(t("faq.length")))].map((_, index) => (
                                <div key={index} className="hs-accordion hs-accordion-active:bg-gray-100 rounded-xl p-6 dark:hs-accordion-active:bg-white/[.05]" id={`hs-basic-with-title-and-arrow-${index}`}>
                                    <button className="hs-accordion-toggle group pb-3 inline-flex items-center justify-between gap-x-3 w-full md:text-lg font-semibold text-left text-gray-800 transition hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-400" aria-controls={`hs-basic-with-title-and-arrow-${index}`}>
                                        {t(`faq.${index + 1}.question`)}
                                        <svg className="hs-accordion-active:hidden block w-3 h-3 text-gray-600 group-hover:text-gray-500 dark:text-gray-400" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 5L8.16086 10.6869C8.35239 10.8637 8.64761 10.8637 8.83914 10.6869L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        <svg className="hs-accordion-active:block hidden w-3 h-3 text-gray-600 group-hover:text-gray-500 dark:text-gray-400" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M2 11L8.16086 5.31305C8.35239 5.13625 8.64761 5.13625 8.83914 5.31305L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </button>
                                    <div id={`hs-basic-with-title-and-arrow-${index}`} className="hs-accordion-content hidden w-full overflow-hidden transition-[height] duration-300">
                                        <p className="text-gray-800 dark:text-gray-200">
                                            {t(`faq.${index + 1}.answer`)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
