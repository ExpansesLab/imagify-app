import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { getYooKassaCredentials, yookassaConfig, isTestMode } from "@/config/yookassa";
import prisma from "@/lib/prisma";

type PaymentStatus = 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | 'error';

// Функция для проверки статуса платежа
const checkPaymentStatus = async (orderId: string): Promise<{ status: PaymentStatus; error?: string }> => {
    try {
        console.log('Payment Status: Checking payment in database for orderId:', orderId);
        const dbPayment = await prisma.payment.findUnique({
            where: { tempPaymentId: orderId }
        });

        if (!dbPayment) {
            console.log('Payment Status: Payment not found in database');
            return { status: 'error', error: 'Payment not found' };
        }

        console.log('Payment Status: Found payment with status:', dbPayment.status);
        return { status: dbPayment.status as PaymentStatus };
    } catch (error) {
        console.error('Payment Status: Error checking payment:', error);
        return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

export async function generateMetadata() {
    const t = await getTranslations("Payment");
    return {
        title: t("status.title"),
        description: t("status.description"),
    };
}

export default async function PaymentStatusPage({
    params: { locale },
    searchParams,
}: {
    params: { locale: string };
    searchParams: { [key: string]: string | undefined };
}) {
    const t = await getTranslations("Payment");
    
    const orderId = searchParams.orderId;
    console.log('Payment Status: Checking order ID:', orderId);
    console.log('Payment Status: Current locale:', locale);

    if (!orderId) {
        console.log('Payment Status: No order ID provided');
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            {t("status.error.title")}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {t("status.error.description")}
                        </p>
                        <div className="mt-8">
                            <a
                                href={`/${locale}/pricing`}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {t("status.backToPricing")}
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const { status, error } = await checkPaymentStatus(orderId);

    if (status === 'succeeded') {
        redirect(`/${locale}/profile`);
    }

    const isPending = ['pending', 'waiting_for_capture'].includes(status);

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                {isTestMode && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            {t("status.testMode.title")}
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            <p className="mb-2">{t("status.testMode.description")}</p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>
                                    {t("status.testMode.successCard")}: {yookassaConfig.testCards.success.number}
                                </li>
                                <li>
                                    {t("status.testMode.failureCard")}: {yookassaConfig.testCards.failure.number}
                                </li>
                                <li>
                                    {t("status.testMode.threeDSecureCard")}: {yookassaConfig.testCards.threeDSecure.number}
                                </li>
                            </ul>
                            <p className="mt-2">
                                {t("status.testMode.cardInfo")}:<br />
                                {t("status.testMode.expiryDate")}: {yookassaConfig.testCards.success.expiry}<br />
                                CVC: {yookassaConfig.testCards.success.cvc}
                            </p>
                        </div>
                    </div>
                )}

                <div className="text-center">
                    {isPending ? (
                        <>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
                                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-300 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                                {t("status.pending.title")}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                {t("status.pending.description")}
                            </p>
                            <script
                                dangerouslySetInnerHTML={{
                                    __html: `
                                        setTimeout(function() {
                                            window.location.reload();
                                        }, 5000); // Увеличили интервал до 5 секунд
                                    `
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                                <svg className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                                {t("status.error.title")}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                {error || t("status.error.description")}
                            </p>
                        </>
                    )}
                </div>

                <div className="mt-8">
                    <a
                        href={`/${locale}/profile`}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        {t("status.goToProfile")}
                    </a>
                </div>

                {isTestMode && (
                    <div className="mt-4 text-center">
                        <a
                            href={`/${locale}/pricing`}
                            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            {t("status.backToPricing")}
                        </a>
                    </div>
                )}
            </div>
        </main>
    );
}
