const auth = require("../../middleware/auth");
const request = require("supertest");
const {User} = require("../../models/user");
const { Genre } = require("../../models/genre");


describe("auth middleware", () => {
    
    beforeEach(() => { server = require("../../index"); })
    afterEach(async () => {
        await Genre.deleteMany({})
        await server.close();
    });
    let token;
    let category
    const exec = async () => {
        return await request(server)
            .post("/api/genres")
            .set("x-auth-token", token)
            .send(category)

        }

        beforeEach(()=>{
            category = { category: "genre1" };
            token = new User().generateAuthToken();
        })

    it("should return 401 if not token is provided", async() => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);

    })
    it("should return 400 if not token is provided", async() => {
        token = null;
        const res = await exec();
        expect(res.status).toBe(400);

    })
    it("should return 200 if not token is provided", async() => {

        const res = await exec();
        expect(res.status).toBe(200);

    })
    
})