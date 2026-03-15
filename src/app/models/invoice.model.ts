import { CustomerModel } from "./customer.model";


export interface Invoice {
    product_id?: string | null;
    quantityInStock: number;
    productId: number;
    productName: string;
    hsn: string;
    taxRate: string;
    quantity: string;
    rate: number;
    amount: string;
    unit: string;
    description: string;
    sgst: string;
    cgst: string;
    Igst: string;
    taxableAmount: string;
}

export interface GenerateInvoice {
    _id?: string;
    invoiceNo: number;
    invoiceDate: string;
    placeOfSupply: string;
    reverseCharge: string;
    totalTax: number;
    totalTaxableValue: number;
    totalInvoiceValue: number;
    taxAmtsgstorcgst28: number;
    taxAmtsgstorcgst18: number;
    taxAmtsgstorcgst12: number;
    taxAmtsgstorcgst5: number;
    taxAmtIgst28: number;
    taxAmtIgst18: number;
    taxAmtIgst12: number;
    taxAmtIgst5: number;
    taxable28: number;
    taxable18: number;
    taxable12: number;
    taxable5: number;
    invoiceStatus: string;
    customer: CustomerModel;
    products: Invoice[];
    invoiceType: string;
}
