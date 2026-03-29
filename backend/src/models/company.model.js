const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    defaultCurrency: { type: String, required: true, uppercase: true, trim: true },
  },
  { timestamps: true }
);

companySchema.index({ name: 1 });

module.exports = mongoose.model("Company", companySchema);
