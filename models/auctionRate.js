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

async function getBestBid(auctionId) {
    const bestBid = await AuctionRate
    .where("auctionId", auctionId)
    .sort({value: -1})
    .sort({time: 1})
    .findOne();

    return bestBid;
}

module.exports = {AuctionRate, getBestBid};
