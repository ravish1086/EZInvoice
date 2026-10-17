export interface PurchaseModel {
    _id?: string;
    purchaseId?: string;
    sellerId?: string;
    sellerName?: string;
    purchaseDate?: string;
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