/**
 * Created by mac on 16/2/21.
 */
var mongodb=require('./db');
var util=require('utility');

function Com(name,comment,status)
{
    this.name=name;
    this.comment=comment;
    this.status=status;
}

module.exports=Com;
Com.prototype.save= function (_id ,callback) {
    var tam2=util.YYYYMMDDHHmmss(new Date(),{dateSep:'.'});
    var number = 0;
    number++;
    var comment={
        name:this.name,
        comment: this.comment,
        tam2:tam2,
        comments:[],
        determine:this.status,
        sum: number,
        Comnames:this.name,
        PV:0
    }
    mongodb.open(function(err,db){
        if(err)
        {
            return callback(err);
        }
        db.collection('test',function(err,collection){
            if(err){
                mongodb.close();
                return collection(err)
            };
             collection.update({_id: _id},{$push:{"comments": comment.comment,tam2:comment.tam2,Comnames:comment.name}},true,function(err){
                 if(err) {
                     return callback(err);
                 }
             });
            collection.update({_id: _id},{$inc:{"PV":1}},function(err) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                callback(null);
            });
        })
    })

};

//Com.checkCom = function(name,) {
//
//}

Com.get=function(comId,callback)
{
   mongodb.open(function(err,db){
       if(err){return callback(err)};
       db.collection('test',function(err,collection){
           if(err){mongodb.close();return collection(err)};

           var query={};


           if(comId){query.comId=comId;}

           collection.findOne(query, function(err, docs) {
               if(err) {
                   return callback(err);
               }
               callback(null, docs);
           })
       })
   })
};

//Com.getNumber = function(name, callback) {
//    mongodb.open(function(err, db) {
//        if(err) {
//            callback(err);
//        }
//        db.collection('test', function(err, collection) {
//            if(err) {
//                collection(err);
//            }
//
//            var query = {}
//            if(name) {
//                query.name = name;
//            }
//            collection.find(query).toArray(function(err, docs){
//                if(err) {
//                    callback(err);
//                }
//                return callback(null, docs);
//            })
//        })
//    })
//}

Com.saveUrl = function(url, name, callback) {
    var url= {
        name:name,
        myUrl:url,
        note:null,
        time:null
    }
    mongodb.open(function(err, db) {
        if(err) {
            callback(err);
        };
        db.collection('recod', function(err, collection) {
            if(err) {
                mongodb.close();
            }
            collection.save(url, function(err) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                callback(null);
            })
        })
    })
};

Com.saveBooks = function(url, name, boolName ,time, callback) {
    var boolUrl = {
        name: name,
        bookurl: url,
        time: null,
        bookName: boolName,
        pic:null
    }

    mongodb.open(function(err, db) {
        if(err) {
            callback(err);
        }
        db.collection('recod', function(err, collection) {
            if(err) {
                mongodb.close();
                callback(err);
            }
            collection.save(boolUrl, function(err) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                var _id = boolUrl._id;
                console.log("popopo"+_id    )
                callback(null, _id);
            })
        })
    })
};

Com.saveTvs = function(url, name, Tvname ,time, callback) {
    var TvUrl = {
        name: name,
        Tvurl: url,
        time: time,
        tvName: Tvname
    }

    mongodb.open(function(err, db) {
        if(err) {
            callback(err);
        }
        db.collection('recod', function(err, collection) {
            if(err) {
                mongodb.close();
                callback(err);
            }
            collection.save(TvUrl, function(err) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                callback(null);
            })
        })
    })
};

Com.savePic = function(_id, path, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            callback(err);
        }
        db.collection('recod', function(err, collction) {
            if(err) {
                mongodb.close();
                callback(err);
            }
            collction.update({_id:_id},{$set:{pic:path}},true,function(err) {
                mongodb.close();
                if(err) {
                    callback(err);
                }
                callback(null);
            })
        })
    })
}

Com.getUrl = function(name, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            callback(err);
        }
        var query = {}
        if(name) {
            query.name = name
        }

        db.collection('recod', function(err, collection) {
            if(err) {
                mongodb.close();
                callback(err);
            }
            collection.count(query,function(err, total) {
                if(err) {
                    return callback(err);
                }
                collection.find(query).toArray(function(err, docs) {
                    mongodb.close();
                    if(err) {
                       return callback(err);
                    }
                    callback(null, docs, total);
                })
            });

        })
    })
};

