const asyncHandler = require("express-async-handler");
const Comment = require("../models/comment");
const bcrypt = require('bcrypt');





exports.comment_get_by_auction_id = asyncHandler(async (req, res, next) => {

    const result = await Comment.find({auctionId: req.params.id}).sort({_id: "desc"});

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(422).json({message: "error", id: req.params.id});
    }
});

exports.comment_create = asyncHandler(async (req, res, next) => {

    const comment = await new Comment({
        comment: req.body.comment,
        userId: req.body.userId,
        auctionId: req.body.auctionId,
        userName: req.body.userName,
    }).save();

    req.app.io.to(req.body.auctionId).emit("comment",comment);

    res.json({
        comment: comment.comment,
        _id: comment._id,
        userName: comment.userName
    });
});


