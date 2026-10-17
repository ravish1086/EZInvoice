export interface PurchaseModel {
    _id?: string;
    purchaseId?: string;
    invoiceNumber?: string;
    sellerId?: string;
    sellerName?: string;
    purchaseDate?: string;
    purchaseCategory?: string;
    sgstAmount?: number;
    cgstAmount?: number;
    igstAmount?: number;
    totalTaxableAmount?: number;
    totalInvoiceAmount?: number;
    isActive?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}