const { orderInitFormatter, changeCartFormatter } = require("../formatter/order.format");
const { genrateOtpPhone, addAuth, verifyOtp, checkAuthByPhone, checkAuthByEmail, genrateOtpEmail, checkLogin, getProductList, getOutletDetails, getCustomerDetails, addOrder, getTodaysOrder, changeStatus, getOrderCount, orderByOrderId, getAllOrderByOutletId, updateOrder, updateCartOrder, initOrderFromCart, getDiscountDetails, getSellerOutlet, changeToPending, getCustomerOrderDetails, getCustomerCurrentOrder, addPartnerDetails, changeStatusFromDelivery, getCartDetails, checkOrderPaymentMode, changeOrderRatingStatus, pendingRatingList, changeMPOrderId, getAllOrder, orderByMPOrderId, totalOrderCount, getAllOrderDumpByOutletId, performance } = require("../helpers/order.helper")
const { unknownError, success, badRequest } = require("../helpers/response_helper");
const { parseJwt } = require("../middlewares/authToken");
const { get, post } = require("../services/axios.service");
const { sendNotification } = require("../services/notification.service");
const { productEndPoint, paymentInitUrl, paymentCheckUrl } = require("../services/url.service");

module.exports = {
    cartOrder: async (req, res) => {
        try {
            const { locationId, cartId, ...garbage } = req.body;
            const token = req.headers.authorization
            if (!cartId || JSON.stringify(garbage) != '{}') {
                return badRequest(res, "please provide proper data")
            }
            let cartData = await getCartDetails(cartId)
            let customerData = await getCustomerDetails(token, locationId)
            let outletData = await getOutletDetails(cartData.outletId)
            const formattedData = orderInitFormatter(customerData, cartData.productList, cartData, outletData)
            const saveData = await addOrder(formattedData)
            return saveData ? success(res, "cart initiated successfully", { orderId: formattedData.orderId }) : badRequest(res, "please provide proper data")
        } catch (error) {
            console.log(error);
            return unknownError(res, "unknown error")
        }
    },
    orderInit: async (req, res) => {
        try {
            const { orderId, isCod, ...garbage } = req.body;
            if (!orderId || JSON.stringify(garbage) != '{}') {
                return badRequest(res, "please provide proper data")
            }
            const { status, message, data } = await initOrderFromCart(orderId, isCod)
            if (!status) {
                return badRequest(res, message)
            }
            if (isCod) {
                return success(res, "order placed successfully", { mpOrderId: data.mpOrderId })
            }
            const paymentInitEndpoint = paymentInitUrl()
            const paymentData = {
                "amount": Math.floor(data.payableAmount + 1)
            }
            let header = { "Authorization": req.headers.authorization }
            let paymentResponse = await post(paymentInitEndpoint, paymentData, header)
            if (paymentResponse.status) {
                await changeMPOrderId(orderId, paymentResponse.items.id)
            }
            // sendNotification(outletData.sellerId, `name:${outletData.outletName}`, outletId)
            return paymentResponse.status ? success(res, "order placed successfully", { mpOrderId: paymentResponse.items.id }) : badRequest(res, paymentResponse.message)
        } catch (error) {
            console.log(error);
            return unknownError(res, "unknown error")
        }
    },
    todayOrder: async (req, res) => {
        try {
            const { outletId } = req.params
            const { status } = req.query
            let data = await getTodaysOrder(outletId, status)
            return data[0] ? success(res, "order list", data) : badRequest(res, "no order found");
        } catch (error) {
            console.log(error);
            return unknownError(res, error.message)
        }
    },
    markOrderSuccess: async (req, res) => {
        try {
            const { mpOrderId } = req.body
            const orderModeCheck = await checkOrderPaymentMode(mpOrderId)
            if (!orderModeCheck.status) {
                return badRequest(res, orderModeCheck.message)
            }
            let paymentData = { orderId: mpOrderId, paymentMode: "Cod", paymentStatus: "Not Collected", method: "Cash" }
            const paymentInitEndpoint = paymentCheckUrl(mpOrderId, orderModeCheck.data);
            let paymentResponse = await get(paymentInitEndpoint, req.headers.authorization)
            if (!paymentResponse.status) {
                return badRequest(res, paymentResponse.message)
            }
            if (orderModeCheck.data) {
                paymentData.paymentMode = "online",
                    paymentData.paymentStatus = paymentResponse.items.status,
                    paymentData.method = paymentResponse.items.method
            }
            let { status, message, data } = await changeToPending(paymentData)
            return status ? success(res, message) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    changeOrderStatus: async (req, res) => {
        try {
            let rawToken = req.headers.authorization
            const token = parseJwt(rawToken)
            const { orderId, orderStatus } = req.body
            let { status, message, data } = await changeStatus(orderId, orderStatus, token.customId, rawToken)
            return status ? success(res, message) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    getOutletOrderCount: async (req, res) => {
        try {
            const { outletId, } = req.params
            const { from, to } = req.query
            let data = await getOrderCount(outletId, from, to);
            return data ? success(res, "order list", data) : badRequest(res, "no order found");
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    getOrderDetail: async (req, res) => {
        try {
            const { orderId } = req.params
            let { status, message, data } = await orderByOrderId(orderId)
            return status ? success(res, message, data) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    getMPOrderDetail: async (req, res) => {
        try {
            const { orderId } = req.params
            let { status, message, data } = await orderByMPOrderId(orderId)
            return status ? success(res, message, data) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    allOrderOfOutlet: async (req, res) => {
        try {
            const { outletId } = req.params
            const { status: orderStatus, from, to } = req.query
            let { status, message, data } = await getAllOrderByOutletId(outletId, orderStatus, from, to)
            return status ? success(res, message, data) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    allOrder: async (req, res) => {
        try {
            const { status: orderStatus, from, to } = req.query
            let { status, message, data } = await getAllOrder(orderStatus, from, to)
            return status ? success(res, message, data) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    allProfitOfOutlet: async (req, res) => {
        try {
            const { outletId } = req.params
            const { from, to } = req.query
            const orderStatus = ["pending", 'preparing', 'ready', 'dispatched', 'delivered']
            let { status, message, data } = await getAllOrderByOutletId(outletId, orderStatus, from, to)
            if (!status) {
                let returnData = { totalSale: 0, orderCount: 0, totalDiscount: 0, netProfit: 0 }
                return success(res, "outlet profit", returnData)
            }
            let totalSale = data?.orderData.reduce((total, currentList) => {
                {
                    return total + currentList.amount.totalAmount
                }
            }, 0)
            let netProfit = data?.orderData.reduce((total, currentList) => {
                {
                    let sellerAmount = currentList.amount.totalAmount - currentList.amount.discountedAmount
                    return total + sellerAmount
                }
            }, 0)
            let totalDiscount = data.orderData.reduce((total, currentList) => {
                {
                    return total + currentList.amount.discountedAmount
                }
            }, 0)
            let returnData = { totalSale, orderCount: data.orderData.length, totalDiscount, netProfit }
            success(res, "outlet profit", returnData)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    allOrderOfSeller: async (req, res) => {
        try {
            const token = req.headers.authorization
            const { status: orderStatus, from, to } = req.query
            const sellerOutletList = await getSellerOutlet(token)
            if (!sellerOutletList) {
                return badRequest(res, "Seller don't have any outlet")
            }
            let orderList = await Promise.all(sellerOutletList.map(async (outletData) => {
                let orderData = await getAllOrderByOutletId(outletData.outletId, orderStatus, from, to)
                return orderData.data
            }))
            let mainList = orderList.reduce((previousList, currentList) => {
                if (!currentList?.orderCount && !currentList[0]) {
                    return previousList
                }
                let statusMap = new Map(currentList.orderCount.map((orderStatus) => [orderStatus._id, orderStatus.count]))
                let preparingPlusAssigned = statusMap.get("preparing") && statusMap.get("assigned") ? statusMap.get("preparing") + statusMap.get("assigned") : statusMap.get("preparing") ?? statusMap.get("assigned")
                statusMap.set("preparing", preparingPlusAssigned)
                previousList.pending = statusMap.get("pending") ? previousList.pending + statusMap.get("pending") : previousList.pending;
                previousList.preparing = statusMap.get("preparing") ? previousList.preparing + statusMap.get("preparing") : previousList.preparing;
                previousList.ready = statusMap.get("ready") ? previousList.ready + statusMap.get("ready") : previousList.pending;
                previousList.dispatched = statusMap.get("dispatched") ? previousList.dispatched + statusMap.get("dispatched") : previousList.dispatched;

                previousList.orderList = [...previousList.orderList, ...currentList?.orderData]
                return previousList
            }, { pending: 0, preparing: 0, ready: 0, dispatched: 0, orderList: [] })
            return mainList ? success(res, "order list", mainList) : badRequest(res, "no order found")
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    allOrderDumpOfSeller: async (req, res) => {
        try {
            const token = req.headers.authorization
            const sellerOutletList = await getSellerOutlet(token)
            if (!sellerOutletList) {
                return badRequest(res, "Seller don't have any outlet")
            }
            let outletIdList = sellerOutletList.map(outlet => outlet.outletId)
            let { status, message, data } = await getAllOrderDumpByOutletId(outletIdList)
            return status ? success(res, message, data) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    allProfitOfSeller: async (req, res) => {
        try {
            const token = req.headers.authorization
            let { from, to } = req.query
            let orderStatus = ['pending', 'preparing', 'ready', 'dispatched', 'delivered']
            const sellerOutletList = await getSellerOutlet(token)
            let orderList = await Promise.all(sellerOutletList.map(async (outletData) => {
                let orderData = await getAllOrderByOutletId(outletData.outletId, orderStatus, from, to)
                return orderData.data
            }))
            let mainList = orderList.reduce((previousList, currentList) => {
                if (!currentList.orderData) {
                    return previousList

                }
                return [...previousList, ...currentList.orderData]
            }, [])
            let totalSale = mainList.reduce((total, currentList) => {
                {
                    return total + currentList.amount.totalAmount
                }
            }, 0)
            let netProfit = mainList.reduce((total, currentList) => {
                {
                    let sellerAmount = currentList.amount.totalAmount - currentList.amount.discountedAmount
                    return total + sellerAmount
                }
            }, 0)
            let totalDiscount = mainList.reduce((total, currentList) => {
                {
                    return total + currentList.amount.discountedAmount
                }
            }, 0)
            let returnData = { totalSale, orderCount: mainList.length, totalDiscount, netProfit }
            return success(res, "Profit detail", returnData)
        } catch (error) {
            console.log(error);
            return unknownError(res, error.message)
        }
    },
    customerOrderHistory: async (req, res) => {
        try {
            const token = parseJwt(req.headers.authorization)
            const orderData = await getCustomerOrderDetails(token.customId);
            return orderData ? success(res, "order history", orderData) : badRequest(res, "no order found")
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    customerCurrentOrder: async (req, res) => {
        try {
            const token = parseJwt(req.headers.authorization)
            const orderData = await getCustomerCurrentOrder(token.customId);
            return orderData ? success(res, "order history", orderData) : badRequest(res, "no order found")
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    addPartnerToOrder: async (req, res) => {
        try {
            const { taskId, partnerData, orderId } = req.body
            const { status, message } = await addPartnerDetails(orderId, partnerData, taskId)
            return status ? success(res, message) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    sellerPerformance: async (req, res) => {
        try {
            const token = parseJwt(req.headers.authorization)
            const { status, message, data } = await performance(token.customId)
            return status ? success(res, message, data) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    changeOrderFromPartner: async (req, res) => {
        try {
            const { orderId, orderStatus } = req.body
            let { status, message, data } = await changeStatusFromDelivery(orderId, orderStatus)
            return status ? success(res, message) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    rateOrder: async (req, res) => {
        try {
            const { orderId, ratingStatus } = req.body
            let { status, message } = await changeOrderRatingStatus(orderId, ratingStatus)
            return status ? success(res, message) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    pendingRatingListOfUser: async (req, res) => {
        try {
            const token = parseJwt(req.headers.authorization)
            let { status, message, data } = await pendingRatingList(token.customId)
            return status ? success(res, message, data) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    },
    orderStat: async (req, res) => {
        try {
            let { status, message, data } = await totalOrderCount()
            return status ? success(res, message, data) : badRequest(res, message)
        } catch (error) {
            return unknownError(res, error.message)
        }
    }

}


