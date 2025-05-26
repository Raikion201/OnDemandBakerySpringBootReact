export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
}

export interface PaymentDetails {
    // Base interface for payment details
}

export interface CreditCardDetails extends PaymentDetails {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvv: string;
}

export interface BankTransferDetails extends PaymentDetails {
    accountName?: string;
    bankName?: string;
}