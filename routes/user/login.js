const Router = require('express').Router;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
module.exports = Router({mergeParams: true})
    .post('/user/login', async (req, res, next) => {

        console.log('router user auth');

        res.json("request");
    });
