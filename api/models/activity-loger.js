const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
  action: { type: String, required: true },
  category: { type: String, required: true },
  createdBy: { type: Schema.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  diff: { type: Schema.Types.Mixed },
}, { timestamps: true });

ActivitySchema.index({ action: 1, category: 1 });

module.exports = mongoose.model('LogActivity', ActivitySchema);
