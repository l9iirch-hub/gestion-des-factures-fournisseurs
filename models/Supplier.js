const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, minlength: 2 },
    contact: String,
    email: String,
    phone: String,
    address: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Supplier", SupplierSchema);
