// electron-packager ./app YoutubeDLGUI --platform=win32 --icon=./resources/icon.iconset --out=./build/win/ --overwrite
// electron-packager ./app YoutubeDLGUI --ignore=.gitignore --platform=darwin --icon=./resources/icon.icns --out=./build/mac/ --overwrite
const fs = require('fs')
const path = require('path')
const packager = require('electron-packager')
const ytdlInstall = require('./youtube-dl-install.js');
// const zip = new require('node-zip')();
const zipFolder = require('zip-folder');

const pkg = require('../package.json');



// console.log("PKG: ", pkg.version);
// return;
var base = process.cwd();
var binDir = base+"/app/bin/";
if (!fs.existsSync(binDir)){
  fs.mkdirSync(binDir);
}else{
  var toremove = fs.readdirSync(binDir)
  if(toremove && toremove.length > 0){
    toremove.forEach(function(p){
      fs.unlinkSync(path.join(binDir, p));
    });
  }  
}
var ytopts = {
  platform: "win",
  outputDir: binDir
};
var opts = {
  dir: base+'/app',
  name: "youtube-dl-desktop",
  appVersion: pkg.version,
  platform: "win32",
  icon: base+"/resources/icon.iconset",
  out: base+'/build/win',
  overwrite: true
};

if(process.argv[2]=='mac'){

  ytopts = {
    platform: "mac",
    outputDir: base+"/app/bin/"
  };
  opts = {
    dir: base+'/app',
    name: "youtube-dl-desktop",
    appVersion: pkg.version,
    platform: "darwin",
    icon: base+"/resources/icon.icns",
    out: base+'/build/mac',
    overwrite: true
  };
}


var ytinstall = new ytdlInstall(ytopts);

ytinstall.download({}, function(err, response){
  console.log("err, response", err, response);

  packager(opts, function(err, paths){
    console.log('paths', paths);
    zipFolder(paths[0], paths[0]+".zip", function(err) {
      console.log('zipped', err);
    });
  });
});
