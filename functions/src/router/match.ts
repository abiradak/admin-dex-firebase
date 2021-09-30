module.exports = (app: any)=>{
    const match = require("../controller/match");
    app.get("/api/match", match.fetch);
    app.post("/api/match", match.add);
    app.get("/api/match/:id" , match.fetch_by_id);
    app.patch("/api/match/:id", match.update);
    app.get("/api/suggest", match.suggest);
}