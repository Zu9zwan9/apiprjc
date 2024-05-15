const glob = require('glob');
const Router = require('express').Router;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userController = require("../controllers/userController");
const commentController = require("../controllers/commentController");
const categoryController = require("../controllers/categoryController");
const auctionController = require("../controllers/auctionController");
const authenticateToken = require("../middleware/authenticateToken");
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit to 5MB
    },
});
module.exports = Router({mergeParams: true})

    .get('/category/list', categoryController.category_list)
    .get('/category/:id', categoryController.category_get_by_id)
    .post('/category/create', categoryController.category_create)
    .post('/category/edit', categoryController.category_edit)
    .post('/category/delete', categoryController.category_delete)
    .get('/user/list', userController.user_list)
    .post('/user/login', userController.user_auth)
    .post('/user/registration', userController.user_registration)
    .post('/user/delete', userController.user_delete)
    .post('/save-auction', auctionController.user_save_auction)
    .post('/delete-auction', auctionController.user_delete_auction)
    .get('/user-auction/:id', auctionController.user_auction_list)
    .get('/user/:id', userController.user_get_by_id)
    .post('/user/:id', userController.user_edit_by_id)
    .post('/auction/delete', auctionController.auction_delete)
    .post('/auction/edit', auctionController.auction_edit)
    .get('/auction/list', auctionController.auction_list)
    .post('/auction/filter', auctionController.auction_filter)
    .get('/auction-rate/:id', auctionController.auction_rate_get_by_id)
    .get('/auction-rate-user/:id', auctionController.auction_user_rate_get_by_id)
    .get('/auction/:id', auctionController.auction_get_by_id)
    .get('/comment/auction/:id', commentController.comment_get_by_auction_id)
    .post('/comment', commentController.comment_create)
    .post('/auction/create', upload.single('thumbnail_file'), auctionController.auction_create);


