import { YooCheckout } from '@a2seven/yoo-checkout';
import { NextResponse } from 'next/server';
import { getYooKassaCredentials } from '@/config/yookassa';
import { headers } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

const getCheckoutInstance = () => {
    const credentials = getYooKassaCredentials();
    return new YooCheckout({
        shopId: credentials.shopId,
        secretKey: credentials.secretKey
    });
};

function checkSignature(body: string, signature: string | null): boolean {
    if (!signature) {
        console.log('Webhook: No signature provided');
        return false;
    }
    
    const credentials = getYooKassaCredentials();
    const hmac = crypto.createHmac('sha1', credentials.secretKey);
    hmac.update(body);
    const calculatedSignature = hmac.digest('hex');
    
    const isValid = signature === calculatedSignature;
    console.log('Webhook: Signature validation:', isValid ? 'valid' : 'invalid');
    return isValid;
}

// Функция для обновления кредитов пользователя
const updateUserCredits = async (userEmail: string, credits: number): Promise<boolean> => {
    try {
        await prisma.user.update({
            where: { email: userEmail },
            data: {
                credits: {
                    increment: credits
                }
            }
        });
        console.log('Webhook: Credits updated successfully for user:', userEmail);
        return true;
    } catch (error) {
        console.error('Webhook: Error updating credits:', error);
        return false;
    }
};

// Функция для обновления статуса платежа
const updatePaymentStatus = async (orderId: string, status: string): Promise<boolean> => {
    try {
        await prisma.payment.update({
            where: { tempPaymentId: orderId },
            data: { status }
        });
        console.log('Webhook: Payment status updated successfully for order:', orderId);
        return true;
    } catch (error) {
        console.error('Webhook: Error updating payment status:', error);
        return false;
    }
};

export async function POST(request: Request) {
    console.log('Webhook: Received request');
    try {
        const headersList = headers();
        const signature = headersList.get('X-Payment-Sha1-Hash');
        const body = await request.text();
        
        console.log('Webhook: Headers:', Object.fromEntries(headersList.entries()));
        console.log('Webhook: Raw body:', body);
        
        // В тестовом режиме пропускаем проверку подписи
        if (process.env.NODE_ENV === 'production' && !checkSignature(body, signature)) {
            console.log('Webhook: Signature check failed in production mode');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);
        console.log('Webhook: Parsed event:', JSON.stringify(event, null, 2));

        const checkout = getCheckoutInstance();
        const payment = await checkout.getPayment(event.object.id);
        console.log('Webhook: Payment details:', JSON.stringify(payment, null, 2));

        // Всегда обновляем статус платежа в базе данных
        if (payment.metadata?.orderId) {
            const statusUpdated = await updatePaymentStatus(payment.metadata.orderId, payment.status);
            if (!statusUpdated) {
                console.error('Webhook: Failed to update payment status');
                return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
            }
        } else {
            console.error('Webhook: No orderId in payment metadata');
            return NextResponse.json({ error: 'No orderId in payment metadata' }, { status: 400 });
        }

        // Обновляем кредиты только если платеж успешен
        if (payment.status === 'succeeded' && payment.metadata) {
            const { userEmail, credits } = payment.metadata;
            
            if (!userEmail || !credits) {
                console.error('Webhook: Missing required metadata fields');
                return NextResponse.json({ error: 'Missing required metadata fields' }, { status: 400 });
            }

            const creditsUpdated = await updateUserCredits(userEmail, Number(credits));
            if (!creditsUpdated) {
                console.error('Webhook: Failed to update user credits');
                return NextResponse.json({ error: 'Failed to update user credits' }, { status: 500 });
            }

            console.log(`Webhook: Payment ${payment.id} processed successfully in ${process.env.NODE_ENV} mode`);
        } else {
            console.log(`Webhook: Payment ${payment.id} status: ${payment.status} (not succeeded)`);
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
