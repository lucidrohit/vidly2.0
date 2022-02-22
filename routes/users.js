const express = require('express');
const mongoose = require('mongoose');
const Joi = require("joi");
const _ = require('lodash');
const {User, validateUser} = require("../models/user")
const passwordComplexity = require('joi-password-complexity');
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth")

const router = express.Router();

router.get("/me", auth ,async(req,res)=>{
    const user = await User.findById(req.user._id).select("-password");
    res.send(user)
})


router.post("/", async (req,res)=>{

    const {error} = validateUser(req.body);
    if(error) return res.status(400).send(error.details[0].message);


    let user = await User.findOne({email:req.body.email});
    if(user) return res.status(409).send("this user already exist, so u can't add it twice");

    user = new User(_.pick(req.body, ["name","email","password"]));

    let result = passwordComplexity().validate(user.password);
    if(result.error) return res.status(400).send(result.error.details[0].message);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password,salt );

    await user.save();

    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ["_id","name", "email"]));

});


module.exports = router;