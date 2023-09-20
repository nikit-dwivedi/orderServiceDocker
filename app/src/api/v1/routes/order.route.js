const express = require('express');
const { orderInit, todayOrder, changeOrderStatus, getOutletOrderCount, getOrderDetail, allOrderOfOutlet, cartOrder, allOrderOfSeller, markOrderSuccess, allProfitOfSeller, allProfitOfOutlet, customerOrderHistory, customerCurrentOrder, addPartnerToOrder, changeOrderFromPartner, rateOrder, pendingRatingListOfUser, allOrder, getMPOrderDetail, orderStat, allOrderDumpOfSeller, sellerPerformance } = require('../controllers/order.controller');
const { authenticateUser, authenticateSeller, authenticateGuest, authenticateAdmin } = require('../middlewares/authToken');
const router = express.Router();

router.get('/', authenticateAdmin, allOrder)
router.post('/cart', authenticateGuest, cartOrder)
router.post('/init', authenticateUser, orderInit);
router.post('/success', authenticateUser, markOrderSuccess);
router.get('/upcoming/:outletId', todayOrder)
router.post('/status', authenticateUser, changeOrderStatus);
router.get('/count/:outletId', getOutletOrderCount);
router.get('/outlet/:outletId', allOrderOfOutlet)
router.get('/outlet/:outletId/profit', allProfitOfOutlet)
router.get('/seller', authenticateSeller, allOrderOfSeller);
router.get('/seller/performance', authenticateSeller, sellerPerformance);
router.get('/seller/dump', authenticateSeller, allOrderDumpOfSeller);
router.get('/customer/history', authenticateUser, customerOrderHistory);
router.get('/customer/running', authenticateUser, customerCurrentOrder);
router.get('/seller/profit', authenticateSeller, allProfitOfSeller)
router.get('/details/:orderId', getOrderDetail);
router.get('/mp/details/:orderId', getMPOrderDetail);
router.post('/partner', addPartnerToOrder);
router.post('/partner/status', changeOrderFromPartner);
router.post('/rating', rateOrder);
router.get('/rating', authenticateUser, pendingRatingListOfUser);
router.get("/stat",authenticateAdmin,orderStat)




module.exports = router