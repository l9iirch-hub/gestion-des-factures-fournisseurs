const User = require("../models/User");
const Supplier = require("../models/Supplier");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");

const getAllClients = async (req, res) => {
  const clients = await User.find({ role: "client" }).select("-password");
  res.json(clients);
};

const getClientSuppliers = async (req, res) => {
  const suppliers = await Supplier.find({ userId: req.params.id });
  res.json(suppliers);
};

const getClientInvoices = async (req, res) => {
  const invoices = await Invoice.find({ userId: req.params.id }).populate(
    "supplierId",
    "name",
  );
  res.json(invoices);
};

const getClientPayments = async (req, res) => {
  const payments = await Payment.find({ userId: req.params.id }).populate(
    "invoiceId",
  );
  res.json(payments);
};

module.exports = {
  getAllClients,
  getClientSuppliers,
  getClientInvoices,
  getClientPayments,
};
