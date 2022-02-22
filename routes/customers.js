const express = require("express");
const router = express.Router();
const Joi = require("joi");
const mongoose = require("mongoose");
const {Customer, validateCustomer} = require("../models/customer")


router.get("/", async (req, res) => {
    const customers = await Customer.find().sort("name");
    res.send(customers);
});

router.get("/:id", async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send("this customer does not exist...");
    res.send(customer);
});

router.post("/", async (req, res) => {
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).send(`Error: ${error.message}`);

    const customer = new Customer(req.body);
    await customer.save();
    res.send(req.body);
});


router.put("/:id", async(req, res)=>{
    let customer = await Customer.findById(req.params.id);
    if(!customer) return res.status(404).send("the customer donot exist");

    customer = {
        name:(req.body.name)?req.body.name:customer.name,
        isGold:(req.body.isGold)?req.body.isGold:customer.isGold,
        phone:(req.body.phone)?req.body.phone:customer.phone

    };
    
    const {error} = validateCustomer(customer);
    if(error) return res.status(400).send(`Error: ${error.message}`)

    customer = await Customer.findByIdAndUpdate(req.params.id, customer, {
        new:true
    });

    res.send(customer);
});


router.delete("/:id", async (req,res)=>{
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if(!customer) return res.status(404).send("this customer does not exist");
    res.send(customer)

})



module.exports = router;
