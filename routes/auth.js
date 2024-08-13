const express = require('express');
const User = require('../models/User');
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const fetchuser =  require("../middleware/fetchuser");

const router = express.Router();
const JWT_SECRET = "Bhai_Tera_Gunda";

// ROUTE 1 : Create a user, POST : '/api/auth/createuser'. No login required
router.post(
    // endpoint
    "/createuser", 

    // validations
    [
        body("name", "Name must have 3 chacarters").isLength({min : 3}),
        body("email", "Enter a valid Email.").isEmail(),
        body("password", "Password must have 5 or more characters.").isLength({min : 5}),
    ], 

    // callback function
    async (req, res) => {
    
    // If there are any validation errors, send 400 and errors
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }

    try{
        // if user with this email already exist, send 400 and error
        let user = await User.findOne({email : req.body.email});
        if(user){
            res.status(400).json({error: "A user with this email already exists. Please login.."})
        }

        // generates a salt for hashing the password
        const salt = await bcrypt.genSalt(10); 
        
        // Synchronous Sign with default (HMAC SHA256)
        const secPass = await bcrypt.hash( req.body.password, salt ); 

        user = await User({
            name : req.body.name,
            password : secPass,
            email : req.body.email,
        });
        user.save();

        const data = {
            user : {
                id : user.id,
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        res.json(authToken);
    }
    catch (error) {
        res.status(500).send("Internal Server Error");
    }
});


// ROUTE 2 :  Logs a user in, POST : '/api/auth/login'. No login required
router.post(
    // endpoint
    "/login", 

    // validations 
    [
        body("email", "Enter a valid Email").isEmail(),
        body("password", "Password is required * ").exists(),
    ],

    // callback
    async (req, res) => {
        // If there are any validation errors in email and password, send 400 and errors
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors : errors.array()});
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({email : email});
            if(!user){
                res.status(400).json({error: "Please try to log in with correct credentials."});
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if(!passwordCompare){
                res.status(400).json({error: "Please try to log in with correct credentials."});
            }

            const data = {
                user : {
                    id : user.id,
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET);
            res.json({authToken}); 
            // in frontend we will store authToken and will send it in header for various other srequests
        }
        catch (error) {
            res.status(500).send("Internal Server Error");
        }

    }
);

// ROUTE 3 : Gets user information of logged in user. GET : "api/auth/getuser". login required
router.get( "/getuser", fetchuser, async (req, res) => {
    try {
        // get user by id
        const userId = req.user.id
        let user = await User.findById(userId).select("-password");

        if(!user){
            res.status(400).json({error: "Please try to log in with correct credentials."});
        }

        res.send(user);
    }
    catch (error) {
        res.status(500).send("Internal Server Error");
    }

});

module.exports = router;