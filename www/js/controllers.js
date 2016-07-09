angular.module('hk_taxi_stands.controllers', [])

  .controller('MenuCtrl', function() {})

  .controller('MapCtrl', function($scope, $rootScope, $ionicModal, $timeout, $cordovaGeolocation, uiGmapGoogleMapApi, $http, fCsv) {

    $scope.markers = [];
    $scope.show_detail = "none";
    $scope.visibleTypes = "all";
    $rootScope.script = "english";
    $scope.toggleLanguage = toggleLanguage;
    $scope.displayType = displayType;
    $scope.show_details = show_details;
    $scope.expand_details = expand_details;
    $scope.hide_details  = hide_details;
    $scope.detail = null;
    $scope.typeSelectionModal = null;

    var longCats = {
      english: {
        U: "Urban Taxi Stand (Local)",
        N: "New Territories Taxi Stand",
        C: "Cross-Harbour Taxi Stand",
        L: "Lantau Island Taxi Stand",
        CU: "Urban Taxi Stands for Local & Cross-Harbour",
        NU: "Taxi Stands for Urban & New Territories"
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
    }

    function expand_details() {
      $scope.show_detail = "all";
    }

    function hide_details() {
      $scope.show_detail = "none";
    }




    var initializeMap = function(position) {
      if (position) {
        $scope.position = position;
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

      // TODO add marker on current location

      $scope.map = {
        center: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        zoom: 15
      };

      // Make info window for marker show up above marker
      $scope.windowOptions = {
        pixelOffset: {
          height: -32,
          width: 0
        }
      };

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
      return {
        id: $index,
        category: stand.Category,
        longcat: longCats[$rootScope.script][stand.Category],
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
        icon: "img/marker-" + stand.Category + ".png"
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

  });
