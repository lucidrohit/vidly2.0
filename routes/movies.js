const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const {Movie, validateMovie} = require("../models/movie");
const {Genre} = require("../models/genre");
const auth = require("../middleware/auth")

router.get("/", async(req,res)=>{
    const movies = await Movie.find();
    res.send(movies);
});

router.get("/:id", async(req,res)=>{
    const movie = await Movie.findById(req.params.id);
    if(!movie)  return res.status(400).send("Invalid Movie.")

    res.send(movie);
})

router.post("/", auth, async(req, res)=>{
    const {error} = validateMovie(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findById(req.body.genreId);
    if(!genre)  return res.status(400).send("Invalid genre.")

    const movie = new Movie({
        title: req.body.title,
        genre: {
            _id:genre._id,
            category:genre.category
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
    })

    await movie.save();

    res.send(movie);

});


module.exports = router;