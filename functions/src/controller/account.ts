import * as admin from "firebase-admin";
import * as firebaseHelper from "firebase-functions-helper";
// import { body, validationResult } from "express-validator";
import * as CryptoJS from "crypto-js";
const db = admin.firestore();

var encryptSecretKey = "vrx9fd91fvrx9fd91f";
const account_collection = "vrx_account";
("subadmin_limit_collection");
("subadmin_transactions_collection");
("supermaster_limit_collection");
("supermaster_transactions_collection");
("master_limit_collection");
("master_transactions_collection");
("superagent_limit_collection");
("superagent_transactions_collection");
("agent_limit_collection");
("agent_transactions_collection");

const client_collection = "vrx_clients";
const client_limit_collection = "vrx_clients_limit_collection";
const client_transactions_collection = "vrx_clients_transactions_collection";

// const client = require("../redis");

interface Account {
  id: Number | null;
  parent_id: Number;
  username: String;
  name: String;
  subadmin_id: Number | null;
  supermaster_id: Number | null;
  master_id: Number | null;
  superagent_id: Number | null;
  mobile: String;
  password: String;
  reference: String;
  role: Number;
  new: Number;
  inactive: Number;
  deleted: Number;
  created: String;
  updated: String;
}

interface Client {
  id: Number | null;
  parent_id: Number;
  username: String;
  name: String;
  subadmin_id: Number | null;
  supermaster_id: Number | null;
  master_id: Number | null;
  superagent_id: Number | null;
  agent_id: Number | null;
  uuid: String | null;
  mobile: String;
  password: String;
  role: Number;
  new: Number;
  locked: Number;
  inactive: Number;
  hide_commission: Number;
  deleted: Number;
  created: String;
  updated: String;
}

interface Limits {
  created_by: Number;
  parent_id: Number;
  account_id: Number;
  fix: Number | 0;
  current: Number | 0;
  share: String | 0;
  match_commission: String | 0;
  session_commission: String | 0;
  match_bet_min: Number | 0;
  match_bet_max: Number | 0;
  session_bet_min: Number | 0;
  session_bet_max: Number | 0;
  created: String;
  updated: String;
}

interface Limit {
  created_by: Number;
  parent_id: Number;
  client_id: Number;
  fix: Number | 0;
  current: Number | 0;
  match_commission: String | 0;
  session_commission: String | 0;
  match_bet_min: Number | 0;
  match_bet_max: Number | 0;
  session_bet_min: Number | 0;
  session_bet_max: Number | 0;
  created: String;
  updated: String;
}

interface Trasaction {
  id: Number;
  created_by: Number;
  parent_id: Number;
  account_id: Number;
  amount: Number;
  type: Number | 0;
  comment: String;
  transaction_reference: Number;
  created: String;
  updated: String;
}

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

// @ Add Acccount
exports.add = async (req: any, res: any) => {
  try {
    req.body = decrypt_data(req.body);
    var creator_id = req.headers.target_id;
    const creator_role = req.headers.target;
    var form = ["agent", "superagent", "master", "supermaster", "subadmin"];
    // var validation_result = validate(req);
    if (
      parseInt(req.body.share) < 100 ||
      parseInt(req.body.share) > 0 ||
      parseInt(req.body.match_commission) < 100 ||
      parseInt(req.body.match_commission) > 0 ||
      parseInt(req.body.session_commission) < 100 ||
      parseInt(req.body.session_commission) > 0
    ) {
      // @ for creating the acoout collection (common)
      var id = Math.floor(Math.random() * (999 - 100 + 1) + 100);
      const account: Account = {
        id: id,
        subadmin_id: null,
        supermaster_id: null,
        master_id: null,
        superagent_id: null,
        parent_id: parseInt(req.body.parent_id),
        username: req.body.username,
        name: req.body.name.trim(),
        mobile: req.body.mobile.trim(),
        password: req.body.password.trim(),
        reference: req.body.reference.trim(),
        role: parseInt(req.body.role),
        new: 1,
        inactive: 0,
        deleted: 0,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      const limit: Limits = {
        created_by: parseInt(creator_id),
        parent_id: parseInt(req.body.parent_id),
        account_id: id,
        fix: parseInt(req.body.current),
        current: parseInt(req.body.current),
        share: req.body.share,
        match_commission: req.body.match_commission,
        session_commission: req.body.session_commission,
        match_bet_min: parseInt(req.body.match_bet_min),
        match_bet_max: parseInt(req.body.match_bet_max),
        session_bet_min: parseInt(req.body.session_bet_min),
        session_bet_max: parseInt(req.body.session_bet_max),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      var role = req.body.role;
      var parent_role = parseInt(role) + 1;
      if (role) {
        if (parseInt(creator_role) > parseInt(role)) {
          if (role == 4) {
            account.parent_id = creator_id;
            limit.parent_id = creator_id;
            account.subadmin_id = id;
            db.collection(account_collection)
              .where("username", "==", req.body.username)
              .where("role", "==", 4)
              .get()
              .then((querySnapshot) => {
                if (querySnapshot.empty) {
                  // @ if empty then creating the account of that subadmin
                  firebaseHelper.firestoreHelper
                    .createDocumentWithID(
                      db,
                      account_collection,
                      req.body.username,
                      account
                    )
                    .then((ref: any) => {
                      // @ if passes previous then creating the limit of that subadmin
                      firebaseHelper.firestoreHelper
                        .createDocumentWithID(
                          db,
                          `${form[role]}_limit_collection`,
                          req.body.username,
                          limit
                        )
                        .then((limitref: any) => {
                          res.status(200).send({
                            msg: "Subadmin Added!",
                            status: true,
                          });
                        });
                    });
                } else {
                  res.status(400).send({
                    message: "User Exists!",
                    status: false,
                  });
                }
              });
          } else if (role == 3 || role == 2 || role == 1 || role == 0) {
            db.collection(account_collection)
              .where("username", "==", req.body.username)
              .where("role", "==", role)
              .get()
              .then((querySnapshot) => {
                if (querySnapshot.empty) {
                  //@ check if parent is active & not deleted & have limit
                  db.collection(account_collection)
                    .where("id", "==", parseInt(req.body.parent_id))
                    .where("deleted", "==", 0)
                    .where("inactive", "==", 0)
                    .get()
                    .then((querySnapshot) => {
                      if (querySnapshot.empty) {
                        res.status(400).send({
                          msg: "Parent Either Inactive or Deleted!",
                          status: false,
                        });
                      } else {
                        // @ getting the limit of that parent
                        db.collection(`${form[parent_role]}_limit_collection`)
                          .where(
                            "account_id",
                            "==",
                            parseInt(req.body.parent_id)
                          )
                          .get()
                          .then((parent_limit_snap) => {
                            if (!parent_limit_snap.empty) {
                              parent_limit_snap.forEach((limit_data) => {
                                if (
                                  parseInt(req.body.current) >
                                  limit_data.data().current
                                ) {
                                  res.status(400).send({
                                    msg: "Limit Cannot Be More Than Parent Limit",
                                    status: false,
                                  });
                                } else if (
                                  parseInt(req.body.share) >
                                  parseInt(limit_data.data().share)
                                ) {
                                  res.status(400).send({
                                    msg: "Share Cannot Be More Than Parent Limit",
                                    status: false,
                                  });
                                } else if (
                                  parseInt(req.body.current) <
                                    parseInt(limit_data.data().current) &&
                                  parseInt(req.body.share) <
                                    parseInt(limit_data.data().share)
                                ) {
                                  const current_value: any =
                                    parseInt(limit_data.data().current) -
                                    parseInt(req.body.current);

                                  // @Supermaster
                                  if (role == 3) {
                                    account.subadmin_id = parseInt(
                                      req.body.parent_id
                                    );
                                    account.supermaster_id = id;
                                    // @ master
                                  } else if (role == 2) {
                                    account.subadmin_id = parseInt(
                                      req.body.subadmin_id
                                    );
                                    account.supermaster_id = parseInt(
                                      req.body.parent_id
                                    );
                                    account.master_id = id;
                                    // @ superagent
                                  } else if (role == 1) {
                                    account.subadmin_id = parseInt(
                                      req.body.subadmin_id
                                    );
                                    account.supermaster_id = parseInt(
                                      req.body.supermaster_id
                                    );
                                    account.master_id = parseInt(
                                      req.body.parent_id
                                    );
                                    account.superagent_id = id;
                                    // @ Agent
                                  } else if (role == 0) {
                                    account.subadmin_id = parseInt(
                                      req.body.subadmin_id
                                    );
                                    account.supermaster_id = parseInt(
                                      req.body.supermaster_id
                                    );
                                    account.master_id = parseInt(
                                      req.body.parent_id
                                    );
                                    account.superagent_id =
                                      req.body.superagent_id;
                                  }
                                  console.log("hadhahd", account);
                                  // @ adding that account
                                  firebaseHelper.firestoreHelper
                                    .createDocumentWithID(
                                      db,
                                      account_collection,
                                      req.body.username,
                                      account
                                    )
                                    .then((ref: any) => {
                                      firebaseHelper.firestoreHelper
                                        .createDocumentWithID(
                                          db,
                                          `${form[role]}_limit_collection`,
                                          req.body.username,
                                          limit
                                        )
                                        .then((limitref: any) => {
                                          // @ building Transaction Reference (parent)
                                          var uniqid = Date.now();
                                          const parent_trnsaction: Trasaction =
                                            {
                                              id: uniqid,
                                              created_by: parseInt(creator_id),
                                              parent_id: 0,
                                              account_id: parseInt(
                                                req.body.parent_id
                                              ),
                                              amount: parseInt(
                                                req.body.current
                                              ),
                                              type: 0,
                                              comment: `limit transferred by ${form[parent_role]}`,
                                              transaction_reference: uniqid,
                                              created: new Date().toISOString(),
                                              updated: new Date().toISOString(),
                                            };
                                          //  @ building Transaction Reference (main)
                                          const trnsaction: Trasaction = {
                                            id: uniqid,
                                            created_by: parseInt(creator_id),
                                            parent_id: parseInt(
                                              req.body.parent_id
                                            ),
                                            account_id: id,
                                            amount: parseInt(req.body.current),
                                            type: 1,
                                            comment: `limit transferred by ${form[role]}`,
                                            transaction_reference: uniqid,
                                            created: new Date().toISOString(),
                                            updated: new Date().toISOString(),
                                          };
                                          // @ creating transaction of that parent user
                                          firebaseHelper.firestoreHelper
                                            .createDocumentWithID(
                                              db,
                                              `${form[parent_role]}_transactions_collection`,
                                              uniqid.toString(),
                                              parent_trnsaction
                                            )
                                            .then(
                                              (parent_trnsaction_ref: any) => {
                                                // @ creating transaction of that user
                                                firebaseHelper.firestoreHelper
                                                  .createDocumentWithID(
                                                    db,
                                                    `${form[role]}_transactions_collection`,
                                                    uniqid.toString(),
                                                    trnsaction
                                                  )
                                                  .then(
                                                    (transaction_ref: any) => {
                                                      // @ reducing current of that user
                                                      db.collection(
                                                        `${form[parent_role]}_limit_collection`
                                                      )
                                                        .where(
                                                          "account_id",
                                                          "==",
                                                          parseInt(
                                                            req.body.parent_id
                                                          )
                                                        )
                                                        .get()
                                                        .then((query) => {
                                                          const thing =
                                                            query.docs[0];

                                                          let tmp =
                                                            thing.data();
                                                          (tmp.current =
                                                            current_value),
                                                            thing.ref.update(
                                                              tmp
                                                            );

                                                          res.status(200).send({
                                                            status: true,
                                                            msg: `${form[role]} Added!`,
                                                          });
                                                        });
                                                    }
                                                  );
                                              }
                                            );
                                        });
                                    });
                                } else {
                                  res.status(400).send({
                                    msg: "Share And Limit Cannot greater than parent!",
                                    status: false,
                                  });
                                }
                              });
                            } else {
                              res.status(400).send({
                                msg: "Something went wrong!",
                                status: false,
                              });
                            }
                          });
                      }
                    });
                } else {
                  res.status(400).send({
                    message: "User Exists!",
                    status: false,
                  });
                }
              });
          }
        } else {
          res.status(400).send({
            msg: "You dont have the permission to do it",
            status: false,
          });
        }
      }
    } else {
      res
        .status(400)
        .send({ msg: "Share & Commission Cannot be 100%", status: false });
    }
  } catch (error) {
    res.status(400).send({
      message: "Invalid Data fields are Missing!",
      status: false,
      error: error,
    });
  }
};

// Account Get Data
exports.account = async (req: any, res: any) => {
  if (req.params.role) {
    var role = parseInt(req.params.role);
    if (role == 4) {
      var user_name = "SUB1";
      db.collection(account_collection)
        .where("role", "==", role)
        .orderBy("created", "desc")
        .limit(1)
        .get()
        .then((username_snapshot) => {
          if (!username_snapshot.empty) {
            username_snapshot.forEach((user) => {
              user_name = `SUB${
                parseInt(user.data().username.split("SUB")[1]) + 1
              }`;
            });
            res.status(200).send({
              status: true,
              username: user_name,
            });
          } else {
            res.status(200).send({
              status: true,
              username: user_name,
            });
          }
        });
    } else if (role == 3 || role == 2 || role == 1 || role == 0) {
      var form = ["agent", "superagent", "master", "supermaster", "subadmin"];
      var parent_role = parseInt(req.params.role) + 1;
      var username_initial = ["A", "SA", "MU", "SMU"];
      const creator = req.headers.target;
      const creator_id = req.headers.target_id;
      var user_name = `${username_initial[role]}1`;
      var parent_data: any = {};
      var parent_array: any = [];
      var obj: any = {};
      db.collection(account_collection)
        .where("role", "==", role)
        .orderBy("created", "desc")
        .limit(1)
        .get()
        .then((username_snapshot) => {
          if (!username_snapshot.empty) {
            username_snapshot.forEach((user) => {
              user_name = `${username_initial[role]}${
                parseInt(
                  user.data().username.split(username_initial[role])[1]
                ) + 1
              }`;
            });
          }
        });
      // @ get the parents data here
      db.collection(`${form[parent_role]}_limit_collection`)
        .get()
        .then((limit_snap) => {
          if (creator == parent_role) {
            db.collection(account_collection)
              .where("id", "==", creator_id)
              .where("role", "==", creator)
              .where("deleted", "==", 0)
              .where("inactive", "==", 0)
              .get()
              .then((account_snap) => {
                if (!account_snap.empty) {
                  account_snap.forEach((element) => {
                    limit_snap.forEach((limit) => {
                      if (element.data().id == limit.data().account_id) {
                        parent_data = element.data();
                        parent_data.current = limit.data().current;
                        parent_data.match_commission =
                          limit.data().match_commission;
                        parent_data.session_commission =
                          limit.data().session_commission;
                        parent_data.share = limit.data().share;
                      }
                    });
                  });
                  res.status(200).send({
                    status: true,
                    username: user_name,
                    parents_data: parent_data,
                  });
                } else {
                  res
                    .status(400)
                    .send({ status: true, username: "Invalid Request!" });
                }
              });
          } else {
            var query = db
              .collection(account_collection)
              .where("role", "==", parent_role)
              .where("deleted", "==", 0)
              .where("inactive", "==", 0);
            if (creator == 4) {
              query = query.where("subadmin_id", "==", creator_id);
            } else if (creator == 3) {
              query = query.where("supermaster_id", "==", creator_id);
            } else if (creator == 2) {
              query = query.where("master_id", "==", creator_id);
            } else if (creator == 1) {
              query = query.where("superagent_id", "==", creator_id);
            }
            query.get().then((parent_account_snap) => {
              if (!parent_account_snap.empty) {
                parent_account_snap.forEach((element: any) => {
                  limit_snap.forEach((limit) => {
                    if (element.data().id == limit.data().account_id) {
                      obj = element.data();
                      obj.current = limit.data().current;
                      obj.match_commission = limit.data().match_commission;
                      obj.session_commission = limit.data().session_commission;
                      obj.share = limit.data().share;
                    }
                  });
                  parent_array.push(obj);
                });
                res.status(200).send({
                  status: true,
                  username: user_name,
                  parents_data: parent_array,
                });
              } else {
                res
                  .status(400)
                  .send({ status: true, username: "Invalid Request !" });
              }
            });
          }
        });
    }
  }
};

// Accout Update
exports.account_update = async (req: any, res: any) => {
  try {
    req.body = decrypt_data(req.body);
    const creator_role = req.headers.target;
    const creator_id = req.headers.target_id;
    var form = ["agent", "superagent", "master", "supermaster", "subadmin"];
    var role = parseInt(req.body.role);
    var parent_role = role + 1;
    if (
      parseInt(req.body.share) < 100 ||
      parseInt(req.body.share) > 0 ||
      parseInt(req.body.match_commission) < 100 ||
      parseInt(req.body.match_commission) > 0 ||
      parseInt(req.body.session_commission) < 100 ||
      parseInt(req.body.session_commission) > 0
    ) {
      if (parseInt(creator_role) > role) {
        if (role == 4) {
          db.collection(account_collection)
            .where("id", "==", parseInt(req.body.id))
            .where("deleted", "==", 0)
            .where("inactive", "==", 0)
            .get()
            .then((account_snap) => {
              if (!account_snap.empty) {
                const account = account_snap.docs[0];
                let tmp = account.data();
                tmp.name = req.body.name.trim();
                tmp.mobile = req.body.mobile.trim();
                tmp.password = req.body.password.trim();
                tmp.reference = req.body.reference.trim();
                tmp.updated = new Date().toISOString();
                db.collection(`${form[role]}_limit_collection`)
                  .where("account_id", "==", parseInt(req.body.id))
                  .get()
                  .then((limit_snap) => {
                    if (!limit_snap.empty) {
                      const limit = limit_snap.docs[0];
                      let tmp_limit = limit.data();
                      tmp_limit.share = req.body.share;
                      tmp_limit.current = req.body.current;
                      tmp_limit.match_commission = req.body.match_commission;
                      tmp_limit.session_commission =
                        req.body.session_commission;
                      tmp_limit.match_bet_min = req.body.match_bet_min;
                      tmp_limit.match_bet_max = req.body.match_bet_max;
                      tmp_limit.session_bet_min = req.body.session_bet_min;
                      tmp_limit.session_bet_max = req.body.session_bet_max;
                      tmp_limit.updated = new Date().toISOString();

                      db.collection(`subadmin_limit_collection`)
                        .where("account_id", "==", parseInt(req.body.id))
                        .get()
                        .then((limit_snap) => {
                          if (!limit_snap.empty) {
                            const limit = limit_snap.docs[0];
                            let tmp_limit = limit.data();
                            if (
                              parseInt(req.body.current) !=
                              parseInt(tmp_limit.current)
                            ) {
                              var user_trnsaction_comment;
                              var user_transaction_type: any;
                              var amount: any;
                              if (
                                parseInt(req.body.current) >
                                parseInt(tmp_limit.current)
                              ) {
                                user_trnsaction_comment = "credited";
                                user_transaction_type = 1;
                                amount =
                                  parseInt(req.body.current) -
                                  parseInt(tmp_limit.current);
                              } else {
                                user_trnsaction_comment = "debited";
                                user_transaction_type = 0;
                                amount =
                                  parseInt(tmp_limit.current) -
                                  parseInt(req.body.current);
                              }
                              var uniqid = Date.now();
                              const trnsaction: Trasaction = {
                                id: uniqid,
                                created_by: parseInt(creator_id),
                                parent_id: parseInt(req.body.parent_id),
                                account_id: parseInt(req.body.id),
                                amount: amount,
                                type: user_transaction_type,
                                comment: `limit ${user_trnsaction_comment} by admin`,
                                transaction_reference: uniqid,
                                created: new Date().toISOString(),
                                updated: new Date().toISOString(),
                              };
                              firebaseHelper.firestoreHelper.createDocumentWithID(
                                db,
                                `subadmin_transactions_collection`,
                                uniqid.toString(),
                                trnsaction
                              );
                            }
                            account.ref.update(tmp);
                            limit.ref.update(tmp_limit);
                            res.status(200).send({
                              msg: `${form[role]} Updated`,
                              status: true,
                            });
                          } else {
                            res.status(400).send({
                              msg: "Account Inactive or Deleted!",
                              status: false,
                            });
                          }
                        });
                    } else {
                      res.status(400).send({
                        msg: "Account Inactive or Deleted!",
                        status: false,
                      });
                    }
                  });
              } else {
                res.status(400).send({
                  msg: "Account Inactive or Deleted!",
                  status: false,
                });
              }
            });
        } else if (role == 3 || role == 2 || role == 1 || role == 0) {
          db.collection(`${form[parent_role]}_limit_collection`)
            .where("account_id", "==", parseInt(req.body.parent_id))
            .get()
            .then((parent_limit_snap) => {
              if (!parent_limit_snap.empty) {
                const parent_limit = parent_limit_snap.docs[0];
                let parent_tmp_limit = parent_limit.data();
                if (
                  parseInt(req.body.current) >
                  parseInt(parent_tmp_limit.current)
                ) {
                  res.status(400).send({
                    msg: "Limit Cannot Be More Than Parent Limit",
                    status: false,
                  });
                } else if (
                  parseInt(req.body.share) > parseInt(parent_tmp_limit.share)
                ) {
                  res.status(400).send({
                    msg: "Share Cannot Be More Than Parent Limit",
                    status: false,
                  });
                } else {
                  db.collection(account_collection)
                    .where("id", "==", parseInt(req.body.id))
                    .where("deleted", "==", 0)
                    .where("inactive", "==", 0)
                    .get()
                    .then((account_snap) => {
                      if (!account_snap.empty) {
                        // @ account object create for update
                        const account = account_snap.docs[0];
                        let tmp = account.data();
                        tmp.name = req.body.name.trim();
                        tmp.mobile = req.body.mobile.trim();
                        tmp.password = req.body.password.trim();
                        tmp.reference = req.body.reference.trim();
                        tmp.updated = new Date().toISOString();
                        db.collection(`${form[role]}_limit_collection`)
                          .where("account_id", "==", parseInt(req.body.id))
                          .get()
                          .then((limit_snap) => {
                            if (!limit_snap.empty) {
                              const limit = limit_snap.docs[0];
                              let tmp_limit = limit.data();
                              console.log("tmp", tmp_limit);
                              db.collection(
                                `${form[parent_role]}_limit_collection`
                              )
                                .where(
                                  "account_id",
                                  "==",
                                  parseInt(req.body.parent_id)
                                )
                                .get()
                                .then((parent_limit_snap) => {
                                  if (!parent_limit_snap.empty) {
                                    const parent_limit =
                                      parent_limit_snap.docs[0];
                                    let parent_tmp_limit = parent_limit.data();
                                    if (
                                      parseInt(req.body.current) !=
                                      parseInt(tmp_limit.current)
                                    ) {
                                      var parent_amount;
                                      var parent_trnsaction_comment;
                                      var user_trnsaction_comment;
                                      var parent_transaction_type: any;
                                      var user_transaction_type: any;
                                      var amount: any;
                                      if (
                                        parseInt(req.body.current) >
                                        parseInt(tmp_limit.current)
                                      ) {
                                        parent_trnsaction_comment = "debited";
                                        user_trnsaction_comment = "credited";
                                        parent_transaction_type = 0;
                                        user_transaction_type = 1;
                                        amount =
                                          parseInt(req.body.current) -
                                          parseInt(tmp_limit.current);
                                        parent_amount =
                                          parseInt(parent_tmp_limit.current) -
                                          amount;
                                      } else {
                                        user_trnsaction_comment = "debited";
                                        parent_trnsaction_comment = "credited";
                                        user_transaction_type = 0;
                                        parent_transaction_type = 1;
                                        amount =
                                          parseInt(tmp_limit.current) -
                                          parseInt(req.body.current);
                                        parent_amount =
                                          parseInt(parent_tmp_limit.current) +
                                          amount;
                                      }

                                      // Obj For Parent Limit Update
                                      parent_tmp_limit.current = parent_amount;

                                      // @ building Transaction Reference (parent)
                                      var uniqid = Date.now();
                                      const parent_trnsaction: Trasaction = {
                                        id: uniqid,
                                        created_by: parseInt(creator_id),
                                        parent_id: 0,
                                        account_id: parseInt(
                                          req.body.parent_id
                                        ),
                                        amount: amount,
                                        type: parent_transaction_type,
                                        comment: `limit ${parent_trnsaction_comment} by admin`,
                                        transaction_reference: uniqid,
                                        created: new Date().toISOString(),
                                        updated: new Date().toISOString(),
                                      };
                                      //  @ building Transaction Reference (main)
                                      const trnsaction: Trasaction = {
                                        id: uniqid,
                                        created_by: parseInt(creator_id),
                                        parent_id: parseInt(req.body.parent_id),
                                        account_id: parseInt(req.body.id),
                                        amount: amount,
                                        type: user_transaction_type,
                                        comment: `limit ${user_trnsaction_comment} by admin`,
                                        transaction_reference: uniqid,
                                        created: new Date().toISOString(),
                                        updated: new Date().toISOString(),
                                      };
                                      // @ creating transaction of that parent user
                                      firebaseHelper.firestoreHelper
                                        .createDocumentWithID(
                                          db,
                                          `${form[parent_role]}_transactions_collection`,
                                          uniqid.toString(),
                                          parent_trnsaction
                                        )
                                        .then((parent_trnsaction_ref: any) => {
                                          // @ creating transaction of that user
                                          firebaseHelper.firestoreHelper.createDocumentWithID(
                                            db,
                                            `${form[role]}_transactions_collection`,
                                            uniqid.toString(),
                                            trnsaction
                                          );
                                        });
                                    }
                                    // @ victim limit object for update
                                    tmp_limit.share = req.body.share;
                                    tmp_limit.current = req.body.current;
                                    tmp_limit.match_commission =
                                      req.body.match_commission;
                                    tmp_limit.session_commission =
                                      req.body.session_commission;
                                    tmp_limit.match_bet_min =
                                      req.body.match_bet_min;
                                    tmp_limit.match_bet_max =
                                      req.body.match_bet_max;
                                    tmp_limit.session_bet_min =
                                      req.body.session_bet_min;
                                    tmp_limit.session_bet_max =
                                      req.body.session_bet_max;
                                    tmp_limit.updated =
                                      new Date().toISOString();

                                    // @ parent limit object for update
                                    // parent_tmp_limit.share = req.body.share;
                                    // tmp;
                                    parent_tmp_limit.match_commission =
                                      req.body.match_commission;
                                    parent_tmp_limit.session_commission =
                                      req.body.session_commission;
                                    parent_tmp_limit.match_bet_min =
                                      req.body.match_bet_min;
                                    parent_tmp_limit.match_bet_max =
                                      req.body.match_bet_max;
                                    parent_tmp_limit.session_bet_min =
                                      req.body.session_bet_min;
                                    parent_tmp_limit.session_bet_max =
                                      req.body.session_bet_max;
                                    parent_tmp_limit.updated =
                                      new Date().toISOString();

                                    account.ref.update(tmp);
                                    limit.ref.update(tmp_limit);
                                    parent_limit.ref.update(parent_tmp_limit);
                                    res.status(200).send({
                                      msg: `${form[role]} Updated`,
                                      status: true,
                                    });
                                  } else {
                                    console.log("ssvjs");
                                    res.status(400).send({
                                      msg: "Account Inactive or Deleted!",
                                      status: false,
                                    });
                                  }
                                });
                            } else {
                              res.status(400).send({
                                msg: "Account Inactive or Deleted!",
                                status: false,
                              });
                            }
                          });
                      } else {
                        res.status(400).send({
                          msg: "Account Inactive or Deleted!",
                          status: false,
                        });
                      }
                    });
                }
              } else {
                res.status(400).send({
                  msg: "Account Inactive or Deleted!",
                  status: false,
                });
              }
            });
        }
      }
    } else {
      res
        .status(400)
        .send({ msg: "Share & Commission Cannot be 100%", status: false });
    }
  } catch (error) {}
};

// Account Limit Update
exports.limit_update = async (req: any, res: any) => {
  try {
    req.body = decrypt_data(req.body);
    const creator_role = req.headers.target;
    const creator_id = req.headers.target_id;
    var form = ["agent", "superagent", "master", "supermaster", "subadmin"];
    var role = parseInt(req.body.role);
    var parent_role = role + 1;
    if (
      parseInt(req.body.share) < 100 ||
      parseInt(req.body.share) > 0 ||
      parseInt(req.body.match_commission) < 100 ||
      parseInt(req.body.match_commission) > 0 ||
      parseInt(req.body.session_commission) < 100 ||
      parseInt(req.body.session_commission) > 0
    ) {
      if (parseInt(creator_role) > role) {
        if (role == 4) {
          db.collection(account_collection)
            .where("id", "==", parseInt(req.body.id))
            .where("deleted", "==", 0)
            .where("inactive", "==", 0)
            .get()
            .then((account_snap) => {
              if (!account_snap.empty) {
                db.collection(`subadmin_limit_collection`)
                  .where("account_id", "==", parseInt(req.body.id))
                  .get()
                  .then((limit_snap) => {
                    if (!limit_snap.empty) {
                      const limit = limit_snap.docs[0];
                      let tmp_limit = limit.data();
                      tmp_limit.current = req.body.current;
                      tmp_limit.updated = new Date().toISOString();

                      db.collection(`subadmin_limit_collection`)
                        .where("account_id", "==", parseInt(req.body.id))
                        .get()
                        .then((limit_snap) => {
                          if (!limit_snap.empty) {
                            const limit = limit_snap.docs[0];
                            let tmp_limit = limit.data();
                            if (
                              parseInt(req.body.current) !=
                              parseInt(tmp_limit.current)
                            ) {
                              var user_trnsaction_comment;
                              var user_transaction_type: any;
                              var amount: any;
                              if (
                                parseInt(req.body.current) >
                                parseInt(tmp_limit.current)
                              ) {
                                user_trnsaction_comment = "credited";
                                user_transaction_type = 1;
                                amount =
                                  parseInt(req.body.current) -
                                  parseInt(tmp_limit.current);
                              } else {
                                user_trnsaction_comment = "debited";
                                user_transaction_type = 0;
                                amount =
                                  parseInt(tmp_limit.current) -
                                  parseInt(req.body.current);
                              }
                              var uniqid = Date.now();
                              const trnsaction: Trasaction = {
                                id: uniqid,
                                created_by: parseInt(creator_id),
                                parent_id: parseInt(req.body.parent_id),
                                account_id: parseInt(req.body.id),
                                amount: amount,
                                type: user_transaction_type,
                                comment: `limit ${user_trnsaction_comment} by admin`,
                                transaction_reference: uniqid,
                                created: new Date().toISOString(),
                                updated: new Date().toISOString(),
                              };
                              firebaseHelper.firestoreHelper.createDocumentWithID(
                                db,
                                `subadmin_transactions_collection`,
                                uniqid.toString(),
                                trnsaction
                              );
                              limit.ref.update(tmp_limit);
                              res.status(200).send({
                                msg: `${form[role]} limit Updated`,
                                status: true,
                              });
                            }
                          } else {
                            res.status(400).send({
                              msg: "Account Inactive or Deleted!",
                              status: false,
                            });
                          }
                        });
                    } else {
                      res.status(400).send({
                        msg: "Account Inactive or Deleted!",
                        status: false,
                      });
                    }
                  });
              } else {
                res.status(400).send({
                  msg: "Account Inactive or Deleted!",
                  status: false,
                });
              }
            });
        } else if (role == 3 || role == 2 || role == 1 || role == 0) {
          db.collection(`${form[parent_role]}_limit_collection`)
            .where("account_id", "==", parseInt(req.body.parent_id))
            .get()
            .then((parent_limit_snap) => {
              if (!parent_limit_snap.empty) {
                const parent_limit = parent_limit_snap.docs[0];
                let parent_tmp_limit = parent_limit.data();
                if (
                  parseInt(req.body.current) >
                  parseInt(parent_tmp_limit.current)
                ) {
                  res.status(400).send({
                    msg: "Limit Cannot Be More Than Parent Limit",
                    status: false,
                  });
                } else if (
                  parseInt(req.body.current) <
                  parseInt(parent_tmp_limit.current)
                ) {
                  db.collection(account_collection)
                    .where("id", "==", parseInt(req.body.id))
                    .where("deleted", "==", 0)
                    .where("inactive", "==", 0)
                    .get()
                    .then((account_snap) => {
                      if (!account_snap.empty) {
                        // @ account object create for update
                        db.collection(`${form[role]}_limit_collection`)
                          .where("account_id", "==", parseInt(req.body.id))
                          .get()
                          .then((limit_snap) => {
                            if (!limit_snap.empty) {
                              const limit = limit_snap.docs[0];
                              let tmp_limit = limit.data();
                              db.collection(
                                `${form[parent_role]}_limit_collection`
                              )
                                .where(
                                  "account_id",
                                  "==",
                                  parseInt(req.body.parent_id)
                                )
                                .get()
                                .then((parent_limit_snap) => {
                                  if (!parent_limit_snap.empty) {
                                    const parent_limit =
                                      parent_limit_snap.docs[0];
                                    let parent_tmp_limit = parent_limit.data();
                                    if (
                                      parseInt(req.body.current) !=
                                      parseInt(tmp_limit.current)
                                    ) {
                                      var parent_amount;
                                      var parent_trnsaction_comment;
                                      var user_trnsaction_comment;
                                      var parent_transaction_type: any;
                                      var user_transaction_type: any;
                                      var amount: any;
                                      if (
                                        parseInt(req.body.current) >
                                        parseInt(tmp_limit.current)
                                      ) {
                                        parent_trnsaction_comment = "debited";
                                        user_trnsaction_comment = "credited";
                                        parent_transaction_type = 0;
                                        user_transaction_type = 1;
                                        amount =
                                          parseInt(req.body.current) -
                                          parseInt(tmp_limit.current);
                                        parent_amount =
                                          parseInt(parent_tmp_limit.current) -
                                          amount;
                                      } else {
                                        console.log("nfdss");
                                        user_trnsaction_comment = "debited";
                                        parent_trnsaction_comment = "credited";
                                        user_transaction_type = 0;
                                        parent_transaction_type = 1;
                                        amount =
                                          parseInt(tmp_limit.current) -
                                          parseInt(req.body.current);
                                        parent_amount =
                                          parseInt(parent_tmp_limit.current) +
                                          amount;
                                      }
                                    }
                                    // @ victim limit object for update

                                    tmp_limit.current = req.body.current;
                                    tmp_limit.updated =
                                      new Date().toISOString();

                                    // @ parent limit object for update

                                    parent_tmp_limit.current = parent_amount;
                                    parent_tmp_limit.updated =
                                      new Date().toISOString();

                                    // @ building Transaction Reference (parent)
                                    var uniqid = Date.now();
                                    const parent_trnsaction: Trasaction = {
                                      id: uniqid,
                                      created_by: parseInt(creator_id),
                                      parent_id: 0,
                                      account_id: parseInt(req.body.parent_id),
                                      amount: amount,
                                      type: parent_transaction_type,
                                      comment: `limit ${parent_trnsaction_comment} by admin`,
                                      transaction_reference: uniqid,
                                      created: new Date().toISOString(),
                                      updated: new Date().toISOString(),
                                    };
                                    //  @ building Transaction Reference (main)
                                    const trnsaction: Trasaction = {
                                      id: uniqid,
                                      created_by: parseInt(creator_id),
                                      parent_id: parseInt(req.body.parent_id),
                                      account_id: parseInt(req.body.id),
                                      amount: amount,
                                      type: user_transaction_type,
                                      comment: `limit ${user_trnsaction_comment} by admin`,
                                      transaction_reference: uniqid,
                                      created: new Date().toISOString(),
                                      updated: new Date().toISOString(),
                                    };
                                    // @ creating transaction of that parent user
                                    firebaseHelper.firestoreHelper
                                      .createDocumentWithID(
                                        db,
                                        `${form[parent_role]}_transactions_collection`,
                                        uniqid.toString(),
                                        parent_trnsaction
                                      )
                                      .then((parent_trnsaction_ref: any) => {
                                        // @ creating transaction of that user
                                        firebaseHelper.firestoreHelper.createDocumentWithID(
                                          db,
                                          `${form[role]}_transactions_collection`,
                                          uniqid.toString(),
                                          trnsaction
                                        );
                                      });
                                    limit.ref.update(tmp_limit);
                                    parent_limit.ref.update(parent_tmp_limit);
                                    res.status(200).send({
                                      msg: `${form[role]} Updated`,
                                      status: true,
                                    });
                                  } else {
                                    console.log("ssvjs");
                                    res.status(400).send({
                                      msg: "Account Inactive or Deleted!",
                                      status: false,
                                    });
                                  }
                                });
                            } else {
                              res.status(400).send({
                                msg: "Account Inactive or Deleted!",
                                status: false,
                              });
                            }
                          });
                      } else {
                        res.status(400).send({
                          msg: "Account Inactive or Deleted!",
                          status: false,
                        });
                      }
                    });
                }
              } else {
                res.status(400).send({
                  msg: "Account Inactive or Deleted!",
                  status: false,
                });
              }
            });
        }
      }
    } else {
      res
        .status(400)
        .send({ msg: "Share & Commission Cannot be 100%", status: false });
    }
  } catch (error) {}
};

// Get Child Accounts
exports.get_account = async (req: any, res: any) => {
  const parent_role = req.headers.target;
  const parent_id = req.headers.target_id;
  var form = ["agent", "superagent", "master", "supermaster", "subadmin"];
  var role = parseInt(req.params.role);
  var obj: any = {};
  var child_array: any = [];
  // @ get the childs data here
  if (parent_role == 9) {
    db.collection(`${form[role]}_limit_collection`)
      .get()
      .then((limit_snap) => {
        db.collection(account_collection)
          .where("role", "==", role)
          .where("deleted", "==", 0)
          .get()
          .then((account_snap) => {
            if (!account_snap.empty) {
              account_snap.forEach((element: any) => {
                limit_snap.forEach((limit) => {
                  if (element.data().id == limit.data().account_id) {
                    obj = element.data();
                    obj.current = limit.data().current;
                    obj.match_commission = limit.data().match_commission;
                    obj.session_commission = limit.data().session_commission;
                    obj.share = limit.data().share;
                  }
                });
                child_array.push(obj);
              });
              res.status(200).send({
                status: true,
                child: child_array,
              });
            } else {
              res
                .status(400)
                .send({ status: true, username: "Invalid Request !" });
            }
          });
      });
  } else if (
    parent_role == 4 ||
    parent_role == 3 ||
    parent_role == 2 ||
    parent_role == 1 ||
    parent_role == 0
  ) {
    var diff = parent_role - role;
    switch (diff) {
      case 1:
        db.collection(`${form[role]}_limit_collection`)
          .where("parent_id", "==", parent_id)
          .get()
          .then((limit_snap) => {
            db.collection(account_collection)
              .where("role", "==", role)
              .where("parent_id", "==", parent_id)
              .where("deleted", "==", 0)
              .get()
              .then((account_snap) => {
                if (!account_snap.empty) {
                  account_snap.forEach((element: any) => {
                    limit_snap.forEach((limit) => {
                      if (element.data().id == limit.data().account_id) {
                        obj = element.data();
                        obj.current = limit.data().current;
                        obj.match_commission = limit.data().match_commission;
                        obj.session_commission =
                          limit.data().session_commission;
                        obj.share = limit.data().share;
                      }
                    });
                    child_array.push(obj);
                  });
                  res.status(200).send({
                    status: true,
                    child: child_array,
                  });
                } else {
                  res
                    .status(400)
                    .send({ status: true, username: "Invalid Request !" });
                }
              });
          });
        break;
      case 2:
        db.collection(`${form[role]}_limit_collection`)
          .get()
          .then((limit_snap) => {
            var query = db
              .collection(account_collection)
              .where("role", "==", role)
              .where("deleted", "==", 0);

            if (parent_role == 4) {
              query = query.where("subadmin_id", "==", parent_id);
            } else if (parent_role == 3) {
              query = query.where("supermaster_id", "==", parent_id);
            } else if (parent_role == 2) {
              query = query.where("master_id", "==", parent_id);
            } else if (parent_role == 1) {
              query = query.where("superagent_id", "==", parent_id);
            }

            query.get().then((account_snap) => {
              if (!account_snap.empty) {
                account_snap.forEach((element: any) => {
                  limit_snap.forEach((limit) => {
                    if (element.data().id == limit.data().account_id) {
                      obj = element.data();
                      obj.current = limit.data().current;
                      obj.match_commission = limit.data().match_commission;
                      obj.session_commission = limit.data().session_commission;
                      obj.share = limit.data().share;
                    }
                  });
                  child_array.push(obj);
                });
                res.status(200).send({
                  status: true,
                  child: child_array,
                });
              } else {
                res
                  .status(400)
                  .send({ status: true, username: "Invalid Request !" });
              }
            });
          });
        break;
      case 3:
        db.collection(`${form[role]}_limit_collection`)
          .get()
          .then((limit_snap) => {
            var query = db
              .collection(account_collection)
              .where("role", "==", role)
              .where("deleted", "==", 0);

            if (parent_role == 4) {
              query = query.where("subadmin_id", "==", parent_id);
            } else if (parent_role == 3) {
              query = query.where("supermaster_id", "==", parent_id);
            } else if (parent_role == 2) {
              query = query.where("master_id", "==", parent_id);
            } else if (parent_role == 1) {
              query = query.where("superagent_id", "==", parent_id);
            }

            query.get().then((account_snap) => {
              if (!account_snap.empty) {
                account_snap.forEach((element: any) => {
                  limit_snap.forEach((limit) => {
                    if (element.data().id == limit.data().account_id) {
                      obj = element.data();
                      obj.current = limit.data().current;
                      obj.match_commission = limit.data().match_commission;
                      obj.session_commission = limit.data().session_commission;
                      obj.share = limit.data().share;
                    }
                  });
                  child_array.push(obj);
                });
                res.status(200).send({
                  status: true,
                  child: child_array,
                });
              } else {
                res
                  .status(400)
                  .send({ status: true, username: "Invalid Request !" });
              }
            });
          });
        break;
      case 4:
        db.collection(`${form[role]}_limit_collection`)
          .get()
          .then((limit_snap) => {
            var query = db
              .collection(account_collection)
              .where("role", "==", role)
              .where("deleted", "==", 0);

            if (parent_role == 4) {
              query = query.where("subadmin_id", "==", parent_id);
            } else if (parent_role == 3) {
              query = query.where("supermaster_id", "==", parent_id);
            } else if (parent_role == 2) {
              query = query.where("master_id", "==", parent_id);
            } else if (parent_role == 1) {
              query = query.where("superagent_id", "==", parent_id);
            }

            query.get().then((account_snap) => {
              if (!account_snap.empty) {
                account_snap.forEach((element: any) => {
                  limit_snap.forEach((limit) => {
                    if (element.data().id == limit.data().account_id) {
                      obj = element.data();
                      obj.current = limit.data().current;
                      obj.match_commission = limit.data().match_commission;
                      obj.session_commission = limit.data().session_commission;
                      obj.share = limit.data().share;
                    }
                  });
                  child_array.push(obj);
                });
                res.status(200).send({
                  status: true,
                  child: child_array,
                });
              } else {
                res
                  .status(400)
                  .send({ status: false, msg: `No ${form[role]} found!` });
              }
            });
          });
        break;
      default:
        break;
    }
  }
};

// Get a Single Account
exports.get_single_account = async (req: any, res: any) => {
  var form = ["agent", "superagent", "master", "supermaster", "subadmin"];
  var id = parseInt(req.params.id);
  db.collection(account_collection)
    .where("id", "==", id)
    .where("deleted", "==", 0)
    .where("inactive", "==", 0)
    .get()
    .then((account_snap) => {
      if (!account_snap.empty) {
        const account = account_snap.docs[0];
        let tmp = account.data();
        db.collection(`${form[tmp.role]}_limit_collection`)
          .where("account_id", "==", id)
          .get()
          .then((limit_snap) => {
            const limit = limit_snap.docs[0];
            let tmp_limit = limit.data();
            if (tmp.role == 4) {
              res.status(200).send({
                status: false,
                data: {
                  account: tmp,
                  limit: tmp_limit,
                },
              });
            } else if (
              tmp.role == 3 ||
              tmp.role == 2 ||
              tmp.role == 1 ||
              tmp.role == 0
            ) {
              db.collection(`${form[parseInt(tmp.role) + 1]}_limit_collection`)
                .where("account_id", "==", tmp.parent_id)
                .get()
                .then((limit_snap) => {
                  const parent_limit = limit_snap.docs[0];
                  let parent_tmp_limit = parent_limit.data();
                  res.status(200).send({
                    status: false,
                    data: {
                      account: tmp,
                      limit: tmp_limit,
                      parent_limit: parent_tmp_limit,
                    },
                  });
                });
            }
          });
      } else {
        res.status(400).send({
          msg: "Account Inactive or Deleted!",
          status: false,
        });
      }
    });
};

// Add Client
exports.add_client = async (req: any, res: any) => {
  try {
    req.body = decrypt_data(req.body);
    var creator_id = req.headers.target_id;
    if (
      parseInt(req.body.match_commission) < 100 ||
      parseInt(req.body.match_commission) > 0 ||
      parseInt(req.body.session_commission) < 100 ||
      parseInt(req.body.session_commission) > 0
    ) {
      // @ for creating the acoout collection (common)
      var id = Math.floor(Math.random() * (999 - 100 + 1) + 100);
      const client: Client = {
        id: id,
        subadmin_id: null,
        supermaster_id: null,
        master_id: null,
        superagent_id: null,
        agent_id: parseInt(req.body.parent_id),
        parent_id: parseInt(req.body.parent_id),
        username: req.body.username,
        name: req.body.name.trim(),
        mobile: req.body.mobile.trim(),
        password: req.body.password.trim(),
        role: parseInt(req.body.role),
        new: 1,
        inactive: 0,
        deleted: 0,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        uuid: null,
        locked: 0,
        hide_commission: 0,
      };
      const limit: Limit = {
        created_by: parseInt(creator_id),
        parent_id: parseInt(req.body.parent_id),
        client_id: id,
        fix: parseInt(req.body.current),
        current: parseInt(req.body.current),
        match_commission: req.body.match_commission,
        session_commission: req.body.session_commission,
        match_bet_min: parseInt(req.body.match_bet_min),
        match_bet_max: parseInt(req.body.match_bet_max),
        session_bet_min: parseInt(req.body.session_bet_min),
        session_bet_max: parseInt(req.body.session_bet_max),
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      var role = req.body.role;
      db.collection(client_collection)
        .where("username", "==", req.body.username)
        .where("role", "==", role)
        .get()
        .then((querySnapshot) => {
          if (querySnapshot.empty) {
            //@ check if parent is active & not deleted & have limit
            db.collection(account_collection)
              .where("id", "==", parseInt(req.body.parent_id))
              .where("deleted", "==", 0)
              .where("inactive", "==", 0)
              .get()
              .then((querySnapshot) => {
                if (querySnapshot.empty) {
                  res.status(400).send({
                    msg: "Parent Either Inactive or Deleted!",
                    status: false,
                  });
                } else {
                  // @ getting the limit of that parent
                  db.collection(`agent_limit_collection`)
                    .where("account_id", "==", parseInt(req.body.parent_id))
                    .get()
                    .then((parent_limit_snap) => {
                      if (!parent_limit_snap.empty) {
                        parent_limit_snap.forEach((limit_data) => {
                          if (
                            parseInt(req.body.current) >
                              limit_data.data().current ||
                            parseInt(req.body.current) ==
                              limit_data.data().current
                          ) {
                            res.status(400).send({
                              msg: "Limit Cannot Be More Than Parent Limit or Equal",
                              status: false,
                            });
                          } else {
                            const current_value: any =
                              parseInt(limit_data.data().current) -
                              parseInt(req.body.current);

                            // @ adding that client
                            firebaseHelper.firestoreHelper
                              .createDocumentWithID(
                                db,
                                account_collection,
                                req.body.username,
                                client
                              )
                              .then((ref: any) => {
                                // @ adding client limit
                                firebaseHelper.firestoreHelper
                                  .createDocumentWithID(
                                    db,
                                    client_limit_collection,
                                    req.body.username,
                                    limit
                                  )
                                  .then((limitref: any) => {
                                    // @ building Transaction Reference (parent)
                                    var uniqid = Date.now();
                                    const parent_trnsaction: Trasaction = {
                                      id: uniqid,
                                      created_by: parseInt(creator_id),
                                      parent_id: 0,
                                      account_id: parseInt(req.body.parent_id),
                                      amount: parseInt(req.body.current),
                                      type: 0,
                                      comment: `limit transferred by admin`,
                                      transaction_reference: uniqid,
                                      created: new Date().toISOString(),
                                      updated: new Date().toISOString(),
                                    };
                                    //  @ building Transaction Reference (main)
                                    const trnsaction: Trasaction = {
                                      id: uniqid,
                                      created_by: parseInt(creator_id),
                                      parent_id: parseInt(req.body.parent_id),
                                      account_id: id,
                                      amount: parseInt(req.body.current),
                                      type: 1,
                                      comment: `limit added to client`,
                                      transaction_reference: uniqid,
                                      created: new Date().toISOString(),
                                      updated: new Date().toISOString(),
                                    };
                                    // @ creating transaction of that parent user
                                    firebaseHelper.firestoreHelper
                                      .createDocumentWithID(
                                        db,
                                        `agent_transactions_collection`,
                                        uniqid.toString(),
                                        parent_trnsaction
                                      )
                                      .then((parent_trnsaction_ref: any) => {
                                        // @ creating transaction of that user
                                        firebaseHelper.firestoreHelper
                                          .createDocumentWithID(
                                            db,
                                            client_transactions_collection,
                                            uniqid.toString(),
                                            trnsaction
                                          )
                                          .then((transaction_ref: any) => {
                                            // @ reducing current of that user
                                            db.collection(
                                              `agent_limit_collection`
                                            )
                                              .where(
                                                "account_id",
                                                "==",
                                                parseInt(req.body.parent_id)
                                              )
                                              .get()
                                              .then((query) => {
                                                const thing = query.docs[0];

                                                let tmp = thing.data();
                                                (tmp.current = current_value),
                                                  thing.ref.update(tmp);

                                                res.status(200).send({
                                                  status: true,
                                                  msg: `Client Added!`,
                                                });
                                              });
                                          });
                                      });
                                  });
                              });
                          }
                        });
                      } else {
                        res.status(400).send({
                          msg: "Something went wrong!",
                          status: false,
                        });
                      }
                    });
                }
              });
          } else {
            res.status(400).send({
              message: "Client Exists!",
              status: false,
            });
          }
        });
    } else {
      res
        .status(400)
        .send({ msg: "Share & Commission Cannot be 100%", status: false });
    }
  } catch (error) {
    res.status(400).send({
      message: "Invalid Data fields are Missing!",
      status: false,
      error: error,
    });
  }
};

// Account Get Data
exports.client = async (req: any, res: any) => {
  var creator_id = req.headers.target_id;
  const creator_role = req.headers.target;
  var user_name = "CL1";
  var parent_data: any = {};
  var parent_array: any = [];
  var obj: any = {};
  db.collection(client_collection)
    .where("role", "==", -1)
    .orderBy("created", "desc")
    .limit(1)
    .get()
    .then((username_snapshot) => {
      if (!username_snapshot.empty) {
        username_snapshot.forEach((user) => {
          user_name = `CL${parseInt(user.data().username.split("CL")[1]) + 1}`;
        });
      }
    });  
  // @ get the parents data here
  db.collection(`agent_limit_collection`)
    .get()
    .then((limit_snap) => {
      if (creator_role == 0) {
        db.collection(account_collection)
          .where("id", "==", creator_id)
          .where("role", "==", creator_role)
          .where("deleted", "==", 0)
          .where("inactive", "==", 0)
          .get()
          .then((account_snap) => {
            if (!account_snap.empty) {
              account_snap.forEach((element) => {
                limit_snap.forEach((limit) => {
                  if (element.data().id == limit.data().account_id) {
                    parent_data = element.data();
                    parent_data.current = limit.data().current;
                    parent_data.match_commission =
                      limit.data().match_commission;
                    parent_data.session_commission =
                      limit.data().session_commission;
                    parent_data.share = limit.data().share;
                  }
                });
              });
              res.status(200).send({
                status: true,
                username: user_name,
                parents_data: parent_data,
              });
            } else {
              res
                .status(400)
                .send({ status: true, username: "Invalid Request!" });
            }
          });
      } else {
        var query = db
          .collection(account_collection)
          .where("role", "==", 0)
          .where("deleted", "==", 0)
          .where("inactive", "==", 0);
        if (creator_role == 4) {
          query = query.where("subadmin_id", "==", creator_id);
        } else if (creator_role == 3) {
          query = query.where("supermaster_id", "==", creator_id);
        } else if (creator_role == 2) {
          query = query.where("master_id", "==", creator_id);
        } else if (creator_role == 1) {
          query = query.where("superagent_id", "==", creator_id);
        }
        query.get().then((parent_account_snap) => {
          if (!parent_account_snap.empty) {
            parent_account_snap.forEach((element: any) => {
              limit_snap.forEach((limit) => {
                if (element.data().id == limit.data().account_id) {
                  obj = element.data();
                  obj.current = limit.data().current;
                  obj.match_commission = limit.data().match_commission;
                  obj.session_commission = limit.data().session_commission;
                  obj.share = limit.data().share;
                }
              });
              parent_array.push(obj);
            });
            res.status(200).send({
              status: true,
              username: user_name,
              parents_data: parent_array,
            });
          } else {
            res
              .status(400)
              .send({ status: true, username: "Invalid Request !" });
          }
        });
      }
    });
};
