const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String, required: true },
    year: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Available", "Issued"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
