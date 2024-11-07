import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { YooCheckout } from '@a2seven/yoo-checkout';
import { getYooKassaCredentials, yookassaConfig, isTestMode } from "@/config/yookassa";
import prisma from "@/lib/prisma";

type PaymentStatus = 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | 'error';

interface Payment {
    id: string;
    status: PaymentStatus;
    amount: {
        value: string;
        currency: string;
    };
    metadata?: {
        userEmail?: string;
        credits?: number;
        planId?: string;
    };
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getPaymentWithRetry = async (checkout: YooCheckout, paymentId: string, attempts: number = 3): Promise<Payment> => {
    for (let i = 0; i < attempts; i++) {
        try {
            await delay(1000);
            const payment = await checkout.getPayment(paymentId);
            return payment as Payment;
        } catch (error) {
            if (i === attempts - 1) throw error;
            await delay(1000);
        }
    }
    throw new Error('Failed to get payment after retries');
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
    
    // Получаем paymentId из URL
    const paymentId = searchParams.orderId;
    console.log('Payment Status: Checking payment ID:', paymentId);
    console.log('Payment Status: Current locale:', locale);

    if (!paymentId) {
        console.log('Payment Status: No payment ID provided');
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

    try {
        // Проверяем статус платежа в базе данных
        const dbPayment = await prisma.payment.findUnique({
            where: { paymentId }
        });

        // Если платеж найден в базе и статус succeeded, показываем страницу успеха
        if (dbPayment?.status === 'succeeded') {
            console.log('Payment Status: Payment found in database with succeeded status');
            return (
                <main className="min-h-screen flex items-center justify-center px-4">
                    <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                                <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                                {t("status.success.title")}
                            </h2>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                {t("status.success.description")}
                            </p>
                            <script
                                dangerouslySetInnerHTML={{
                                    __html: `
                                        window.location.href = "/${locale}/profile";
                                    `
                                }}
                            />
                        </div>
                    </div>
                </main>
            );
        }

        const checkout = new YooCheckout({
            shopId: getYooKassaCredentials().shopId,
            secretKey: getYooKassaCredentials().secretKey
        });

        console.log('Payment Status: Fetching payment details...');
        const payment = await getPaymentWithRetry(checkout, paymentId);
        console.log('Payment Status: Payment details received:', payment);

        if (!payment) {
            throw new Error('Payment not found');
        }

        const isSuccess = payment.status === 'succeeded';
        const isPending = ['pending', 'waiting_for_capture'].includes(payment.status);

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
                                            }, 3000);
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
                                    {t("status.error.description")}
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
    } catch (error) {
        console.error('Payment Status: Error fetching payment status:', error);
        
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
                            <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            {t("status.pending.title")}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {t("status.pending.description")}
                        </p>
                        <div className="mt-8">
                            <a
                                href={`/${locale}/profile`}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {t("status.goToProfile")}
                            </a>
                        </div>
                    </div>
                </div>
            </main>
        );
    }
}
