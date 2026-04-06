const Invoice = require("../models/Invoice");
const Supplier = require("../models/Supplier");
const Payment = require("../models/Payment");

const updateInvoiceStatus = async (invoice) => {
  const payments = await Payment.find({ invoiceId: invoice._id });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  let status = "unpaid";
  if (totalPaid === 0) status = "unpaid";
  else if (totalPaid >= invoice.amount) status = "paid";
  else status = "partially_paid";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today && status !== "paid") status = "overdue";

  if (invoice.status !== status) {
    invoice.status = status;
    await invoice.save();
  }

  return { totalPaid, remainingAmount: invoice.amount - totalPaid };
};

const createInvoice = async (req, res) => {
  const { supplierId, amount, dueDate, description } = req.body;

  const supplier = await Supplier.findOne({
    _id: supplierId,
    userId: req.user.id,
  });
  if (!supplier)
    return res.status(403).json({ message: "Fournisseur non trouvé" });

  if (!amount || amount <= 0)
    return res.status(422).json({ message: "Montant doit être > 0" });

  const invoice = await Invoice.create({
    userId: req.user.id,
    supplierId,
    amount,
    dueDate,
    description,
    status: "unpaid",
  });
  res.status(201).json(invoice);
};

const getInvoices = async (req, res) => {
  const { status, supplierId, page = 1, limit = 15 } = req.query;
  const query = { userId: req.user.id };
  if (status) query.status = status;
  if (supplierId) query.supplierId = supplierId;

  const invoices = await Invoice.find(query)
    .populate("supplierId", "name")
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const total = await Invoice.countDocuments(query);

  const invoicesWithDetails = await Promise.all(
    invoices.map(async (invoice) => {
      const { totalPaid, remainingAmount } = await updateInvoiceStatus(invoice);
      return {
        id: invoice._id,
        supplierId: invoice.supplierId._id,
        supplierName: invoice.supplierId.name,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        status: invoice.status,
        totalPaid,
        remainingAmount,
        createdAt: invoice.createdAt,
      };
    }),
  );

  res.json({
    invoices: invoicesWithDetails,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  });
};

const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate(
    "supplierId",
    "name",
  );
  if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });

  const { totalPaid, remainingAmount } = await updateInvoiceStatus(invoice);
  res.json({ ...invoice.toObject(), totalPaid, remainingAmount });
};

const updateInvoice = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });

  const payments = await Payment.find({ invoiceId: invoice._id });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  if (totalPaid >= invoice.amount)
    return res
      .status(422)
      .json({ message: "Facture payée, modification impossible" });

  const { amount, dueDate, description } = req.body;
  if (amount && amount <= 0)
    return res.status(422).json({ message: "Montant doit être > 0" });

  const updated = await Invoice.findByIdAndUpdate(
    req.params.id,
    { amount, dueDate, description },
    { new: true },
  );
  await updateInvoiceStatus(updated);
  res.json(updated);
};

const deleteInvoice = async (req, res) => {
  const payments = await Payment.find({ invoiceId: req.params.id });
  if (payments.length > 0)
    return res
      .status(422)
      .json({ message: "Facture avec paiements, suppression impossible" });

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });

  await invoice.deleteOne();
  res.json({ message: "Facture supprimée" });
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  updateInvoiceStatus,
};
