angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

})

.controller('MapCtrl', function($scope, $rootScope, $ionicModal, $http, fCsv, leafletMarkerEvents) {

  $scope.center= {lat: 22.29, lng: 114.17, zoom: 13};
  $scope.defaults = {};
  $scope.show_detail = "none";
  $scope.visibleTypes = "all";
  $rootScope.script = "english";
  $scope.toggleLanguage = toggleLanguage;
  $scope.displayType = displayType;
  $scope.detail = null;
  $scope.typeSelectionModal = null;
  $scope.standDetailModal = null;
  $scope.expand_details = expand_details;
  $scope.hide_details  = hide_details;

  $scope.$on("leafletDirectiveMarker.click", function(event, args){
    //console.log("marker click");
    $scope.detail = args.model;
    $scope.show_detail = "name";
    //console.log("Detail", $scope.detail);
  });

  $scope.$on("leafletDirectiveMap.click", function(event, args){
    console.log("map click");
    $scope.show_detail = "none";
  });

  $scope.$on("click", function(event, args){
    console.log("any click", event, args);
  });

  console.log("mapclick", $scope.$on("leafletDirectiveMap.click"));

  function expand_details() {
    console.log("expand");
    console.log("mapclick", $scope.$on("leafletDirectiveMap.click"));
    //$scope.show_detail = "all";

    // $scope.$on("leafletDirectiveMap.click", function(event, args){
    //   console.log("map click");
    //   $scope.show_detail = "none";
    // });
  }

  function hide_details() {
    $scope.show_detail = "none";
  }

  loadMarkers();

  $scope.defaults = {
    tileLayer: "tiles/{z}/{x}/{y}.png",
    minZoom: 10,
    maxZoom: 15,
    tileLayerOptions: {
      opacity: 0.9,
      detectRetina: true,
      reuseTiles: true,
    }
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



  function loadMarkers() {
    $http.get('hk_taxi_stands.csv').then(function(resp) {
       $scope.markers = angular.fromJson(fCsv.toJson(resp.data)).filter(filterByType).map(toMarker);
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

  function toMarker(stand) {
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
      lat: parseFloat(stand.Lattitude),
      lng: parseFloat(stand.Longitude),
      focus: false,
      draggable: false,
      icon: getIcon(color),
      name: stand.Name,
      name_chi: stand.名稱,
      area: stand.Area,
      district: stand.Distict,
      district_chi: stand.地區,
      location: stand.Location,
      category: color,
      hours: stand.Hours,
      image: "https://maps.googleapis.com/maps/api/streetview?size=600x300&pano=" + stand.pano + "&heading=" + stand.heading + "&fov=120"
    };
  }

  function getIcon(color) {
    if (color) iconUrl = "img/marker-" + color + ".png";
    else       iconUrl = "img/marker-grey.png";
    return {
        iconUrl: iconUrl,
        iconSize:     [25, 41], // size of the icon
        iconAnchor:   [13, 41], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, -42] // point from which the popup should open relative to the iconAnchor
      };
  }

  $ionicModal.fromTemplateUrl('type-selection-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.typeSelectionModal = modal;
  });

  // $ionicModal.fromTemplateUrl('stand-detail-modal.html', {
  //   scope: $scope,
  //   animation: 'slide-in-up'
  // }).then(function(modal) {
  //   $scope.standDetailModal = modal;
  // });

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.typeSelectionModal.remove();
    //$scope.standDetailModal.remove();
  });




  document.addEventListener("deviceready", onDeviceReady, false);
  function onDeviceReady() {
      console.log("navigator.geolocation works well");
      // onSuccess Callback
      // This method accepts a Position object, which contains the
      // current GPS coordinates
      //
      var onSuccess = function(position) {
          alert('Latitude: '          + position.coords.latitude          + '\n' +
                'Longitude: '         + position.coords.longitude         + '\n' +
                'Altitude: '          + position.coords.altitude          + '\n' +
                'Accuracy: '          + position.coords.accuracy          + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                'Heading: '           + position.coords.heading           + '\n' +
                'Speed: '             + position.coords.speed             + '\n' +
                'Timestamp: '         + position.timestamp                + '\n');
      };

      // onError Callback receives a PositionError object
      //
      function onError(error) {
          alert('code: '    + error.code    + '\n' +
                'message: ' + error.message + '\n');
      }

      navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }

});
