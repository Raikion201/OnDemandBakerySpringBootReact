// ecfront/ec-front/lib/orderState/OrderState.ts

export interface OrderState {
    name: string;
    canNext(): boolean;
    canCancel(): boolean;
    nextStatus(): string | null;
    cancelStatus(): string | null;
}