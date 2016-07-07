angular.module('angularGoogleMapsExample.controllers', ['angularGoogleMapsExample.services'])

  .controller('MapCtrl', function($scope, $rootScope, $timeout, $cordovaGeolocation, uiGmapGoogleMapApi, $http, fCsv, Yelp) {

    $scope.markers = [];
    $scope.infoVisible = false;
    $scope.infoBusiness = {};

    $scope.show_detail = "none";
    $scope.visibleTypes = "all";
    $rootScope.script = "english";
    //$scope.toggleLanguage = toggleLanguage;
    //$scope.displayType = displayType;
    $scope.expand_details = expand_details;
    $scope.hide_details  = hide_details;
    $scope.detail = null;
    $scope.typeSelectionModal = null;

    // Initialize and show infoWindow for business
    $scope.showInfo = function(marker, eventName, markerModel) {
      $scope.infoBusiness = markerModel;
      $scope.infoVisible = true;
    };

    // Hide infoWindow when 'x' is clicked
    $scope.hideInfo = function() {
      $scope.infoVisible = false;
    };

    var initializeMap = function(position) {
      if (position) {
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
      console.log(position);
      // TODO add marker on current location

      $scope.map = {
        center: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        zoom: 14
      };

      // Make info window for marker show up above marker
      $scope.windowOptions = {
        pixelOffset: {
          height: -32,
          width: 0
        }
      };

      loadMarkers();

      // Yelp.search(position).then(function(data) {
      //   console.log(data);
      //   for (var i = 0; i < 10; i++) {
      //     var business = data.data.businesses[i];
      //     $scope.markers.push({
      //       id: i,
      //       name: business.name,
      //       url: business.url,
      //       location: {
      //         latitude: business.location.coordinate.latitude,
      //         longitude: business.location.coordinate.longitude
      //       }
      //     });
      //   }
      // }, function(error) {
      //   console.log("Unable to access yelp");
      //   console.log(error);
      // });
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
        console.log("unfiltered", angular.fromJson(fCsv.toJson(resp.data)));
        $scope.markers = angular.fromJson(fCsv.toJson(resp.data)).filter(filterByType).map(toMarker);
        console.log($scope.markers);
      });
    }

    function filterByType(stand) {
      if ($scope.visibleTypes == "all") return true;
      switch (stand.Category) {
        case "C":
          return ($scope.visibleTypes == "cross");
          break;
        case "CU":
          return ($scope.visibleTypes == "cross") || ($scope.visibleTypes == "urban");
          break;
        case "L":
          return (stand.Category=="lantau");
          break;
        case "N":
          return (stand.Category=="newterr");
          break;
        case "NU":
          return (stand.Category=="newterr") || ($scope.visibleTypes == "urban");
          break;
        case "U":
          return (stand.Category=="urban");
          break;
      }
    }

    function toMarker(stand, $index) {
      switch (stand.Category) {
        case "U":
          var color = "red";
          break;
        case "NT":
          var color = "green";
          break;
        case "L":
          var color = "blue";
          break;
      }

      return {
        id: $index,
        name: "name",
        url: "http://www.google.com",
        location: {
          latitude: parseFloat(stand.Lattitude),
          longitude: parseFloat(stand.Longitude)
        },
        options: {
          draggable: false,
          icon: color ? "img/marker-" + color + ".png" : "img/marker-grey.png"
        },
        click: show_detail
      };

    }

    function show_detail(args, eventName) {
      $scope.detail = $scope.markers[args.key];
      $scope.show_detail = "name";
    }

    function expand_details() {
      $scope.show_detail = "all";
    }

    function hide_details() {
      $scope.show_detail = "none";
    }

  });
