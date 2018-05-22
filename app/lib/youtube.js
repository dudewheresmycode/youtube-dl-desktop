const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const ipcMain = electron.ipcMain

const fs = require("fs")
const path = require("path")
const youtubedl = require("youtube-dl")
const spawn = require("child_process").spawn
const request = require("request")

let tmpPath = app.getPath('temp');


// var video = youtubedl('http://www.youtube.com/watch?v=90AiXO1pAiA',
//   // Optional arguments passed to youtube-dl.
//   ['--format=18'],
//   // Additional options can be given for calling `child_process.execFile()`.
//   { cwd: __dirname });
//
// // Will be called when the download starts.
// video.on('info', function(info) {
//   console.log('Download started');
//   console.log('filename: ' + info.filename);
//   console.log('size: ' + info.size);
// });
//
// video.pipe(fs.createWriteStream('myvideo.mp4'));

ipcMain.on('yt.info.get', function(event,url){
  console.log('get',url);
  //, "--write-info-json=pipe:1"
  //"--xattr-set-filesize",
  var yt = spawn(process.env.YTDL_BIN, ["--youtube-skip-dash-manifest", "--no-warnings", "-f", "best", "-j", url]);
  var stderr = '';
  yt.stderr.on('data',function(d){
    stderr += d.toString('utf8');
    console.log('youtube-dl stderr: %s', d);
    event.sender.send('yt.log', "stderr: "+d.toString());
  })
  var json = '';
  yt.stdout.on('data',function(d){
    json += d.toString('utf8');
    event.sender.send('yt.log', "Stdout: "+d.toString());
    // console.log('youtube-dl stdout: %s', d);
  })
  yt.on('close',function(code){
    event.sender.send('yt.log', "closed with code "+code);
    electron.dialog.showMessageBox({
      type:"info",
      buttons: ["OK"],
      message: "stderr: " + json
    });
    console.log('youtube-dl closed: %s', code);
    if(code==0){
      try {
        event.sender.send('yt.log', "parse json "+json);
        var info = JSON.parse(json);
        event.sender.send('yt.info.result', null, info);
      }catch(e){
        event.sender.send('yt.info.result', json);
        console.log('error parsing JSON', json);
      }
    }else{
      console.log("Error: ", stderr);
      event.sender.send('yt.info.result', stderr);

    }
  })
  // youtubedl.getInfo(url, [], function(err, info) {
  //   console.log(err,info);
  //   event.sender.send('yt.info.result', info);
  // });
});

ipcMain.on('yt.download.start', function(event, options, format){


  var jsonString = JSON.stringify(options.info);

  console.log('get', options.url);
  var parts = path.parse(options.output);
  console.log('download to: ', options.output);
  console.log('download dir: ', parts.dir);
  console.log('download base: ', parts.base);

  //load-info-json
  //var ytdl = youtubedl(options.url, ['--format='+options.options.format, '--load-info-json='+json_tmp], {cwd:parts.dir});
  //, '--load-info-json=pipe:0'

  var bytesTotal;
  var bytesWritten = 0;
  request.get(format.url, function(err, res){
    console.log('finished');
    event.sender.send('yt.download.complete');
  })
  .on('data',function(d){
    bytesWritten += d.length;
    var p = bytesWritten/bytesTotal;
    console.log('progress', p, bytesWritten, bytesTotal);
    event.sender.send('yt.download.progress', p, bytesWritten, bytesTotal);
  })
  .on('response',function(res){
    bytesTotal = parseInt(res.headers['content-length']);
  })
  .pipe(fs.createWriteStream(options.output));

  // var ytdl = spawn(process.env.YTDL_BIN, [options.url, '-o', 'pipe:1', '--format='+options.options.format]);
  // ytdl.stderr.on('data',function(d){
  //   console.log('stderr', d.toString('utf8'))
  // });
  // var bytesWritten = 0;
  // ytdl.stdout.on('data',function(d){
  //   bytesWritten += d.length;
  //   console.log('downloaded %s bytes', bytesWritten);
  // });
  // //   console.log('stdout', d.toString('utf8'))
  // //   // var reg = new RegExp('^\[download\].*?\K([0-9.]+\%|#\d+ of \d)');
  // //   // var matches = reg.exec(d);
  // //   // console.log('stdout', matches)
  // // });
  // ytdl.on('close',function(code){
  //   console.log('close', code);
  // });
  // ytdl.stdout.pipe(fs.createWriteStream(options.output))
  //


});
