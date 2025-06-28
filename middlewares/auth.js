const jwt = require('jsonwebtoken');

function isme(req, res, next){
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/dashboard/login')
    };
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        return next();
    } catch (error) {
        return res.redirect('/dashboard/login')
    }
}

module.exports = {isme};