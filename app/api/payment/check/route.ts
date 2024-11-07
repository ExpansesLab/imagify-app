import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from "@/lib/prisma";

export async function GET() {
    console.log('\n=== Payment Check Started ===');
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            console.log('Payment Check: Unauthorized request');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ищем незавершенный платеж пользователя
        const payment = await prisma.payment.findFirst({
            where: {
                user: {
                    email: session.user.email
                },
                status: {
                    in: ['pending', 'waiting_for_capture']
                }
            }
        });

        if (!payment) {
            return NextResponse.json({ exists: false });
        }

        return NextResponse.json({
            exists: true,
            payment: {
                id: payment.tempPaymentId, // Изменено с paymentId на tempPaymentId
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                planId: payment.planId
            }
        });
    } catch (error) {
        console.error('Payment Check Error:', error);
        return NextResponse.json(
            { error: 'Failed to check payment' },
            { status: 500 }
        );
    }
}
