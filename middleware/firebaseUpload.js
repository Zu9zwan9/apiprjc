const path = require('path');
const { bucket } = require('./firebase-config');

async function uploadToFirebase(file) {
    const { stream, mimetype } = file;
    const filename = `${file.md5}${Date.now()}${path.extname(file.name)}`;
    const fileUpload = bucket.file(filename);

    const blobStream = fileUpload.createWriteStream({
        metadata: {
            contentType: mimetype,
        },
    });

    stream.pipe(blobStream);

    return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => reject(error));
        blobStream.on('finish', () => {
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURI(fileUpload.name)}?alt=media`;
            resolve(publicUrl);
        });
        stream.end();
    });
}

module.exports = uploadToFirebase;
