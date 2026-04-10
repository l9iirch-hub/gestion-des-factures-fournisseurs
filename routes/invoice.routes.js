const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { checkInvoiceOwner } = require("../middlewares/owner.middleware");
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/invoice.controller");
const router = express.Router();

router.use(protect);
router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/:id", checkInvoiceOwner, getInvoiceById);
router.put("/:id", checkInvoiceOwner, updateInvoice);
router.delete("/:id", checkInvoiceOwner, deleteInvoice);

module.exports = router;
