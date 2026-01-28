const router = require("express").Router();
const {
  assignDeliveryBoy,
  completeDelivery
} = require("../controllers/deliveryController");

router.post("/assign", assignDeliveryBoy);
router.post("/complete", completeDelivery);

module.exports = router;
