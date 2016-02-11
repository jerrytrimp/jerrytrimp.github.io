'use strict';

/**
 * Initialisation of the common module
 */
angular
    .module('TravelBlog.common', ['TravelBlog'])
    .controller('SharedCtrl', ['$scope', 'FirebaseData', '$q', '$timeout', function SharedCtrl($scope, FirebaseData, $q, $timeout) {

        $scope.destinations = FirebaseData.getDestinations();
        $scope.visitedplaces = FirebaseData.getVisitedPlaces();
        $scope.photos = FirebaseData.getPhotos();

        //attach fastclick handler to body
        FastClick.attach(document.body);

        //lightbox
        $scope.lightboxContentTitle = '';
        $scope.lightboxContentImage = '';

        //click function vars
        $scope.clickedDestination;
        $scope.lastClickedVisitedPlace;

        //error handling vars
        $scope.errors = false;
        $scope.toastMessage = '';

        //click functions
        $scope.setLastClickedVisitedPlace = function ($event, id) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.lastClickedVisitedPlace = id;
        }

        $scope.setLastClickedDestination = function (id) {


            //dont set the new id when the destination is the same as the opened one,
            //otherwise if you have opened a visited place (number 2) and you click in the wrapper
            //the destination is opened again and than the default visited place will be opened again
            //preventing you from adding photos to a visited place other than the default one in the admin panel
            if (id != $scope.clickedDestination) {
                $scope.visitedPlacesPromise = $scope.getFirstFBArrayItemId(true, $scope.visitedplaces)
                    .then(function (string) {
                        $scope.lastClickedVisitedPlace = string;
                    });
            }

            $scope.clickedDestination = id;
        }

        $scope.deferImage = function(photoLink){
            console.log('$inview == true: deferImage photoLink =',photoLink);
        }

        $scope.convertDateFormat = function (date) {
            var dateParts = date.split("-");
            var europeanDateFormat = dateParts[2] + "-" + dateParts[1] + "-" + dateParts[0];
            return europeanDateFormat;
        }

        $scope.fillLightbox = function ($event, lightboxContentTitle, lightboxContentImage) {
            $event.preventDefault();

            $scope.lightboxContentTitle = lightboxContentTitle;
            $scope.lightboxContentImage = lightboxContentImage;
        }

        //this function returns a promise object, which shoulkd be used with the .then() method to catch its return value
        $scope.getFirstFBArrayItemId = function (isDependentVarAvailable, collection) {
            var deferred = $q.defer();
            collection.$loaded().then(function (response) {
                var collectionRegularArray = [];
                angular.forEach(collection, function (value) {


                    //if the destinations first array item id is fetched, use if to get the filtered visited places belonging to that destination
                    if (isDependentVarAvailable == true) {
                        if (value.destinationId == $scope.clickedDestination) {
                            collectionRegularArray.push(value);
                        }
                    }
                    else {
                        collectionRegularArray.push(value);
                    }
                }, $scope);

                var firstItemId;
                if (collectionRegularArray.length > 0) {
                    var lastArrayindex = collectionRegularArray.length - 1;
                    firstItemId = collectionRegularArray[lastArrayindex].id;
                }


                //return firstItemId;
                deferred.resolve(firstItemId);
            });

            return deferred.promise;
        }

        //this then method captures the return value of the before genereted promise made by the $scope.getFirstFBArrayItemId function
        $scope.destinationsPromise = $scope.getFirstFBArrayItemId(false, $scope.destinations)
            .then(function (string) {

                $scope.clickedDestination = string;

                $scope.visitedPlacesPromise = $scope.getFirstFBArrayItemId(true, $scope.visitedplaces)
                    .then(function (string) {
                        $scope.lastClickedVisitedPlace = string;
                    });
            });

        //error handling method
        $scope.handleToastEvents = function (message, isError) {

            if (isError == true) {
                $scope.errors = true;
            }
            $scope.toastMessage = message;

            //automatically reset after 3 secs
            $timeout(function () {
                $scope.toastMessage = '';
            }, 3000);
        }

        //filters voor ng-repeat//////////////////////////////////////////////////////////////

        //alleen alle visited places die horen bij de huidge destination
        $scope.byDestination = function (id) {
            return function (visited_place) {
                return visited_place.destinationId == id;
            }
        }

        //alleen alle photos die horen bij de huidge visited place
        $scope.byVisitedPlace = function (id) {
            return function (photo) {
                return photo.visitedPlaceId == id;
            }
        }
    }])
    .service('FirebaseData', ['$firebase', function ($firebase) {
        return {

            getDestinations: function () {
                var firebaseObjDestinations = new Firebase("https://glowing-inferno-8985.firebaseio.com/Destinations/");
                var syncDestinations = $firebase(firebaseObjDestinations);
                var destinations = syncDestinations.$asArray();
                return destinations;
            },
            getVisitedPlaces: function () {
                var firebaseObjVisitedPlaces = new Firebase("https://glowing-inferno-8985.firebaseio.com/Visited_places");
                var syncVisitedPlaces = $firebase(firebaseObjVisitedPlaces);
                var visitedplaces = syncVisitedPlaces.$asArray();
                return visitedplaces;
            },
            getPhotos: function () {
                var firebaseObjPhotos = new Firebase("https://glowing-inferno-8985.firebaseio.com/Photos");
                var syncPhotos = $firebase(firebaseObjPhotos);
                var photos = syncPhotos.$asArray();
                return photos;
            }

        };
    }])
    .directive('visitedPlacesPhotos', function () {
        return {
            restrict: 'C',
            transclude: true,
            templateUrl: 'website/partials/visited-places-photos.html'
        };
    })
    .directive('visitedPlaces', function () {
        return {
            require: '^visitedPlacesPhotos',
            restrict: 'C',
            transclude: false,
            templateUrl: 'website/partials/visited-places.html'
        };

    });
