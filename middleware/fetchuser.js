// This middleware gets user from jwt token add it in 'req'

const jwt = require("jsonwebtoken");


const JWT_SECRET = "Bhai_Tera_Gunda";

const fetchuser = (req, res, next) => {
    const token = req.header("auth-token");
    // console.log("auth-token", token)
    if(!token){
        res.status(401).json({error : "Please authenticate using valid token ! "});
    }
    try {
        
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user
        next();
        
    } catch (error) {
        res.status(500).send({error : "Internal Server Error (fetchuser)", stackTrace : error});
    }
}

module.exports = fetchuser;