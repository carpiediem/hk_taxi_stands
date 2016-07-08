// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'leaflet-directive', 'starter.controllers', 'fCsv'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

// .config(function() {
//   document.addEventListener("deviceready", onDeviceReady, false);
//
//   // Cordova is ready
//   function onDeviceReady() {
//     var map = L.map('map');
//
//     var db = new MBTiles(file);
//
//     db.getMetadata(db, function (res) {
//         console.log(res);
//     }, function(err){
//         console.log(err);
//     });
//
//     var layer = new L.TileLayer.MBTilesPlugin(db, {tms: true},
//         function (tileLayer) {
//             console.log("TileLayer initalized");
//             $scope.layers.baselayers['mbtiles'] = layer;
//         }
//     );
//
//     layer.addTo(map);
//   }
// })


.config(function($logProvider){
  $logProvider.debugEnabled(false);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.map', {
    url: '/map',
    views: {
      'menuContent': {
        templateUrl: 'templates/map.html',
        controller: 'MapCtrl'
      }
    }
  })

  .state('app.apps', {
    url: '/apps',
    views: {
      'menuContent': {
        templateUrl: 'templates/apps.html'
      }
    }
  })

  .state('app.depots', {
    url: '/depots',
    views: {
      'menuContent': {
        templateUrl: 'templates/depots.html'
      }
    }
  })

  .state('app.feedback', {
    url: '/feedback',
    views: {
      'menuContent': {
        templateUrl: 'templates/feedback.html'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
});
