const mongoose = require("mongoose");
const { Schema } = mongoose;

const PlayerSchema = new Schema({
  username: { type: String, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String },
  password: { type: String },
  contact: { type: Number },
  address: { type: String }
});

const Player = mongoose.model("player", PlayerSchema);

module.exports = Player;
