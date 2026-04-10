const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { checkSupplierOwner } = require("../middlewares/owner.middleware");
const {
  getSupplierStats,
  getDashboard,
} = require("../controllers/analytics.controller");
const router = express.Router();

router.use(protect);
router.get("/dashboard", getDashboard);
router.get("/suppliers/:id/stats", checkSupplierOwner, getSupplierStats);

module.exports = router;
