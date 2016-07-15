// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// the 2nd parameter is an array of 'requires'
var app = angular.module('hk_taxi_stands', ['ionic', 'ngCordova', 'uiGmapgoogle-maps', 'fCsv',
    'hk_taxi_stands.controllers'])

    .config(function(uiGmapGoogleMapApiProvider) {
      uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCCD9qpjFMDkGoH4GLP6Uyuy7o9m5ga8dM',
        //libraries: 'weather,geometry,visualization',
        v: '3'
      });
    })

    .run(function($ionicPlatform) {
      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
          StatusBar.styleDefault();
        }
      });
    })

    .config(function($stateProvider, $urlRouterProvider) {

      $stateProvider

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'MenuCtrl'
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

      .state('app.about', {
        url: '/about',
        views: {
          'menuContent': {
            templateUrl: 'templates/about.html',
            controller: 'AboutCtrl'
          }
        }
      })

      .state('app.apps', {
        url: '/apps',
        views: {
          'menuContent': {
            templateUrl: 'templates/apps.html',
            controller: 'AppsCtrl'
          }
        }
      })

      .state('app.depots', {
        url: '/depots',
        views: {
          'menuContent': {
            templateUrl: 'templates/depots.html',
            controller: 'DepotsCtrl'
          }
        }
      })

      .state('app.feedback', {
        url: '/feedback',
        views: {
          'menuContent': {
            templateUrl: 'templates/feedback.html',
            controller: 'FeedbackCtrl'
          }
        }
      });

      // if none of the above states are matched, use this as the fallback
      $urlRouterProvider.otherwise('/app/map');

    })
  ;
