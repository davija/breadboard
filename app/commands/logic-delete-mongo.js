function remove (context, callback) {

    /**
     * Default delete operation for the object of interest, with no other business logic.
     * It removes the object from mongodb.
     * In order to determine what table (collection) to use, it looks first for the "collection"
     * link, which defines that collection an item is within. If this link is not present,
     * we are dealing with an actual collection, in which case the "self" link is used.
     */

    var mongodb = require("mongodb"),
        dbstring = app.get("mongodb.connect");

    mongodb.MongoClient.connect(dbstring, function (err, db) {
        var c,
            self,
            coll,
            cname;

        context.links.forEach(function (link) {
            if (link.rel === "schema/rel/collection") {
                coll = link.schema['$ref'].substring(link.schema['$ref'].lastIndexOf("/")+1);
            } else if (link.rel === "schema/rel/self") {
                self = link.schema['$ref'].substring(link.schema['$ref'].lastIndexOf("/")+1);
            }
        });
        cname = coll || self;

        c = db.collection(cname);
        c.remove({_id: context.params.uri}, function (err, count) {
            db.close();
            console.log("Removing (x) items from collection: " + cname + " : " + count);
            callback(context)
        });
    });
};