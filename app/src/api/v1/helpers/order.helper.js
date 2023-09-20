const orderModel = require('../models/order.model');
const { productEndPoint, outletEndPoint, customerEndPoint, discountDataUrl, sellerOutletEndpoint, getPartnerDetails, cartEndPoint } = require('../services/url.service');
const { post, get } = require('../services/axios.service');
const { randomBytes } = require('node:crypto');
const { merchantNotification, statusNotification, sendNotification, sendCustomerNotification, customerNotification, adminNotification } = require('../services/notification.service');
const { assignPartner, unassignPartner } = require('../services/delivery.service');
const moment = require("moment")
const { token } = require('morgan');
const res = require('express/lib/response');

module.exports = {
    getProductList: async (cartData) => {
        try {
            let productList = []
            let outletId = ""
            let totalAmount = 0
            for (const element of cartData) {
                const productUrl = productEndPoint(element.productId)
                const productData = await post(productUrl, { customItemIdList: element.customItemIdList })
                if (!productData.status) {
                    continue
                }
                outletId = productData.items.productList.outletId
                productData.items.productList.quantity = element.quantity
                productData.items.productList.totalPrice = productData.items.productList.productAmount * element.quantity
                totalAmount += productData.items.productList.totalPrice
                productList.push(productData.items.productList)
            }
            return { productList, outletId, totalAmount }
        } catch (error) {
            return false
        }
    },
    getCartDetails: async (cartId) => {
        try {
            const outletUrl = cartEndPoint(cartId)
            const outletData = await get(outletUrl)
            return outletData.status ? outletData.items : false
        } catch (error) {
            return false
        }
    },
    getOutletDetails: async (outletId) => {
        try {
            if (outletId == '1234') {
                outletId = 'bfc54c9ce627'
            }
            const outletUrl = outletEndPoint(outletId)
            const outletData = await get(outletUrl)
            return outletData.status ? outletData.items : false
        } catch (error) {
            return false
        }
    },
    getSellerOutlet: async (token) => {
        try {
            const sellerUrl = sellerOutletEndpoint()
            const sellerList = await get(sellerUrl, token)
            return sellerList.status ? sellerList.items : false
        } catch (error) {
            return false
        }
    },
    getCustomerDetails: async (token, locationId) => {
        try {
            const customerUrl = customerEndPoint()
            let userDetails = await get(customerUrl, token)
            let addressHolder = ""
            let longitudeHolder = null
            let latitudeHolder = null
            let userData = {}
            if (!userDetails.status) {
                return false
            }
            userDetails.items.addressList.forEach(element => {
                if (element._id == locationId) {
                    addressHolder = element.address,
                        longitudeHolder = element.longitude,
                        latitudeHolder = element.latitude
                }
            });
            if (!longitudeHolder || !latitudeHolder) {
                return false
            }
            if (userDetails.status) {
                delete userDetails.items.addressList
                userData = userDetails.items
                delete userData._id
                delete userData.__v
            }
            userData.address = addressHolder
            userData.longitude = longitudeHolder
            userData.latitude = latitudeHolder
            return userData
        } catch (error) {
            return false
        }
    },
    getDiscountDetails: async (discountId) => {
        try {
            const discountUrl = discountDataUrl(discountId)
            const discountData = await get(discountUrl)
            return discountData.status ? discountData.items : false
        } catch (error) {
            return false
        }
    },
    addOrder: async (orderData) => {
        try {
            const saveOrder = new orderModel(orderData)
            return await saveOrder.save() ? true : false
        } catch (error) {
            console.log(error.message);
            return false
        }
    },
    initOrderFromCart: async (orderId, isCod) => {
        try {
            let changeData = await orderModel.findOne({ orderId })
            if (!changeData) {
                return {
                    status: false, message: "order not found", data: {}
                }
            }
            if (changeData.status !== 'init') {
                return { status: false, message: "order already placed", data: {} }
            }
            let mpOrderId = randomBytes(4).toString('hex')
            let paymentMode = isCod ? "cash" : "online"
            let updatedData = await orderModel.findOneAndUpdate({ orderId }, { mpOrderId, "payment.paymentMode": paymentMode }, { new: true })
            changeData.mpOrderId = mpOrderId
            return { status: true, message: "payment initiated", data: updatedData }
        } catch (error) {
            return { status: false, message: error.message, data: {} }
        }
    },
    changeMPOrderId: async (orderId, mpOrderId) => {
        try {
            await orderModel.findOneAndUpdate({ orderId }, { mpOrderId })
            return { status: true, message: "mpOrderId changed", data: {} }
        } catch (error) {
            return { status: false, message: error.message, data: {} }
        }
    },
    updateCartOrder: async (orderData) => {
        try {
            const { orderId, productList, payableAmount, amount, distance, client } = orderData
            const changeData = await orderModel.findOneAndUpdate({ orderId }, { productList, payableAmount, distance, client, amount })
            return changeData ? true : false
        } catch (error) {
            return false
        }
    },
    changeToPending: async (paymentData) => {
        try {
            const { orderId, paymentMode, paymentStatus, method } = paymentData
            let changeData = await orderModel.findOne({ mpOrderId: orderId })
            if (!changeData) {
                return { status: false, message: "order not found", data: {} }
            }
            if (changeData.status != 'init') {
                return { status: false, message: "order not in cart", data: {} }
            }
            changeData.status = 'pending'
            const data = { paymentMode, paymentStatus, method }
            changeData.payment = data
            changeData.timing.push({ status: changeData.status, time: formatTime(), date: formatDate() })
            await changeData.save()
            await sendNotification(changeData.outlet.sellerId, `You have recived an order on ${changeData.outlet.outletName}`, changeData.outlet.outletId)
            await sendCustomerNotification(changeData.client.clientId, `Your order from ${changeData.outlet.outletName} has placed successfully`, changeData.orderId)
            await merchantNotification(`You have recived an order on ${changeData.outlet.outletName}`, changeData.outlet.sellerId)
            await adminNotification(orderId)
            return { status: true, message: "status changed", data: {} }
        } catch (error) {
            return { status: false, message: error.message }
        }
    },
    checkOrderPaymentMode: async (mpOrderId) => {
        try {
            let changeData = await orderModel.findOne({ mpOrderId })
            if (!changeData) {
                return { status: false, message: "order not found", data: {} }
            }

            let check = changeData.payment.paymentMode == "online" ? true : false
            return { status: true, message: "payment status", data: check }
        } catch (error) {
            return { status: false, message: error.message }
        }
    },
    changeStatus: async (orderId, orderStatus, customId, token) => {
        try {
            const statusList = ['pending', 'cancelled', 'accepted', 'preparing', 'ready', 'dispatched', 'delivered',]
            if (!statusList.includes(orderStatus)) {
                return { status: false, message: "invalid status", data: {} }
            }
            let changeData = await orderModel.findOne({ orderId })
            if (changeData) {
                let notificationMessage = customerNotificationMessage(orderStatus, changeData.outlet.outletName)
                if (statusList.indexOf(orderStatus) <= statusList.indexOf(changeData.status) || ((statusList.indexOf(orderStatus) - statusList.indexOf(changeData.status)) != 1 && (orderStatus != 'accepted' && orderStatus != "ready"))) {
                    return { status: false, message: "invalid status", data: {} }
                }
                if (orderStatus == 'accepted') {
                    orderStatus = 'preparing'
                }
                changeData.status = orderStatus
                changeData.timing.push({ status: orderStatus, time: formatTime(), date: formatDate() })
                await changeData.save()

                if (orderStatus == 'pending') {
                    await sendNotification(customId, `You have received an order on ${changeData.outlet.outletName}`, changeData.outlet.outletId)
                    await merchantNotification(`new order received on ${changeData?.outlet?.outletName}`, customId)
                    await adminNotification(orderId)
                } else {
                    if (orderStatus == 'preparing') {
                        await assignPartner(changeData)
                    }
                    await customerNotification(changeData.client.clientId, changeData.orderId)
                    await sendCustomerNotification(changeData.client.clientId, notificationMessage, changeData.orderId)
                    await statusNotification(changeData.outlet.outletId, orderStatus)
                    await adminNotification(orderId)
                }

                return { status: true, message: "status changed", data: {} }
            }
            return { status: false, message: "no order found", data: {} }
        } catch (error) {
            return { status: false, message: error.message, data: {} }
        }
    },
    changeStatusFromDelivery: async (orderId, orderStatus, customId, token) => {
        try {
            const statusList = ['ready', 'dispatched', 'delivered']
            if (!statusList.includes(orderStatus)) {
                return { status: false, message: "invalid status", data: {} }
            }
            let changeData = await orderModel.findOne({ orderId })
            if (!changeData) {
                return { status: false, message: "no order found", data: {} }
            }
            if (!statusList.includes(changeData.status)) {
                return { status: false, message: "no order found", data: {} }
            }
            let notificationMessage = customerNotificationMessage(orderStatus, changeData.outlet.outletName)
            changeData.status = orderStatus
            changeData.timing.push({ status: orderStatus, time: formatTime(), date: formatDate() })
            await changeData.save()
            await sendCustomerNotification(changeData.client.clientId, notificationMessage, changeData.orderId)
            await statusNotification(changeData.outlet.outletId, orderStatus)
            await customerNotification(changeData.client.clientId, changeData.orderId)
            await adminNotification(orderId)
            return { status: true, message: "status changed", data: {} }
        } catch (error) {
            return { status: false, message: error.message, data: {} }
        }
    },
    getTodaysOrder: async (outletId, status = "pending") => {
        try {
            let date = new Date
            let a = date.getDate()
            let b = date.getMonth()
            let c = date.getFullYear()
            if (status == "all") {
                status = ["pending", 'preparing', 'ready']
            }
            const orderData = await orderModel.find({
                "outlet.outletId": outletId,
                status: status,
                createdAt: {
                    $gte: new Date(c, b, a),
                    $lt: new Date(c, b, a + 1)
                }
            }).select('-_id -__v -productList._id -client._id -outlet._id -partner._id -amount._id -timing._id -createdAt -updatedAt')
            return orderData.reverse()
        } catch (error) {
            console.log(error);
            return false
        }
    },
    getOrderCount: async (outletId, from, to) => {
        try {
            let date = new Date
            let a = date.getDate()
            let b = date.getMonth()
            let c = date.getFullYear()
            const dateQuery = {
                createdAt: {
                    $gte: new Date(c, b, a),
                    $lt: new Date(c, b, a + 1)
                }
            }
            if (from && to) {
                dateQuery.createdAt = {
                    $gte: new Date(from),
                    $lt: new Date(to)
                }
            }
            let pendingCount = await orderModel.count({
                'outlet.outletId': outletId, status: "pending", dateQuery
            })
            let preperingCount = await orderModel.count({
                'outlet.outletId': outletId, status: "preparing", dateQuery
            })
            let readyCount = await orderModel.count({
                'outlet.outletId': outletId, status: "ready", dateQuery
            })
            let dispatchedCount = await orderModel.count({
                'outlet.outletId': outletId, status: "dispatched", dateQuery
            })
            let deliveredCount = await orderModel.count({
                'outlet.outletId': outletId, status: "delivered", dateQuery
            })
            let cancelledCount = await orderModel.count({
                'outlet.outletId': outletId, status: "cancelled", dateQuery
            })
            return { pendingCount, preperingCount, readyCount, dispatchedCount, deliveredCount, cancelledCount }
        }
        catch (error) {
            console.log(error);
            return false
        }
    },
    orderByOrderId: async (orderId) => {
        try {
            const orderData = await orderModel.findOne({ orderId })
            return orderData ? { status: true, message: "order details", data: orderData } : { status: false, message: "no order found", data: {} };
        } catch (error) {
            return { status: false, message: error.message, data: {} }
        }
    },
    orderByMPOrderId: async (mpOrderId) => {
        try {
            const orderData = await orderModel.findOne({ mpOrderId })
            return orderData ? { status: true, message: "order details", data: orderData } : { status: false, message: "no order found", data: {} };
        } catch (error) {
            return { status: false, message: error.message, data: {} }
        }
    },
    getAllOrderByOutletId: async (outletId, status = 'pending', from, to) => {
        try {
            if (status == "all") {
                status = ["pending", 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled']
            }
            if (status == "preparing") {
                status = ["preparing", "assigned"]
            }
            let query = {
                "outlet.outletId": outletId,
                status: status
            }
            if (from && to) {
                query.createdAt = {
                    $gte: new Date(from),
                    $lt: new Date(to)
                }
            } else {
                let d = new Date
                let a = d.getDate()
                let b = d.getMonth()
                let c = d.getFullYear()
                query.createdAt = {
                    $gte: new Date(c, b, a),
                    $lt: new Date(c, b, a + 1)
                }
            }

            const orderCount = await orderModel.aggregate([
                {
                    $match: {
                        "outlet.outletId": outletId,
                        createdAt: {
                            $gte: query.createdAt['$gte'],
                            $lt: query.createdAt['$lt']
                        }
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: {
                            $sum: 1
                        }
                    }
                }
            ])
            // .select('-_id -__v -productList._id -client._id -outlet._id -patner._id -amount._id -timing._id -createdAt -updatedAt')
            const orderData = await orderModel.find(query).select('-_id -__v -productList._id -client._id -outlet._id -patner._id -amount._id -timing._id -createdAt -updatedAt')
            const returnData = { orderData: orderData.reverse(), orderCount }
            return orderData[0] ? { status: true, message: "order list", data: returnData } : { status: false, message: "no orders found", data: orderData };
        } catch (error) {
            console.log(error); return { status: false, message: error.message, data: [] }
        }
    },
    getAllOrderDumpByOutletId: async (outletId) => {
        try {

            let status = ["pending", "preparing", "assigned", 'ready', 'dispatched', 'delivered', 'cancelled']
            let query = {
                "outlet.outletId": { $in: outletId },
                status: status
            }
            const orderData = await orderModel.find(query).select('-_id -__v -productList._id -client._id -outlet._id -patner._id -amount._id -timing._id -createdAt -updatedAt')
            return orderData[0] ? { status: true, message: "order list", data: orderData } : { status: false, message: "no orders found", data: orderData };
        } catch (error) {
            console.log(error); return { status: false, message: error.message, data: [] }
        }
    },
    getAllOrder: async (status = 'pending', from, to) => {
        try {
            if (status == "all") {
                status = ["pending", 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled']
            }
            if (status == "preparing") {
                status = ["preparing", "assigned"]
            }
            let query = {
                status: status
            }
            if (from && to) {
                query.createdAt = {
                    $gte: new Date(from),
                    $lt: new Date(to)
                }
            }
            const orderData = await orderModel.find(query).select('-_id -__v -productList._id -client._id -outlet._id -patner._id -amount._id -timing._id -updatedAt').sort({ _id: -1 }).lean()
            let newList = orderData.map((order) => {
                const date = new Date(order.createdAt).getFullYear()
                console.log(order.timing[1].date + " " + date + " " + order.timing[1].time);
                order.date = moment(order.timing[1].date + " " + date + " " + order.timing[1].time).calendar(null, {
                    sameDay: '[Today] h:m A',
                    lastDay: '[Yesterday] h:m A',
                    lastWeek: '[Last] dddd h:m A',
                    sameElse: 'MMM DD, YYYY h:m A'
                });
                delete order.createdAt
                return order
            })
            return newList[0] ? { status: true, message: "order list", data: newList.reverse() } : { status: false, message: "no orders found", data: newList };
        } catch (error) {
            console.log(error); return { status: false, message: error.message, data: [] }
        }
    },
    getCustomerOrderDetails: async (customerId) => {
        try {
            const status = ['pending', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled']
            const orderList = await orderModel.find({ 'client.clientId': customerId, status }).select('-_id -productList._id -client._id -outlet._id -patner._id -amount._id -timing._id -createdAt -updatedAt -__v')
            orderList.reverse()
            return orderList[0] ? orderList : false
        } catch (error) {
            return false
        }
    },
    getCustomerCurrentOrder: async (customerId) => {
        try {
            const status = ['pending', 'preparing', 'ready', 'dispatched']
            const orderList = await orderModel.find({ 'client.clientId': customerId, status }).select('-_id -productList._id -client._id -outlet._id -patner._id -amount._id -timing._id -createdAt -updatedAt -__v')
            orderList.reverse()
            return orderList[0] ? orderList : false
        } catch (error) {
            return false
        }
    },
    addPartnerDetails: async (orderId, partnerData, taskId) => {
        try {
            const orderData = await orderModel.findOne({ orderId });
            if (!orderData) {
                return { status: false, message: "order not found" }
            }
            orderData.partner.partnerId = partnerData.fleet_id;
            orderData.partner.partnerName = partnerData.fleet_name;
            orderData.partner.phone = partnerData.fleet_phone;
            orderData.partner.image = partnerData.fleet_image;
            orderData.partner.taskId = taskId;
            orderData.timing.push({ status: "assigned", time: formatTime(), date: formatDate() })
            await orderData.save();
            await sendCustomerNotification(orderData.client.clientId, `${partnerData.fleet_name} is your delivery partner.`, orderData.orderId)
            await customerNotification(orderData.client.clientId, orderData.orderId)
            return { status: true, message: "order updated" }
        } catch (error) {
            return { status: false, message: error.message }
        }
    },
    changeOrderRatingStatus: async (orderId, ratingStatus) => {
        try {
            const orderCheck = await orderModel.findOne({ orderId })
            if (!orderCheck) {
                return { status: false, message: "order not found" }
            }
            if (orderCheck.ratingStatus != "pending") {
                return { status: false, message: "rating already completed" }
            }
            await orderModel.findOneAndUpdate({ orderId }, { ratingStatus })
            return { status: true, message: "rating status changed" }
        } catch (error) {
            return { status: false, message: error.message }
        }
    },
    pendingRatingList: async (userId) => {
        try {
            const pendingList = await orderModel.findOne({ 'client.clientId': userId, status: "delivered", ratingStatus: "pending" })
            return pendingList ? { status: true, message: "pending rating", data: pendingList } : { status: false, message: "no pending rating" }
        } catch (error) {
            return { status: false, message: error.message, data: error }
        }
    },
    totalOrderCount: async () => {
        try {
            let date = new Date
            let a = date.getDate()
            let b = date.getMonth()
            let c = date.getFullYear()
            const statusCountList = await orderModel.aggregate([
                {
                    $match: {
                        status: {
                            $ne: "init"
                        },
                        createdAt: {
                            $gte: new Date(c, b, a),
                            $lt: new Date(c, b, a + 1)
                        }
                    }
                },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ])
            const statusCountMap = new Map(statusCountList.map(doc => [doc._id, doc.count]));
            !statusCountMap.has("pending") && statusCountMap.set("pending", 0)
            !statusCountMap.has("preparing") && statusCountMap.set("preparing", 0)
            !statusCountMap.has("ready") && statusCountMap.set("ready", 0)
            !statusCountMap.has("dispatched") && statusCountMap.set("dispatched", 0)
            !statusCountMap.has("delivered") && statusCountMap.set("delivered", 0)
            !statusCountMap.has("cancelled") && statusCountMap.set("cancelled", 0)
            let returnList = []
            statusCountMap.forEach((value, key) => {
                returnList = [{ status: key, count: value }, ...returnList]
            })
            return { status: true, message: "order count", data: returnList }
        } catch (error) {
            return { status: false, message: error.message, data: error }
        }
    },
    performance: async (sellerId) => {
        try {
            let d = new Date
            let a = d.getDate()
            let b = d.getMonth()
            let c = d.getFullYear()
            let performanceData = await orderModel.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(c, b, a),
                            $lt: new Date(c, b, a + 1)
                        },
                        'status': {
                            $ne: "init"
                        },
                        'outlet.sellerId': sellerId
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalOrder: { $sum: 1 },
                        orderValue: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ['$status', 'delivered'] },
                                    then: '$amount.totalAmount',
                                    else: 0
                                }
                            }
                        },
                        orderStatus: { $push: '$status' },
                        newCustomer: {
                            $addToSet: '$client.clientId'
                        }
                    }
                },
                {
                    $set: {
                        customerCount: { $size: '$newCustomer' },
                        cancelledOrder: {
                            $size: {
                                $filter: {
                                    input: '$orderStatus',
                                    as: 'review',
                                    cond: {
                                        $eq: ['$$review', 'cancelled']
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalOrder: 1,
                        orderValue: 1,
                        customerCount: 1,
                        cancelledOrder: 1,
                    }
                }
            ])
            performanceData = performanceData[0] ? performanceData[0] : { "totalOrder": 0, "orderValue": 0, "customerCount": 0, "cancelledOrder": 0 }
            return performanceData ? { status: true, message: "performance Detail", data: performanceData } : { status: false, message: "no performance" }

        } catch (error) {
            return { status: false, message: error.message, data: error }
        }
    }
}
function formatTime() {
    var currentTime = new Date();

    var currentOffset = currentTime.getTimezoneOffset();

    var ISTOffset = 330;

    var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

    let indainDate = ISTTime.toLocaleString().replace(",", "")
    let newData = indainDate.split(" ");
    let timeSplit = newData[1].split(':')
    if (timeSplit[0] < 10) {
        timeSplit[0] = `0${timeSplit[0]}`
    }
    let returnData = `${timeSplit[0]}: ${timeSplit[1]} ${newData[2].toLocaleUpperCase()}`
    return returnData
}
function formatDate() {
    var currentTime = new Date();

    var currentOffset = currentTime.getTimezoneOffset();

    var ISTOffset = 330;

    var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

    let indainDate = ISTTime.toDateString().split(' ')
    return `${indainDate[1]} ${indainDate[2]}`
}

function customerNotificationMessage(status, outletName) {
    'pending', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled'
    switch (status) {
        case "pending":
            return `Your order from ${outletName} has been placed successfully`
        case "accepted":
            return `${outletName} has accepted your order`
        case "ready":
            return `Waiting for Delivery Partner to pick your order up`
        case "dispatched":
            return `Good food on its way to your plate`
        case "delivered":
            return `Order delivered, Now soothe your cravings in peace!`
        case "cancelled":
            return `Your order was cancelled by the restaurant`
    }
}