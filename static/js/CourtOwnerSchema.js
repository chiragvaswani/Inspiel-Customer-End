const mongoose = require("mongoose");
const { Schema } = mongoose;

const Address = new Schema({
  flatNo: Number,
  street: String,
  city: String,
  landmark: String
});

// const mongoose = require("mongoose");
// const { Schema } = mongoose;

const CourtOwnerSchema = new Schema({
  username: { type: String, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  password: { type: String },
  contact: { type: Number },
  name: { type: String },
  sport: { type: String },
  ownerUsername: { type: String },
  address: { type: Address },
  imagePath: { type: String }
});
const CourtOwner = mongoose.model("courtowner", CourtOwnerSchema);

module.exports = CourtOwner;
