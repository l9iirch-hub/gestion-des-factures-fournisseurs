const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "overdue"],
      default: "unpaid",
    },
    description: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
