
//post /api/returns {customerId, movieId}

// return 401 if client is not logged in
// return 400 if customerId is not provided
// return 400 if movieId is not provided
// return 404 if no rental found for this customer/movie
// return 400 if rental already processed

// return 200 if valid request
// cal the rental fee
// increase the stock
// return the rental
const moment = require("moment")
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth")
const {Rental} = require("../models/rental")
const {Movie} = require("../models/movie")


router.post("/", auth, async(req,res)=>{
    if(!req.body.customerId) return res.status(400).send("customerId is not provided")
    if(!req.body.movieId) return res.status(400).send("movieId is not provided")
    const rental = await Rental.findOne({
        'customer._id':req.body.customerId,
        'movie._id':req.body.movieId
    })
    if(!rental) return res.status(404).send("rental not present")

    if(rental.dateReturned) return res.status(400).send("Return already processed");

    rental.dateReturned = new Date();
    const rentalDays = moment().diff(rental.dateOut, "days");

    rental.rentalFee = rentalDays*rental.movie.dailyRentalRate;
    await rental.save()

    await Movie.updateOne({_id:rental.movie._id},{
        $inc:{numberInStock:1}
    })

    res.send(rental);
})

module.exports = router;