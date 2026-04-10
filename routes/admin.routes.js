const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { adminMiddleware } = require("../middlewares/admin.middleware");
const {
  getAllClients,
  getClientSuppliers,
  getClientInvoices,
  getClientPayments,
} = require("../controllers/admin.controller");
const router = express.Router();

router.use(protect, adminMiddleware);
router.get("/clients", getAllClients);
router.get("/clients/:id/suppliers", getClientSuppliers);
router.get("/clients/:id/invoices", getClientInvoices);
router.get("/clients/:id/payments", getClientPayments);

module.exports = router;
