const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    thumbnail: String,
    auctionRate: [{type: mongoose.Schema.Types.ObjectId, ref:"AuctionRate"}]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
