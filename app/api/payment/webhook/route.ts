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
    const timestamp = new Date().toISOString();
    console.log(`\n=== Webhook Request Received at ${timestamp} ===`);
    console.log('Webhook: Environment:', process.env.NODE_ENV);
    console.log('Webhook: Request URL:', request.url);
    console.log('Webhook: Request method:', request.method);

    try {
        const headersList = headers();
        const signature = headersList.get('X-Payment-Sha1-Hash');
        console.log('Webhook: Received signature:', signature);

        const body = await request.text();
        console.log('\nWebhook: Headers:', JSON.stringify(Object.fromEntries(headersList.entries()), null, 2));
        console.log('\nWebhook: Raw body:', body);
        
        // В тестовом режиме пропускаем проверку подписи
        if (process.env.NODE_ENV === 'production' && !checkSignature(body, signature)) {
            console.log('Webhook: Signature check failed in production mode');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);
        console.log('\nWebhook: Parsed event:', JSON.stringify(event, null, 2));

        const checkout = getCheckoutInstance();
        console.log('\nWebhook: Getting payment details for ID:', event.object.id);
        const payment = await checkout.getPayment(event.object.id);
        console.log('\nWebhook: Payment details:', JSON.stringify(payment, null, 2));

        if (payment.status === 'succeeded' && payment.metadata) {
            const { userEmail, credits, planId, orderId } = payment.metadata;
            console.log('\nWebhook: Processing successful payment');
            console.log('Webhook: User email:', userEmail);
            console.log('Webhook: Credits to add:', credits);
            console.log('Webhook: Plan ID:', planId);
            console.log('Webhook: Order ID:', orderId);

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
                console.log('\nWebhook: Updated user credits:', JSON.stringify(updatedUser, null, 2));

                // Обновляем статус платежа в базе данных, используя tempPaymentId
                const updatedPayment = await prisma.payment.update({
                    where: { tempPaymentId: orderId },
                    data: {
                        status: payment.status
                    }
                });
                console.log('\nWebhook: Updated payment status:', JSON.stringify(updatedPayment, null, 2));

            } catch (dbError) {
                console.error('\nWebhook: Database operation failed:', dbError);
                throw dbError;
            }

            console.log(`\nWebhook: Payment ${payment.id} processed successfully in ${process.env.NODE_ENV} mode`);
        } else {
            console.log(`\nWebhook: Payment ${payment.id} status: ${payment.status} (not succeeded)`);
            
            // Обновляем статус платежа в базе данных, даже если он не succeeded
            if (payment.metadata?.orderId) {
                const updatedPayment = await prisma.payment.update({
                    where: { tempPaymentId: payment.metadata.orderId },
                    data: {
                        status: payment.status
                    }
                });
                console.log('\nWebhook: Updated payment status in database:', JSON.stringify(updatedPayment, null, 2));
            }
        }

        console.log('\nWebhook: Processing completed successfully');
        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('\nWebhook processing error:', error);
        return NextResponse.json(
            { error: 'Failed to process webhook', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
