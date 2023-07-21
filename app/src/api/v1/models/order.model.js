const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timingSchema = new Schema({
    status: {
        type: String,
        enum: ['init', 'pending', 'preparing', 'ready', "assigned", 'dispatched', 'delivered', 'cancelled'],
    },
    time: {
        type: String
    },
    date: {
        type: String
    }
})

const clientSchema = new Schema({
    clientId: {
        type: String,
        required: true
    },
    clientName: {
        type: String
    },
    clientPhone: {
        type: String
    },
    clientAddress: {
        type: String
    },
    clientLongitude: {
        type: Number,
    },
    clientLatitude: {
        type: Number
    }
})

const outletSchema = new Schema({
    outletId: {
        type: String,
        required: true
    },
    sellerId: {
        type: String
    },
    outletName: {
        type: String
    },
    outletPhone: {
        type: String
    },
    outletArea: {
        type: String
    },
    outletAddress: {
        type: String
    },
    outletLongitude: {
        type: Number,
    },
    outletLatitude: {
        type: Number
    }
})
const partnerSchema = new Schema({
    partnerId: {
        type: String,
    },
    partnerName: {
        type: String
    },
    taskId: {
        type: String
    },
    phone: {
        type: String
    },
    image: {
        type: String
    }
})

const amountSchema = new Schema({
    totalAmount: {
        type: Number
    },
    deliveryCharge: {
        type: Number,
    },
    deliveryTip: {
        type: Number
    },
    taxAmount: {
        type: Number
    },
    discountedAmount: {
        type: Number,
    },
})

const paymentSchema = new Schema({
    paymentMode: {
        type: String
    },
    paymentStatus: {
        type: String,
    },
    method: {
        type: Object
    },
    taxAmount: {
        type: Number
    },
    discountedAmount: {
        type: Number,
    },
})

const productSchema = new Schema({
    productId: {
        type: String,
        required: true,
    },
    lastVariationId: {
        type: String
    },
    productName: {
        type: String,
    },
    variationName: {
        type: String
    },
    productPrice: {
        type: Number
    },
    isVeg: {
        type: Boolean
    },
    quantityPrice: {
        type: Number,
    },
    quantity: {
        type: Number,
        default: 1
    },
    addOnName: {
        type: String
    },
    addOnIdList: [{
        type: String
    }]
})

const orderSchema = new Schema({
    orderId: {
        type: String,
        unique: true
    },
    mpOrderId: {
        type: String,
        default: "",
    },
    productList: [{
        type: productSchema,
    }],
    client: {
        type: clientSchema
    },
    outlet: {
        type: outletSchema,
    },
    partner: {
        type: partnerSchema,
        default: {}
    },
    payableAmount: {
        type: Number,
    },
    distance: {
        type: String,
    },
    status: {
        type: String,
        enum: ['init', 'pending', 'preparing', 'ready', 'dispatched', 'delivered', 'cancelled'],
        default: 'init'
    },
    amount: {
        type: amountSchema
    },
    payment: {
        type: paymentSchema
    },
    timing: [{
        type: timingSchema
    }],
    ratingStatus: {
        type: String,
        enum: ["pending", "skipped", "completed"],
        default: "pending"
    }
}, { timestamps: true })
const orderModel = mongoose.model('order', orderSchema);
module.exports = orderModel;

