const {Schema, model} = require("mongoose");

const AuctionSchema = new Schema({
    name: String,
    description: String,
    price: Number,
    vinCode: String,
    carMileage: Number,
    color: String,
    year: Number,
    modelId: {
        type: Schema.Types.ObjectId,
        ref: "CarModel"
    },
    brandId: {
        type: Schema.Types.ObjectId,
        ref: "CarBrand"
    },
    thumbnail: String,
    viewCount: Number,
    dateCreate: Date,
    dateClose: Number,
    status: Number,
    categoryId: String,
    isCommercial: Boolean,
    type: Number,
    countryId: {
        type: Schema.Types.ObjectId,
        ref: "Country"
    },
    locationId: {
        type: Schema.Types.ObjectId,
        ref: "Location"
    }
});

const favAuctionSchema = new Schema({
    userId: String,
    auctionId: String
});



const Auction = model('Auction', AuctionSchema);

module.exports = Auction;
