// ecfront/ec-front/lib/orderState/OrderStateFactory.ts
import { OrderState } from "./OrderState";
import { PendingState, ProcessingState, ShippedState, DeliveredState, CancelledState } from "./AllState";

export function getOrderState(status: string): OrderState {
    switch (status) {
        case "PENDING": return new PendingState();
        case "PROCESSING": return new ProcessingState();
        case "SHIPPED": return new ShippedState();
        case "DELIVERED": return new DeliveredState();
        case "CANCELLED": return new CancelledState();
        default: return new PendingState();
    }
}