export interface ReceivedPayments {
    _id?: string;
    gst: string;
    customerName: string;
    dateofReceipt: string;
    amountReceived: number;
    modeofPayment: string;
    paymentDetails: string;
    lastFYBalance: number | null;
}
