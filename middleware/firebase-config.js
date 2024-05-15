const admin = require('firebase-admin');
const multer = require('multer');
const serviceAccount = require('../files/auction-files firebase-adminsdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://auction-files.appspot.com'
});

const bucket = admin.storage().bucket();

module.exports = { bucket };

