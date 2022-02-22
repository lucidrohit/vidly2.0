const express = require('express');
const mongoose = require('mongoose');
const Joi = require("joi")
const _ = require('lodash');
const {User} = require("../models/user")
const bcrypt = require("bcrypt");
const router = express.Router();
const passwordComplexity = require("joi-password-complexity");

router.post("/", async (req,res)=>{
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email:req.body.email});
    if(!user) return res.status(400).send("Invalid email.");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send("Invalid password.")
    
    const token = user.generateAuthToken();
    res.send(token);

});

const complexityOptions = {
    min: 5,
    max: 1024,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 4,
  };

function validate(req){
    const schema = Joi.object({
        email:Joi.string().min(5).max(255).required().email(),
        password: passwordComplexity(complexityOptions)

    });

    return schema.validate(req);
}


module.exports = router;