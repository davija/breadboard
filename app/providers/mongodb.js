"use strict";

var Mongo = require("mongodb"),
    MongoClient = Mongo.MongoClient;

exports.readOne = function (args, callback) {
    var dbstring = args.config.mongodb.connect;
    MongoClient.connect(dbstring, function (err, db) {
        db.collection(args.collection)
            .findOne({_id: Mongo.ObjectID(args.id)}, function (err, doc) {
                console.log("Mongodb Provider readOne found: " + JSON.stringify(doc) + "looking for: " + args.id);
                callback(err, doc);
                db.close();
            });
    });
};

exports.readList = function (args, callback) {
    var dbstring = args.config.mongodb.connect;
    MongoClient.connect(dbstring, function (err, db) {
        db.collection(args.collection)
            .find({}).toArray(function (err, doc) {
                console.log("Mongodb Provider Found collection: " + doc);
                callback(err, doc);
                db.close();
            });
    });
};

exports.create = function (args, callback) {
    var dbstring = args.config.mongodb.connect;
    MongoClient.connect(dbstring, function (err, db) {
        var c = db.collection(args.collection);
        args.data._id = new Mongo.ObjectID();
        args.data.uri = args.uri + "/" + args.data._id;
        c.insertOne(args.data, function (err, result) {
            console.log(err);
            console.log("Mongodb Provider created item: ", result.ops[0]._id);
            callback(err, result.ops[0]);
            db.close();
        });
    });
};

exports.update = function (args, callback) {
    var dbstring = args.config.mongodb.connect;
    MongoClient.connect(dbstring, function (err, db) {
        var c = db.collection(args.collection);
        console.log("trying to update to collection: " + args.collection + " : " + JSON.stringify(args.data));
        //to do an update, we need to use $set in order to force merge, since we may not have the entire representation
        //http://docs.mongodb.org/manual/reference/operator/update/set/#up._S_set
        c.updateOne({_id: Mongo.ObjectID(args.id)}, {$set: args.data }, function (err, result) {
            callback(err, args.data);
            db.close();
            console.log("Updating to collection: " + args.collection + " : " + JSON.stringify(args.data));
        });
    });
};

exports.remove = function (args, callback) {
    var dbstring = args.config.mongodb.connect;
    MongoClient.connect(dbstring, function (err, db) {
        var c = db.collection(args.collection);
        c.deleteOne({_id: Mongo.ObjectID(args.id)}, function (err, count) {
            db.close();
            console.log("Removing (x) items from collection: " + args.collection + " : " + count);
            console.log("Tried to remove: " + args.uri);
            callback(err);
        });
    });
};
