import * as admin from "firebase-admin";
import * as firebaseHelper from "firebase-functions-helper";
const db = admin.firestore();
const market_collection = "vrx_sports_markets";
const match_collection = "vrx_sports_matches";

interface Market {
  id: Number;
  event_id: Number;
  market_id: String;
  name: String;
  type: Number;
  grp: Number;
  session_bet_min: Number | 500;
  session_bet_max: Number | 50000;
  session_commission: Number | 1;
  manual: Number | 0;
  manual_lock: Number | 0;
  locked: Number | 0;
  completed: Number | 0;
  declared: Number | 0;
  result: Number | 0;
  active: Number | 0;
  deleted: Number | 0;
  created: String;
  updated: String;
}

// For Creating Session
exports.add = async (req: any, res: any, next: any) => {
  try {
    if (req.body.event_id && req.body.name) {
      // @ query for check event_type_id & event_id dose not exist
      db.collection(market_collection)
        .where("event_id", "==", parseInt(req.body.event_id))
        .where("deleted", "==", 0)
        .get()
        .then((querySnapshot) => {
          const market_id = `${req.body.event_id}.${Math.round(
            querySnapshot.size + 1
          )}`;
          if (!querySnapshot.empty) {
            db.collection(market_collection)
              .orderBy("id", "desc")
              .limit(1)
              .get()
              .then((querySnapshot2) => {
                querySnapshot2.forEach((session) => {
                  const id = parseInt(session.data().id) + 1;
                  console;
                  const market: Market = {
                    id: id,
                    event_id: parseInt(req.body.event_id),
                    market_id: market_id,
                    name: req.body.name,
                    type: parseInt(req.body.type),
                    grp: parseInt(req.body.grp),
                    session_bet_min: parseInt(req.body.session_bet_min),
                    session_bet_max: parseInt(req.body.session_bet_max),
                    session_commission: parseInt(req.body.session_commission),
                    manual: 0,
                    manual_lock: 0,
                    locked: 0,
                    completed: 0,
                    declared: 0,
                    result: 0,
                    active: 0,
                    deleted: 0,
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                  };
                  console.log("ne", market_id);
                  firebaseHelper.firestoreHelper
                    .createDocumentWithID(
                      db,
                      market_collection,
                      id.toString(),
                      market
                    )
                    .then((ref: any) => {
                      res.status(200).send({
                        message: "Session Activated!",
                        data: ref,
                        status: true,
                      });
                    });
                });
              });
          } else {
            console.log("size", querySnapshot.size);
            const id = 1;
            const market: Market = {
              id: id,
              event_id: parseInt(req.body.event_id),
              market_id: market_id,
              name: req.body.name,
              type: parseInt(req.body.type),
              grp: parseInt(req.body.grp),
              session_bet_min: parseInt(req.body.session_bet_min),
              session_bet_max: parseInt(req.body.session_bet_max),
              session_commission: parseInt(req.body.session_commission),
              manual: 0,
              manual_lock: 0,
              locked: 0,
              completed: 0,
              declared: 0,
              result: 0,
              active: 0,
              deleted: 0,
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
            };
            console.log("e", market_id);
            firebaseHelper.firestoreHelper
              .createDocumentWithID(
                db,
                market_collection,
                id.toString(),
                market
              )
              .then((ref: any) => {
                res.status(200).send({
                  message: "Session Activated!",
                  data: ref,
                  status: true,
                });
              });
          }
        });
    } else {
      res.status(400).send({ message: "Invalid data", status: false });
    }
  } catch (error) {
    res.send({ status: false, msg: error });
  }
};

// List Session
exports.fetch = async (req: any, res: any, next: any) => {
  try {
    var id = parseInt(req.params.id);
    if (id) {
      var matchdata = {};
      var session_array: FirebaseFirestore.DocumentData[] = [];
      var locked = {};
      const match_query_snapshot = await db
        .collection(match_collection)
        .where("deleted", "==", 0)
        .where("event_id", "==", id)
        .get();
      const query_sessions_snapshot = await db
        .collection(market_collection)
        .where("event_id", "==", id)
        .get();
      const query_sessions_locked = await db
        .collection(market_collection)
        .where("event_id", "==", id)
        .limit(1)
        .get();
      match_query_snapshot.forEach((match) => {
        matchdata = match.data();
      });
      query_sessions_snapshot.forEach((session) => {
        session_array.push(session.data());
      });
      query_sessions_locked.forEach((sess) => {
        locked = sess.data();
      });
      res.send({
        status: true,
        data: { match: matchdata, sessions: session_array, s_locked: locked },
      });
    } else {
      res.status(400).send({ message: "Invalid data", status: false });
    }
  } catch (error) {
    res.send({ status: false, msg: error });
  }
};

// Get Match data By Id
exports.fetch_by_id = async (req: any, res: any, next: any) => {
  try {
    var id = parseInt(req.params.id);
    var market_id = parseInt(req.params.market_id);
    var matchdata = {};
    var session_array: any[] = [];
    const match_query_snapshot = await db
      .collection(match_collection)
      .where("deleted", "==", 0)
      .where("event_id", "==", id)
      .get();
    const query_sessions_active = await db
      .collection(market_collection)
      .where("deleted", "==", 0)
      .where("declared", "==", 0)
      .where("completed", "==", 0)
      .where("active", "==", 1)
      .where("event_id", "==", id)
      .where("market_id", "==", market_id)
      .get();
    match_query_snapshot.forEach((match) => {
      matchdata = match.data();
    });
    query_sessions_active.forEach((session) => {
      session_array.push(session.data());
    });
    res.send({
      status: true,
      data: { match: matchdata, session: session_array },
    });
  } catch (error) {
    res.send({ status: false, msg: error });
  }
};

// Session Update
exports.update = async (req: any, res: any, next: any) => {
  try {
    var id = parseInt(req.params.id);
    var market_id = req.params.market_id;
    if (id && market_id) {
      db.collection(market_collection)
        .where("event_id", "==", id)
        .where("market_id", "==", market_id)
        .where("deleted", "==", 0)
        .orderBy("id", "desc")
        .get()
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            console.log("hi");
            db.collection(market_collection)
              .where("event_id", "==", id)
              .where("market_id", "==", market_id)
              .get()
              .then((query) => {
                console.log("hello");
                const session = query.docs[0];
                let tmp = session.data();
                for (var key in req.body.update) {
                  if (req.body.update.hasOwnProperty(key)) {
                    for (var keys in tmp) {
                      if (tmp.hasOwnProperty(keys)) {
                        if (keys == key) {
                          tmp[key] = req.body.update[key];
                        }
                      }
                    }
                  }
                }
                session.ref.update(tmp);
                res
                  .status(200)
                  .send({ status: true, msg: "Session Updated !", data: tmp });
              });
          } else {
            res.status(400).send({ status: false, msg: "Sessoin Not Found!" });
          }
        });
    } else {
      res.status(400).send({ message: "Invalid data", status: false });
    }
  } catch (error) {
    res.send({ status: false, msg: error });
  }
};

// Session Lock
exports.lock = async (req: any, res: any, next: any) => {
  try {
    if (req.body.event_id) {
      // @ update query for updating all sessions
      db.collection(market_collection)
        .where("event_id", "==", parseInt(req.body.event_id))
        .where("deleted", "==", 0)
        .where("active", "==", 1)
        .get()
        .then((query) => {
          const thing = query.docs[0];
          let tmp = thing.data();
          (tmp.locked = req.body.locked), thing.ref.update(tmp);
          res.status(200).send({ status: true, msg: "Competetion Updated !" });
        });
    } else {
      res.send({ status: false, msg: "Invalid Data!" });
    }
  } catch (error) {
    res.send({ status: false, msg: error });
  }
};
