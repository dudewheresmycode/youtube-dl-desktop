const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;
const dialog = electron.dialog;


const path = require('path')
const url = require('url')
const _ = require('lodash')

// const ytdlInstall = require('./lib/youtube-dl-install/index.js');
require('./lib/youtube.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

process.env.YTDL_BIN = path.join(app.getAppPath(), "bin/youtube-dl" + (process.platform=="win32" ? ".exe" : ""));

console.log("YOUTUBE-DL PATH", process.env.YTDL_BIN);


function createWindow () {
  // require('electron-context-menu')({
  //   showInspectElement: false
  // 	// prepend: (params, browserWindow) => [{
  // 	// 	label: 'Rainbow'
  // 	// 	// Only show it when right-clicking images
  // 	// 	// visible: params.mediaType === 'image'
  // 	// }]
  // });


  // electron.dialog.showMessageBox({
  //   type:"info",
  //   buttons: ["OK"],
  //   message: "binary: " + process.env.YTDL_BIN
  // });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 700, height: 700
    // titleBarStyle: "hiddenInset",
    // webPreferences: {
      // experimentalFeatures: true
    // }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })


  const menu = new Menu()
  if (process.platform === 'darwin') {
    menu.append(new MenuItem({
      label: electron.app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    }));
  }
  if (process.platform === 'win32') {
    menu.append(new MenuItem({
      label: 'File',
      submenu: [
        {role: 'quit'}
      ]
    }));
  }
  menu.append(new MenuItem({
    label: 'Edit',
    submenu: [
      {label:"Cut", role:'cut'},
      {label:"Copy", role: 'copy'},
      {label:"Paste", role: 'paste'}
    ]
  }));
  try {
    setTimeout(function(){
      Menu.setApplicationMenu(menu);
    },4000);
  }catch(e){
    console.log(e);
  }


}
//
// function dependencyCheck(){
//   var ytinstall = new ytdlInstall({
//     outputDir: app.getAppPath() //path.join(app.getAppPath(), "youtube-dl")
//   });
//   ytinstall.locateBinary({}, function(err, response){
//     // if(err){
//       // console.log('so... this error happened: ', err);
//       // createWindow("error.html");
//     if(response!=undefined && _.has(response, "path")){
//       //installed and already
//
//       // dialog.showMessageBox({
//       //   type:"info",
//       //   buttons: ["OK"],
//       //   message: "Has binary: " + JSON.stringify(response)
//       // });
//
//       console.log("located binary", response.path);
//       process.env.YTDL_BIN = response.path;
//       createWindow("index.html");
//     }else{
//       ytinstall.download({}, function(err, binary){
//         process.env.YTDL_BIN = binary;
//         createWindow("index.html");
//       });
//       // dialog.showMessageBox({
//       //   type:"info",
//       //   buttons: ["OK"],
//       //   message: "NEEDS BINARY"
//       // });
//       //
//       // console.log("something wrong with binary...", response);
//       // createWindow("install.html");
//     }
//
//   });
// }
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// const menu = Menu.buildFromTemplate(require('./lib/menu-template.js'))

app.on('ready', function(){
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    dependencyCheck()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
