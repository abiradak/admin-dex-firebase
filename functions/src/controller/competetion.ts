import * as admin from "firebase-admin";
import * as firebaseHelper from "firebase-functions-helper";
const db = admin.firestore();
const competetion_collection = "vrx_sports_competitions";

interface Competetion {
  id: Number;
  event_type_id: Number;
  competition_id: Number;
  event_id: Number;
  long_name: String;
  short_name: String;
  display_picture: String | null;
  inactive: Number;
  deleted: Number;
  created: String;
  updated: String;
}

// Add Competetion
exports.add = async (req: any, res: any, next: any) => {
  try {
    db.collection(competetion_collection)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          const comp: Competetion = {
            id: 1,
            event_type_id: req.body.event_type_id,
            competition_id: req.body.competition_id,
            event_id: req.body.event_id,
            long_name: `${req.body.long_name}`,
            short_name: `${req.body.short_name}`,
            inactive: 1,
            deleted: 0,
            display_picture: `${req.body.file_name}`,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
          };
          firebaseHelper.firestoreHelper
            .createDocumentWithID(db, competetion_collection, "1", comp)
            .then((ref: any) => {
              res.status(200).send({
                message: "Competetion Added!",
                data: ref,
                status: true,
              });
            });
        } else {
          db.collection(competetion_collection)
            .where("event_id", "==", parseInt(req.body.event_id))
            .where("deleted", "==", 0)
            .orderBy("id", "desc")
            .get()
            .then((querySnapshot) => {
              if (querySnapshot.empty) {
                db.collection(competetion_collection)
                  .orderBy("id", "desc")
                  .limit(1)
                  .get()
                  .then((querySnapshot) => {
                    querySnapshot.forEach((compref) => {
                      const id = Math.round(compref.data().id + 1);
                      const comp: Competetion = {
                        id: id,
                        event_type_id: req.body.event_type_id,
                        competition_id: req.body.competition_id,
                        event_id: req.body.event_id,
                        long_name: `${req.body.long_name}`,
                        short_name: `${req.body.short_name}`,
                        inactive: 1,
                        deleted: 0,
                        display_picture: `${req.body.file_name}`,
                        created: new Date().toISOString(),
                        updated: new Date().toISOString(),
                      };
                      firebaseHelper.firestoreHelper
                        .createDocumentWithID(
                          db,
                          competetion_collection,
                          id.toString(),
                          comp
                        )
                        .then((ref: any) => {
                          res.status(200).send({
                            message: "Competetion Added!",
                            data: ref,
                            status: true,
                          });
                        });
                    });
                  });
              } else {
                res.status(200).send({
                  status: false,
                  msg: "Competition Already Listed !",
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

// List Competetion
exports.fetch = async (req: any, res: any, next: any) => {
  try {
    var competetions_array: any[] = [];
    db.collection(competetion_collection)
      .where("deleted", "==", 0)
      .orderBy("id", "desc")
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((competetion) => {
            competetions_array.push(competetion.data());
          });
          res.status(200).send({ status: true, data: competetions_array });
        } else {
          res.status(200).send({ status: false, msg: "No Competetion Found!" });
        }
      })
      .catch((error) => {
        res.status(400).send({ status: false, data: error });
      });
  } catch (error) {
    res.status(400).send({ status: false, data: error });
  }
};

// Fetch By Id
exports.fetch_by_id = async (req: any, res: any, next: any) => {
  try {
    var id = parseInt(req.params.id);
    db.collection(competetion_collection)
      .where("event_id", "==", id)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach((competetion) => {
            if (competetion.data().deleted == 0) {
              res.status(200).send({ status: true, data: competetion.data() });
            } else {
              res
                .status(200)
                .send({ status: false, msg: "Competetion Deleted!" });
            }
          });
        } else {
          res
            .status(200)
            .send({ status: false, msg: "Competetion Not Found!" });
        }
      })
      .catch((error) => {
        res.status(400).send({ status: false, data: error });
      });
  } catch (error) {
    res.status(400).send({ status: false, data: error });
  }
};

// Update Competetion
exports.update = async (req: any, res: any, next: any) => {
  try {
    var id = parseInt(req.params.id);
    db.collection(competetion_collection)
      .where("event_id", "==", id)
      .where("deleted", "==", 0)
      .limit(1)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          db.collection(competetion_collection)
            .where("event_id", "==", id)
            .get()
            .then((query) => {
              const thing = query.docs[0];
              let tmp = thing.data();
              (tmp.long_name = req.body.long_name),
                (tmp.short_name = req.body.short_name),
                (tmp.display_picture = req.body.file_name),
                thing.ref.update(tmp);
              res
                .status(200)
                .send({ status: true, msg: "Competetion Updated !" });
            });
        } else {
          res
            .status(400)
            .send({ status: true, msg: "Competetion Not Found !" });
        }
      });
  } catch (error) {
    res.status(400).send({ status: true, data: error });
  }
};
