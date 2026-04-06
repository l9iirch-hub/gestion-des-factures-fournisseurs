const Supplier = require("../models/Supplier");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

const getSupplierStats = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier)
    return res.status(404).json({ message: "Fournisseur non trouvé" });

  const invoices = await Invoice.find({
    supplierId: supplier._id,
    userId: req.user.id,
  });
  const payments = await Payment.find({
    invoiceId: { $in: invoices.map((i) => i._id) },
  });

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);

  let overdueCount = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const invoicesByStatus = {
    unpaid: 0,
    partially_paid: 0,
    paid: 0,
    overdue: 0,
  };

  for (const invoice of invoices) {
    const invoicePayments = payments.filter(
      (p) => p.invoiceId.toString() === invoice._id.toString(),
    );
    const paidAmount = invoicePayments.reduce((sum, p) => sum + p.amount, 0);

    let status = "unpaid";
    if (paidAmount === 0) status = "unpaid";
    else if (paidAmount >= invoice.amount) status = "paid";
    else status = "partially_paid";

    const dueDate = new Date(invoice.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today && status !== "paid") {
      status = "overdue";
      overdueCount++;
    }

    invoicesByStatus[status]++;
  }

  const allInvoices = await Invoice.find({ userId: req.user.id });
  const globalTotal = allInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const percentage = globalTotal > 0 ? (totalAmount / globalTotal) * 100 : 0;

  res.json({
    supplierId: supplier._id,
    supplierName: supplier.name,
    totalInvoices: invoices.length,
    totalAmount,
    totalPaid,
    totalRemaining: totalAmount - totalPaid,
    overdueCount,
    percentage: parseFloat(percentage.toFixed(2)),
    invoicesByStatus,
  });
};

const getDashboard = async (req, res) => {
  const suppliers = await Supplier.find({ userId: req.user.id });
  const invoices = await Invoice.find({ userId: req.user.id });
  const payments = await Payment.find({ userId: req.user.id });

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = payments.reduce((sum, pay) => sum + pay.amount, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let overdueCount = 0;
  let overdueAmount = 0;
  const invoicesByStatus = {
    unpaid: 0,
    partially_paid: 0,
    paid: 0,
    overdue: 0,
  };

  for (const invoice of invoices) {
    const invoicePayments = payments.filter(
      (p) => p.invoiceId.toString() === invoice._id.toString(),
    );
    const paidAmount = invoicePayments.reduce((sum, p) => sum + p.amount, 0);

    let status = "unpaid";
    if (paidAmount === 0) status = "unpaid";
    else if (paidAmount >= invoice.amount) status = "paid";
    else status = "partially_paid";

    const dueDate = new Date(invoice.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today && status !== "paid") {
      status = "overdue";
      overdueCount++;
      overdueAmount += invoice.amount - paidAmount;
    }

    invoicesByStatus[status]++;
  }

  const supplierSpending = {};
  for (const invoice of invoices) {
    const invoicePayments = payments.filter(
      (p) => p.invoiceId.toString() === invoice._id.toString(),
    );
    const paidAmount = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
    if (!supplierSpending[invoice.supplierId])
      supplierSpending[invoice.supplierId] = 0;
    supplierSpending[invoice.supplierId] += paidAmount;
  }

  const topSuppliers = await Promise.all(
    Object.entries(supplierSpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(async ([supplierId, amount]) => {
        const supplier = await Supplier.findById(supplierId);
        return {
          supplierId,
          supplierName: supplier ? supplier.name : "Inconnu",
          totalSpent: amount,
        };
      }),
  );

  res.json({
    totalSuppliers: suppliers.length,
    totalInvoices: invoices.length,
    totalAmount,
    totalPaid,
    totalRemaining: totalAmount - totalPaid,
    overdueCount,
    overdueAmount,
    invoicesByStatus,
    topSuppliers,
  });
};

module.exports = { getSupplierStats, getDashboard };
