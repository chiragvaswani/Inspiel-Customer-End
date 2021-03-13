const mongoose = require("mongoose");
const { Schema } = mongoose;

const Slots = new Schema({
  startTime: {
    hours: Number,
    minutes: Number,
    am: String
  },
  endTime: {
    hours: Number,
    minutes: Number,
    pm: String
  }
});

const OwnerSchema = new Schema({
  username: { type: String },
  firstname: { type: String },
  lastname: { type: String },
  email: { type: String, unique: true },
  contact: { type: Number },
  court: { type: String },
  sport: { type: String },
  password: { type: String },
  copassword: { type: String },
  address: { type: String },
  street: { type: String },
  city: { type: String },
  landmark: { type: String },
  description: { type: String },
  slots: { type: [Slots] }
});

const Owner = mongoose.model("user", OwnerSchema);

module.exports = Owner;
