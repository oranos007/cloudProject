const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(403).send("Access denied");

    jwt.verify(token, 'RANDOM_TOKEN_SECRET', (err, decoded) => {
        if(err) return res.status(401).send("Invalid token");
        req.userData = decoded;
        next();
    });
};

module.exports = verifyToken;