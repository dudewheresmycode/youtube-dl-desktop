const electron = require('electron');

module.exports = [
  {
    label: 'Edit',
    submenu: [
      // {role: 'undo'},
      // {role: 'redo'},
      // {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'}
      // {role: 'pasteandmatchstyle'},
      // {role: 'delete'},
      // {role: 'selectall'}
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Report Bugs',
        click () { electron.shell.openExternal('https://github.com/dudewheresmycode/youtube-dl-desktop/issues') }
      }
    ]
  }
]
//
if (process.platform === 'darwin') {
  module.exports.unshift({
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
  })
}else{
  module.exports.unshift({
    label: "File",
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })
}
//
//   // Edit menu
//   module.exports[1].submenu.push(
//     {type: 'separator'},
//     {
//       label: 'Speech',
//       submenu: [
//         {role: 'startspeaking'},
//         {role: 'stopspeaking'}
//       ]
//     }
//   )
//
//   // Window menu
//   module.exports[2].submenu = [
//     {role: 'close'},
//     {role: 'minimize'},
//     {role: 'zoom'},
//     {type: 'separator'},
//     {role: 'front'}
//   ]
// }
