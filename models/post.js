var mongodb=require('./db');
var util=require('utility');
var Com = require('./com');

function Post(name,title,post)
{
    this.name=name;
    this.title=title;
    this.post=post;

}

module.exports=Post;

var artical = 0;

Post.prototype.save=function(callback)
{

var tam=util.YYYYMMDDHHmmss(new Date(),{dateSep:'.'});
    ++artical;
    var post={
      name:this.name,
      tam:tam,
      title:this.title,
      post:this.post,
        status: true,
        arNumber:artical,
        PV:0,
        likeNum:0,
        likeNames:[]

  }

    mongodb.open(function (err, db) {
        if(err){
            return callback(err);
        }
        db.collection('test',function(err,collection){
            if(err){
                mongodb.close();
                return collection(err);
            }
            collection.insert(post,{safe:true},
            function(err){
                mongodb.close();
                if(err){
                    return  callback(err);
                }
               callback(null);
            });
        });
    });

};

Post.get=function(title,callback)
{
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('test',function(err,collection){
            if(err){
                mongodb.close();
                return collection(err);
            }
         var query={};
            if(title){
                query.title=title;

            }
            collection.find(query, {
                limit:3
            }).sort({
                time:-1
            }).toArray(function(err,docs){

                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,docs);
            });
        });
    });
};

Post.getId=function(num, callback) {
    mongodb.open(function(err, db) {
        if(err) {
           return callback(err);
        }
        db.collection('test', function(err, collection) {
            if(err) {
                mongodb.close();
               return collection(err)
            }
           collection.findOne({_id:num},function(err, docs) {
               if(err) {
                   return callback(err);
               };
               callback(null, docs);
           })
        })
    })
};

Post.Compage = function(title, page,  callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('test', function(err, collection) {
            if(err) {
                return callback(err);
            };
            var query = {};
            if(title) {
                query.title = title;
            }
            collection.count(query, function(err, total) {
                if(err) {
                    callback(err);
                }
                collection.find(query, {
                    skip: (page-1)*3,
                    limit: 3
                }).toArray(function(err, docs) {
                    mongodb.close();
                    if(err) {
                    return callback(err);
                    }
                    callback(null, docs, total);
                })
            })
        })
    })
};


Post.checkLilename = function(arcId, likeName ,callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        };
        db.collection('test', function(err, collection) {
            if(err) {
                mongodb.close();
                return callback(err);
            }
            collection.findOne({_id: arcId}, function(err, docs) {
                if(err) {
                    return callback(err);
                }
                if(docs.likeNames.length>0) {
                    for(var i = 0; i < docs.likeNames.length; i++) {
                        if(likeName == docs.likeNames[i]) {
                            mongodb.close();
                            return callback(likeName);
                        };
                        collection.update({_id:arcId},{$inc:{"likeNum":1}}, function(err) {
                            if(err) {
                                return callback(err);
                            }
                        });
                        collection.update({_id:arcId},{$push:{"likeNames":likeName}}, function(err) {
                            mongodb.close();
                            if(err) {
                                return callback(err);
                            }
                            callback(null);
                        })
                    }
                } else {
                    collection.update({_id:arcId},{$inc:{"likeNum":1}}, function(err) {
                        if(err) {
                            return callback(err);
                        }
                    });
                    collection.update({_id:arcId},{$push:{"likeNames":likeName}}, function(err) {
                        mongodb.close();
                        if(err) {
                            return callback(err);
                        }
                        callback(null);
                    })
                }
            })
        })
    })
};



