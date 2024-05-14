const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET
module.exports = {
    createSession: (userId) => {
        return jwt.sign({userId: userId}, secret);

    },
    getUserId: (token) => {
        try {
            const decoded = jwt.verify(token, secret);
            return decoded.userId;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}
