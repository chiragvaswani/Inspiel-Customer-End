const mongoose = require("mongoose");
const { Schema } = mongoose;

// const Slots = new Schema({ slot: String });

const Slots = new Schema({
  startTime: {
    hours: Number,
    minutes: Number
  },
  endTime: {
    hours: Number,
    minutes: Number
  }
});

const Address = new Schema({
  flatno: Number,
  street: String,
  city: String,
  landmark: String
});

const CourtSchema = new Schema({
  name: { type: String },
  sport: { type: String },
  ownerusername: { type: String },
  address: { type: Address },
  imagepath: { type: String },
  slots: { type: [Slots] }
});
const Court = mongoose.model("court", CourtSchema);

module.exports = Court;
