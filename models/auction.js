const mongoose = require('mongoose');

const AuctionSchema = mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    vinCode: String,
    carMileage: Number,
    color: String,
    year: Number,
    modelId: Number,
    brandId: Number,
    thumbnail: String,
    viewCount: Number,
    dateCreate: Date,
    dateClose: Number,
    status: Number,
    categoryId: String,
    isCommercial: Boolean,
    type: Number
});

const favAuctionSchema = new mongoose.Schema({
    userId: String,
    auctionId: String
});
favAuctionSchema.index({userId: 1, auctionId: 1}, {unique: true});
const FavAuction = mongoose.model('FavAuction', favAuctionSchema);


const Auction = mongoose.model('Auction', AuctionSchema);

module.exports = Auction;
