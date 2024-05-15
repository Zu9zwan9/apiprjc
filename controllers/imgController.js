const multer = require('multer');
const {bucket} = require("../middleware/firebase-config");
const {getStorage, getDownloadURL} = require("firebase-admin/storage");
const {extname} = require("path");

const Router = require('express').Router;
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit to 5MB
    },
});

module.exports = Router({mergeParams: true})
.post('/upload', upload.single('file'), async (req, res) => {

    const newFileName = req.file.md5 + Date.now() + extname(req.file.originalname);
    const buffer = req.file.buffer;
    await bucket.file(newFileName).save(buffer);
    const fileRef = bucket.file(newFileName);
    const url = await getDownloadURL(fileRef);
    res.send({imageUrl: url});
});
