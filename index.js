const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const router = require('./routes/list');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cron = require('node-cron');
const dotenv = require('dotenv');
require('dotenv').config();
const isDevelopmentEnvironment = process.env.NODE_ENV !== 'production';
require('dotenv').config();

const SERVER_PORT = process.env.PORT;

const app = express();

app.use(cors());

const session = require('cookie-session');

app.use(session({
    secret: 'Enter your secret key',
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: true || false, // Set to true if you're using HTTPS, false if using HTTP
        httpOnly: true || false // Mitigates risk of client side script accessing the cookie

    }
}));
app.use((req, res, next) => {
    next();
});

passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize user by their ID
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


app
    .use(bodyParser.urlencoded({extended: false}))
    .use(bodyParser.json())
    .use(passport.initialize())
    .use(passport.session())
    .use(fileUpload())
    .use(express.static('files'))
    .use('/files', express.static('files'))
    .use('/api', router);

passport.use(new LocalStrategy({
    usernameField: 'email',  // Ensure your form fields match
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({email: email}, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, {message: 'Incorrect email.'});
        }
        if (!compareSync(password, user.password)) {
            return done(null, false, {message: 'Incorrect password.'});
        }
        return done(null, user);
    });
}));


const httpServer = http.createServer(app);

const server = new socketio.Server(httpServer);

app.io = server;

const mongoDb = process.env.MONGO_URI;
mongoose.connect(mongoDb);

const User = require('./models/user.js');
const AuctionRate = require('./models/auctionRate');
const Auction = require('./models/auction');
const auctionStatusEnum = require('./types/enums/auctionStatusEnum');
const {compareSync} = require("bcrypt");


cron.schedule('* * * * * *', async () => {
    console.log("cron tab");

    console.log("time: ", Math.floor(Date.now() / 1000));
    console.log(mongoose.connection.readyState);


    const list = await Auction
        .where('status', auctionStatusEnum.ACTIVE)
        .where('dateClose').lte(Math.floor(Date.now() / 1000))
        .find();

    list.map(item => {

        item.status = auctionStatusEnum.CLOSE;
        item.save();
        console.log("close auction", item._id);

        try {
            server.emit("auction_close", item._id);
            server.to(item._id).emit("auction_close", item._id)

        } catch (error) {
            console.log(error);
        }


        console.log("close auction", item._id);
    })
});

app.post('/',
    passport.authenticate('local', {session: true}),
    (req, res) => {

        console.log("Request");

        //const user = new User({name: 'Alex', email: 'Email', role: 'role'});
        //u//ser.save();
        //console.log('user', user);

        /*
        user.save((err, user) => {
            if (err) {
              console.log('err', err)
            }
            console.log('saved user', user)
        });
        */
        res.json("okay");

    });
app.post('auth/logout', function (req, res) {
    req.logout();
    req.session.destroy(function (err) {

        if (err) {
            return res.status(500).send('Failed to destroy session');
        }
        res.send('Session destroyed');
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.json('not auth')
}

app.get('/login', (req, res) => {
    res.send("Home page. You're authorized.");
});

app.get('/home', ensureAuthenticated, (req, res) => {

    if (req.isAuthenticated()) {
        res.send("Home page. You're authorized.");
    }
    res.send("Home page. You're not ! authorized.");
});

server.on("connection", (socket) => {

    console.log(`socket connection ${socket.id}`);

    socket.on("join_room", (data) => {
        console.log("join_room", data);
        if (data) socket.join(data);
    });

    socket.on("auction_rate", async (data) => {

        console.log("data", data);
        const auctionRate = new AuctionRate();
        auctionRate.value = data.value;
        auctionRate.time = data.time;
        auctionRate.userId = data.user._id;
        auctionRate.user = data.user;
        auctionRate.userName = data.user.name;
        auctionRate.auctionId = data.auctionId;

        await auctionRate.save();

      
        
        console.log("send to room", data.user.name);

        socket.to(data.auctionId).emit("auction_rate", auctionRate);

        //console.log("auction rate",data);
    })

    socket.on("disconnect", () => {
        console.log(`socket disconnected ${socket.id}`);
    })
});


httpServer.listen(SERVER_PORT, () => {
    console.log(`Server start on port ${SERVER_PORT}`);
});



