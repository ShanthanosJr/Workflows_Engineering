const mongoose = require('mongoose');
const ComplaintSchema = new mongoose.Schema({
  ticket: { type: String, unique: true, index: true },
  area: { type: String, required: true, index: true },
  type: { type: String, enum: ['SAFETY','QUALITY','DELAY','OTHER'], required: true, index: true },
  complainant: { type: String, default: '' },
  description: { type: String, required: true },
  photoUrl: String,
  status: { type: String, enum: ['OPEN','IN_PROGRESS','RESOLVED'], default: 'OPEN', index: true },
  assignee: { type: String, default: 'Manager' },
  escalated: { type: Boolean, default: false },
  history: [{ at: Date, action: String, note: String }]
}, { timestamps: true });
ComplaintSchema.index({ type: 1, status: 1 });
module.exports = mongoose.model('Complaint', ComplaintSchema);
