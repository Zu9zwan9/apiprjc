const asyncHandler = require("express-async-handler");
const Auction = require("../models/auction");
const auctionStatusEnum = require("../types/enums/auctionStatusEnum");
const path = require('path');
const AuctionRate = require("../models/auctionRate");
const {bucket} = require("../middleware/firebase-config");
const {single} = require("../middleware/multerConfig");

async function uploadThumbnail(file) {
    if (!file) return null;
    const blob = bucket.file(file.originalname);
    const blobStream = blob.createWriteStream({
        metadata: {
            contentType: file.mimetype,
        }
    });

    return new Promise((resolve, reject) => {
        blobStream.on('err', reject);
        blobStream.on('finish', async () => {
            await blob.makePublic();
            resolve(blob.publicUrl());
        });
        blobStream.end(file.buffer);
    });
}


exports.auction_create = asyncHandler(async (req, res) => {
    single('thumbnail_file')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const auctionData = req.body;
        const thumbnailFile = req.file;
        let thumbnailUrl = null;

        try {
            thumbnailUrl = await uploadThumbnail(thumbnailFile);
        } catch (error) {
            return res.status(500).json({ message: error.message }); // Use the specific error message
        }

            const auction = new Auction({
                ...auctionData,
                thumbnail: thumbnailUrl,
                dateCreate: Date.now(),
                viewCount: 0,
                status: auctionData.dateClose
                    ? (auctionData.dateClose * 1000 < Date.now() ? auctionStatusEnum.CLOSE : auctionStatusEnum.ACTIVE)
                    : auctionStatusEnum.ACTIVE
            });

        const result = await auction.save();
        res.status(201).json(result);
    });
});

exports.auction_edit = asyncHandler(async (req, res, next) => {

    const auction = await Auction.findById(req.body._id);

    if (auction) {

        auction.name = req.body.name;
        auction.price = req.body.price;
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

        if (req.files) {
            const {thumbnail_file} = req.files;


            if (thumbnail_file) {
                auction.thumbnail = thumbnail_file.md5 + Date.now() + path.extname(thumbnail_file.name)

                await thumbnail_file.mv(__dirname + '/../files/' + auction.thumbnail);
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

    const brand = parseInt(req.body.brand);

    if (brand > 0) auction.where('brandId', brand);

    const model = parseInt(req.body.model);

    if (model > 0) auction.where('modelId', model);

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
