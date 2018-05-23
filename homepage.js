var macLink = "https://github.com/dudewheresmycode/youtube-dl-desktop/releases/download/v1.2-beta.0/youtube-dl-desktop-Mac-x64.zip";
var winLink = "https://github.com/dudewheresmycode/youtube-dl-desktop/releases/download/v1.2-beta.0/youtube-dl-desktop-Windows-x64.zip";

$(function(){
  // $.getJSON("https://api.github.com/repos/dudewheresmycode/youtube-dl-desktop/releases").done(function (releases){
  //   var release = releases[0];
  //   console.log(release);
  //   var win = release.assets.find(function(it){ return /win/gi.test(it.name); });
  //   var mac = release.assets.find(function(it){ return /mac/gi.test(it.name); });
  //   console.log(win, mac);
  //   // var linux = release.assets.find(function(it){ return /linux/gi.test(it.name); });
  //   $("#links").append(makeLink(mac.browser_download_url, "Mac OS", "fa-apple"));
  //   $("#links").append(makeLink(win.browser_download_url, "Windows", "fa-windows"));
  //   // $("#links").append('<a href="'+mac+'">Download For Mac</button>');
  // });
  $("#links").append(makeLink(macLink, "Mac OS", "fa-apple"));
  $("#links").append(makeLink(winLink, "Windows", "fa-windows"));
  function makeLink(href, txt, icon){
    return $('<a download target="_blank" href="'+href+'"><i class="fab fa-fw '+icon+'"></i> '+txt+'</a>');
  }
});
