const asyncHandler = require("express-async-handler");
const User = require("../models/user");
const roleTypeEnum = require("../types/enums/roleTypeEnum");
const bcrypt = require('bcrypt');
const { Socket } = require("socket.io");
const path = require('path');
const {bucket} = require("../middleware/firebase-config");
const {getDownloadURL} = require("firebase-admin/storage");

exports.user_auth = asyncHandler(async (req, res, next) => {

    const userByEmail = await User
        .find({email: req.body.email})
        .limit(1);

    if (userByEmail.length) {

        const login = await bcrypt.compare(
            req.body.password,
            userByEmail[0].password
        );

        if (login) {
            res.json({
                name: userByEmail[0].name,
                email: userByEmail[0].email,
                role: userByEmail[0].role,
                _id: userByEmail[0]._id
            });
        } else {
            res.status(422).json({
                "message": "Пароль не вірний"
            });
        }

    } else {
        res.status(422).json({
            "message": "Користувача з таким email не існує"
        });
    }
});

exports.user_get_by_id = asyncHandler(async (req, res, next) => {

    const result = await User.findById(req.params.id);

    if (result) {

        res.status(200).json(result);
    } else {
        res.status(422).json({message: "error", id: req.params.id});
    }
});

exports.user_edit_by_id = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.params.id);

   

    if (user) {

        user.name = req.body.name;
        user.email = req.body.email;
        user.role = req.body.role;

        if (req.files) {
            const {thumbnail_file} = req.files;


            if (thumbnail_file) {
                const buffer = thumbnail_file.data;
                console.log("buffer")
                console.log(buffer);
                const filename= thumbnail_file.md5 + Date.now() + path.extname(thumbnail_file.name)
                console.log(filename);
                await bucket.file(filename).save(buffer);
                const fileRef = bucket.file(filename);
                const url = await getDownloadURL(fileRef)
                console.log(url);
                user.thumbnail =url
            }
        }


        let result = await user.save(); 

        console.log("id",user.id);

        req.app.io.to(user.id).emit("user",user);

        res.status(200).json(user);
    } else {
        res.status(422).json({message: "error", id: req.params.id});
    }
});

exports.user_delete = asyncHandler(async (req, res, next) => {

    const result = await User.findByIdAndDelete(req.body._id);


    if (result) {
        res.status(200).json({message: "success"});
    } else {
        res.status(422).json({message: "error", id: req.body._id});
    }
});

exports.user_list = asyncHandler(async (req, res, next) => {

    const userList = await User.find();
    res.json(userList);
});

exports.user_registration = asyncHandler(async (req, res, next) => {

    const count = await User.countDocuments({}).exec();

    const userByEmail = await User.find({email: req.body.email});

    if (userByEmail.length) {
        res.status(422).json({
            "message": "Користувач з таким email вже існує"
        });
    } else {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const user = await new User({
            name: req.body.name,
            email: req.body.email,
            password: passwordHash,
            role: (count) ? roleTypeEnum.CLIENT : roleTypeEnum.ROOT
        }).save();


        res.json({
            name: user.name,
            email: user.email,
            role: user.role,
            _id: user._id
        });
    }
});
