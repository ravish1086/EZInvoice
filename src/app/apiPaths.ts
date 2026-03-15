export const ApiPathsJsonServer = {
    createInvoice: '/generatedInvoices',
    updateInvoice: '/generatedInvoices',
    getInvoiceDetails: '/generatedInvoices'

}

export const ApiPathExpressServer = {
getAllPaymentDetails:'/payments/getAllPaymentDetails',
updatePaymentDetails:'/payments/updatePaymentDetails',
deletePaymentDetails:'/payments/deletePaymentDetails',
savePaymentDetails:'/payments/savePaymentDetails',
getAllInvoices:'/invoices/getAllInvoices',
createInvoice:'/invoices/createInvoice',
updateInvoice:'/invoices/updateInvoice',
deleteInvoice:'/invoices/deleteInvoice',
getInvoiceById:'/invoices/getInvoiceById',
getAllProducts:'/products/getAllProducts',
addProduct:'/products/addProduct',
updateProduct:'/products/updateProduct',
deleteProduct:'/products/deleteProduct',
getAllCustomers:'/customers/getAllCustomers',
saveCustomer:'/customers/saveCustomer',
updateCustomer:'/customers/updateCustomer',
deleteCustomerDetails:'/customers/deleteCustomerDetails',
importCustomerDetails: '/customers/importCustomersFromExcel',
addUser:'/users/addUser',
getAllUsers:'/users/getAllUsers',
getUserById:'/users/getUserById',
updateUser:'/users/updateUser',
deleteUser:'/users/deleteUser',

getAllSellers:'/sellers/getAllSellers',
saveSeller:'/sellers/saveSeller',
updateSeller:'/sellers/updateSeller',
deleteSellerDetails:'/sellers/deleteSellerDetails',
login: '/authenticate/login',
syncData: '/authenticate/syncData',

getLastInvoiceNumber: '/invoices/getLastInvoiceNumber',
setLastInvoiceNumber: '/invoices/setLastInvoiceNumber',
getTotalValueOfInvoiceAndReceivedAmount: '/invoices/getTotalInvoiceValue'
}