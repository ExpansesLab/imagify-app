import { YooCheckout, CreatePaymentPayload } from '@a2seven/yoo-checkout';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { yookassaConfig, getYooKassaCredentials } from '@/config/yookassa';
import crypto from 'crypto';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

const getCheckoutInstance = () => {
    const credentials = getYooKassaCredentials();
    return new YooCheckout({
        shopId: credentials.shopId,
        secretKey: credentials.secretKey
    });
};

export async function POST(request: Request) {
    console.log('\n=== Payment Creation Started ===');
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            console.log('Payment Creation: Unauthorized request');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Получаем текущую локаль из заголовков
        const headersList = headers();
        const referer = headersList.get('referer') || '';
        const locale = referer.match(/\/(ru|en)\//) ? referer.match(/\/(ru|en)\//)?.[1] : 'ru';
        console.log('Payment Creation: Locale:', locale);

        const body = await request.json();
        const { planId } = body;
        console.log('Payment Creation: Plan ID:', planId);

        const plan = yookassaConfig.plans[planId as keyof typeof yookassaConfig.plans];
        if (!plan) {
            console.log('Payment Creation: Invalid plan ID');
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Генерируем orderId заранее
        const orderId = crypto.randomUUID();
        console.log('Payment Creation: Generated Order ID:', orderId);

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
        console.log('\nPayment Creation: Payment data:', JSON.stringify(paymentData, null, 2));

        // Создаем платеж
        const payment = await checkout.createPayment(paymentData, idempotenceKey);
        console.log('\nPayment Creation: Payment created:', JSON.stringify(payment, null, 2));

        if (!payment.confirmation?.confirmation_url) {
            console.log('Payment Creation: No confirmation URL received');
            throw new Error('Payment URL not received from YooKassa');
        }

        // Сохраняем платеж в базе данных, используя tempPaymentId для хранения orderId
        console.log('\nPayment Creation: Saving payment to database');
        const dbPayment = await prisma.payment.create({
            data: {
                paymentId: payment.id,
                tempPaymentId: orderId,
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
        console.log('Payment Creation: Payment saved to database:', JSON.stringify(dbPayment, null, 2));

        console.log('\nPayment Creation: Process completed successfully');
        return NextResponse.json({
            paymentUrl: payment.confirmation.confirmation_url,
            paymentId: payment.id,
            orderId: orderId,
            testMode: process.env.NODE_ENV !== 'production',
            testCards: process.env.NODE_ENV !== 'production' ? yookassaConfig.testCards : undefined
        });
    } catch (error) {
        console.error('\nPayment Creation Error:', error);
        
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
