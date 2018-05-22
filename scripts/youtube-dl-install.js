const request = require('request')
const path = require('path')
const url = require('url')
const fs = require('fs')
const execFile = require('child_process').execFile
const util = require("util")
const events = require("events")
const which = require('which')
//unix/linux/mac
//https://yt-dl.org/downloads/latest/youtube-dl
//windows
//https://yt-dl.org/downloads/latest/youtube-dl.exe
// require('fix-path')();


var downloadUrls = {
  "nix": "https://yt-dl.org/downloads/latest/youtube-dl",
  "win": "https://yt-dl.org/latest/youtube-dl.exe"
}


function ytInstall (opts){
  events.EventEmitter.call(this);
  if (!(this instanceof ytInstall)) {
    return new ytInstall(opts);
  }
  this.outputDir = opts.outputDir || process.cwd();
  this.isWindows = opts.platform=="win" || process.platform=="win32";
  console.log('is windows', this.isWindows?"YES":"NO");
  console.log('new', this.outputDir);
}
util.inherits(ytInstall, events.EventEmitter);

ytInstall.prototype.locateBinary = function(options, callback){
  var wopts = {};
  var binFile = "youtube-dl" + (this.isWindows ? ".EXE" : "");
  if ( fs.existsSync( path.join(this.outputDir, binFile) ) ){
    callback(null, path.join(this.outputDir, binFile));
  }else{
    which(binFile, wopts, function(err,path){
      if(err){
        callback(err);
      }else if(typeof path=='string'){
        var out = {filename:binFile, path:path, version:null, executable:false};
        execFile(path, ["--version"], function(e,se,so){
          out.version = se.trim();
          out.executable = !e;
          callback(null, out);
        });
      }else{
        callback(null, null);
      }
    });
  }
}

ytInstall.prototype.versions = function(options, callback){
  var that = this;
  let ghUrl = "https://api.github.com/repos/rg3/youtube-dl/releases/latest";
  request({url:ghUrl, json:true, headers:{"User-Agent":"NodeJS-App"}}, function(err, res, body){
    console.log(err);
    console.log(body);

    console.log('-------');
    console.log('-------');

    var version = body.tag_name;

    name: 'youtube-dl.exe',

    console.log("version: %s", version);
    callback(null, body);
  });
	// this.emit('progress');
};

ytInstall.prototype.download = function(options, callback){
  console.log('download');
  var that = this;
  let key = this.isWindows ? 'win' : 'nix';
  let dlUrl = downloadUrls[key];
  let parsed = url.parse(dlUrl);
  let fn = path.parse(parsed.pathname);
  let outputPath = path.join(this.outputDir, fn.base);

  let oStream = fs.createWriteStream(outputPath);
  let totalBytes = 0;
  let bytesLoaded = 0;

  request({url:dlUrl, encoding:null}, function(err, response){
    if(err){ return callback(err); }
    fs.chmod(outputPath, 0755, function(err){
      if(err){ return callback(err); }
      callback(null, outputPath);
    });
  })
  .on('response', function(response) {
    totalBytes = response.headers['content-length'];
  })
  .on('data', function(data) {
    bytesLoaded += data.length;
    that.emit('progress', bytesLoaded, totalBytes);
    //let percentage = (bytesLoaded/totalBytes)*100;
    //console.log('downloading %s - %s KB', percentage.toFixed(2), bytesLoaded/1024);
    // console.log('received ' + data.length + ' bytes of uncompressed data')
  })
  .pipe(oStream);


};

module.exports = ytInstall;
