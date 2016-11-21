var cheerio = require('cheerio');
var douban = require('../douban');
var path = require('path');
var https = require('https');
var saveMovie = require('../models/movie')


// module.exports = {
//   getMovie :  function(index) {
//         console.log(index);
//       var movies = [];
//         https.get('https://movie.douban.com/top250?start=' + index, function (res) {
//             var pageSize = 25;
//             var html = '';
//
//             res.setEncoding('utf-8');
//             res.on('data', function (chunk) {
//                 html += chunk;
//             });
//             res.on('end', function () {
//                 var $ = cheerio.load(html);
//                 $('.item').each(function () {
//                     var picUrl = $('.pic img', this).attr('src');
//
//                     var movie = {
//                         title: $('.title', this).text(),
//                         star: $('.info .star .rating_num', this).text(),
//                         link: $('a', this).attr('href'),
//                         picUrl: picUrl
//                     };
//                     if (movie) {
//                         movies.push(movie);
//                         if(movies) {
//                             //for (var i = 0; i < movies.length; i++) {
//                             //    console.log(movies[i].title);
//                             //    console.log(movies[i].star);
//                             //    console.log(movies[i].link);
//                             //    console.log(movies[i].picUrl);
//                             //}
//
//                         }
//                     }
//                     // downloadImg('../img/', movie.picUrl);
//                 });
//
//                 saveMovie.saveAll(movies, function(err) {
//                     if(err) {
//                         console.log(err);
//                     }
//                     else {
//                         console.log("ok")
//                     }
//                 })
//                 //saveData('./data' + (index / pageSize) + '.json', movies);
//             });
//
//         }).on('error', function (err) {
//             console.log(err);
//         });
//
//
//     }
// }
//
//
//

module.exports = {
    getMovies: function() {
       var ids = [];
       var allmovie = [];
       var movie = [];
       var getM = [];

    https.get('https://movie.douban.com/nowplaying/mianyang/', function (res) {
        var pageSize = 25;
        var html = '';

        res.setEncoding('utf-8');
        res.on('data', function (chunk) {
            html += chunk;
        });
        res.on('end', function () {
            var $ = cheerio.load(html);
            $('.lists .list-item').each(function () {
                //  var picUrl = $('.pic img', this).attr('src');
                var picid = $(this).attr('id');
                var movieName = $(this).attr('data-title');
                var movieScore = $(this).attr('data-score');
                var movieYear = $(this).attr('data-release');
                var movieTime = $(this).attr('data-duration');
                var movieRegion = $(this).attr('data-region');
                var movieDirector = $(this).attr('data-director');
                var movieActor = $(this).attr('data-actors');
                var picUrl = $('.poster img', this).attr('src');
                ids.push(picid);

                getNew(picid, function (getList) {
                    //     console.log(getIt)
                    //     console.log(getList.date)
                    //     console.log(getList.cinema)
                    //     console.log(getList.price)
                    //getM.date = getList.date;
                    //getM.cinema = getList.cinema;
                    //getM.price = getList.price;
                    //console.log(getList.price);

                    //saveMovie.saveIndex(getList, picid ,function(err) {
                    //    if(err) {
                    //        console.log(err);
                    //    }
                    //})
                    movie = {
                        movieId: picid,
                        movieName: movieName,
                        movieScore: movieScore,
                        movieYear: movieYear,
                        movieTime: movieTime,
                        movieRegion: movieRegion,
                        movieDirector: movieDirector,
                        movieActor: movieActor,
                          moviePic: picUrl,
                        getM: getList
                    }
                    allmovie.push(movie);

                    console.log(movie.movieId)
                    console.log(movie.movieName)
                    console.log(movie.movieScore)
                    console.log(movie.movieYear)
                    console.log(movie.movieTime)
                    console.log(movie.movieRegion)
                    console.log(movie.movieDirector)
                    console.log(movie.getM)

                    saveMovie.saveAll(movie ,function (err) {
                        if (err) {
                            console.log(err)
                        }
                    })

                    // downloadImg('../img/', movie.picUrl);
                });
                //

                //});


                //saveData('./data' + (index / pageSize) + '.json', movies);
            });
        }).on('error', function (err) {
            console.log(err);
        });
})
}
}
//var indexDate = 0;
//
//function getid(getdate) {
//
//       var nowDate = getdate;
//       indexDate = getdate;
//       if(nowDate-indexDate < 86400000) {
//            console.log("error")
//       }else {
//           var ids = [];
//           var allmovie = [];
//           var movie = [];
//           var getM = [];
//
//           https.get('https://movie.douban.com/nowplaying/mianyang/', function (res) {
//               var pageSize = 25;
//               var html = '';
//
//               res.setEncoding('utf-8');
//               res.on('data', function (chunk) {
//                   html += chunk;
//               });
//               res.on('end', function () {
//                   var $ = cheerio.load(html);
//                   $('.lists .list-item').each(function () {
//                       //  var picUrl = $('.pic img', this).attr('src');
//                       var picid = $(this).attr('id');
//                       var movieName = $(this).attr('data-title');
//                       var movieScore = $(this).attr('data-score');
//                       var movieYear = $(this).attr('data-release');
//                       var movieTime = $(this).attr('data-duration');
//                       var movieRegion = $(this).attr('data-region');
//                       var movieDirector = $(this).attr('data-director');
//                       var movieActor = $(this).attr('data-actors');
//                       var picUrl = $('.poster img', this).attr('src');
//                       ids.push(picid);
//                       console.log(picid)
//                       getNew(picid, function (getList) {
//                           //     console.log(getIt)
//                           //     console.log(getList.date)
//                           //     console.log(getList.cinema)
//                           //     console.log(getList.price)
//                           //getM.date = getList.date;
//                           //getM.cinema = getList.cinema;
//                           //getM.price = getList.price;
//                           //console.log(getList.price);
//
//                           //saveMovie.saveIndex(getList, picid ,function(err) {
//                           //    if(err) {
//                           //        console.log(err);
//                           //    }
//                           //})
//                           movie = {
//                               movieId: picid,
//                               movieName: movieName,
//                               movieScore: movieScore,
//                               movieYear: movieYear,
//                               movieTime: movieTime,
//                               movieRegion: movieRegion,
//                               movieDirector: movieDirector,
//                               movieActor: movieActor,
//                               moviePic: picUrl,
//                               getM: getList
//                           }
//                           allmovie.push(movie);
//
//                           console.log(movie.movieId)
//                           console.log(movie.movieName)
//                           console.log(movie.movieScore)
//                           console.log(movie.movieYear)
//                           console.log(movie.movieTime)
//                           console.log(movie.movieRegion)
//                           console.log(movie.movieDirector)
//                           console.log(movie.getM)
//
//                           //saveMovie.saveAll(allmovie, function (err) {
//                           //    if (err) {
//                           //        console.log(err)
//                           //    }
//                           //})
//
//                           // downloadImg('../img/', movie.picUrl);
//                       });
//                       //
//
//                       //});
//
//
//                       //saveData('./data' + (index / pageSize) + '.json', movies);
//                   });
//               }).on('error', function (err) {
//                   console.log(err);
//               });
//           })
//       }
//
//}

function getNew(ids , callback) {
    var moveisNew = [];
    var movie = {};
    var dates = [];
    var cinemas = [];
    var prices = [];

       https.get('https://movie.douban.com/subject/'+ids+'/cinema/mianyang/' , function (res) {
           var html = ''
           res.setEncoding('utf-8');
           res.on('data', function(chunk) {
               html += chunk;
           })
           res.on('end', function() {
               var $ = cheerio.load(html);

               $('#date-bar li').each(function () {
                   var dateMovie = $('a', this).text()
                   dates.push(dateMovie);
                   //console.log(dateMovie);
               })
               $('#cinema-list-wrap .cinema-item .hd').each(function() {
                   var cinema = $('h3', this).text();
                   var price = $('span', this).text().trim();
                   cinemas.push(cinema)
                   prices.push(price);
                   //console.log(cinema)
                   //console.log(price)
               })
              // var price = $('#cinema-list-wrap .cinema-item .hd')
                 movie = {
                    movieId: ids,
                    date: dates,
                    cinema: cinemas,
                    price: prices
                }
              // moveisNew.push(movie);
               //
               //for(var i =0 ; i< moveisNew.length;i++) {
               //    console.log(moveisNew[i]);
               //}

            //  moveisNew.push(movie);

               callback(movie);
           })
       }).on('error', function(err) {
           console.log(err);
       })

   }
//

//var date = new Date().getTime()
//
//getid(date);



