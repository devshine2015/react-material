var MongoClient = require('mongodb').MongoClient;
var inProgress = false;

// dal dependent parameters
global.dbConnectionPool = {};
global.defaultPoolSize = 10;

//global.dbConnectionPool: required, define as empty object in appConfig.js

module.exports = () => {

    /**
     * @desc gives db connection
     * @param {any} req
     * @param {any} cb
     * @return {Object} dbConn
     */
    function getDBConnection(url, dbName, cb) {

        if (!inProgress) {
            //check if connection already present in app global conn pool
            var dbBase = global.dbConnectionPool[url + dbName];

            if (dbBase === undefined) {
                inProgress = true;
                if (url && dbName && cb) {
                    MongoClient.connect(url + dbName + '?ssl=true&replicaSet=ITASandbox-shard-0&authSource=admin', {
                            poolSize: global.defaultPoolSize
                        },
                        function (err, _db) {
                            if (err) {
                                cb(null);
                            } else {
                                console.log('DB connected successfully');
                                dbBase = _db;
                                global.dbConnectionPool[url + dbName] = _db;
                                cb(dbBase);
                            }
                            inProgress = false;
                        });

                } else {
                    cb(false);
                    inProgress = false;
                }
            } else {
                cb(dbBase);
            }
        } else {
            setTimeout(function () {
                getDBConnection(url, dbName, cb);
            }, 5000);
        }
    }

    /**
     * @desc close db connection
     * @param {any} req
     * @param {any} cb
     */
    function closeDBConnection(dbConn) {

        return;

        // if (dbConn) {
        //     dbConn.close();
        //     //console.log('DB closed');
        // }

    }

    /**
     * @desc saves one record
     * @param {any} req
     * @param {any} cb
     * @return {boolean} result
     */
    function saveData(req, cb) {
        try {
            var o = req.options;
            if (o.params == undefined)
                o.params = {}

            getDBConnection(o.server, o.source, function (db) {

                db.collection(o.type).save(o.query, {
                    w: 1
                }, function (err, r) {
                    if (err)
                        throw err;
                    else if (cb)
                        cb(true);
                });
            });

        } catch (err) {
            console.log(err);
            if (cb)
                cb(false);
        }
    }

    /**
     * @desc saves multiple records
     * @param {any} req
     * @param {any} cb
     * @return {boolean} result
     */
    function saveMulti(req, cb) {
        try {
            var o = req.options;
            var dataArray = o.query;
            if (o.params == undefined)
                o.params = {}

            dataArray.forEach((data) => {
                var r = JSON.parse(JSON.stringify(o));
                r.query = data;
                saveData(r, (resp) => {
                    if (resp)
                        console.log('record saved');
                });
            });

            getDBConnection(o.server, o.source, function (db) {

                db.collection(o.type).insertMany(dataArray, function (err, r) {
                    if (err)
                        throw err;
                    else if (cb)
                        cb(true);
                });
            });

        } catch (err) {
            console.log(err);
            if (cb)
                cb(false)
        }
    }

    /**
     * @desc inserts one record
     * @param {any} req
     * @param {any} cb
     * @return {boolean} result
     */
    function insertOne(req, cb) {
        try {
            var o = req.options;
            if (o.params == undefined)
                o.params = {}

            getDBConnection(o.server, o.source, function (db) {

                db.collection(o.type).insertOne(o.query, {
                    w: 1
                }, function (err, r) {
                    if (err)
                        throw err;
                    else if (cb)
                        cb(true);
                });
            });

        } catch (err) {
            console.log(err);
            if (cb)
                cb(false);
        }
    }

    /**
     * @desc inserts multiple records
     * @param {any} req
     * @param {any} cb
     * @return {boolean} result
     */
    function insertMany(req, cb) {
        try {
            var o = req.options;
            var dataArray = o.query;
            if (o.params == undefined)
                o.params = {}

            getDBConnection(o.server, o.source, function (db) {
                db.collection(o.type).insertMany(dataArray, function (err, r) {
                    if (err)
                        throw err;
                    else if (cb)
                        cb(true);
                });
            });

        } catch (err) {
            console.log(err);
            if (cb)
                cb(false)
        }
    }

    /**
     * @desc updates one record
     * @param {any} req
     * @param {any} cb
     * @return {boolean} result
     */
    function updateData(req, cb) {
        try {
            var o = req.options;
            var findQuery = o.query.findQuery;
            var setQuery = o.query.setQuery;

            if (o.params == undefined)
                o.params = {}
            var upsert = o.params.upsert || false;

            getDBConnection(o.server, o.source, function (db) {
                db.collection(o.type).updateOne(findQuery, setQuery, {
                    upsert: upsert
                }, function (err, r) {
                    if (err)
                        throw err;
                    else if (cb)
                        cb(true, r.result.nModified);
                });
            });

        } catch (err) {
            console.log(err);
            if (cb)
                cb(false);
        }
    }

    /**
     * @desc finds data in the db
     * @param {any} req
     * @param {any} cb
     * @return {Object} result
     */
    function findData(req, cb) {
        try {
            var o = req.options;
            if (o.query == undefined)
                o.query = {}

            if (o.params == undefined)
                o.params = {}

            if (o.sort == undefined)
                o.sort = {}

            getDBConnection(o.server, o.source, function (db) {

                if (o.params.limit == undefined) {
                    db.collection(o.type).find(o.query, o.params)
                        .sort(o.sort)
                        .toArray(function (err, item) {
                            cb(item);
                        });
                } else {
                    db.collection(o.type).find(o.query, o.params)
                        .sort(o.sort).limit(o.params.limit)
                        .toArray(function (err, item) {
                            cb(item);
                        });
                }
            });

        } catch (err) {
            console.log(err);
            if (cb)
                cb(false);
        }
    }

    /**
     * @desc finds data in db
     * @param {any} req
     * @param {any} cb
     * @return {Object} result
     */
    function findOne(req, cb) {
        if (cb)
            findData(req, (items) => {
                items.length > 0 ? cb(items[0]) : cb();
            });

    }

    /**
     * @desc aggregate data queries
     * @param {any} req
     * @param {any} cb
     * @return {Object} result
     */
    function getAgrregatedData(req, cb) {
        try {
            var o = req.options;
            var pipeline = o.query.pipeline;
            if (o.params == undefined)
                o.params = {}

            getDBConnection(o.server, o.source, function (db) {
                db.collection(o.type).aggregate(pipeline)
                    .toArray(function (err, result) {
                        if (cb) {
                            if (result) {
                                cb(result);
                            } else {
                                cb();
                            }
                        }
                    });
            });

        } catch (err) {
            console.log(err);
            if (cb)
                cb(false);
        }
    }

    /**
     * @desc removes a record
     * @param {any} req
     * @param {any} cb
     * @return {boolean} result
     */
    function removeData(req, cb) {
        try {
            var o = req.options;
            if (o.query == undefined) {
                console.log('In remove data, no query parameter found');
                cb(false);

                return;
            }

            if (o.params == undefined)
                o.params = {}

            getDBConnection(o.server, o.source, function (db) {
                db.collection(o.type).remove(o.query, o.params, (err, items) => {
                    if (cb)
                        cb(err ? false : true);

                })
            });
        } catch (err) {
            if (cb)
                base.handleError(err, cb);
        }
    }

    /**
     * @desc drop collection
     * @param {any} req
     * @param {any} cb
     * @return {boolean} result
     */
    function dropCollection(req, cb) {
        try {
            var o = req.options;
            if (o.params == undefined)
                o.params = {}

            getDBConnection(o.server, o.source, function (db) {
                db.dropCollection(o.type, function (err, r) {
                    if (err)
                        base.handleError(err);
                    else if (cb)
                        cb(true);

                });
            });
        } catch (err) {
            base.handleError(err);
        }
    }

    /**
     * @desc drop database
     * @param {any} req
     * @param {any} cb
     * @return {boolean} result
     */
    function dropDB(req, cb) {
        try {
            var o = req.options;
            if (o.params == undefined)
                o.params = {}

            getDBConnection(o.server, o.source, function (db) {
                db.dropDatabase(o.type, function (err, r) {
                    if (err)
                        base.handleError(err);
                    else if (cb)
                        cb(true);
                });
            });
        } catch (err) {
            base.handleError(err);
        }
    }

    function getQueryObj(req) {
        return {
            options: {
                server: req.mongoUrl || global.mongoUrl,
                source: req.db || global.deviceDB,
                type: req.collection,
                query: req.q || {},
                params: req.p || {},
                sort: req.s || {}
            }
        }
    }

    return {
        saveData: saveData,
        saveMulti: saveMulti,
        insertOne: insertOne,
        insertMany: insertMany,
        updateData: updateData,
        findOne: findOne,
        findData: findData,
        getAgrregatedData: getAgrregatedData,
        dropDB: dropDB,
        dropCollection: dropCollection,
        removeData: removeData,
        getQueryObj: getQueryObj
    }
}
