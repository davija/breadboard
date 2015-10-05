"use strict";

var Mongo = require("mongodb"),
    MongoClient = Mongo.MongoClient,
    fs = require('fs'),
    http = require('http'),
    connect,
    getMongoConnectString,
    readTokenFile;

readTokenFile = function (tokenFile) {
    var token;

    console.log("Reading token from " + tokenFile);
    token = fs.readFileSync(tokenFile, {encoding: "utf-8"});
    console.log("Read token " + token);
    return token;
};

// This makes a call to vault each time to get the connection string instead of caching.
// This allows breadboard to get values as soon as token file is updated.
// Another solution would be to implement an error handler for vault calls that catches
// auth failures or permissions issues and re-loads the token before retrying.
getMongoConnectString = function (args, callback) {
    var req = http.request({
        hostname: args.config.mongoVault.hostname,
        path: '/v1/secret/mongodb',
        method: 'GET',
        port: args.config.mongoVault.port,
        headers: {
            "X-Vault-Token": readTokenFile(args.config.mongoVault.tokenFile),
            "Content-Type": "application/json"
        }
    }, function (response) {
        if ("200" == response.statusCode) {
            response.on('data', function (chunk) {
                callback(JSON.parse(chunk).data.connectString);
            });
        } else {
            console.log("Unexpected response status code: " + response.statusCode);
        }
    });

    req.on('error', function (e) {
        console.log('Could not load connection string from vault: ' + e.message);
    });

    req.end();
};

connect = function (args, mongoFunction) {
    getMongoConnectString(args, function (connectString) {
        MongoClient.connect(connectString, mongoFunction);
    });
};

exports.readOne = function (args, callback) {
    connect(args, function (err, db) {
        db.collection(args.collection)
            .findOne({_id: Mongo.ObjectID(args.id)}, function (err, doc) {
                console.log("Mongodb Provider readOne found: " + JSON.stringify(doc) + "looking for: " + args.id);
                callback(err, doc);
                db.close();
            });
    });
};

exports.readList = function (args, callback) {
    connect(args, function (err, db) {
        db.collection(args.collection)
            .find({}).toArray(function (err, doc) {
                console.log("Mongodb Provider Found collection: " + doc);
                callback(err, doc);
                db.close();
            });
    });
};

exports.create = function (args, callback) {
    connect(args, function (err, db) {
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
    connect(args, function (err, db) {
        var c = db.collection(args.collection);
        console.log("trying to update to collection: " + args.collection + " : " + JSON.stringify(args.data));
        //to do an update, we need to use $set in order to force merge, since we may not have the entire representation
        //http://docs.mongodb.org/manual/reference/operator/update/set/#up._S_set
        c.updateOne({_id: Mongo.ObjectID(args.id)}, {$set: args.data}, function (err, result) {
            callback(err, args.data);
            db.close();
            console.log("Updating to collection: " + args.collection + " : " + JSON.stringify(args.data));
        });
    });
};

exports.remove = function (args, callback) {
    connect(args, function (err, db) {
        var c = db.collection(args.collection);
        c.deleteOne({_id: Mongo.ObjectID(args.id)}, function (err, count) {
            db.close();
            console.log("Removing (x) items from collection: " + args.collection + " : " + count);
            console.log("Tried to remove: " + args.uri);
            callback(err);
        });
    });
};
