const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  paymentDate: { type: Date, required: true },
  mode_paiement: { type: String, required: true, enum: ['espèces', 'chèque', 'virement'] },
  note: String
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);