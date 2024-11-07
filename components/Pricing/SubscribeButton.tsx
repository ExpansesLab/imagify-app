'use client';

import { useRouter } from 'next/navigation';
import { useContext, useState, useEffect, useCallback } from 'react';
import { AppContext } from '@/contexts/AppContext';

interface BuyCreditsButtonProps {
    planId: string;
    className?: string;
    children: React.ReactNode;
}

interface PaymentInfo {
    id: string;
    amount: number;
    currency: string;
    status: string;
    planId: string;
}

export default function BuyCreditsButton({ planId, className, children }: BuyCreditsButtonProps) {
    const router = useRouter();
    const { user } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [existingPayment, setExistingPayment] = useState<PaymentInfo | null>(null);

    // Проверяем существующий платеж при загрузке компонента
    const checkExistingPayment = useCallback(async () => {
        try {
            const response = await fetch('/api/payment/check', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store'
            });

            const data = await response.json();
            if (data.exists && data.payment) {
                setExistingPayment(data.payment);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error checking existing payment:', error);
        }
    }, []); // Нет зависимостей, так как функция не использует внешние переменные

    useEffect(() => {
        if (user) {
            checkExistingPayment();
        }
    }, [user, checkExistingPayment]); // Добавляем все зависимости

    const handleClick = async () => {
        try {
            if (!user) {
                router.push('/sign-in');
                return;
            }

            // Если есть незавершенный платеж, показываем модальное окно
            if (existingPayment) {
                setShowModal(true);
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
                throw new Error(data.message || data.error || 'Ошибка создания платежа');
            }
            
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

    const handleDeletePayment = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/payment/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentId: existingPayment?.id }),
                cache: 'no-store'
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || data.error || 'Ошибка удаления платежа');
            }

            setExistingPayment(null);
            setShowModal(false);
        } catch (error) {
            console.error('Payment deletion error:', error);
            setError(error instanceof Error ? error.message : 'Произошла ошибка при удалении платежа');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinuePayment = useCallback(() => {
        router.push(`/payment/status?orderId=${existingPayment?.id}`);
    }, [router, existingPayment]); // Добавляем зависимости

    return (
        <div className="relative">
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

            {/* Модальное окно для управления существующим платежом */}
            {showModal && existingPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                            У вас есть незавершенный платеж
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Сумма: {existingPayment.amount} {existingPayment.currency}
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleContinuePayment}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                disabled={isLoading}
                            >
                                Продолжить оплату
                            </button>
                            <button
                                onClick={handleDeletePayment}
                                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
                                disabled={isLoading}
                            >
                                Удалить платеж
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md"
                                disabled={isLoading}
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
