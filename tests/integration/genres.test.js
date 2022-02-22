const request = require("supertest");
const { Genre } = require("../../models/genre")
const { User } = require("../../models/user")
let server;


describe("/api/genres", () => {
    
    beforeEach(() => { server = require("../../index"); })
    afterEach(async () => {
        await Genre.deleteMany({});
        await server.close();
    });
    
    
    describe("GET/", () => {
        it("should return all genres", async () => {
            Genre.insertMany([
                { category: "genre1" },
                { category: "genre2" }
            ]);
            
            const res = await request(server).get("/api/genres");
            expect(res.status).toBe(200);
            expect(res.body.some(g => g.category === "genre1")).toBeTruthy()
            expect(res.body.some(g => g.category === "genre2")).toBeTruthy()
        });
        
    });
    
    describe("GET/:category", () => {
        
        it("should return 404 if invalid category is passed", async () => {
            let res = await request(server).get(`/api/genres/1`);
            expect(res.status).toBe(404);
        });
        
        it("should return a genres with matching category/name/id", async () => {
            const genre = new Genre({ category: "genre1" })
            genre.save();
            
            let res = await request(server).get(`/api/genres/` + genre.category);
            expect(res.status).toBe(200);
        });
    });
    
    describe("POST/", () => {
        
        let token;
        let category;
        
        beforeEach(() => {
            token = new User().generateAuthToken();
            category = { "category": "genre1" }
        })
        
        let exec = async () => {
            return await request(server)
            .post("/api/genres")
            .set("x-auth-token", token)
            .send(category)
        }
        
        it("should return 401 if client is not logged in", async () => {
            token = "";
            const res = await exec()
            expect(res.status).toBe(401);
        })
        
        it("should return 400 if category's length is less than 5", async () => {
            
            category = { category: "123" };
            
            const res = await exec()
            expect(res.status).toBe(400)
        })
        it("should return 400 if category's length is more than 50", async () => {
            category = { category: new Array(52).join("a") };
            
            const res = await exec();
            
            expect(res.status).toBe(400)
        })
        
        it("should save the genre , if it is valid", async () => {
            category = { category: "genre1" }
            
            await exec();
            const genre = await Genre.findOne(category);
            
            expect(genre).not.toBeNull();
        })
        
        it("should return the genre , if it is valid", async () => {
            
            const res = await exec();
            
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("category", "genre1");
            
        })
    })
});