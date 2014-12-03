angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $q, $filter) {

  // Create the find modal that we will use later
  $ionicModal.fromTemplateUrl('templates/find.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.initializeMap = function() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var madison = new google.maps.LatLng(43.0849935, -89.4064204);
    var mapOptions = {
      zoom:6,
      center: madison
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
  }

  // Triggered in the find modal to close it
  $scope.closeFind = function() {
    $scope.modal.hide();
  };

  // Open the find modal
  $scope.find = function() {
    $scope.modal.show();
  };

  // Form data for the login modal
  $scope.stopData = {};
  $scope.best_ride = {};

  // Perform the submitStop action when the user submits the find form
  $scope.submitStop = function() {

    //assume origin is Madison for this demo
    var origin = "Madison, WI"; //for demo
    var stop = $scope.stopData.destination; //city entered in form
    var destinations = ["Green Bay, WI", "St. Louis, MO", "San Francisco, CA"];

    //create distance service instance
    var service = new google.maps.DistanceMatrixService();

    //start calculation
    function calculateAdditionalDistance(origin, stop, destinations) {
      var deferred = $q.defer();

      //start by getting distance from origin to stop
      var originToStop = 0; 
      service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [stop],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        durationInTraffic: false,
        avoidHighways: false,
        avoidTolls: false
      }, originToStopCallback); //get distance, calls function below



      function originToStopCallback(response, status) {
        if (status == google.maps.DistanceMatrixStatus.OK) {

          //store returned value as distance from Origin to Stop
          originToStop = Number(response.rows[0].elements[0].distance.value);

          //get distance matrix, each element is distance from one origin to one destination
          //start by calling google maps api, pairing origin and stop as starting points, and calculating their distances to all available trip destinations
          var distanceArray = service.getDistanceMatrix(
          {
            origins: [origin, stop],
            destinations: destinations,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
            durationInTraffic: false,
            avoidHighways: false,
            avoidTolls: false
          }, matrixCallback);
        }
      };

      //callback from above method
      function matrixCallback(response, status) {
          //this function returns the distance array as a promise
          //distanceArray will have originToStop as 0 index value, then the added meters to add stop to each route

          if (status == google.maps.DistanceMatrixStatus.OK) {
            var origins = response.originAddresses;
            var destinations = response.destinationAddresses;

            var distanceArray = new Array(destinations.length + 1);
            distanceArray[0] = originToStop; //0 index value will be originToStop value for cost calculation

            for (var i = 0; i < destinations.length; i++) {
              
              var originToDestination = Number(response.rows[0].elements[i].distance.value);
              var stopToDestination = Number(response.rows[1].elements[i].distance.value);

              //calculate the distance added to trip by stopping
              var addedDistance = Number((originToStop + stopToDestination) - originToDestination);
              distanceArray[i + 1] = addedDistance; //offset by 1 due to originToStop at 0 index
            }

            deferred.resolve(distanceArray); //return the distanceArray
          }
        };

      return deferred.promise;
    }

    //call calculation function, using the promise
    var promise = calculateAdditionalDistance(origin, stop, destinations);
    promise.then(function(distanceArray) {
      //set arbitrary lowest distance
      var lowest = distanceArray[1]; //since 0 index is originToStop
      var lowestIndex = 1;
      //loop through array to find lowest
      for (var i = distanceArray.length - 1; i >= 2; i--) {
        if (distanceArray[i] < lowest) {
          lowest = distanceArray[i];
          lowestIndex = i;
        }
      };

      //set scope vars to best trip option
      $scope.best_ride.origin = origin;
      $scope.best_ride.stop = stop;
      $scope.best_ride.destination = destinations[lowestIndex - 1];
      //arbitrary cost calculation 
      $scope.best_ride.cost = $filter('currency')(Number((distanceArray[lowestIndex] + distanceArray[0]) / 1609.34) * 0.33); //33 cents per mile to stop, 33 cents per mile added to original trip

      //draw route onto map, this method is in the js/route.js file
      calcRoute(origin, stop, destinations[lowestIndex - 1]);

    });

    //close modal
    $scope.closeFind();
  };

})




.controller('RandomCtrl', function($scope, $http, Color, $cordovaClipboard, $ionicPlatform) {
  //get 6 random colors
  var colorData = Color.get({count: 6}, function() {
    //store colors to scope
    $scope.colors = colorData.colors;

    //generate 6 random icons
    $scope.random_icons = new Array(6);
    for (var i = $scope.random_icons.length - 1; i >= 0; i--) {
      //icons is pulled from js/icons.js, there are 246 elements in array
      $scope.random_icons[i] = icons[Math.floor(Math.random() * 246)];
    };
  });

  $ionicPlatform.ready(function() {
    $scope.copyText = function() {
      $scope.message = 'copyText called';
      $cordovaClipboard
        .copy('Hello!')
        .then(function () {
          // success
          $scope.message = "Text copied to clipboard";
        }, function () {
          // error
          $scope.message = "There was an error.";
        });
      };
  });

});
