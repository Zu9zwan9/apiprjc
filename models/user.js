const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    thumbnail: String,
    auctionRate: [{type: mongoose.Schema.Types.ObjectId, ref: "AuctionRate"}],
    followedAuctionPrice: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auction"
        }
    ]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function getUser(userId) {
    const user = await User.findById(userId);

    return user;
}

module.exports = {User, getUser};
