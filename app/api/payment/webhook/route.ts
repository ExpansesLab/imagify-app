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

        if (payment.status === 'succeeded' && payment.metadata) {
            const { userEmail, credits, planId, orderId } = payment.metadata;
            console.log('Webhook: Processing payment for user:', userEmail);

            try {
                // Обновляем количество кредитов пользователя
                const updatedUser = await prisma.user.update({
                    where: { email: userEmail },
                    data: {
                        credits: {
                            increment: Number(credits)
                        }
                    }
                });
                console.log('Webhook: Updated user credits:', updatedUser);

                // Обновляем статус платежа в базе данных, используя tempPaymentId
                const updatedPayment = await prisma.payment.update({
                    where: { tempPaymentId: orderId },
                    data: {
                        status: payment.status
                    }
                });
                console.log('Webhook: Updated payment status:', updatedPayment);

            } catch (dbError) {
                console.error('Webhook: Database operation failed:', dbError);
                throw dbError;
            }

            console.log(`Webhook: Payment ${payment.id} processed successfully in ${process.env.NODE_ENV} mode`);
        } else {
            console.log(`Webhook: Payment ${payment.id} status: ${payment.status} (not succeeded)`);
            
            // Обновляем статус платежа в базе данных, даже если он не succeeded
            if (payment.metadata?.orderId) {
                await prisma.payment.update({
                    where: { tempPaymentId: payment.metadata.orderId },
                    data: {
                        status: payment.status
                    }
                });
                console.log('Webhook: Updated payment status in database');
            }
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
