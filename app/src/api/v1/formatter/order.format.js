const { randomBytes } = require('node:crypto');
const { encryption } = require('../middlewares/authToken');

module.exports = {
    orderInitFormatter: (clientData, productList, amountData, outletData) => {
        // console.log('+++++++++++++++++++++++++++++');
        // console.log(clientData, productList, amountData, outletData);
        // console.log('+++++++++++++++++++++++++++++');
        const formmatedTime = formatTime()
        const formattedDate = formatDate()
        const orderId = randomBytes(4).toString('hex')

        // //---------discount-Charge
        // let discountedAmount = 0
        // if (amountData.discountData) {
        //     if (amountData.totalAmount >= amountData.discountData.minAmount) {
        //         discountedAmount = (amountData.totalAmount * amountData.discountData.discountPercent) / 100
        //         if (!amountData.discountData.isFlatDiscount && discountedAmount > amountData.discountData.maxDiscount) {
        //             discountedAmount = amountData.discountData.maxDiscount
        //         }
        //     }
        // }

        // //----------delivery-charge
        let distance = distanceCalculator(clientData.longitude, clientData.latitude, outletData.longitude, outletData.latitude)
        // let deliveryCharge = 25
        // if (distance > 1.8) {
        //     if (distance <= 4) {
        //         deliveryCharge = distance * 10
        //     } else if (4 < distance <= 8) {
        //         let extraDistance = distance - 4
        //         deliveryCharge = (4 * 10) + (extraDistance * 11.5)
        //     } else {
        //         let extraDistance = distance - 8
        //         deliveryCharge = (4 * 10) + (4 * 11.5)(extraDistance * 12.5)
        //     }
        // }

        // //-----------tax-charge
        // let taxAmount = (amountData.totalAmount * 5) / 100

        // //-----------payable-amount
        // let payableAmount = (amountData.totalAmount + taxAmount + amountData.deliveryTip + deliveryCharge) - discountedAmount


        return {
            orderId: orderId,
            productList: productList,
            client: {
                clientId: clientData.customerId,
                clientName: clientData.name,
                clientPhone: clientData.phone,
                clientAddress: clientData.address,
                clientLongitude: clientData.longitude,
                clientLatitude: clientData.latitude
            },
            outlet: {
                sellerId: outletData.sellerId,
                outletId: outletData.outletId,
                outletName: outletData.outletName,
                outletPhone:outletData.phone,
                outletArea: outletData.area,
                outletAddress: outletData.shopAddress,
                outletLongitude: outletData.longitude,
                outletLatitude: outletData.latitude
            },
            distance: `${distance} kms`,
            payableAmount: amountData.payableAmount,
            amount: {
                totalAmount: amountData.totalAmount,
                deliveryCharge: amountData.deliveryFee,
                deliveryTip: amountData.deliveryTip,
                taxAmount: amountData.tax,
                discountedAmount: amountData.discountedAmount,
            },
            timing: [{
                status: "init",
                time: formmatedTime,
                date: formattedDate
            }]
        }
    },
    changeCartFormatter: (orderId, clientData, productList, amountData, outletData) => {
        //---------discount-Charge
        let discountedAmount = 0
        if (amountData.discountData) {
            if (amountData.totalAmount >= amountData.discountData.minAmount) {
                discountedAmount = (amountData.totalAmount * amountData.discountData.discountPercent) / 100
                if (!amountData.discountData.isFlatDiscount && discountedAmount > amountData.discountData.maxDiscount) {
                    discountedAmount = amountData.discountData.maxDiscount
                }
            }
        }
        //----------delivery-charge
        let distance = distanceCalculator(clientData.longitude, clientData.latitude, outletData.outletLongitude, outletData.outletLatitude)
        let deliveryCharge = 8
        if (distance <= 5) {
            deliveryCharge = (distance * 3) < 8 ? 8 : distance * 3
        } else if (distance > 5) {
            let extraDistance = distance - 5
            deliveryCharge = (5 * 3) + (extraDistance * 5)
        }

        //-----------tax-chanrge
        let taxAmount = (amountData.totalAmount * 5) / 100

        //-----------payable-amount
        let payableAmount = (amountData.totalAmount + taxAmount + amountData.deliveryTip + deliveryCharge) - discountedAmount


        return {
            orderId: orderId,
            productList: productList,
            distance: `${distance} kms`,
            payableAmount: payableAmount,
            client: {
                clientId: clientData.customerId,
                clientName: clientData.name,
                clientPhone: clientData.phone,
                clientAddress: clientData.address,
                clientLongitude: clientData.longitude,
                clientLatitude: clientData.latitude
            },
            amount: {
                totalAmount: amountData.totalAmount,
                deliveryCharge: deliveryCharge,
                deliveryTip: amountData.deliveryTip,
                taxAmount: taxAmount,
                discountedAmount: discountedAmount,
            }
        }
    }
}
function distanceCalculator(lon1, lat1, lon2, lat2) {
    lon1 = lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
    let c = 2 * Math.asin(Math.sqrt(a));
    let r = 6371;
    return parseFloat((c * r).toFixed(1));
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
    let returnData = `${timeSplit[0]}:${timeSplit[1]} ${newData[2].toLocaleUpperCase()}`
    return returnData
}
function formatDate() {
    var currentTime = new Date();

    var currentOffset = currentTime.getTimezoneOffset();

    var ISTOffset = 330;

    var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset) * 60000);

    let indainDate = ISTTime.toDateString().split(" ")

    return `${indainDate[1]} ${indainDate[2]}`
}