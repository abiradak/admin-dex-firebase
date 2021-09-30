module.exports = (app: any)=>{
    const score = require("../controller/score");
    app.post("/api/score/add", score.add);
}
