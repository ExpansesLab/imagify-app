import { YooCheckout, CreatePaymentPayload } from '@a2seven/yoo-checkout';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { yookassaConfig, getYooKassaCredentials } from '@/config/yookassa';
import crypto from 'crypto';
import { headers } from 'next/headers';

const getCheckoutInstance = () => {
    const credentials = getYooKassaCredentials();
    return new YooCheckout({
        shopId: credentials.shopId,
        secretKey: credentials.secretKey
    });
};

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Получаем текущую локаль из заголовков
        const headersList = headers();
        const referer = headersList.get('referer') || '';
        const locale = referer.match(/\/(ru|en)\//) ? referer.match(/\/(ru|en)\//)?.[1] : 'ru';

        const body = await request.json();
        const { planId } = body;

        const plan = yookassaConfig.plans[planId as keyof typeof yookassaConfig.plans];
        if (!plan) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Генерируем orderId заранее
        const orderId = crypto.randomUUID();

        const idempotenceKey = crypto.randomUUID();
        const checkout = getCheckoutInstance();

        // Создаем объект с данными платежа
        const paymentData: CreatePaymentPayload = {
            amount: {
                value: String(plan.amount.toFixed(2)),
                currency: yookassaConfig.currency
            },
            confirmation: {
                type: 'redirect',
                // Добавляем orderId в URL возврата
                return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://imagify.ru'}/${locale}/payment/status?orderId=${orderId}`
            },
            capture: yookassaConfig.capture,
            description: plan.description,
            metadata: {
                planId,
                userEmail: session.user.email,
                credits: plan.credits,
                orderId // Сохраняем orderId в метаданных
            },
            receipt: {
                customer: {
                    email: session.user.email
                },
                items: [{
                    description: plan.description,
                    amount: {
                        value: String(plan.amount.toFixed(2)),
                        currency: yookassaConfig.currency
                    },
                    vat_code: 1,
                    quantity: "1"
                }]
            },
            webhook: {
                url: yookassaConfig.webhookUrl
            }
        };

        // Логируем данные платежа для отладки
        console.log('Creating payment with payload:', JSON.stringify(paymentData, null, 2));

        // Создаем платеж
        const payment = await checkout.createPayment(paymentData, idempotenceKey);
        console.log('Payment created:', JSON.stringify(payment, null, 2));

        if (!payment.confirmation?.confirmation_url) {
            throw new Error('Payment URL not received from YooKassa');
        }

        // Сохраняем связь orderId и paymentId в базе данных
        await prisma.payment.create({
            data: {
                paymentId: payment.id,
                orderId: orderId,
                amount: Number(payment.amount.value),
                currency: payment.amount.currency,
                status: payment.status,
                planId: planId,
                user: {
                    connect: {
                        email: session.user.email
                    }
                }
            }
        });

        return NextResponse.json({
            paymentUrl: payment.confirmation.confirmation_url,
            paymentId: payment.id,
            orderId: orderId,
            testMode: process.env.NODE_ENV !== 'production',
            testCards: process.env.NODE_ENV !== 'production' ? yookassaConfig.testCards : undefined
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorDetails = error instanceof Error && (error as any).response?.data 
            ? (error as any).response.data 
            : undefined;

        return NextResponse.json(
            { 
                error: 'Failed to create payment', 
                message: errorMessage,
                details: errorDetails
            },
            { status: 500 }
        );
    }
}
