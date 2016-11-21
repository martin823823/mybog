///**
// * Created by mac on 16/4/17.
// */
//
//var mongodb = require('./db');
//var util = require('utility');
//
//function Recor(name) {
//    this.name = name;
//}
//
//module.exports=Recor;
//Recor.prototype.save = function(note, callback) {
//    var  reTime = util.YYYYMMDDHHmmss(new Date(), {dateSep: '.'});
//    var  recod = {
//        name:this.name,
//        time: reTime,
//        times: [],
//        notes: []
//    };
//   mongodb.open(function(err, db) {
//       if(err) {
//           return callback(err);
//       }
//       db.collection('recos', function(err, collection) {
//           if(err) {
//               mongodb.close();
//               return callback(err);
//           }
//           collection.update({name:recod.name},{$push:{"notes":note}},true,function(err) {
//               mongodb.close();
//               if(err) {
//                   return callback(err);
//               }
//               callback(null);
//           })
//       })
//   })
//};

var mongodb=require("./db");
var crypto = require('crypto');
var lodash = require('lodash');
var util = require('utility');

function Note(name,note,time)
{
    this.name=name;
    this.note = note;
    this.time = time;
};

module.exports=Note;

Note.prototype.save=function(callback)
{
    var tam2=util.YYYYMMDDHHmmss(new Date(),{dateSep:'.'});
    var user={
        name:this.name,
        note:this.note,
        tam2:tam2,
        time:this.time,
        urls:[],
        notes:{},
        times:[]
    };

    mongodb.open(function(err,db)
    {
        if(err){
            return callback(err);

        }
        db.collection('recod',function(err,collection)
        {
            if(err){
                mongodb.close();
                return callback(err);

            }
            collection.findOne({name: user.name},function(err, docs) {
                if(docs) {
                    mongodb.close();
                    if(err) {
                        return callback(err);
                    }
                    callback(null);
                } else {
                    collection.insert(user,{safe:true},function(err,user){
                        mongodb.close();
                        if(err) {
                            return callback(err);
                        }
                        callback(null);
                    });
                }
            })

        });
    });
};

Note.getIt = function(_id, content ,callback) {
    //var recoder = {
    //    name:name,
    //    note:note,
    //    time:time
    //}
    var  reTime = util.YYYYMMDDHHmmss(new Date(), {dateSep: '.'});
    mongodb.open(function(err,db) {
       if(err) {
           return callback(err);
       }
       db.collection('recod', function(err, collection) {
           if(err) {
               return callback(err);
           }
           collection.update({_id:_id},{$set:{note:content, time:reTime}},true, function(err) {
               mongodb.close();
               if(err) {
                   return callback(err);
               }
               callback(null);
           })
       })
   })
};


Note.finduser = function(_id,callback) {
    mongodb.open(function(err,db) {
        if(err) {
            return callback(err);
        }
        db.collection('recod', function(err, collection) {
            if(err) {
                return callback(err);
            }
            collection.findOne({_id:_id},function(err, docs) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                callback(null, docs);
            })
        })
    })
};

Note.find = function(name,callback) {
    mongodb.open(function(err,db) {
        if(err) {
            return callback(err);
        }
        db.collection('recod', function(err, collection) {
            if(err) {
                return callback(err);
            }
            collection.find({name:name},function(err, docs) {
                mongodb.close();
                if(err) {
                    return callback(err);
                }
                callback(null, docs);
            })
        })
    })
};