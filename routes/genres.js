const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const mongoose = require('mongoose');
const Joi = require("joi");
const { Genre, validateGenre } = require("../models/genre");
const router = express.Router();



router.get("/", async (req, res) => {
    const genres = await Genre.find().sort("category");
    res.send(genres);
});


router.get("/:category", async (req, res) => {

    const genre = await Genre.findOne({ category: req.params.category });
    
    if (!genre) return res.status(404).send("please try again with different genre");
    res.send(req.params.category);
    
});

router.post("/", auth, async (req, res) => {
    
    const { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    let genre = await Genre.findOne({ category: req.body.category });
    if (genre) return res.status(409).send("this genre already exist, so u can't add it twice");
    
    genre = new Genre({ category: req.body.category });
    genre = await genre.save();
    
    res.send(genre);
    
});


router.put("/:category", auth, async (req, res) => {
    const { error } = validateGenre(req.body)
    if (error) return res.status(400).send(error.details[0].message);
    
    genre = await Genre.findOneAndUpdate({ category: req.params.category }, { category: req.body.category }, { new: true })
    
    if (!genre) return res.status(404).send("please try again with different genre");
    
    res.send(genre);
});

router.delete("/:category", [auth, admin], async (req, res) => {
    
    const genre = await Genre.findOneAndRemove({ category: req.params.category })
    if (!genre) return res.status(404).send("please try again with different genre");
    
    res.send(genre);
});


module.exports = router;