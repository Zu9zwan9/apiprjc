const asyncHandler = require("express-async-handler");
const Category = require("../models/category");
const bcrypt = require('bcrypt');

exports.category_list = asyncHandler(async (req, res, next) => {

    const categoryList = await Category.find();

    res.json(categoryList);
});

exports.category_delete = asyncHandler(async (req, res, next) => {

    const result = await Category.findByIdAndDelete(req.body._id);


    if (result) {
        res.status(200).json({message: "success"});
    } else {
        res.status(422).json({message: "error", id: req.body._id});
    }
});

exports.category_edit = asyncHandler(async (req, res, next) => {

    const category = await Category.findById(req.body._id);

    if (category) {

        category.name = req.body.name;
        category.description = req.body.description;

        const result = await category.save();

        if (result) {
            res.status(200).json(category);
        } else {
            res.status(422).json({message: "error"});
        }

    } else {
        res.status(422).json({message: "error"});
    }
});

exports.category_get_by_id = asyncHandler(async (req, res, next) => {

    const result = await Category.findById(req.params.id);

    if (result) {
        res.status(200).json(result);
    } else {
        res.status(422).json({message: "error", id: req.params.id});
    }
});

exports.category_create = asyncHandler(async (req, res, next) => {

    const category = await new Category({
        name: req.body.name,
        description: req.body.description
    }).save();


    res.json({
        name: category.name,
        _id: category._id,
        description: category.description
    });
});
