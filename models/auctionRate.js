const mongoose = require('mongoose');

const AuctionRateSchema = new mongoose.Schema({
    time: Number,
    value: Number,
    userId: String,
    auctionId: String,
    userName: String,
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }
});

const AuctionRate = mongoose.model('AuctionRate', AuctionRateSchema);

module.exports = AuctionRate;
