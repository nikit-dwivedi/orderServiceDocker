const express = require("express");
const router = express.Router();

require("../v1/config/mongodb");

const orderRoute = require('./routes/order.route.js')

router.use("/order", orderRoute);

module.exports = router;
