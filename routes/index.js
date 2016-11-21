var crypto = require('crypto'),
      User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Com=require('../models/com.js');
var util = require('utility');
var str = require("underscore.string");
var qiniu = require('qiniu');
var config = require('./../qiniuConfig');
var fs = require('fs');
var multer  = require('multer');
var upload = multer({ dest: 'routes/uploads/'});
var recods = require('../models/record.js');
var douban = require('../douban.js');
var Movie = require('./getMovie');
var dbMovie = require('../models/movie')

var ObjectID = require('mongodb').ObjectID;

module.exports = function(app) {

  app.get('/', function(req, res) {
    Post.get(null, function (err, posts) {
              if (err) {
                posts = [];
              }

      // console.log(doc.title);

      //console.log(num[num.length-1]);
              res.render('index', {
                title: '主页',
                douban : douban ,
                user: req.session.user,
                posts: posts,
                sum:posts.sum,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
              });
            });
  })

  app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
    });
    User.get(newUser.name, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg');
      }
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');
        }
        req.session.user = user;
        req.flash('success', '注册成功!');
        res.redirect('/logout');
      });
    });
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/login');
      }
      if (user.password != password) {
        req.flash('error', '密码错误!');
        return res.redirect('/login');
      }
      req.session.user = user;
      req.flash('success', '登陆成功!');
      res.redirect('/');
    });
  });

  app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    var date = util.YYYYMMDDHHmmss(new Date(),{dateSep:'.'});
    res.render('post', {
      title: '发表',
      Postdate:date,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '发布成功!');
      res.redirect('/');//发表成功跳转到主页
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');
  });

  app.get('/changUser', checkLogin);
  app.get('/changUser', function(req, res) {
    req.session.user = null;
    res.redirect('/login');
  })

  app.get('/comment/:Id',checkLogin);
  app.get('/comment/:Id',function(req,res){
    var reg = /\d+$/;
    var getId = req.url;
    var num =reg.exec(getId)[0];
    var newnum = parseInt(num);
    res.render('comment',{
      title:'评论',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });

  });

  app.post('/comment/:Id',checkLogin);
  app.post('/comment/:Id',checkLogin);
  app.post('/comment/:Id', function (req,res) {
    var reg = /\d+$/;
    var getId = req.url;
    var num =reg.exec(getId)[0];
    var newnum = parseInt(num);
    var currentUser=req.session.user,
        comment =new Com(currentUser.name,req.body.comment, "true");
       comment.save(newnum, function (err) {
      if(err){req.flash('error',err);
      return res.redirect('/');
      }
      req.flash('success','评论成功!');
      res.redirect('/');
    });
  });

  app.get('/infor', checkLogin);
  app.get('/infor',function(req, res) {
    var users = req.session.user;
    Post.get(users.name, function(err, docs) {
      if(err) {
        docs = []
      }
      res.render('infor', {
        title: '基本信息',
        docs: docs,
        email:users.email,
        unUser: users.name,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
    })

  });

  app.post('/infor', checkLogin);
  app.post('/infor', checkLogin);
  app.post('/infor', function(req, res) {
      var user = {
        name: req.body.name,
        email:req.body.email,
        address: req.body.address,
        work: req.body.work
      }
    var unUseer = req.session.user;
    console.log(unUseer.name);
      User.update(unUseer.name,user,function(err, resulr) {
       if(err) {
         req.flash('error', '更新失败');
         return res.redirect('/infor')
       }
        req.flash('success', '更新成功');
        req.session.user=user;
       // var aa=req.session.user;
       // console.log(aa.name);
         res.redirect('/');
      })
  });

  app.get('/detail/:Id', checkLogin);
  app.get('/detail/:Id', function(req, res) {
    var getId = req.url;
    var newUrl = getId.replace('/detail/','');
    console.log(newUrl);
    var newnum = ObjectID(newUrl);

   // console.log(newnum);
    Post.getId(newnum, function(err, docs) {
        if(err) {
          docs = [];
        }
        //console.log(docs.title);
        res.render('detail',{
          user: req.session.user,
          docs: docs,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        });
    });
  });

  app.post('/detail/:Id', checkLogin);
  app.post('/detail/:Id', function(req, res) {
      var user = req.session.user;
      var getComperson = new Com(user.name, req.body.comment, true);
      //var reg = /^\d+\w+$/g;
      //var getId = req.url;
      //var num =reg.exec(getId)[0];
      //var newnum = parseInt(num);

    var getId = req.url;
    var newUrl = getId.replace('/detail/','');
   // console.log(newUrl);
    var newnum = ObjectID(newUrl)
       getComperson.save(newnum ,function(err) {
        if(err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        req.flash('success', ' 评论成功');
        res.redirect('/');
      })
  });

  //get upload path,restore path
  app.post('/like',checkLogin);
  app.post('/like', function(req, res) {
    var getId = req.body.itemId;
    console.log("number"+ getId);
    var user = req.session.user;
    var getnewId = ObjectID(getId);
    var getHadlike = user.name;
    //console.log(getnewId);
    Post.checkLilename(getnewId, getHadlike, function(err) {
      if(err) {
        req.flash('error', '已加入喜欢');
        return res.redirect('/')
      }
       else {
        req.flash('success', '加入喜欢');
        return res.redirect('/');
      }
    })
  });

  app.get('/movie' , checkLogin);
  app.get('/movie' , function(req , res) {
    //for(var i =0,j=0; i<10;i++,j+=25){
    //  Movie.getMovie(j);
    //}
    dbMovie.findAll(null, function(err, data) {
     if(err) {
       data = {}
     }

        res.render('movie', {
          data: data,
          user: req.session.user,
          title: '最新movie ',
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        })


    })
  })

  app.get('/getMovies', checkLogin);
  app.get('/getMovies', function(req, res) {
    Movie.getMovies();
    res.render('getMovies', {
      title: "获取电影成功",
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    })
  });


  app.get('/Tv', checkLogin);
  app.get('/Tv', function(req, res) {
    res.render('Tv', {
      title:'Tv',
      user: req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    })
  });

  app.post('/Tv', checkLogin);
  app.post('/Tv', upload.single('Tvs'), function(req, res) {
    console.log(req.file);
    //......
    if(!req.file) {
      req.flash('error','请选择文件');
      return res.redirect('/Tv');
    }
    qiniu.conf.ACCESS_KEY = config.AK;
    qiniu.conf.SECRET_KEY = config.SK;

//要上传的空间
    bucket = config.bucket;

//上传到七牛后保存的文件名
    key = 'myTv/' + req.file.originalname;

//转码是使用的队列名称。
    pipeline = config.pipe;  //#设定自己账号下的pipleline

//要进行转码的转码操作。
    fops = "avthumb/mp4/s/640x360/vb/1.25m"

//可以对转码后的文件进行使用saveas参数自定义命名，当然也可以不指定文件会默认命名并保存在当间。
    saveas_key = qiniu.util.urlsafeBase64Encode(bucket+":"+key);
    fops = fops+'|saveas/'+saveas_key;;

//上传策略中设置pipeline以及fops
    function uptoken(bucket, key) {
      var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
      putPolicy.persistentOps = fops;
      putPolicy.persistentPipeline = pipeline;
      return putPolicy.token();
    }

//生成上传 Token
    token = uptoken(bucket, key);

//要上传文件的本地路径
    filePath = '/Users/mac/pic/' + req.file.originalname;

//构造上传函数
    function uploadFile(uptoken, key, localFile) {
      var extra = new qiniu.io.PutExtra();
      qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if(!err) {
          // 上传成功， 处理返回值
          console.log(ret.hash, ret.key, ret.persistentId);
        } else {
          // 上传失败， 处理返回代码
          console.log(err);
        }
      });
    }

//调用uploadFile上传
    uploadFile(token, key, filePath);

    //...

    qiniu.conf.ACCESS_KEY = config.AK;
    qiniu.conf.SECRET_KEY = config.SK;
    var user = req.session.user;
    var username = user.name;
//构建私有空间的链接
    url = 'http://7xt1fn.com1.z0.glb.clouddn.com/' + key;
    var policy = new qiniu.rs.GetPolicy();

//生成下载链接url
    var downloadUrl = policy.makeRequest(url);
    var tam2=util.YYYYMMDDHHmmss(new Date(),{dateSep:'.'});
    var name = req.file.originalname;
    Com.saveTvs(downloadUrl, username, name ,tam2,function(err) {
      if(err) {
        req.flash('error', err);
        res.redirect('/');
      }
      req.flash('success', "下载url成功");
      res.redirect('/');
    })
//打印下载的url
    console.log(downloadUrl);
  });

  app.get('/showTv', checkLogin);
  app.get('/showTv', function(req, res) {
    var name = req.session.user.name;
    Com.getUrl(name, function(err, docs, total) {
      if(err) {
        docs = [];
      }
      res.render('showTv', {
        title: '微视频',
        total:total-1,
        user: req.session.user,
        docs: docs,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
    })
  })

  app.get('/createPersonal', checkLogin);
  app.get('/createPersonal', function(req, res) {
    var user = req.session.user;
    var name = user.name;
    var recs = new recods(name,null,null);

    recs.save(function(err) {
      if(err) {
        req.flash('error', err);
        res.redirect('/personal');
      }
      res.redirect('/personal');
    });
  });

  app.get('/postPictures', checkLogin);
  app.get('/postPictures', function(req, res) {
      var name = req.session.user.name;
      recods.find(name,function(err, docs) {
        if(err) {
          docs = [];
        }
       // console.log("name is" +docs.name)
        res.render('postPictures',{
          title: "上传",
          docs: docs,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        })
      })
  });
  // app.post('/postPictures', checkLogin);
  app.post('/image', checkLogin);
  app.post('/image',upload.single('image'), function(req, res) {

    if(!req.file) {
      req.flash('error', '请选择文件');
      return res.redirect('/');
    }
    if(req.file.fieldname == 'image') {
        console.log(req.file);

        qiniu.conf.ACCESS_KEY = config.AK;
        qiniu.conf.SECRET_KEY = config.SK;
        // console.log(uptoken);

        var bucket = config.bucket;
//上传到七牛后保存的文件名
        var key = 'myPicture/' + req.file.originalname;

//构建上传策略函数
        function uptoken(bucket, key) {
          var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
          return putPolicy.token();
        }

//生成上传 Token
        token = uptoken(bucket, key);

//要上传文件的本地路径
        // filePath = './ruby-logo.png'

//构造上传函数
        function uploadFile(uptoken, key, localFile) {
          var extra = new qiniu.io.PutExtra();
          qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
            if (!err) {
              req.flash('success', '上传成功');
            } else {
              // 上传失败， 处理返回代码
              console.log(err);
              req.flash('error', '上传失败');
              res.redirect('/postPictures');
            }
          });
        }



        var target = __dirname + "/uploads/" +  req.file.filename;

        //调用uploadFile上传
        uploadFile(token, key, target);

        qiniu.conf.ACCESS_KEY = config.AK;
        qiniu.conf.SECRET_KEY = config.SK;
        var user = req.session.user;
        var name = user.name;
//构建私有空间的链接
        url = 'http://7xt1fn.com1.z0.glb.clouddn.com/' + key;
        var policy = new qiniu.rs.GetPolicy();

//生成下载链接url
        var downloadUrl = policy.makeRequest(url);

        Com.saveUrl(downloadUrl, name, function(err) {
          if(err) {
            req.flash('error', err);
            res.redirect('/');
          }
          req.flash('success', "下载url成功");
          res.redirect('/');
        })
//打印下载的url
        console.log(downloadUrl);
      }

  });

  app.get('/uploadBook', checkLogin);
  app.get('/uploadBook', function(req, res) {
    var name = req.session.user.name;
    recods.find(name,function(err, docs) {
      if(err) {
        docs = [];
      }
      // console.log("name is" +docs.name)
      res.render('uploadBook',{
        title: "上传",
        docs: docs,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
    })
  });

  // app.post('/uploadBook', checkLogin);
  app.post('/BOOK', checkLogin);
  app.post('/BOOK', upload.single('books'),function(req, res) {
    if(!req.file) {
      req.flash('error', '请选择文件');
      return res.redirect('/');
    }
          if(req.file.fieldname == 'books') {
            console.log(req.file.fieldname);
            //console.log(config.AK);
            qiniu.conf.ACCESS_KEY = config.AK;
            qiniu.conf.SECRET_KEY = config.SK;
            // console.log(uptoken);


            var bucket = config.bucket;
//上传到七牛后保存的文件名
            var key = 'myBooks/' + req.file.originalname;

//构建上传策略函数
            function uptoken(bucket, key) {
              var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
              return putPolicy.token();
            }

//生成上传 Token
            token = uptoken(bucket, key);

//要上传文件的本地路径
            // filePath = './ruby-logo.png'

//构造上传函数
            function uploadFile(uptoken, key, localFile) {
              var extra = new qiniu.io.PutExtra();
              qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
                if (!err) {
                  req.flash('success', '上传成功');
                } else {
                  // 上传失败， 处理返回代码
                  console.log(err);
                  req.flash('error', '上传失败');
                  res.redirect('/uploadBook');
                }
              });
            }

            var target = __dirname + "/uploads/" + req.file.filename;

            //调用uploadFile上传
            uploadFile(token, key, target);

            qiniu.conf.ACCESS_KEY = config.AK;
            qiniu.conf.SECRET_KEY = config.SK;
            var user = req.session.user;
            var name = user.name;
//构建私有空间的链接
            url = 'http://7xt1fn.com1.z0.glb.clouddn.com/' + key;
            var policy = new qiniu.rs.GetPolicy();

//生成下载链接url
            var downloadUrl = policy.makeRequest(url);
            var bookName = req.file.originalname;
            var tam2=util.YYYYMMDDHHmmss(new Date(),{dateSep:'.'});
            Com.saveBooks(downloadUrl, name, bookName ,tam2, function(err, bookID) {
              if(err) {
                req.flash('error', err);
                res.redirect('/');
              }
              //pdf picture get  brew ghostscript,imagemagick

              var pdfimage = require("pdf-image").PDFImage;
              var PDFimage = new pdfimage(target);
              PDFimage.convertPage(0).then(function(imagePath) {
                var picname = imagePath.replace(__dirname + "/uploads/","");
                console.log("momo"+picname);
                console.log(bookID);
                var relId = ObjectID(bookID);
                var key2 = 'Books/'+picname;
                token2 = uptoken(bucket, key2);
                var target2 = __dirname + "/uploads/" + picname;
                uploadFile(token2, key2, target2);
                url = 'http://7xt1fn.com1.z0.glb.clouddn.com/' + key2;
                var policy = new qiniu.rs.GetPolicy();

//生成下载链接url
                var downloadUrl2 = policy.makeRequest(url);
                Com.savePic(relId, downloadUrl2, function(err) {
                  if(err) {
                    console.log(err);
                  }
                })
              },function(err) {
                console.log(err);
              });
              req.flash('success', "下载url成功");
              res.redirect('/');
            });

//打印下载的url
            console.log(downloadUrl);
          }
  });

  app.get('/Dowbooks', checkLogin);
  app.get('/Dowbooks', function(req, res) {
    //var name = req.session.user.name;

    Com.getUrl(null, function(err, docs, total) {
      if(err) {
        docs = [];
      }
      res.render('Dowbook', {
        title: '下载',
        total:total-1,
        user: req.session.user,
        docs: docs,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })

    })
  });

  //app.get('/bookDow/:id', checkLogin);
  //app.get('/bookDow/:id', function(req, res) {
  //  var name = req.session.user.name;
  //  var url = req.url;
  //  var getID = url.replace("/bookDow/", "");
  //  var relId = ObjectID(getID);
  //  console.log(relId);
  //  recods.finduser(relId, function(err, docs) {
  //    if(err) {
  //      docs = [];
  //    }
  //    var geturl = docs.bookurl;
  //    res.download(geturl);
  //  })
  //});

  app.get('/personal', function(req, res) {
    var user = req.session.user;
    var name = user.name;
    Com.getUrl(name, function(err, docs, total) {
      if(err) {
        docs = [];
      }
       docs.forEach(function(doc, index) {
          console.log("my note"+index);
       })

       res.render('personal', {
         title: '个人空间',
         total:total-1,
         user: req.session.user,
         docs: docs,
         success: req.flash('success').toString(),
         error: req.flash('error').toString()
       })

    })
  });

  app.post('/personal', checkLogin);
  app.post('/personal', function(req, res) {
    var getRecoder = req.body.content;
    var geturlID = req.body.urlId;
    var newgeturlId = ObjectID(geturlID);
    console.log("content"+ getRecoder);
    console.log("I am"+geturlID);
    var tam2=util.YYYYMMDDHHmmss(new Date(),{dateSep:'.'});
    //console.log(getRecoder);

    recods.getIt(newgeturlId, getRecoder ,function(err) {
      if(err) {
        req.flash('error', err);
        res.redirect('/');
      }
      req.flash('success', '留言成功');
      res.redirect('/personal');
    })

  })

  app.get('/:i', function (req, res) {
    //var reg = /\d+$/;
    var url = req.url;
    console.log("sdsd"+newUrl);
    var newUrl = url.replace('/','');
    var PgetpageNum = parseInt(newUrl);

    Post.get(null, function(err, pos) {
      if(err) {
        docs = [];
      }
      Post.Compage(null, PgetpageNum, function(err, docs, total) {
        if(err) {
          docs = [];
        }

        //console.log("gu"+total);
        res.render('detailPage', {
          title: '主页',
          pos: pos,
          user: req.session.user,
          posts: docs,
          arNumber:total,
          total: total,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        })
      })
    })
  });




  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!');
      res.redirect('/login');
    }
    next();
  }


  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!');
      res.redirect('back');
    }
    next();
  }
};
