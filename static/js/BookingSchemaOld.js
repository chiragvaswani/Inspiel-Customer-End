const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingsSchema = new Schema({
  username: { type: String },
  date: { type: Date },
  courtName: { type: String },
  slot: { type: String },
  cost: { type: Number },
  ownerUsername: { type: String }
});
const Booking = mongoose.model("booking", BookingsSchema);

module.exports = Booking;

// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const BookingSchema = new Schema({
//   username: { type: String },
//   date: { type: Date, default: Date.now },
//   courtname: { type: String },
//   ownerusername: { type: String },
//   slot: { type: String },
//   cost: { type: Number }
// });
// const Booking = mongoose.model("booking", BookingSchema);

// module.exports = Booking;
