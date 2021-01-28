const mongoose = require("mongoose");
const { Schema } = mongoose;

const Slots = new Schema({
  startTime: {
    hours: Number,
    minutes: Number
  },
  endTime: {
    hours: Number,
    minutes: Number
  }
}); // added on 26th Jan

const cDate = new Schema({});

const BookingSchema = new Schema({
  username: { type: String },
  // date: { type: Date, default: Date.now().toLocaleString() },
  // date: {type: cDate},
  date: { type: String },
  courtname: { type: String },
  ownerusername: { type: String },
  slot: { type: Slots },
  cost: { type: Number }
});
const Booking = mongoose.model("booking", BookingSchema);

module.exports = Booking;
