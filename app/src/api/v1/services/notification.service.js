const { post } = require('./axios.service');
const { sellerOrderNotificationUrl, sellerStatusNotificationUrl, customerOrderNotificationUrl, adminOrderNotificationUrl } = require('./url.service');

exports.sendNotification = async (sellerId, message, outletId) => {
    try {
        let data = {
            app_id: "73beb105-9dca-45eb-8f7c-479ddc15cb43",
            contents: { "en": `${message}` },
            headings: { "en": `New order received` },
            data: { outletId },
            include_external_user_ids: [sellerId]
        };
        let headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic NzcyZTY5OTMtMDkzYi00ODY3LWIwM2EtNWRhOTMxYjZlMGEw"
        };

        let options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };

        let https = require('https');
        let req = https.request(options, function (res) {
            res.on('data', function (data) {
            });
        });

        req.on('error', function (e) {
            console.log(e);
        });

        req.write(JSON.stringify(data));
        req.end();
    } catch (error) {
        console.log(error.message);
    }
};

exports.sendCustomerNotification = async (customerId, message, orderId) => {
    try {
        let data = {
            app_id: "089e033e-f4bc-4082-aa7d-ece18822d553",
            contents: { "en": `${message}` },
            headings: { "en": `Order updates` },
            data: { orderId },
            include_external_user_ids: [customerId]
        };
        let headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Authorization": "Basic NWRjNTcxZGEtMWM2YS00ZTg1LThhOGYtZjc4NDM3NzI4NmMx"
        };

        let options = {
            host: "onesignal.com",
            port: 443,
            path: "/api/v1/notifications",
            method: "POST",
            headers: headers
        };

        let https = require('https');
        let req = https.request(options, function (res) {
            res.on('data', function (data) {
            });
        });

        req.on('error', function (e) {
            console.log(e);
        });
        req.write(JSON.stringify(data));
        req.end();
    } catch (error) {
        console.log(error.message);
    }
}
exports.merchantNotification = async (orderId, sellerId) => {
    try {
        const notificationUrl = sellerOrderNotificationUrl();
        const sendNotification = await post(notificationUrl, { orderId, sellerId })
        return sendNotification.status ? true : false
    } catch (error) {
        return false
    }
}
exports.adminNotification = async (orderId) => {
    try {
        const notificationUrl = adminOrderNotificationUrl();
        const sendNotification = await post(notificationUrl, { orderId })
        return sendNotification.status ? true : false
    } catch (error) {
        return false
    }
}

exports.customerNotification = async (customId,orderId) => {
    try {
        const notificationUrl = customerOrderNotificationUrl();
        const sendNotification = await post(notificationUrl, { customId, orderId })
        return sendNotification.status ? true : false
    } catch (error) {
        console.log(error);
        return false
    }
}
exports.statusNotification = async (outletId, status) => {
    try {
        if (status != 'init') {
            return false
        }
        const notificationUrl = sellerStatusNotificationUrl();
        const sendNotification = await post(notificationUrl, { outletId, status })
        return sendNotification.status ? true : false
    } catch (error) {
        return false
    }
}
