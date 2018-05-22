


var ytdl = require('./index.js');

ytdl().locateBinary({}, function(err,result){
  console.log("result", err, result);
})
// ytdl()
// .on('progress',function(loaded,total){
//   console.log('loaded: %s, total: %s', loaded, total);
// })
// .download({outputDir:__dirname}, function(err,result){
//   console.log('done!');
//   console.log(err,result);
// });
