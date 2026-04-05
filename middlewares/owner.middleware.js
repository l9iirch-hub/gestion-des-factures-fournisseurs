const Supplier = require('../models/Supplier');
const Invoice = require('../models/Invoice');

const checkSupplierOwner = async (req, res, next) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Fournisseur non trouvé' });
  if (supplier.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
  next();
};

const checkInvoiceOwner = async (req, res, next) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });
  if (invoice.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });
  req.invoice = invoice;
  next();
};

module.exports = { checkSupplierOwner, checkInvoiceOwner };