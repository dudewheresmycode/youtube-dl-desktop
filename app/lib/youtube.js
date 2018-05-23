const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const ipcMain = electron.ipcMain

const fs = require("fs")
const path = require("path")

const spawn = require("child_process").spawn
const request = require("request")

let tmpPath = app.getPath('temp');


ipcMain.on('yt.info.get', function(event,url){
  console.log('get',url);
  console.log('bin', process.env.YTDL_BIN);
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
    // electron.dialog.showMessageBox({
    //   type:"info",
    //   buttons: ["OK"],
    //   message: "stderr: " + json
    // });
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
});

ipcMain.on('yt.download.cancel', function(event, options){
  if(download_req!=null){
    download_req.abort();
    download_req = null;
    console.log('removed: ', options.output);
    if(fs.existsSync(options.output)){
      fs.unlinkSync(options.output);
    }
    event.sender.send('yt.download.canceled');
  }
});
var download_req = null;

ipcMain.on('yt.download.start', function(event, options, format){


  var jsonString = JSON.stringify(options.info);

  console.log('get', options.url);
  var parts = path.parse(options.output);
  console.log('download to: ', options.output);
  console.log('download dir: ', parts.dir);
  console.log('download base: ', parts.base);

  var bytesTotal;
  var bytesWritten = 0;
  download_req = request.get(format.url, function(err, res){
    console.log('finished');
    download_req = null;
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
  });

  download_req.pipe(fs.createWriteStream(options.output));

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
