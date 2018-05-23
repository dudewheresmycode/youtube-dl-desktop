// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const {ipcRenderer} = require('electron')
const {dialog} = require('electron').remote
const {shell} = require('electron')
global.jQuery = global.$ = require('jQuery')
const angular = require('angular')
const hhmmss = require("hhmmss-util")
const moment = require('moment');
const filesize = require('filesize');

angular.module('ytdl', [
  // require('angular-animate')
])
.filter('filesize',function(){
  return function(bytes){
    return isNaN(bytes) ? 0 : filesize(bytes);
  }
})
.filter('yyyymmdd',function(){
  return function(d){
    console.log(d);
    if(d){
      var y = d.slice(0,4);
      var m = d.slice(4,6);
      var d = d.slice(6,8);
      return moment(y+'-'+m+'-'+d).format("LL");
    }else{
      return d;
    }
  }
})
.filter('hhmmss',function(){
  return function(s){
    return isNaN(s) || s<0 ? "00:00" : hhmmss(s);
  }
})
.run(function($rootScope){
  $rootScope.default_video = {
    loading: false,
    download: {
      active:false,
      progress:0
    },
    options: {
      format:null,
      convert:false
    },
    info: null,
    url: ""
  }
  $rootScope.video = angular.copy($rootScope.default_video);

  $rootScope.selectedFormat = function(){
    return $rootScope.video.info.formats.find(function(it){ return it.format_id==$rootScope.video.options.format; });
  }
})
.directive('ytInfo',function($rootScope){
  return { templateUrl:'tpl/yt-info.html' }
})
.directive('ytError',function($rootScope){
  return { templateUrl:'tpl/yt-error.html' }
})
.directive('ytLoading',function($rootScope){
  return { templateUrl:'tpl/yt-loading.html' }
})
.directive('ytFormatList',function($rootScope){
  return {
    templateUrl: 'tpl/yt-format-list.html',
    link: function(scope,ele,attr){
      scope.bestSort = function(s){
        return !(s.vcodec!="none" && s.acodec!="none");
      }
    }
  }
})
.directive('ytDownload', function($rootScope){
  return {
    templateUrl: 'tpl/yt-download.html',
    link: function(scope,ele,attr){

      scope.progressWidth = function(){
        return {width:$rootScope.video.download.progress+'%'};
      }

      ipcRenderer.on('yt.download.progress', function(event,percent,loaded,total){
        console.log('progress', percent);
        $rootScope.video.download.progress = percent*100;
        $rootScope.video.download.bytesLoaded = loaded;
        $rootScope.video.download.bytesTotal = total;
        $rootScope.$apply();
      });
      ipcRenderer.on('yt.download.complete', function(event, percent, bytesWritten, bytesTotal){
        console.log('finished');
        $rootScope.video.download.complete = true;
        $rootScope.video.download.progress = 100;
        $rootScope.$apply();
      });
      ipcRenderer.on('yt.download.canceled', function(event){
        $rootScope.video.download.complete = true;
        $rootScope.video.output = null;
        $rootScope.video.download = {active:false, progress:0};
        $rootScope.$apply();
      });
      scope.reveal = function(){
        shell.showItemInFolder($rootScope.video.output);
      }
      scope.cancel = function(){
        ipcRenderer.send('yt.download.cancel', $rootScope.video);
      }
      scope.done = function(){
        console.log('done');
        $rootScope.video.output = null;
        $rootScope.video.download = {active:false, progress:0};
        // $rootScope.video.download.active=false;
      }
      scope.download = function(){
        // console.log("download video: %s format: %s", $rootScope.video.url, $rootScope.video.options.format);
        var fmt = $rootScope.selectedFormat();
        var fn = $rootScope.video.info.title+"."+fmt.ext;
        $rootScope.video.download.active=true;
        dialog.showSaveDialog({defaultPath:fn, buttonLabel:"Download"},function(fn){
          console.log(fn);
          if(fn){
            $rootScope.video.output = fn;
            ipcRenderer.send('yt.download.start', $rootScope.video, fmt);
          }else{
            $rootScope.video.download.active=false;
          }
        });


      }
    }
  }
})
.directive('linkForm', function($rootScope){
  return {
    link: function(scope,ele,attr){
      ipcRenderer.on('yt.log', function(event, log){
        console.log('yt.log', log);
      });
      ipcRenderer.on('yt.info.result', function(event,error,info){
        console.log(error,info);
        $rootScope.video.loading = false;
        if(error){
          $rootScope.video.error = error;
        }else{
          $rootScope.video.options.format = info.format_id;
          $rootScope.video.info = info;
        }
        $rootScope.$apply();
      });

      scope.getInfo = function(){
        console.log('getInfo');

        $rootScope.video.info = angular.copy($rootScope.default_video.info); //reset

        $rootScope.video.loading = true;
        ipcRenderer.send('yt.info.get', $rootScope.video.url);
      }
    }
  }
})
