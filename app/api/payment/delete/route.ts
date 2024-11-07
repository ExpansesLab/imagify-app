import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    console.log('\n=== Payment Deletion Started ===');
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            console.log('Payment Deletion: Unauthorized request');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { paymentId } = body;

        if (!paymentId) {
            console.log('Payment Deletion: No payment ID provided');
            return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });
        }

        // Проверяем, что платеж принадлежит текущему пользователю и находится в нужном статусе
        const payment = await prisma.payment.findFirst({
            where: {
                OR: [
                    { paymentId },
                    { tempPaymentId: paymentId }
                ],
                user: {
                    email: session.user.email
                },
                status: {
                    in: ['pending', 'waiting_for_capture']
                }
            }
        });

        if (!payment) {
            console.log('Payment Deletion: Payment not found or not eligible for deletion');
            return NextResponse.json({ error: 'Payment not found or cannot be deleted' }, { status: 404 });
        }

        // Удаляем платеж
        await prisma.payment.delete({
            where: {
                id: payment.id
            }
        });

        console.log('Payment Deletion: Successfully deleted payment:', payment.id);
        return NextResponse.json({ status: 'ok' });
    } catch (error) {
        console.error('Payment Deletion Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete payment' },
            { status: 500 }
        );
    }
}
