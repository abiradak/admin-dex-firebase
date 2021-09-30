/* eslint-disable no-shadow */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as firebaseHelper from "firebase-functions-helper";
import * as crypto from "crypto";
import * as cors from "cors";
import * as redis from "redis";
import * as CryptoJS from "crypto-js";
const api_router = require("./routes/router");
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const app = express();
const main = express();
const client = redis.createClient(6379, "134.209.144.84");
const iv = crypto.randomBytes(16);
const algorithm = "aes-256-ctr";
const secretKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
var encryptSecretKey = "vrx9fd91fvrx9fd91f";

const account_collection = "vrx_account";
const session_collection = "vrx_session";
const sports_collection = "vrx_sports";

function decrypt_data(data: any) {
  try {
    const bytes = CryptoJS.AES.decrypt(data, encryptSecretKey);
    if (bytes.toString()) {
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    return data;
  } catch (e) {
    console.log(e);
  }
}

// const agent_limit_collection = "vrx_agents_limits";
// const super_agent_limit_collection = "vrx_super_agents_limits";
client.on("error", function (err) {
  console.log("Error " + err);
});
main.use("/", app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));
// -- webApi is your functions name, and you will pass main as a parameter
export const webApi = functions.https.onRequest(main);

// -- Automatically allow cross-origin requests
app.use(cors({ origin: true }));
// Session Setup

// @ redis test api
app.post("/test", async (req, res) => {
  var key = req.body.key;
  var value = req.body.value;
  client.setex(
    `vrx_${key}`,
    86400,
    JSON.stringify({ source: "Redis Cache", ...value })
  );
  res.status(200).send({
    status: true,
    msg: "data submited",
  });
});

// @ redis test api
app.get("/test/:id", async (req, res) => {
  var key = req.params.id;
  client.get(`${key}`, (err, result) => {
    if (result) {
      var response = JSON.parse(result);
      res.status(200).send({
        status: true,
        data: response,
      });
    }
  });
});

app.use("/api", (req: any, res: any, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No authorization header sent!" });
  } else {
    var token = req.headers.authorization;
    client.get(`vrx_session_${token}`, (err, result) => {
      if (err) return res.status(401).json({ status: false, msg: err });
      if (result) {
        var response = JSON.parse(result);
        if (response.token == token && response.logout == 0) {
          next();
        } else {
          return res.status(401).json({ status: false, msg: "unauthorized!" });
        }
      } else {
        db.collection(session_collection)
          .where("token", "==", token)
          .get()
          .then((querySnapshot) => {
            if (!querySnapshot.empty) {
              querySnapshot.forEach((session) => {
                var obj = session.data();
                if (session.data().logout == 0) {
                  client.setex(
                    `vrx_session_${token}`,
                    86400,
                    JSON.stringify({ source: "Redis Cache", ...obj })
                  );
                  next();
                } else {
                  return res
                    .status(401)
                    .json({ status: false, msg: "unauthorized!" });
                }
              });
            } else {
              return res
                .status(401)
                .json({ status: false, msg: "unauthorized!" });
            }
          })
          .catch((error) =>
            res.status(500).send({
              message: "fill all fields!",
              status: false,
              error: error,
            })
          );
      }
    });
  }
});

app.use("/api/account", (req: any, res: any, next) => {
  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No authorization header sent!" });
  } else {
    var token = req.headers.authorization;
    client.get(`vrx_session_${token}`, (err, result) => {
      if (err) return res.status(401).json({ status: false, msg: err });
      if (result) {
        var response = JSON.parse(result);
        if (response.token == token && response.logout == 0) {
          req.headers.target = response.role;
          req.headers.target_id = response.account_id;
          next();
        } else {
          return res.status(401).json({ status: false, msg: "unauthorized!" });
        }
      } else {
        db.collection(session_collection)
          .where("token", "==", token)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((session) => {
              var obj = session.data();
              if (session.data().logout == 0) {
                client.setex(
                  `vrx_session_${token}`,
                  86400,
                  JSON.stringify({ source: "Redis Cache", ...obj })
                );
                req.headers.target = session.data().role;
                req.headers.target_id = session.data().account_id;
                next();
              } else {
                return res
                  .status(401)
                  .json({ status: false, msg: "unauthorized!" });
              }
            });
          })
          .catch((error) =>
            res.status(500).send({
              message: "fill all fields!",
              status: false,
              error: error,
            })
          );
      }
    });
  }
});

app.use("/api", api_router);
require("./router/match")(app);
require("./router/session")(app);
require("./router/competetion")(app);
require("./router/account")(app, client);
// require("./router/score")(app, client);

interface Sports {
  id: Number;
  event_type_id: Number;
  name: String;
  display_picture: String;
  inactive: Number | 0;
  deleted: Number | 0;
  created: String;
  updated: String;
}

interface Session {
  account_id: Number;
  role: Number;
  otp: Number;
  token: String;
  user_agent: String;
  valid: Number;
  logout: Number;
  ip: Number;
  created: String;
  updated: String;
}

// @ login (POST)
app.post("/login", async (req, res) => {
  try {
    db.collection(account_collection)
      .where("username", "==", req.body.username)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((admin) => {
          if (admin.data().password == req.body.password) {
            var created = new Date().toISOString();
            var otp = Math.floor(Math.random() * (9999 - 1000)) + 1000;
            var token = `${+new Date()}${
              Math.floor(Math.random() * (999 - 100)) + 100
            }${Math.floor(Math.random() * (999 - 100)) + 100}`;
            var user_agent = `${req.get("User-Agent")?.toString()}`;
            const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
            const encrypted = Buffer.concat([
              cipher.update(token),
              cipher.final(),
            ]);
            const enc_token =
              iv.toString("hex") + ":" + encrypted.toString("hex");
            // @ query for inserting the session
            const session: Session = {
              account_id: admin.data().id,
              user_agent: user_agent,
              token: enc_token,
              role: admin.data().role,
              otp: otp,
              valid: 1,
              logout: 0,
              ip: 0,
              created: created,
              updated: created,
            };
            firebaseHelper.firestoreHelper
              .createNewDocument(db, session_collection, session)
              .then((response) => {
                const send_obj = {
                  uuid: enc_token,
                  id: admin.data().id,
                  username: admin.data().username,
                  name: admin.data().name,
                  parent_id: admin.data().parent_id,
                  role: admin.data().role,
                };
                client.setex(
                  `vrx_session_${enc_token}`,
                  86400,
                  JSON.stringify({ source: "Redis Cache", ...session })
                );
                res.send({
                  status: true,
                  data: send_obj,
                  msg: "Login Successfull!",
                });
              });
          } else {
            res.status(401).send({
              message: "unauthorized!",
              status: false,
            });
          }
        });
      })
      .catch((error) =>
        res.status(500).send({
          message: "fill all fields!",
          status: false,
          error: error,
        })
      );
  } catch (error) {
    res.send({ status: false, msg: error });
  }
});

// Logout Api
app.patch("/api/logout", async (req, res) => {
  try {
    db.collection(session_collection)
      .where("token", "==", req.headers.authorization)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((session) => {
          firebaseHelper.firestoreHelper.updateDocument(
            db,
            session_collection,
            session.id,
            req.body
          );
          res.status(200).send({
            message: "Logout SuccessFull!",
            status: true,
          });
        });
      });
  } catch (error) {
    res.status(400).send({
      message: "Token is missing!",
      status: false,
      error: error,
    });
  }
});

// ************************ Sports Related Apis ******************************** //
app.post("/api/sport", async (req, res) => {
  try {
    db.collection(sports_collection)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          const sport: Sports = {
            id: 1,
            event_type_id: req.body.event_type_id,
            name: `${req.body.name}`,
            inactive: 0,
            deleted: 0,
            display_picture: `${req.body.file_name}`,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          };
          firebaseHelper.firestoreHelper
            .createDocumentWithID(db, sports_collection, "1", sport)
            .then((ref: any) => {
              res.status(200).send({
                message: "Sport Added!",
                data: ref,
                status: true,
              });
            });
        } else {
          db.collection(sports_collection)
            .where("event_type_id", "==", parseInt(req.body.event_type_id))
            .where("deleted", "==", 0)
            .orderBy("id", "desc")
            .get()
            .then((querySnapshot) => {
              if (querySnapshot.empty) {
                db.collection(sports_collection)
                  .orderBy("id", "desc")
                  .limit(1)
                  .get()
                  .then((querySnapshot) => {
                    querySnapshot.forEach((sportref) => {
                      const id = Math.round(sportref.data().id + 1);
                      const sport: Sports = {
                        id: id,
                        event_type_id: req.body.event_type_id,
                        name: `${req.body.name}`,
                        inactive: 0,
                        deleted: 0,
                        display_picture: `${req.body.file_name}`,
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                      };
                      firebaseHelper.firestoreHelper
                        .createDocumentWithID(
                          db,
                          sports_collection,
                          id.toString(),
                          sport
                        )
                        .then((ref: any) => {
                          res.status(200).send({
                            message: "Sport Added!",
                            data: ref,
                            status: true,
                          });
                        });
                    });
                  });
              } else {
                res.status(200).send({
                  status: false,
                  msg: "Sport Already Listed !",
                });
              }
            })
            .catch((error) =>
              res.status(500).send({
                message: "fill all fields!",
                status: false,
                error: error,
              })
            );
        }
      });
  } catch (error) {
    res.status(400).send({
      message: "Invalid Data fields are Missing!",
      status: 400,
      error: error,
    });
  }
});
// ************************ Sports Related Apis ******************************** //

app.post("/api/score/:id", async (req, res) => {
  req.body = decrypt_data(req.body);
  client.setex(
    `score_${req.params.id}`,
    86400,
    JSON.stringify({ source: "Redis Cache", ...req.body })
  );
  res.status(200).send({
    message: "Data Saved!",
    status: true,
  });
});

app.get("/api/score", async (req, res) => {
  client.get(`score`, (err, result) => {
    if (err) return res.status(401).json({ status: false, msg: err });
    if (result) {
      var response = JSON.parse(result);
      res.status(200).send({
        message: "Score!",
        status: true,
        score: response,
      });
    }
  });
});
