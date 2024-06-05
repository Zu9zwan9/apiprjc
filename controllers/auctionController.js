const asyncHandler = require("express-async-handler");
const Auction = require("../models/auction");
const auctionStatusEnum = require("../types/enums/auctionStatusEnum");
const path = require('path');
const {AuctionRate} = require("../models/auctionRate");
const buffer = require("node:buffer");
const {bucket} = require("../middleware/firebase-config");
const {getDownloadURL} = require("firebase-admin/storage");
const {User} = require("../models/user");
const {sendSendgridEmail} = require("../services/sendgridService");
const {calculatePriceChange} = require("../utils/common");
const {SITE_NAME} = require("../utils/env");
exports.auction_create = asyncHandler(async (req, res, next) => {

    const auction = new Auction(req.body);

    if (req.files) {
        const {thumbnail_file} = req.files;


        if (thumbnail_file) {
            const buffer = thumbnail_file.data;
            console.log("buffer")
            console.log(buffer);
            const filename = thumbnail_file.md5 + Date.now() + path.extname(thumbnail_file.name);
            console.log(filename);
            await bucket.file(filename).save(buffer);
            const fileRef = bucket.file(filename);
            const url = await getDownloadURL(fileRef)
            console.log(url);
            auction.thumbnail = url;
        }
    }

    auction.dateCreate = Date.now();
    auction.viewCount = 0;


    if (auction.dateClose) {
        const time = new Date(auction.dateClose * 1000).getTime();

        if (time < Date.now()) {
            auction.status = auctionStatusEnum.CLOSE
        } else {
            auction.status = auctionStatusEnum.ACTIVE;
        }
    }
    //console.log(Date.now());
    //console.log((auction.dateClose) ? new  Date(auction.dateClose*1000).getTime() : "undefined");

    const result = await auction.save();

    res.json(result);
});

exports.auction_edit = asyncHandler(async (req, res, next) => {

    const auction = await Auction.findById(req.body._id);

    if (auction) {

        auction.name = req.body.name;
        auction.vinCode = req.body.vinCode;
        auction.modelId = req.body.modelId;
        auction.brandId = req.body.brandId;
        auction.dateClose = req.body.dateClose;
        auction.year = req.body.year;
        auction.color = req.body.color;
        auction.description = req.body.description;
        auction.carMileage = req.body.carMileage;
        auction.categoryId = req.body.categoryId;
        auction.isCommercial = req.body.isCommercial;
        auction.type = req.body.type;
        auction.countryId = req.body.countryId;
        auction.locationId = req.body.locationId;

        if (req.files) {
            const {thumbnail_file} = req.files;


            if (thumbnail_file) {
                const buffer = thumbnail_file.data;
                console.log("buffer")
                console.log(buffer);
                const filename = thumbnail_file.md5 + Date.now() + path.extname(thumbnail_file.name);
                console.log(filename);
                await bucket.file(filename).save(buffer);
                const fileRef = bucket.file(filename);
                const url = await getDownloadURL(fileRef)
                console.log(url);
                auction.thumbnail = url;
            }
        }

        const result = await auction.save();

        if (result) {
            res.status(200).json(auction);
        } else {
            res.status(422).json({message: "error"});
        }

    } else {
        res.status(422).json({message: "error"});
    }
});

exports.auction_list = asyncHandler(async (req, res, next) => {


    const list = await Auction.find();

    res.json(list);
});

exports.auction_filter = asyncHandler(async (req, res, next) => {

    console.log(req.body);

    let filterList = [];

    const yearFrom = parseInt(req.body.yearFrom);
    const yearTo = parseInt(req.body.yearTo);

    const carMileageFrom = parseInt(req.body.carMileageFrom);
    const carMileageTo = parseInt(req.body.carMileageTo);

    const priceFrom = parseInt(req.body.priceFrom);
    const priceTo = parseInt(req.body.priceTo);

    const auction = Auction
        .where('price').gte(priceFrom).lte(priceTo > 0 ? priceTo : Number.MAX_SAFE_INTEGER)
        .where('carMileage').gte(carMileageFrom).lte(carMileageTo > 0 ? carMileageTo : Number.MAX_SAFE_INTEGER)
        .where('year').gte(yearFrom).lte(yearTo > 0 ? yearTo : Number.MAX_SAFE_INTEGER);

    const type = req.body.type;

    if (type.trim().length) auction.where('type', type);

    const brand = req.body.brand;

    if (brand?.length) auction.where('brandId', brand);

    const model = req.body.model;

    if (model?.length) auction.where('modelId', model);

    const category = req.body.category;

    if (category.length) auction.where('categoryId', category);

    const action = req.body.action;

    switch (action) {
        case "popular":
            auction.sort({viewCount: 'desc'});
            break;
        case "new":
            auction.sort({_id: 'desc'});
            break;
        case "commercial":
            auction.where('isCommercial', true);
            break;

    }

    const country = req.body.country;
    if (country?.length) auction.where('countryId', country);

    const location = req.body.location;
    if (location?.length) auction.where('locationId', location);

    const list = await auction.find();

    res.json(list);
});

exports.auction_get_by_id = asyncHandler(async (req, res, next) => {

    const result = await Auction.findById(req.params.id);

    if (result) {

        result.viewCount++;
        const updateCount = await result.save();

        res.status(200).json(result);
    } else {
        res.status(422).json({message: "error", id: req.params.id});
    }
});

exports.auction_rate_get_by_id = asyncHandler(async (req, res, next) => {

    const result = await AuctionRate.find({auctionId: req.params.id}).populate('user').sort({_id: "desc"});

    if (result) {
        console.log(result);

        res.status(200).json(result);
    } else {
        res.status(422).json({message: "error", id: req.params.id});
    }
});

exports.auction_user_rate_get_by_id = asyncHandler(async (req, res, next) => {

    const result = await AuctionRate.find({userId: req.params.id}).sort({_id: "desc"});

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(422).json({message: "error", id: req.params.id});
    }
});

exports.auction_delete = asyncHandler(async (req, res, next) => {

    const result = await Auction.findByIdAndDelete(req.body._id);


    if (result) {
        res.status(200).json({message: "success"});
    } else {
        res.status(422).json({message: "error", id: req.body._id});
    }
});
exports.user_save_auction = asyncHandler(async (req, res, next) => {

    const result = await AuctionRate.findOne({userId: req.body.userId, auctionId: req.body.auctionId});
    if (result) {
        res.status(200).json({message: "already saved"});
    } else {
        const auctionRate = new AuctionRate(req.body);
        const result = await auctionRate.save();
        res.status(200).json(result);
    }
});
exports.user_delete_auction = asyncHandler(async (req, res, next) => {

    const result = await AuctionRate.findOneAndDelete
    ({userId: req.body.userId, auctionId: req.body.auctionId});
    if (result) {
        res.status(200).json({message: "success"});
    } else {
        res.status(422).json({message: "error"});
    }
});
exports.user_auction_list = asyncHandler(async (req, res, next) => {

    const result = await AuctionRate.find({userId: req.params.id});
    if (result) {
        res.status(200).json(result);
    } else {
        res.status(422).json({message: "error", id: req.params.id});
    }

});

exports.follow_price = asyncHandler(async (req, res, next) => {
    const {auctionId = '', userId = ''} = req.params;
    // Check if user is exist in db
    const getUser = await User.findById(userId).select(['_id', 'followedAuctionPrice']);
    if (!getUser) {
        return res.status(404).json({message: 'The user is not found'});
    }
    // Check if auction is exist
    const getAuction = await Auction.findById(auctionId).select('_id');
    if (!getAuction) {
        return res.status(404).json({message: `The action with id ${auctionId} is not found`});
    }
    // Check if user is already followed this auction
    if (getUser?.followedAuctionPrice?.findIndex(id => id.toString() === auctionId) !== -1) {
        return res.status(403).json({message: `You are already followed this auction`});
    }
    // Add auction id to followed auction price list
    await User.updateOne({
        _id: userId
    }, {
        $addToSet: {
            followedAuctionPrice: auctionId
        }
    });
    return res.status(200).json({ message: 'You have successfully followed the auction price' });
});

exports.unfollow_price = asyncHandler(async (req, res, next) => {
    const {auctionId = '', userId = ''} = req.params;
    // Check if user is exist in db
    const getUser = await User.findById(userId).select(['_id', 'followedAuctionPrice']);
    if (!getUser) {
        return res.status(404).json({message: 'The user is not found'});
    }
    // Check if auction is exist
    const getAuction = await Auction.findById(auctionId).select('_id');
    if (!getAuction) {
        return res.status(404).json({message: `The action with id ${auctionId} is not found`});
    }
    // Check if user is already followed this auction
    if (getUser?.followedAuctionPrice?.findIndex(id => id.toString() === auctionId) === -1) {
        return res.status(403).json({message: `You dont follow this auction`});
    }
    // Remove auction id from the followed auction price list
    await User.updateOne({
        _id: userId
    }, {
        $pull: {
            followedAuctionPrice: auctionId
        }
    });
    return res.status(200).json({ message: 'You have successfully unfollowed the auction price' });
});

exports.check_followed_price = asyncHandler(async (req, res, next) => {
    const {auctionId = '', userId = ''} = req.params;
    // Check if user is exist in db
    const getUser = await User.findById(userId).select(['_id', 'followedAuctionPrice']);
    if (!getUser) {
        return res.status(404).json({message: 'The user is not found'});
    }
    // Check if auction is exist
    const getAuction = await Auction.findById(auctionId).select('_id');
    if (!getAuction) {
        return res.status(404).json({message: `The action with id ${auctionId} is not found`});
    }
    // Check if user followed this auction or not
    res.send(200).json({followed: getUser?.followedAuctionPrice?.findIndex(id => id.toString() === auctionId) !== -1});
});
