var mongo = require('./db');


function isEmpty(obj) {
    for(var i in obj) {
        return false;
    }
    return true;
}


function isExtis(id) {
    mongo.open(function(err, db) {
        if(err) {
           return false
        }
        db.collection('movie', function(err, collection) {
            if(err) {
                mongo.close();
                return false
            }
            collection.find({movieId: id}, function(err, docs) {
                if(err) {
                    return false
                }
                if(docs) {
                    return true
                }else{
                    return false
                }
            })
        })
    })
}

module.exports = {
    saveAll:function(data  ,callback) {

        mongo.open(function (err, db) {
            if (err) {
                callback(err);
            }
            ;
            db.collection('movie', function (err, collection) {
                if (err) {
                    mongo.close();
                }
                collection.find({}).toArray(function (err, docs) {

                    if (err) {
                        mongo.close();
                        return callback(err);
                    }


                      collection.save(data, {safe: true}, function (err, data) {
                          mongo.close();
                          if (err) {
                              return callback(err);
                          }
                          callback(data);
                      })

                })
            })
        })
    },
    saveIndex:
     function(data, movieId , callback) {
        mongo.open(function(err, db) {
            if(err) {
                return callback(err);
            }
            db.collection('movieIndex', function(err, collection) {
                if(err) {
                    mongo.close();
                    return callback(err);
                }
                collection.findOne({movieId: movieId}, function(err, docs) {
                    if(err) {
                        mongo.close();
                        return callback(err);
                    }
                    if(!docs) {
                        collection.insert(data , {safe: true}, function(err, data) {
                            mongo.close();
                            if(err) {
                                return callback(err);
                            }
                            callback(null,data)
                        })
                    }
                })
            })
        })
    }

    //function(data, movieId ,callback) {
    //
    //    mongo.open(function (err, db) {
    //        if (err) {
    //            callback(err);
    //        }
    //        ;
    //        db.collection('movieIndex', function (err, collection) {
    //            if (err) {
    //                mongo.close();
    //            }
    //            collection.find({}).toArray(function (err, docs) {
    //                if (err) {
    //                    mongo.close();
    //                    return callback(err);
    //                }
    //
    //                if (isEmpty(docs) == true) {
    //                    collection.insert(data, {safe: true}, function (err, data) {
    //                        mongo.close();
    //                        if (err) {
    //                            return callback(err);
    //                        }
    //                        callback(data);
    //                    })
    //                }
    //                else {
    //                    collection.update({}, {
    //                        $set: {
    //                            movieId: data.movieId,
    //                            date: data.date,
    //                            cinema: data.cinema,
    //                            price: data.price
    //                        }
    //                    }, function (err) {
    //                        mongo.close()
    //                        if (err) {
    //                            return callback(err);
    //                        }
    //                        callback(null);
    //                    })
    //                }
    //            })
    //        })
    //    })
    //}
    ,
    findAll: function(name , callback) {
        mongo.open(function(err , db) {
            if(err) {
                return callback(err);
            }
            db.collection('movie', function(err, collection) {
                if(err) {
                    mongo.close();
                    return callback(err);
                }
                var query = {}
                if(name) {
                    query.name = name
                }
                collection.find(query).toArray(function(err, data) {
                    mongo.close();
                    if(err) {
                        return callback(err);
                    }
                    callback(null,data);
                })
            })
        })
    },
    findIndex: function(name  ,callback) {
        mongo.open(function(err , db) {
            if(err) {
                return callback(err);
            }
            db.collection('movieIndex', function(err, collection) {
                if(err) {
                    mongo.close();
                    return callback(err);
                }
                var query = {}
                if(name) {
                    query.name = name
                }
                collection.find(query).toArray(function(err, data) {
                    mongo.close();
                    if(err) {
                        return callback(err);
                    }
                    callback(null , data);
                })
            })
        })
    },

    findOne: function(movieId, callback) {
        mongo.open(function(err, db) {
            if(err) {
                return callback(err);
            }
            db.collection('movieIndex', function(err, collection) {
                if(err) {
                    mongo.close();
                    return callback(err);
                }
                collection.find({movieId: movieId}).toArray( function(err, docs) {
                    if(err) {
                        mongo.close();
                        return callback(err);
                    }
                    callback(null, docs);
                })
            })
        })
    }

}

