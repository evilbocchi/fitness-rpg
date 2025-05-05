const request = require("supertest");
const app = require("../src/app");
const fs = require("fs");
const exp = require("constants");

const auths = new Array();

describe("POST Routes", () => {
    test("POST /users > No Body", async () => {
        const response = await request(app).post("/api/users").send();
        expect(response.status).toBe(400);
    });

    test("POST /users > Invalid Email", async () => {
        const response = await request(app).post("/api/users").send({
            username: "socuser321",
            email: "helpmail.com",
            password: "soc"
        });
        expect(response.status).toBe(400);
    });

    test("POST /users > With Body", async () => {
        const users = [
            ["socuser321", "help@mail.com", "soc"],
            ["fitnessKing", "me@mail.com", "passgod"],
            ["BedLover", "ilovebed@helpme.com", "bed"]
        ];
        for (const user of users) {
            const response = await request(app).post("/api/users").send({
                username: user[0],
                email: user[1],
                password: user[2]
            });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("token");
            auths.push(`Bearer ${response.body.token}`)
        }
    });

    test("POST /users > Existing Username", async () => {
        const response = await request(app).post("/api/users").send({
            username: "socuser321",
            email: "help@mailers.com",
            password: "hackers"
        });
        expect(response.status).toBe(409);
    });

    test("POST /users > Existing Email", async () => {
        const response = await request(app).post("/api/users").send({
            username: "ihacku",
            email: "help@mail.com",
            password: "hackers"
        });
        expect(response.status).toBe(409);
    });

    test("POST /users/login > User Exists", async () => {
        const response = await request(app).post("/api/users/login").send({
            username: "socuser321",
            password: "soc",
            rememberme: false
        });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
    });

    test("GET /users > After POST", async () => {
        const response = await request(app).get("/api/users/").send();
        expect(response.status).toBe(200);

        const user = response.body.pop();
        expect(user.username).toBe("BedLover");
        expect(user.skillpoints).toBe(0);
    });

    test("POST /challenges > No Body", async () => {
        const response = await request(app).post("/api/challenges").send();
        expect(response.status).toBe(400);
    });

    test("POST /challenges > With Body", async () => {
        const challenges = [
            [1, 'Complete 2.4km within 15 minutes', 50],
            [1, 'Cycle around the island for at least 50km', 100],
            [2, 'Complete a full marathon (42.2km)', 200],
            [2, 'Hold a plank for 5 minutes', 50],
            [2, 'Perform 100 push-ups in one session', 75],
            [2, 'Sleep for 8 hours every day for a week', 50]
        ]
        for (const challenge of challenges) {
            const response = await request(app)
                .post("/api/challenges")
                .send({
                    challenge: challenge[1],
                    skillpoints: challenge[2]
                })
                .set('Authorization', auths[challenge[0] - 1]);
            expect(response.status).toBe(201);
            expect(response.body.creator_id).toEqual(challenge[0]);
            expect(response.body.challenge).toEqual(challenge[1]);
            expect(response.body.skillpoints).toEqual(challenge[2]);
        }
    });

    test("GET /challenges > After POST", async () => {
        const response = await request(app).get("/api/challenges");
        expect(response.status).toBe(200);
        expect(response.body.length).toEqual(6);
    });

    test("POST /challenges/:challenge_id > No Body", async () => {
        const response = await request(app)
            .post("/api/challenges/1")
            .send({});
        expect(response.status).toBe(400);
    });

    test("POST /challenges/:challenge_id > Challenge Not Exist", async () => {
        const response = await request(app)
            .post("/api/challenges/99")
            .send({
                completed: true,
                creation_date: "2024-11-30",
                notes: "A fitter me!"
            })
            .set('Authorization', auths[0]);
        expect(response.status).toBe(404);
    });

    test("POST /challenges/:challenge_id > User Not Exist", async () => {
        const response = await request(app)
            .post("/api/challenges/1")
            .send({
                completed: true,
                creation_date: "2024-11-30",
                notes: "A fitter me!"
            });
        expect(response.status).toBe(401);
    });

    test("POST /challenges/:challenge_id > With Body", async () => {
        const response = await request(app)
            .post("/api/challenges/1")
            .send({
                completed: true,
                creation_date: "2024-11-30",
                notes: "A fitter me!"
            })
            .set('Authorization', auths[1]);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            complete_id: 1,
            challenge_id: 1,
            user_id: 2,
            username: "fitnessKing",
            completed: true,
            creation_date: "2024-11-30 00:00:00",
            notes: "A fitter me!"
        });
    });

    test("GET /users/:user_id > After POST", async () => {
        const response = await request(app)
            .get("/api/users/2");
        expect(response.status).toBe(200);
        expect(response.body.skillpoints).toEqual(50);
    });

    test("POST /challenges/:challenge_id > Completion False", async () => {
        const response = await request(app)
            .post("/api/challenges/1")
            .send({
                completed: false,
                creation_date: "2024-10-30",
                notes: "I don't like this challenge"
            })
            .set('Authorization', auths[2]);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            complete_id: 2,
            challenge_id: 1,
            user_id: 3,
            username: "BedLover",
            completed: false,
            creation_date: "2024-10-30 00:00:00",
            notes: "I don't like this challenge"
        });
    });

    test("GET /users/:user_id > After POST Completion False", async () => {
        const response = await request(app)
            .get("/api/users/3");
        expect(response.status).toBe(200);
        expect(response.body.skillpoints).toEqual(5);
    });

    test("POST /character > No Body", async () => {
        const response = await request(app)
            .post("/api/character/")
            .send({});
        expect(response.status).toBe(400);
    });

    test("POST /character > With Body", async () => {
        const response = await request(app)
            .post("/api/character/")
            .send({
                name: "Bob",
                element: "Fire"
            })
            .set('Authorization', auths[0]);
        expect(response.status).toBe(201);
        expect(response.body.name).toEqual("Bob");

        const response2 = await request(app)
            .post("/api/character/")
            .send({
                name: "Alice",
                element: "Water"
            })
            .set('Authorization', auths[1]);
        expect(response2.status).toBe(201);
        expect(response2.body.name).toEqual("Alice");
    });

    test("GET /character/:character_id > After POST With Body", async () => {
        const response = await request(app)
            .get("/api/character/1");
        expect(response.status).toBe(200);
    });

    test("POST /battle > No Body", async () => {
        const response = await request(app)
            .post("/api/battle")
            .send({});
        expect(response.status).toBe(400);
    });

    test("POST /battle/request > With Body", async () => {
        const response = await request(app)
            .post("/api/battle/request")
            .send({
                character_id: 1,
                username: "fitnessKing" // opponent
            })
            .set('Authorization', auths[0]);
        expect(response.status).toBe(201);
    });

    test("POST /battle > With Body", async () => {
        const response = await request(app)
            .post("/api/battle")
            .send({
                attacker_id: 1,
                defender_id: 2
            });
        expect(response.status).toBe(201);
    });

    test("POST /battle > Battle Exist", async () => {
        const response = await request(app)
            .post("/api/battle")
            .send({
                attacker_id: 2,
                defender_id: 1
            });
        expect(response.status).toBe(403);
    });

    test("POST /character/:character_id/skills > No Body", async () => {
        const response = await request(app)
            .post("/api/character/1/skills")
            .send({});
        expect(response.status).toBe(400);
    });

    test("POST /character/:character_id/skills > No Skillpoints", async () => {
        const response = await request(app)
            .post("/api/character/1/skills")
            .send({
                skill_id: 2
            })
            .set('Authorization', auths[0]);
        expect(response.status).toBe(403);
    });

    test("PUT /users/:id > Adding Skillpoints", async () => {
        await request(app).put("/api/users/1").send({
            username: "superSOC",
            email: "help@mail.com",
            password: "soc",
            skillpoints: 1000
        });
        const response = await request(app).put("/api/users/2").send({
            username: "fitnessKing",
            email: "me@mail.com",
            password: "passgod",
            skillpoints: 1000
        });
        expect(response.status).toBe(200);
    });

    test("POST /character/:character_id/skills > With Body", async () => {
        await request(app).post("/api/character/1/skills").send({ skill_id: 6 }).set('Authorization', auths[0]);
        await request(app).post("/api/character/1/skills").send({ skill_id: 7 }).set('Authorization', auths[0]);
        await request(app).post("/api/character/1/skills").send({ skill_id: 19 }).set('Authorization', auths[0]);
        await request(app).post("/api/character/1/skills").send({ skill_id: 11 }).set('Authorization', auths[0]);
        await request(app).post("/api/character/2/skills").send({ skill_id: 14 }).set('Authorization', auths[0]);
        await request(app).post("/api/character/2/skills").send({ skill_id: 2 }).set('Authorization', auths[0]);
        const response = await request(app).post("/api/character/1/skills").send({ skill_id: 2 }).set('Authorization', auths[0]);
        expect(response.status).toBe(201);
    });

    test("POST /battle/:battle_id/skill > Skill Not Exist", async () => {
        const response = await request(app).post("/api/battle/1/skill").send({ skill_id: 99 }).set('Authorization', auths[0]);
        expect(response.status).toBe(404);
    });

    test("POST /battle/:battle_id/skill > Not Owned Skill", async () => {
        const response = await request(app).post("/api/battle/1/skill").send({ skill_id: 20 }).set('Authorization', auths[0]);
        expect(response.status).toBe(403);
    });

    test("POST /battle/:battle_id/skill > Owned Skill", async () => {
        const response = await request(app).post("/api/battle/1/skill").send({ skill_id: 11 }).set('Authorization', auths[0]);
        expect(response.status).toBe(200);
        expect(response.body.attacker.mana).toEqual(40);
    });

    test("POST /battle/:battle_id/guard", async () => {
        const response = await request(app).post("/api/battle/1/guard").set('Authorization', auths[1]).send();
        expect(response.status).toBe(200);
        expect(response.body.defender.mana).toEqual(50);
    });

    test("POST /battle/:battle_id/forfeit", async () => {
        const response = await request(app).post("/api/battle/1/forfeit").set('Authorization', auths[0]).send();
        expect(response.status).toBe(200);
        expect(response.body.attacker.health).toEqual(0);
    });

    test("POST /dungeon/:dungeon_id/explore > No Body", async () => {
        const response = await request(app).post("/api/dungeon/1/explore").set('Authorization', auths[0]).send();
        expect(response.status).toBe(400);
    });

    test("POST /dungeon/:dungeon_id/explore > Character Not Exist", async () => {
        const response = await request(app).post("/api/dungeon/1/explore").set('Authorization', auths[0]).send({ character_id: 99 });
        expect(response.status).toBe(404);
    });

    test("POST /dungeon/:dungeon_id/explore > Character Dead", async () => {
        const response = await request(app).post("/api/dungeon/1/explore").set('Authorization', auths[0]).send({ character_id: 1 });
        expect(response.status).toBe(403);
    });

    test("POST /character/:character_id/recover > Character Not Exist", async () => {
        const response = await request(app).post("/api/character/99/recover").set('Authorization', auths[0]).send();
        expect(response.status).toBe(404);
    });

    test("POST /character/:character_id/recover > Character Exist", async () => {
        const response = await request(app).post("/api/character/1/recover").set('Authorization', auths[0]).send();
        expect(response.body).toHaveProperty("cost");
        expect(response.status).toBe(200);
    });

    test("POST /dungeon/:dungeon_id/explore > Character Alive", async () => {
        const response = await request(app).post("/api/dungeon/1/explore").set('Authorization', auths[0]).send({ character_id: 1 });
        expect(response.body).toHaveProperty("loot");
        expect(response.body).toHaveProperty("exp");
        for (const item of response.body.loot) {
            expect(item).toHaveProperty("item_id");
        }
        expect(response.status).toBe(200);
    });
});

describe("GET Routes", () => {
    test("GET /users", async () => {
        const response = await request(app).get("/api/users").send();
        expect(response.body.length).toBe(3);
        expect(response.status).toBe(200);
    });

    test("GET /users/:user_id > User Exist", async () => {
        const response = await request(app).get("/api/users/1").send();
        expect(response.body.user_id).toBe(1);
        expect(response.status).toBe(200);
    });

    test("GET /users/:user_id > User Not Exist", async () => {
        const response = await request(app).get("/api/users/99").send();
        expect(response.status).toBe(404);
    });

    test("GET /skills", async () => {
        const response = await request(app).get("/api/skills").send();
        expect(response.body.length).toBe(24);
        expect(response.status).toBe(200);
    });

    test("GET /skills/:skill_id > Skill Not Exist", async () => {
        const response = await request(app).get("/api/skills/99").send();
        expect(response.status).toBe(404);
    });

    test("GET /skills/:skill_id > Skill Exist", async () => {
        const response = await request(app).get("/api/skills/4").send();
        expect(response.body.skill_id).toBe(4);
        expect(response.status).toBe(200);
    });

    test("GET /battle/:battle_id > Battle Exist", async () => {
        const response = await request(app).get("/api/battle/1").send();
        expect(response.body.battle_id).toBe(1);
        expect(response.status).toBe(200);
    });

    test("GET /battle/:battle_id > Battle Not Exist", async () => {
        const response = await request(app).get("/api/battle/99").send();
        expect(response.status).toBe(404);
    });

    test("GET /dungeon", async () => {
        const response = await request(app).get("/api/dungeon").send();
        expect(response.body[response.body.length - 1].name).toBe("Hamster Sanctuary");
        expect(response.status).toBe(200);
    });

    test("GET /dungeon/:dungeon_id > Dungeon Exist", async () => {
        const response = await request(app).get("/api/dungeon/1").send();
        expect(response.body.dungeon_id).toBe(1);
        expect(response.status).toBe(200);
    });

    test("GET /dungeon/:dungeon_id > Dungeon Not Exist", async () => {
        const response = await request(app).get("/api/dungeon/99").send();
        expect(response.status).toBe(404);
    });

    test("GET /character", async () => {
        const response = await request(app).get("/api/character").send();
        expect(response.body.length).toBe(2);
        expect(response.status).toBe(200);
    });

    test("GET /character/:character_id > Character Exist", async () => {
        const response = await request(app).get("/api/character/1").send();
        expect(response.body.character_id).toBe(1);
        expect(response.status).toBe(200);
    });

    test("GET /character/:character_id > Character Not Exist", async () => {
        const response = await request(app).get("/api/character/99").send();
        expect(response.status).toBe(404);
    });

    test("GET /character/:character_id/skills > Character Exist", async () => {
        const response = await request(app).get("/api/character/1/skills").send();
        expect(new Set(response.body)).toEqual(new Set([2, 6, 7, 19, 11]));
        expect(response.status).toBe(200);
    });

    test("GET /character/:character_id/skills > Character Not Exist", async () => {
        const response = await request(app).get("/api/character/99/skills").send();
        expect(response.status).toBe(404);
    });

    test("GET /character/:character_id/items > Character Exist", async () => {
        const response = await request(app).get("/api/character/1/items").send();
        for (const item of response.body) {
            expect(item).toHaveProperty("item_id");
        }
        expect(response.status).toBe(200);
    });
});

describe("PUT Routes", () => {
    test("PUT /users/:user_id > User Not Exist", async () => {
        const response = await request(app).put("/api/users/6").send({
            username: "superSOC",
            email: "helperr@mail.com",
            password: "socer",
            skillpoints: 100
        });
        expect(response.status).toBe(404);
    });

    test("PUT /users/:user_id > Existing Username", async () => {
        const response = await request(app).put("/api/users/1").send({
            username: "fitnessKing",
            email: "helperr@mail.com",
            password: "socer",
            skillpoints: 1000
        });

        expect(response.status).toBe(409);
    });

    test("PUT /users/:id > User Exist", async () => {
        const response = await request(app).put("/api/users/1").send({
            username: "superSOC",
            email: "helperr@mail.com",
            password: "socer",
            skillpoints: 100
        });
        expect(response.status).toBe(200);
        expect(response.body.username).toBe("superSOC");
        expect(response.body.skillpoints).toBe(100);
        expect(response.body.user_id).toBe(1);
    });

    test("PUT /challenges/:challenge_id > Challenge Not Exist", async () => {
        const response = await request(app)
            .put("/api/challenges/99")
            .send({
                challenge: "Complete 2.4km within 12 minutes",
                skillpoints: 75
            })
            .set('Authorization', auths[0]);
        expect(response.status).toBe(404);
    });

    test("PUT /challenges/:challenge_id > No Body", async () => {
        const response = await request(app).put("/api/challenges/1").send({});
        expect(response.status).toBe(400);
    });

    test("PUT /challenges/:challenge_id > No Ownership", async () => {
        const response = await request(app)
            .put("/api/challenges/1")
            .send({
                challenge: "Complete 2.4km within 12 minutes",
                skillpoints: 75
            });
        expect(response.status).toBe(401);
    });

    test("PUT /challenges/:challenge_id > With Body", async () => {
        const response = await request(app)
            .put("/api/challenges/1")
            .send({
                challenge: "Complete 2.4km within 12 minutes",
                skillpoints: 75
            })
            .set('Authorization', auths[0]);
        expect(response.status).toBe(200);
    });
});

describe("DELETE Routes", () => {
    test("DELETE /challenges/:challenge_id > Challenge Not Exist", async () => {
        const response = await request(app)
            .delete("/api/challenges/99")
            .send({});
        expect(response.status).toBe(404);
    });

    test("DELETE /challenges/:challenge_id > Challenge Exist", async () => {
        const response = await request(app)
            .delete("/api/challenges/6")
            .send({})
            .set('Authorization', auths[1]);
        expect(response.status).toBe(204);
    });

    test("GET /challenges/:challenge_id > After DELETE", async () => {
        const response = await request(app).get("/api/challenges/6").send();
        expect(response.status).toBe(404);
    });

    test("GET /challenges/:challenge_id > After DELETE", async () => {
        const response = await request(app).get("/api/challenges/6").send();
        expect(response.status).toBe(404);
    });

    test("DELETE /character/:character_id/items/:ownership_id > Item Exist", async () => {
        const response = await request(app).delete("/api/character/1/items/1").set('Authorization', auths[0]).send();
        expect(response.status).toBe(204);
    });

    test("DELETE /character/:character_id/items/:ownership_id > Item Not Exist", async () => {
        const response = await request(app).delete("/api/character/1/items/99").set('Authorization', auths[0]).send();
        expect(response.status).toBe(404);
    });
});

describe("Check package.json", () => {
    let packageJson;

    beforeAll(() => {
        const packageJsonContents = fs.readFileSync("package.json", "utf8");
        packageJson = JSON.parse(packageJsonContents);
    });

    it("Should have a start script", () => {
        expect(packageJson).toHaveProperty("scripts.start");
    });

    it("Should have a dev script", () => {
        expect(packageJson).toHaveProperty("scripts.dev");
    });

    it("Should specify correct values for start and dev scripts", () => {
        const startScript = packageJson.scripts.start;
        const devScript = packageJson.scripts.dev;

        expect(startScript).toEqual("node index.js");
        expect(devScript).toEqual("nodemon index.js");
    });

    it("Should have dependencies", () => {
        expect(packageJson).toHaveProperty("dependencies.express");
        expect(packageJson).toHaveProperty("dependencies.mysql2");
        expect(packageJson).toHaveProperty("devDependencies.nodemon");
    });
});