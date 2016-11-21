var mongodb=require("./db");
var crypto = require('crypto');
var lodash = require('lodash');

function User(user)
{
    this.name=user.name;
    this.password=user.password;
    this.email=user.email;
    this.address = user.address;
    this.work = user.work;
};

module.exports=User;

User.prototype.save=function(callback)
{
    var md5 = crypto.createHash('md5');
    var email_hash = md5.update(this.email.toLocaleLowerCase()).digest('hex');
    var head = "http://www.gravatar.com/avatar/" + email_hash + "?s=48";
    var new_head = lodash.replace(head, 'www.gravatar.com', 'gravatar.duoshuo.com');

    var user={
        name:this.name,
        password:this.password,
        email:this.email,
        address:this.address,
        work: this.work,
        head :new_head
    };

    mongodb.open(function(err,db)
    {
        if(err){
            return callback(err);

        }
       db.collection('users',function(err,collection)
       {
           if(err){
               mongodb.close();
               return callback(err);

           }

           collection.insert(user,{safe:true},function(err,user){
               mongodb.close();
               if(err){

                   return err;
               }
               callback(err,user);
           });
       });
    });
};


User.get=function(name,callback)
{
 mongodb.open(function(err,db){
     if(err){
         return callback(err);

     }
     db.collection('users',function(err,collection){
         if(err){
             mongodb.close();
             return callback(err);

         }

         collection.findOne({
             name:name
         },function(err,user){
             mongodb.close();
             if(err){
                 return callback(err);

             }
             callback(null,user);
         });
     });
 });
};

User.update = function(name, user, callback) {
    mongodb.open(function(err, db) {
        if(err) {
            return callback(err);
        }
        db.collection('users', function(err, collection) {
            if(err) {
                mongodb.close();
                return collection(err);
            }
            collection.update({name:name},{$set:{name:user.name, email:user.email,address:user.address,work:user.work}},function(err, result) {
              if(err) {
                  mongodb.close();
                  callback(err);
              }
                callback(null, result);
            })
        })
    })
}

