export interface ProductDetails {
    _id?: string;
    inStock: number;
    id: number;
    productName: string;
    productHsn: string;
    productPrice: number;
    productTaxRate: number;
    productUnit: string;
}

export interface ProductInvoice {
    productName: string;
    productHsn: string;
    productPrice: number;
    productTaxRate: number;
    productUnit: string;
    productQuantity: number;
    productSgst: number;
    productCgst: number;
    productIgst: number;
    productTaxableAmount: number;
    productTotalAmount: number;
}
