import * as redis from "redis";

const client = redis.createClient(6379, "134.209.144.84");
// Print redis errors to the console
client.on('error', (err) => {
    console.log("Error " + err);
});
module.exports = client;