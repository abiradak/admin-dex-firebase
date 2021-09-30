module.exports = (app: any)=>{
    const account = require("../controller/account");
    app.post("/api/account/add", account.add);
    app.get("/api/account/data/:role", account.account);
    app.patch("/api/account/update", account.account_update);
    app.patch("/api/account/limit", account.limit_update);
    app.get("/api/account/:role", account.get_account);
    app.get("/api/getaccount/:id", account.get_single_account);
    app.post("/api/client", account.add_client);
}
