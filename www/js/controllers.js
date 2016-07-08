angular.module('hk_taxi_stands.controllers', ['hk_taxi_stands.services'])

  .controller('MenuCtrl', function() {})

  .controller('MapCtrl', function($scope, $rootScope, $ionicModal, $timeout, $cordovaGeolocation, uiGmapGoogleMapApi, $http, fCsv) {

    $scope.markers = [];
    $scope.infoVisible = false;
    $scope.infoBusiness = {};

    $scope.show_detail = "none";
    $scope.visibleTypes = "all";
    $rootScope.script = "english";
    $scope.toggleLanguage = toggleLanguage;
    $scope.displayType = displayType;
    $scope.expand_details = expand_details;
    $scope.hide_details  = hide_details;
    $scope.detail = null;
    $scope.typeSelectionModal = null;

    // Initialize and show infoWindow for business
    $scope.showInfo = function(marker, eventName, markerModel) {
      console.log(marker, eventName, markerModel);
      //$scope.infoBusiness = markerModel;
      //$scope.infoVisible = true;
      $scope.detail = markerModel;
      $scope.show_detail = "name";
      console.log("marker click", $scope.infoBusiness, $scope.show_detail);
    };

    // Hide infoWindow when 'x' is clicked
    $scope.hideInfo = function() {
      $scope.infoVisible = false;
    };

    function toggleLanguage() {
      switch ($rootScope.script) {
        case "english":
          $rootScope.script = "chinese";
          break;
        default:
          $rootScope.script = "english";
      }
    }

    function displayType(name) {
      $scope.visibleTypes = name;
      $scope.typeSelectionModal.hide();
      loadMarkers();
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
        $scope.markers = angular.fromJson(fCsv.toJson(resp.data)).filter(filterByType).map(toMarker);
        //console.log("markers", $scope.markers);
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
        name:     ($rootScope.script=="english") ? stand.Name : stand.名稱,
        district: ($rootScope.script=="english") ? stand.District : stand.地區,
        description: stand.Location + (stand.pano?"":" (Approximate marker location only)"),
        hours: stand.Hours,
        location: {
          latitude: parseFloat(stand.Latitude),
          longitude: parseFloat(stand.Longitude)
        },
        image: stand.pano ? "https://maps.googleapis.com/maps/api/streetview?size=600x600&fov=120&pano=" + stand.pano + "&heading=" + stand.heading : "https://maps.googleapis.com/maps/api/streetview?size=600x600&pano=not_yet",
        directions: "https://www.google.com.hk/maps/dir/" + $scope.map.center.latitude + "," + $scope.map.center.longitude + "/" + parseFloat(stand.Latitude) + "," + parseFloat(stand.Longitude) + "/data=!4m2!4m1!3e2",
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

  });
