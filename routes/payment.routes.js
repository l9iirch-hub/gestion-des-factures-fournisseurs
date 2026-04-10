const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { checkInvoiceOwner } = require("../middlewares/owner.middleware");
const {
  createPayment,
  getPayments,
} = require("../controllers/payment.controller");
const router = express.Router();

router.use(protect);
router.post("/:id/payments", checkInvoiceOwner, createPayment);
router.get("/:id/payments", checkInvoiceOwner, getPayments);

module.exports = router;
