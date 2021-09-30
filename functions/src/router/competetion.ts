module.exports = (app: any)=>{
    const competetion = require("../controller/competetion");
    app.post("/api/competetion", competetion.add);
    app.get("/api/competetion", competetion.fetch);
    app.get("/api/competetion/:id", competetion.fetch_by_id);
    app.patch("/api/competetion/:id", competetion.update);
}