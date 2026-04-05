const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { checkSupplierOwner } = require('../middlewares/owner.middleware');
const { createSupplier, getSuppliers, getSupplierById, updateSupplier, deleteSupplier } = require('../controllers/supplier.controller');
const router = express.Router();

router.use(protect);
router.post('/', createSupplier);
router.get('/', getSuppliers);
router.get('/:id', checkSupplierOwner, getSupplierById);
router.put('/:id', checkSupplierOwner, updateSupplier);
router.delete('/:id', checkSupplierOwner, deleteSupplier);

module.exports = router;