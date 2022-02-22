const mongoose = require("mongoose");
const Joi = require("joi");

const Customer = mongoose.model(
    "customer",
    new mongoose.Schema({
        isGold: {
            type: Boolean,
            default: false,
        },
        name: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
    })
);


function validateCustomer(customer) {
    const schema = Joi.object({
        isGold: Joi.boolean().default(false),
        name: Joi.string().required().min(3),
        phone: Joi.string().required().min(4).max(15),
    });
    return schema.validate(customer);
}



exports.Customer =  Customer;
exports.validateCustomer =  validateCustomer;
