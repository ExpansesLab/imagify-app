'use client';

import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { AppContext } from '@/contexts/AppContext';

interface BuyCreditsButtonProps {
    planId: string;
    className?: string;
    children: React.ReactNode;
}

export default function BuyCreditsButton({ planId, className, children }: BuyCreditsButtonProps) {
    const router = useRouter();
    const { user } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        try {
            if (!user) {
                router.push('/sign-in');
                return;
            }

            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId }),
                cache: 'no-store'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Ошибка создания платежа');
            }
            
            // Если есть существующий платеж, перенаправляем на его страницу статуса
            if (data.existingPayment && data.paymentUrl) {
                window.location.href = data.paymentUrl;
                return;
            }

            // Если это новый платеж, перенаправляем на страницу оплаты
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                throw new Error('URL платежа не получен');
            }
        } catch (error) {
            console.error('Payment creation error:', error);
            setError(error instanceof Error ? error.message : 'Произошла неизвестная ошибка');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className={`${className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                type="button"
                disabled={isLoading}
            >
                {isLoading ? 'Загрузка...' : children}
            </button>
            {error && (
                <div className="text-red-500 text-sm mt-2">
                    {error}
                </div>
            )}
        </div>
    );
}
