const Supplier = require("../models/Supplier");
const Invoice = require("../models/Invoice");

const createSupplier = async (req, res) => {
  const { name, contact, email, phone, address } = req.body;

  if (!name || name.length < 2) {
    return res.status(422).json({ message: "Nom requis (min 2 caractères)" });
  }

  const supplier = await Supplier.create({
    userId: req.user.id,
    name,
    contact,
    email,
    phone,
    address,
  });
  res.status(201).json(supplier);
};

const getSuppliers = async (req, res) => {
  const { name, page = 1, limit = 10 } = req.query;
  const query = { userId: req.user.id };
  if (name) query.name = { $regex: name, $options: "i" };

  const suppliers = await Supplier.find(query)
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const total = await Supplier.countDocuments(query);

  res.json({
    suppliers,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  });
};

const getSupplierById = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier)
    return res.status(404).json({ message: "Fournisseur non trouvé" });

  const invoiceCount = await Invoice.countDocuments({
    supplierId: req.params.id,
  });
  res.json({ ...supplier.toObject(), invoiceCount });
};

const updateSupplier = async (req, res) => {
  const { name, contact, email, phone, address } = req.body;

  if (name && name.length < 2) {
    return res
      .status(422)
      .json({ message: "Nom doit contenir au moins 2 caractères" });
  }

  const supplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    { name, contact, email, phone, address },
    { new: true },
  );
  if (!supplier)
    return res.status(404).json({ message: "Fournisseur non trouvé" });
  res.json(supplier);
};

const deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier)
    return res.status(404).json({ message: "Fournisseur non trouvé" });
  await supplier.deleteOne();
  res.json({ message: "Fournisseur supprimé" });
};

module.exports = {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};
