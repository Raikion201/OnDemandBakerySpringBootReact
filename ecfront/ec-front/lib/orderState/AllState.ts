// ecfront/ec-front/lib/orderState/PendingState.ts
import { OrderState } from "./OrderState";

export class PendingState implements OrderState {
  name = "PENDING";
  canNext() { return true; }
  canCancel() { return true; }
  nextStatus() { return "PROCESSING"; }
  cancelStatus() { return "CANCELLED"; }
}

// Tương tự cho các trạng thái khác:
export class ProcessingState implements OrderState {
  name = "PROCESSING";
  canNext() { return true; }
  canCancel() { return true; }
  nextStatus() { return "SHIPPED"; }
  cancelStatus() { return "CANCELLED"; }
}

export class ShippedState implements OrderState {
  name = "SHIPPED";
  canNext() { return true; }
  canCancel() { return false; }
  nextStatus() { return "DELIVERED"; }
  cancelStatus() { return null; }
}

export class DeliveredState implements OrderState {
  name = "DELIVERED";
  canNext() { return false; }
  canCancel() { return false; }
  nextStatus() { return null; }
  cancelStatus() { return null; }
}

export class CancelledState implements OrderState {
  name = "CANCELLED";
  canNext() { return false; }
  canCancel() { return false; }
  nextStatus() { return null; }
  cancelStatus() { return null; }
}