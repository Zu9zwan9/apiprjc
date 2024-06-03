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
require('dotenv').config();
const isDevelopmentEnvironment = process.env.NODE_ENV !== 'production';
const SERVER_PORT = process.env.PORT;
const app = express();
const { calculatePriceChange } = require("./utils/common");
const { SITE_NAME } = require("./utils/env");
const { sendSendgridEmail } = require("./services/sendgridService");
const sendEmail = require("./utils/mailer");

app.use(cors());

const session = require('cookie-session');

app.use(session({
    secret: 'Enter your secret key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true
    }
}));

app.use((req, res, next) => {
    next();
});

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

app.use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use(passport.initialize())
    .use(passport.session())
    .use(fileUpload())
    .use(express.static('files'))
    .use('/files', express.static('files'))
    .use('/api', router);

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({ email: email }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        if (!compareSync(password, user.password)) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    });
}));

const httpServer = http.createServer(app);
const server = new socketio.Server(httpServer);
app.io = server;

const mongoDb = process.env.MONGO_URI;
mongoose.connect(mongoDb);

const { User, getUser } = require('./models/user.js');
const { AuctionRate, getBestBid } = require('./models/auctionRate');
const Auction = require('./models/auction');
const auctionStatusEnum = require('./types/enums/auctionStatusEnum');
const { compareSync } = require("bcrypt");

cron.schedule('* * * * * *', async () => {
    console.log("cron tab");

    const list = await Auction
        .where('status', auctionStatusEnum.ACTIVE)
        .where('dateClose').lte(Math.floor(Date.now() / 1000))
        .find();

    list.forEach(item => {
        item.status = auctionStatusEnum.CLOSE;
        item.save();
        console.log("close auction", item._id);

        getBestBid(item._id).then(bestBid => {
            if (bestBid) {
                getUser(bestBid.userId).then(user => {
                    if (user) {
                        console.log(`Winner: ${user.name} <${user.email}>`);
                        sendEmail(user.email, "Congratulations on Winning the Auction!",
                            `Hello ${user.name}, you have won the auction for item ${item._id}!`,
                            `<strong>Hello ${user.name},</strong><br>You have won the auction for item ${item._id}!`);
                    }
                })
            }
        });

        try {
            server.emit("auction_close", item._id);
            server.to(item._id).emit("auction_close", item._id)

        } catch (error) {
            console.log(error);
        }
    });
});

app.post('/',
    passport.authenticate('local', { session: true }),
    (req, res) => {
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
        if (data) socket.join(data);
    });

    socket.on("auction_rate", async (data) => {
        const auctionRate = new AuctionRate();
        auctionRate.value = data.value;
        auctionRate.time = data.time;
        auctionRate.userId = data.user._id;
        auctionRate.user = data.user;
        auctionRate.userName = data.user.name;
        auctionRate.auctionId = data.auctionId;

        await auctionRate.save();
        const bestBid = await getBestBid(data.auctionId);
        if (bestBid && bestBid._id.toString() === auctionRate._id.toString()) {
            const auction = await Auction.findById(data.auctionId);
            const getUsers = await User.find({ followedAuctionPrice: { $in: [auction._id] } }).select('name email');
            await Promise.all(getUsers.map(async ({ name, email }) => {
                return sendSendgridEmail({
                    to: email,
                    templateId: 'd-a9cd00248db7455c89f8ade5268d1be2',
                    dynamicTemplateData: {
                        userName: name,
                        lotId: auction._id.toString(),
                        currentPrice: `${auctionRate.value}$`,
                        priceChange: `New highest bid: ${auctionRate.value}$`,
                        siteName: SITE_NAME || 'My site'
                    },
                });
            }));
        }

        socket.to(data.auctionId).emit("auction_rate", auctionRate);
    });

    socket.on("disconnect", () => {
        console.log(`socket disconnected ${socket.id}`);
    });
});

httpServer.listen(SERVER_PORT, () => {
    console.log(`Server start on port ${SERVER_PORT}`);
});
