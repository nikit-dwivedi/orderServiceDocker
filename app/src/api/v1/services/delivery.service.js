const { post, get } = require("./axios.service")
const { assignTaskToPartner, unassignTaskToPartner } = require("./url.service")

exports.assignPartner = async (orderData,) => {
    try {
        const url = assignTaskToPartner()
        const response = await post(url, orderData)
    } catch (error) {
        console.log(error.message);
    }
}

exports.unassignPartner = async (orderId, token) => {
    try {
        const url = unassignTaskToPartner()
        const bodyData = {
            orderId: orderId,
            status: "completed",
        }
        const header = { Authorization: token }
        const response = await post(url, bodyData, header)
    } catch (error) {
        console.log(error.message);
    }
}