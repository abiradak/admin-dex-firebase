module.exports = (app: any)=>{
    const session = require("../controller/session");
    app.post("/api/session", session.add);
    app.get("/api/session/:id", session.fetch);
    app.get("/api/sessionbyid/:id/:market_id", session.fetch_by_id);
    app.patch("/api/session/:id/:market_id", session.update);
    app.patch("/api/allsessionlock", session.lock);
}