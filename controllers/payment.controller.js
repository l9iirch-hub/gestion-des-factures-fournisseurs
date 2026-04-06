const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const { updateInvoiceStatus } = require("./invoice.controller");

const createPayment = async (req, res) => {
  const { amount, paymentDate, mode_paiement, note } = req.body;
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });
  if (invoice.status === "paid")
    return res.status(422).json({ message: "Facture déjà payée" });
  if (!amount || amount <= 0)
    return res.status(422).json({ message: "Montant doit être > 0" });

  const payments = await Payment.find({ invoiceId: invoice._id });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  if (totalPaid + amount > invoice.amount) {
    return res
      .status(422)
      .json({ message: "Dépasse le montant de la facture" });
  }

  const paymentDateObj = new Date(paymentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (paymentDateObj > today)
    return res.status(422).json({ message: "Date future non autorisée" });

  const payment = await Payment.create({
    invoiceId: invoice._id,
    userId: req.user.id,
    amount,
    paymentDate,
    mode_paiement,
    note,
  });
  await updateInvoiceStatus(invoice);

  res.status(201).json(payment);
};

const getPayments = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) return res.status(404).json({ message: "Facture non trouvée" });

  const payments = await Payment.find({ invoiceId: invoice._id });
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    payments,
    totalPaid,
    remainingAmount: invoice.amount - totalPaid,
    invoiceStatus: invoice.status,
  });
};

module.exports = { createPayment, getPayments };
