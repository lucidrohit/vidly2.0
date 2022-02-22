const { mongoose } = require("mongoose");
const { Rental } = require("../../models/rental");
const { User } = require("../../models/user");
const request = require("supertest")
const moment = require('moment');
const { Movie } = require("../../models/movie");

describe("/api/returns", ()=>{
    let server;
    let customerId;
    let movieId;
    let rental;
    let token;
    let payload;
    let movie;
    let exec = async()=> {return await request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send(payload)
    }
    
    beforeEach(async()=> { 
        server = require("../../index")
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        movie = new Movie({
            _id:movieId,
            title:"12345",
            dailyRentalRate:2,
            genre:{category:"12345"},
            numberInStock:10
        });
        await movie.save();
        rental = new Rental({
            customer:{
                _id:customerId,
                name:"12345",
                phone:"12345"
            },
            movie:{
                _id:movieId,
                title:"12345",
                dailyRentalRate:2
                
            }
        });
        await rental.save();
        
        token = new User().generateAuthToken();
        payload = {customerId, movieId};
        
    });
    
    afterEach(async()=>{
        await Rental.deleteMany({});
        await Movie.deleteMany({});
        await server.close();
    }); 
    
    it("should return 401 if client id is not present", async()=>{
        token = '';
        let res = await exec();
        expect(res.status).toBe(401)
    });
    
    it("should return 400 if customerId is not present", async()=>{
        payload = {customerId}
        let res = await exec();
        expect(res.status).toBe(400)
    });
    it("should return 400 if movieId is not present", async()=>{
        payload = {movieId}
        let res = await exec();
        expect(res.status).toBe(400)
    });
    
    it("should return 404 if no rental found for the customer/movie", async()=>{
        await Rental.deleteMany({});
        let res = await exec();
        expect(res.status).toBe(404)
    });
    
    it("should return 400 if return is already processed", async()=>{
        
        rental.dateReturned = new Date();
        await rental.save();
        let res = await exec();
        expect(res.status).toBe(400)
    });
    
    it("should return 200 if we have valid request", async()=>{
        
        await rental.save();
        let res = await exec();
        expect(res.status).toBe(200)
    });
    it("should set the rental date if in input is valid", async()=>{
        let res = await exec();
        
        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned
        
        expect(diff).toBeLessThan(10*1000);
        
    });
    
    it("should set the rentalfee if in input is valid", async()=>{
        rental.dateOut = moment().add(-7, "days").toDate() ;
        await rental.save();
        let res = await exec();
        
        const rentalInDb = await Rental.findById(rental._id);
        
        expect(rentalInDb.rentalFee).toBe(14);
        
    });
    
    it("should increase the movie in stock if input is valid", async()=>{
        let res = await exec();
        
        const movieInDb = await Movie.findById(movieId);
        expect(movieInDb.numberInStock).toBe(movie.numberInStock+1)
        
        
    });
    
    it("should return the rental if input is valid", async()=>{
        let res = await exec();
        
        const rentalInDb = await Rental.findById(rental._id);
        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee','customer', 'movie']))
        
        
    });
}); 