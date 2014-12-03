angular.module('starter.services', [])

.factory('Color', function($resource) {
  return $resource('http://www.colr.org/json/colors/random/:count'); 
});