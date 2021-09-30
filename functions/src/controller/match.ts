const match_collection = "vrx_sports_matches";
const sports_collection = "vrx_sports";
const competetion_collection = "vrx_sports_competitions";
import * as admin from "firebase-admin";
import * as firebaseHelper from "firebase-functions-helper";
const db = admin.firestore();

interface Match {
  id: Number;
  event_type_id: Number;
  competition_id: Number;
  event_id: Number;
  market_id: String;
  cricbuzz_id: String | 0;
  sport_id: Number;
  sport_name: String;
  competition_name: String;
  zoom: Number | 0;
  long_name: String;
  short_name: String;
  teams: String;
  start_time: String;
  bet_min: Number;
  bet_max: Number;
  manual: Number | 0;
  manual_lock: Number | 0;
  in_play: Number | 0;
  api: Number | 0;
  locked: Number | 0;
  delay: Number | 0;
  difference_back: Number | 0;
  difference_lay: Number | 0;
  declared: Number | 0;
  completed: Number | 0;
  winner: String | '';
  inactive: Number | 1;
  deleted: Number | 0;
  created: String;
  updated: String;
}

// List All match Api
exports.fetch = async (req: any, res: any, next: any) => {
  try {
    const match_query_snapshot = await db
      .collection(match_collection)
      .where("deleted", "==", 0)
      .where("declared", "==", 0)
      .orderBy("in_play", "desc")
      .orderBy("api", "desc")
      .orderBy("start_time", "asc")
      .get();
    var match_array: any[] = [];
    match_query_snapshot.forEach((match) => {
      match_array.push(match.data());
    });
    res.status(200).send({ status: true, data: { matches: match_array } });
  } catch (error) {
    res.status(400).send({ status: false, error: error });
  }
};

// Add Match Api
exports.add = async (req: any, res: any, next: any) => {
  try {
    var competetion_object: any; var sports_object: any;
    const competetion_query_snapshot = await db
      .collection(competetion_collection)
      .where("competition_id", "==", parseInt(req.body.competition_id))
      .get();
    const sports_query_snapshot = await db
      .collection(sports_collection)
      .where("event_type_id", "==", parseInt(req.body.event_type_id))
      .get();
    if (competetion_query_snapshot.empty) {
      res.status(400).send({status : false, msg: "error"});
    } else if(!competetion_query_snapshot.empty) {
      competetion_query_snapshot.forEach ((competetion) => {
        competetion_object = competetion.data();
      });
    } 
    sports_query_snapshot.forEach ((sport) => { 
      sports_object = sport.data();
    });
    db.collection(match_collection)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          const match: Match = {
            id: 1,
            event_type_id: parseInt(req.body.event_type_id),
            competition_id: parseInt(req.body.competition_id),
            event_id: parseInt(req.body.event_id),
            market_id: req.body.market_id,
            sport_id: parseInt(sports_object.id),
            sport_name: sports_object.name,
            competition_name: competetion_object.long_name,
            cricbuzz_id: req.body.cricbuzz_id,
            zoom: 0,
            long_name: `${req.body.long_name
              .trim()
              .replace(/\b\w/g, (l: any) => l.toUpperCase())
              .replace(" V ", " V ".toLowerCase())}`,
            short_name: `${req.body.short_name
              .trim()
              .toUpperCase()
              .replace(" V ", " V ".toLowerCase())}`,
            teams: `('${req.body.teams
              .toString()
              .toUpperCase()
              .split(",")
              .join("||")}')`,
            start_time: req.body.start_time,
            bet_min: req.body.bet_min,
            bet_max: req.body.bet_max,
            manual: 0,
            manual_lock: 0,
            in_play: 0,
            api: 0,
            locked: 0,
            delay: 0,
            difference_back: 0,
            difference_lay: 1,
            declared: 0,
            completed: 0,
            winner: '',
            inactive: 1,
            deleted: 0,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          };
          firebaseHelper.firestoreHelper
            .createDocumentWithID(db, match_collection, req.body.event_id.toString(), match)
            .then((ref: any) => {
              res.status(200).send({
                message: "Match Added!",
                data: ref,
                status: true,
              });
            });
        } else {
          db.collection(match_collection)
            .where("event_id", "==", req.body.event_id)
            .orderBy("id", "desc")
            .get()
            .then((querySnapshot) => {
              if (querySnapshot.empty) {
                db.collection(match_collection)
                  .orderBy("id", "desc")
                  .limit(1)
                  .get()
                  .then((querySnapshot) => {
                    querySnapshot.forEach((matchref) => {
                      if (matchref.data().id) {
                        var id = Math.round(matchref.data().id + 1);
                        const match: Match = {
                          id: id,
                          event_type_id: parseInt(req.body.event_type_id),
                          competition_id: parseInt(req.body.competition_id),
                          event_id: parseInt(req.body.event_id),
                          sport_id: parseInt(sports_object.id),
                          sport_name: sports_object.name,
                          competition_name: competetion_object.long_name,
                          market_id: req.body.market_id,
                          cricbuzz_id: req.body.cricbuzz_id,
                          zoom: 0,
                          long_name: `${req.body.long_name
                            .trim()
                            .replace(/\b\w/g, (l: any) => l.toUpperCase())
                            .replace(" V ", " V ".toLowerCase())}`,
                          short_name: `${req.body.short_name
                            .trim()
                            .toUpperCase()
                            .replace(" V ", " V ".toLowerCase())}`,
                          teams: `('${req.body.teams
                            .toString()
                            .toUpperCase()
                            .split(",")
                            .join("||")}')`,
                          start_time: req.body.start_time,
                          bet_min: req.body.bet_min,
                          bet_max: req.body.bet_max,
                          manual: 0,
                          manual_lock: 0,
                          in_play: 0,
                          api: 0,
                          locked: 0,
                          delay: 0,
                          difference_back: 0,
                          difference_lay: 1,
                          declared: 0,
                          completed: 0,
                          winner: '',
                          inactive: 1,
                          deleted: 0,
                          created: new Date().toISOString(),
                          updated: new Date().toISOString(),
                        };
                        console.log('here', match);
                        firebaseHelper.firestoreHelper
                          .createDocumentWithID(
                            db,
                            match_collection,
                            req.body.event_id.toString(),
                            match
                          )
                          .then((ref: any) => {
                            res.status(200).send({
                              message: "Match Added!",
                              data: ref,
                              status: true,
                            });
                          });
                      }
                    });
                  });
              } else {
                res.status(200).send({
                  message: "Match Already Listed!",
                  status: false,
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
};

// Get Match data By Id
exports.fetch_by_id = async (req: any, res: any, next: any) => {
  try {
    var id = parseInt(req.params.id);
    db.collection(match_collection)
      .where("event_id", "==", id)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((match) => {
            if (match.data().deleted == 0) {
              res.status(200).send({ status: true, data: match.data() });
            } else {
              res.status(200).send({ status: false, msg: "Match Deleted!" });
            }
          });
        } else {
          res.status(200).send({ status: false, msg: "Match Not Found!" });
        }
      })
      .catch((error) => {
        res.status(400).send({ status: false, data: error });
      });
  } catch (error) {
    res.send({ status: false, msg: error });
  }
};

// Update Match Api
exports.update = async (req: any, res: any, next: any) => {
  try {
    const event_id = parseInt(req.params.id);
    db.collection(match_collection)
      .where("event_id", "==", event_id)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          res.status(400).send({ status: false, msg: "Match Not Found !" });
        } else {
          db.collection(match_collection)
            .where("event_id", "==", event_id)
            .get()
            .then((query) => {
              const match = query.docs[0];
              let tmp = match.data();
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
              match.ref.update(tmp);
              res
                .status(200)
                .send({ status: true, msg: "Match Updated !", data: tmp });
            });
        }
      });
  } catch (error) {
    res.send({ status: false, msg: error });
  }
};

// Suggestion Api
exports.suggest = async (req: any, res: any, next: any) => {
  try {
    db.collection(match_collection)
      .orderBy("id", "desc")
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((match) => {
            var event_id = parseInt(match.data().event_id) + 1;
            var market_id = `1.${event_id}`;
            // @ query for checking theese two already existing or not (series)
            db.collection(match_collection)
              .where("event_id", "==", event_id)
              .where("market_id", "==", market_id)
              .get()
              .then((querySnapshot) => {
                if (querySnapshot.empty) {
                  res.status(200).send({
                    status: true,
                    data: { event_id: event_id, market_id: market_id },
                  });
                } else {
                  res
                    .status(400)
                    .send({ status: false, msg: "No Suggessions Avialble!" });
                }
              });
          });
        } else {
          res.status(200).send({
            status: true,
            data: { event_id: "10000", matket_id: "1.10000" },
          });
        }
      });
  } catch (error) {
    res.send({ status: false, msg: error });
  }
};
