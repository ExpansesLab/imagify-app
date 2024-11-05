declare module '@a2seven/yoo-checkout' {
    export interface CreatePaymentPayload {
        amount: {
            value: string;
            currency: string;
        };
        confirmation: {
            type: string;
            return_url: string;
        };
        capture: boolean;
        description?: string;
        metadata?: Record<string, any>;
        receipt: {
            customer: {
                email: string;
            };
            items: Array<{
                description: string;
                amount: {
                    value: string;
                    currency: string;
                };
                vat_code: number;
                quantity: string;
            }>;
        };
        webhook?: {
            url: string;
        };
    }

    export interface PaymentConfirmation {
        type: string;
        confirmation_url: string;
    }

    export interface Payment {
        id: string;
        status: string;
        amount: {
            value: string;
            currency: string;
        };
        confirmation: PaymentConfirmation;
        created_at: string;
        metadata?: Record<string, any>;
    }

    export class YooCheckout {
        constructor(options: { shopId: string; secretKey: string });
        createPayment(payload: CreatePaymentPayload, idempotenceKey: string): Promise<Payment>;
        getPayment(paymentId: string): Promise<Payment>;
    }
}
