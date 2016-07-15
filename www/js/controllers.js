angular.module('hk_taxi_stands.controllers', [])

  .controller('MenuCtrl', function() {})

  .controller('MapCtrl', function($scope, $rootScope, $ionicModal, $ionicPlatform, $timeout, $cordovaDevice, $cordovaGeolocation, $cordovaGoogleAnalytics, uiGmapGoogleMapApi, $http, fCsv) {

    $scope.markers = [];
    $scope.show_detail = "none";
    $scope.visibleTypes = "all";
    $rootScope.script = "english";
    $scope.toggleLanguage = toggleLanguage;
    $scope.displayType = displayType;
    $scope.show_details = show_details;
    $scope.expand_details = expand_details;
    $scope.hide_details  = hide_details;
    $scope.center_map = center_map;
    $scope.record_directions = record_directions;
    $scope.detail = null;
    $scope.typeSelectionModal = null;

    var longCats = {
      english: {
        U: "Urban Taxi Stand (Local)",
        N: "New Territories Taxi Stand",
        C: "Cross-Harbour Taxi Stand",
        L: "Lantau Island Taxi Stand",
        CU: "Urban Taxi Stands for Local & Cross-Harbour",
        NU: "Taxi Stands for Urban & New Territories",
        LU: "Taxi Stands for Urban & Lantau",
        LNU: "Taxi Stands of all Colors"
      },
      chinese: {
        U: "市區的士站（本地）",
        N: "新界的士站",
        C: "海底的士站",
        L: "大嶼山的士站",
        CU: "市區海底的士站",
        NU: "市區新界的士站"
      }
    }

    function toggleLanguage() {
      switch ($rootScope.script) {
        case "english":
          $rootScope.script = "chinese";
          break;
        default:
          $rootScope.script = "english";
      }
      $scope.markers = [];
      hide_details();
      loadMarkers();
      $cordovaGoogleAnalytics.trackEvent('Map', 'Toggle Language', $rootScope.script);
    }

    function displayType(name) {
      $scope.visibleTypes = name;
      $scope.typeSelectionModal.hide();
      hide_details();
      loadMarkers();
    }

    function show_details(marker, eventName, markerModel) {
      $scope.detail = markerModel;
      $scope.show_detail = "peek";
      $timeout(function(){ $scope.show_detail = "name"; }, 1000);
      $cordovaGoogleAnalytics.trackEvent('Detail Pane', 'Show', markerModel.name);
    }

    function expand_details() {
      $scope.show_detail = "all";
      $cordovaGoogleAnalytics.trackEvent('Detail Pane', 'Expand', $scope.detail.name);
    }

    function hide_details() {
      $scope.show_detail = "none";
    }

    function center_map() {
      $scope.map.center = angular.copy($scope.map.currentPos.coords);
      $cordovaGoogleAnalytics.trackEvent('Map', 'Re-Center');
    }

    function record_directions() {
      $cordovaGoogleAnalytics.trackEvent('Detail Pane', 'Directions', $scope.detail.name);
    }




    var initializeMap = function(position) {
      if (position) {
        $scope.position = position;
        $cordovaGoogleAnalytics.trackEvent('Sensors', 'Location', 'Latitude',  parseInt(position.coords.latitude*100));
        $cordovaGoogleAnalytics.trackEvent('Sensors', 'Location', 'Longitude', parseInt(position.coords.longitude*100));
        $cordovaGoogleAnalytics.trackEvent('Sensors', 'Location', 'Heading',   parseInt(position.coords.heading, 10));
        var outOfBounds = (
          position.coords.latitude  > 22.60  ||
          position.coords.latitude  < 22.19  ||
          position.coords.longitude > 114.41 ||
          position.coords.longitude < 113.83
        );
      }
      console.log("init", position, outOfBounds);
      if (!position || outOfBounds) {
        // Default to Victoria Harbour
        position = {
          coords: {
            latitude: 22.29,
            longitude: 114.17
          }
        };
      }

      $scope.map = {
        center: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        zoom: 15,
        options: {
          zoomControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
          streetViewControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM }
        },
        currentPos: {
          id: 'currentpos',
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          options: {
            draggable: false,
            clickable: false,
            zIndex: 1000
          },
          events: {},
          icon: {
            path: google.maps.SymbolPath.CIRCLE,  //wanted FORWARD_CLOSED_ARROW, but having trouble getting device heading
            scale: 5,
            fillColor: '#2677FF',
            fillOpacity: 1,
            strokeColor: '#2677FF',
            strokeOpacity: 1,
            strokeWeight: 1,
            rotation: position.coords.heading
          }
        }
      };

      var watchOptions = {
        timeout : 3000,
        enableHighAccuracy: false // may cause errors if true
      };
      var watch = $cordovaGeolocation.watchPosition(watchOptions);
      watch.then(
        null,
        function(err) {
          // error
        },
        function(position) {
          //console.log("position update", position);
          $scope.map.currentPos.coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          //$scope.map.currentPos.icon.rotation = position.coords.heading;
      });

      loadMarkers();

    };

    uiGmapGoogleMapApi.then(function(maps) {
      // Don't pass timeout parameter here; that is handled by setTimeout below
      var posOptions = {enableHighAccuracy: false};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
        initializeMap(position);
      }, function(error) {
        console.log(error);
        initializeMap();
      });
    });

    // Deal with case where user does not make a selection
    $timeout(function() {
      if (!$scope.map) {
        console.log("No confirmation from user, using fallback");
        initializeMap();
      }
    }, 5000);

    // Send pageview analytics and set up event triggers
    $ionicPlatform.ready(function() {
      var device = $cordovaDevice.getDevice();
      //$cordovaGoogleAnalytics.debugMode();
      $cordovaGoogleAnalytics.startTrackerWithId('UA-42937954-5');
      $cordovaGoogleAnalytics.trackView('Map Screen');
      $cordovaGoogleAnalytics.addCustomDimension('device model', device.model);
      $cordovaGoogleAnalytics.addCustomDimension('device platform', device.platform);
    });

    function loadMarkers() {
      $http.get('hk_taxi_stands.csv').then(function(resp) {
        //console.log("unfiltered", angular.fromJson(fCsv.toJson(resp.data)));
        $scope.markers = angular.fromJson(fCsv.toJson(resp.data)).filter(filterByType).map(toMarker);
        //console.log("markers", $scope.markers);
      });
    }

    function filterByType(stand) {
      if ($scope.visibleTypes == "all") return true;
      switch ($scope.visibleTypes) {
        default:
        case "all":     return true;
        case "urban":   return (stand.Category.indexOf("U")>=0);
        case "cross":   return (stand.Category.indexOf("C")>=0);
        case "lantau":  return (stand.Category.indexOf("L")>=0);
        case "newterr": return (stand.Category.indexOf("N")>=0);
      }
    }

    function toMarker(stand, $index) {
      var shortcat = stand.Category.replace(/\&/g,"");
      return {
        id: $index,
        category: shortcat,
        longcat: longCats[$rootScope.script][shortcat],
        name:     ($rootScope.script=="english") ? stand.Name : stand.名稱,
        district: ($rootScope.script=="english") ? stand.District : stand.地區,
        description: stand.Location + (stand.pano?"":" (Approximate marker location only)"),
        hours: stand.Hours,
        location: {
          latitude: parseFloat(stand.Latitude),
          longitude: parseFloat(stand.Longitude)
        },
        image: stand.pano ? "https://maps.googleapis.com/maps/api/streetview?size=600x300&fov=120&pano=" + stand.pano + "&heading=" + stand.heading : "https://maps.googleapis.com/maps/api/streetview?size=600x600&pano=not_yet",
        directions: "https://www.google.com.hk/maps/dir/" + $scope.map.center.latitude + "," + $scope.map.center.longitude + "/" + parseFloat(stand.Latitude) + "," + parseFloat(stand.Longitude) + "/data=!4m2!4m1!3e2",
        icon: "img/marker-" + shortcat + ".png"
      };

    }

    $ionicModal.fromTemplateUrl('type-selection-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.typeSelectionModal = modal;
    });

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.typeSelectionModal.remove();
    });

  })

  .controller('DepotsCtrl', function($scope, $rootScope, $http, fCsv) {

    $http.get('hk_taxi_depots.csv').then(function(resp) {
      //console.log("unfiltered", angular.fromJson(fCsv.toJson(resp.data)));
      $scope.depots = angular.fromJson(fCsv.toJson(resp.data));
      console.log("depots", $scope.depots);
    });

  })

  .controller('AboutCtrl', function($ionicPlatform, $cordovaGoogleAnalytics) {
    $ionicPlatform.ready(function() {
      $cordovaGoogleAnalytics.trackView('About Screen');
    });
  })

  .controller('AppsCtrl', function($ionicPlatform, $cordovaGoogleAnalytics) {
    $ionicPlatform.ready(function() {
      $cordovaGoogleAnalytics.trackView('Apps Screen');
    });
  })

  .controller('DepotsCtrl', function($ionicPlatform, $cordovaGoogleAnalytics) {
    $ionicPlatform.ready(function() {
      $cordovaGoogleAnalytics.trackView('Depots Screen');
    });
  })

  .controller('FeedbackCtrl', function($ionicPlatform, $cordovaGoogleAnalytics) {
    $ionicPlatform.ready(function() {
      $cordovaGoogleAnalytics.trackView('Feedback Screen');
    });
  });
