// Import the functions you need from the SDKs you need
const firebase = require("firebase/app");
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAIg7ID5St7OofM831hPv4Qg-D19u4hE0Q",
    authDomain: "auction-files.firebaseapp.com",
    projectId: "auction-files",
    storageBucket: "auction-files.appspot.com",
    messagingSenderId: "906404407225",
    appId: "1:906404407225:web:7c21e0c9df955e46adb868",
    measurementId: "G-BHEK01KLMQ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const admin = require('firebase-admin');
const serviceAccount = require('../auction-files firebase-adminsdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "auction-files.appspot.com"
});

const bucket = admin.storage().bucket();

module.exports = { admin, bucket };
