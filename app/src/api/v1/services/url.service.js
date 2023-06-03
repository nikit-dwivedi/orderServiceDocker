const inventoryBaseUrlStage = 'http://139.59.60.119:9000'
const userBaseStage = 'http://139.59.60.119:4006'
const notificationBaseStage = 'http://139.59.60.119:4011'
const paymentBaseStage = 'http://139.59.60.119:7000'
const deliveryBaseStage = 'http://139.59.60.119:4489'
const cartBaseStage = 'http://139.59.60.119:3123'
const inventoryBaseUrlProd = 'https://inventory.fablocdn.com'
const userBaseProd = 'https://user.fablocdn.com'
const notificationBaseProd = 'https://notification.fablocdn.com'
// const paymentBaseProd = 'https://user.fablocdn.com'
const deliveryBaseProd = 'https://delivery.fablocdn.com'
const cartBaseProd = 'https://cart.fablocdn.com'


module.exports = {
    productEndPoint: (productId) => {
        return `${inventoryBaseUrlProd}/v1/menu/custom-item/${productId}`
    },
    cartEndPoint: (cartId) => `${cartBaseProd}/v1//cart/main/${cartId}`,

    outletEndPoint: (outletId) => {
        return `${inventoryBaseUrlProd}/v1/outlet/single/${outletId}`
    },
    sellerOutletEndpoint: () => {
        return `${inventoryBaseUrlProd}/v1/outlet/seller?mode=2`
    },
    customerEndPoint: () => {
        return `${userBaseProd}/v1/customer/`
    },
    adminOrderNotificationUrl: () => {
        return `${notificationBaseProd}/v1/admin/order`
    },
    sellerOrderNotificationUrl: () => {
        return `${notificationBaseProd}/v1/seller/order`
    },
    customerOrderNotificationUrl: () => {
        return `${notificationBaseProd}/v1/customer/order`
    },
    sellerStatusNotificationUrl: () => {
        return `${notificationBaseProd}/v1/seller/status`
    },
    paymentInitUrl: () => {
        return `${paymentBaseStage}/payment/createPayment`
    },
    paymentCheckUrl: (mpOrderId,check) => {
        return check?`${paymentBaseStage}/payment/check/${mpOrderId}?type=0`:`${paymentBaseStage}/payment/check/${mpOrderId}?type=1`
    },
    discountDataUrl: (discountId) => {
        return `${inventoryBaseUrlProd}/v1/discount/${discountId}`
    },
    assignTaskToPartner: () => {
        return `${deliveryBaseProd}/v1/tookan/task/create`
    },
    unassignTaskToPartner: () => {
        return `${deliveryBaseProd}/v1/partner/task/status`
    },
    getPartnerDetails: (partnerId) => {
        return `${userBaseProd}/v1/partner/details?partnerId=${partnerId}`
    }
}
