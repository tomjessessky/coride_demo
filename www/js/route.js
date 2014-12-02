var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

function initializeMap() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var madison = new google.maps.LatLng(43.0849935, -89.4064204);
  var mapOptions = {
    zoom:7,
    center: madison
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
}

function calcRoute(start, waypoint, destination) {
  var request = {
      origin:start,
      waypoints: [{location: waypoint, stopover: true}],
      destination:destination,
      travelMode: google.maps.TravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }
  });
}
