'use strict';

angular.module('TravelBlog.admin', ['ngRoute', 'TravelBlog.common'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/admin', {
            templateUrl: './admin/admin.html',
            controller: 'AdminCtrl'
        });
    }])

    .controller('AdminCtrl', ['$scope', '$timeout', '$firebase', '$http', '$location', 'CommonProp', 'FirebaseData', '$controller', function ($scope, $timeout, $firebase, $http, $location, CommonProp, FirebaseData, $controller) {

        // Extend the base controller
        angular.extend(this, $controller('SharedCtrl', {$scope: $scope}));

        $scope.username = CommonProp.getUser();

        //protect routes when not logged in
        if (!$scope.username) {
            $location.path('/login');
        }

        //logout function
        $scope.logout = function () {
            $scope.backupDbToLocalFile();
            CommonProp.logoutUser();
        }

        //database backup to local file
        $scope.backupDbToLocalFile = function () {

            //creates a new object with all of the data in it
            var jsonObject = {
                destinations: $scope.removeUnwantedPropertiesFromJsonObject($scope.destinations),
                visitedplaces: $scope.removeUnwantedPropertiesFromJsonObject($scope.visitedplaces),
                photos: $scope.removeUnwantedPropertiesFromJsonObject($scope.photos)
            };

            var jsonString = JSON.stringify(jsonObject);

            $http.get('http://www.jerrytrimp.nl/travelblog/writeJsonFile.php?secret=0832925&jsonData=' + jsonString)
                .success(function (data, status, headers, config) {
                    $scope.handleToastEvents('Local backup made', false);
                })
                .error(function (data, status, headers, config) {
                    $scope.handleToastEvents('Local backup failed', true);
                });
        }

        $scope.removeUnwantedPropertiesFromJsonObject = function(collection){
            var strippedCollection = [];

            angular.forEach(collection, function (value) {
                delete value.$id;
                delete value.$priority;
                delete value.$$hashKey;
                strippedCollection.push(value);
            });


            return strippedCollection;
        }

        //seed database from local file
        $scope.seedDbFromLocalFile = function (modalId) {
            //read contents of created json file
            $http.get('http://www.jerrytrimp.nl/travelblog/getJson.php?secret=0832925').success(function (data) {

                $scope.dataObject = angular.fromJson(data);

                $scope.addEntities($scope.dataObject.destinations,'Destinations', '');
                $scope.addEntities($scope.dataObject.visitedplaces,'Visited_places', '');
                $scope.addEntities($scope.dataObject.photos,'Photos', '');

                $(modalId).modal('hide');
                $scope.handleToastEvents('Seeding of database from local backup file finished', false);

            });

        }

        //generic methods
        $scope.generateId = function (contentTypeName) {

            //if there are no new entities to add
            if ($scope.entitiesToAdd.length < 1) {


                if (contentTypeName === 'Destinations') {

                    var highestId = $scope.findHighestId($scope.destinations);

                }
                else if (contentTypeName === 'Visited_places') {

                    var highestId = $scope.findHighestId($scope.visitedplaces);
                }
                else if (contentTypeName === 'Photos') {

                    var highestId = $scope.findHighestId($scope.photos);
                }
                else {
                    return false;
                }
            }
            else {
                var highestId = $scope.findHighestId($scope.entitiesToAdd);
            }

            var newHighestId = (highestId += 1);
            // return die value
            return newHighestId;
        }

        //function called by generateId
        $scope.findHighestId = function (findHighestIdIn) {
            var highestId = 0;

            angular.forEach(findHighestIdIn, function (value) {
                if (value.id > highestId) {
                    highestId = value.id;
                }
            });
            return highestId;
        }

        //add function creates empty array and objects to be filled by createEntity
        $scope.add = function (modalId) {
            $scope.entitiesToAdd = [];
            $scope.newEntityToAdd = {};
            $(modalId).modal();
        }

        //function creates new db entries and adds them to an array
        $scope.createEntity = function (contentTypeName) {

            var generatedId = $scope.generateId(contentTypeName);
            var user = CommonProp.getUser();

            if (contentTypeName === 'Destinations') {

               /* var toDate = $scope.convertDateFormat($scope.newEntityToAdd.toDate);
                var fromDate = $scope.convertDateFormat($scope.newEntityToAdd.fromDate);*/

                $scope.newEntityToAdd =
                {
                    id: generatedId,
                    title: $scope.newEntityToAdd.title,
                    fromDate: $scope.newEntityToAdd.toDate,
                    toDate: $scope.newEntityToAdd.fromDate,
                    coverphotolink: $scope.newEntityToAdd.coverphotolink,
                    coverphotoposition: $scope.newEntityToAdd.coverphotoposition,
                    addedBy: user,
                    '.priority': user
                };
                $scope.entitiesToAdd.push($scope.newEntityToAdd);
            }
            else if (contentTypeName === 'Photos') {
                var visitedPlaceId = $scope.newEntityToAdd.visitedPlaceId;
                var title = $scope.newEntityToAdd.title;
                var link = $scope.newEntityToAdd.link;
                var position = $scope.newEntityToAdd.position;

                $scope.newEntityToAdd = {
                    id: generatedId,
                    visitedPlaceId: $scope.lastClickedVisitedPlace,
                    title: title,
                    link: link,
                    position: position,
                    addedBy: user,
                    '.priority': user
                };
                $scope.entitiesToAdd.push($scope.newEntityToAdd);

            }
            else if (contentTypeName === 'Visited_places') {
                var title = $scope.newEntityToAdd.title;
                var description = $scope.newEntityToAdd.description;

                $scope.newEntityToAdd = {
                    id: generatedId,
                    destinationId: $scope.clickedDestination,
                    title: title,
                    description: description,
                    addedBy: user,
                    '.priority': user
                };
                $scope.entitiesToAdd.push($scope.newEntityToAdd);
            }
            $scope.newEntityToAdd = {};
        }

        //loops trough the array created by createEntity function to add them to the db
        $scope.addEntities = function (collection,contentTypeName, modalId) {
            var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/" + contentTypeName);

            if(collection == ''){
                collection = $scope.entitiesToAdd;
            }

            angular.forEach(collection, function (value) {
                var entity = $firebase(fb);

                //cast to and from json to remove an angular added $$hashKey property which breaks the angular fire
                var jsonObject = angular.toJson(value);
                var hashkeyLessObject = angular.fromJson(jsonObject);
                console.log('created object to fb => ',hashkeyLessObject);

                entity.$push(hashkeyLessObject).then(function () {
                    $scope.handleToastEvents(contentTypeName + ' added', false);
                }, function (error) {
                    console.log('error => ',error);
                    $scope.handleToastEvents(error, true);
                });
            }, $scope);

            if (modalId != '') {
                $(modalId).modal('hide');
            }

            $scope.entitiesToAdd = [];
        }

        //edit
        $scope.edit = function (contentTypeName, id, modalId) {

            var firebaseobject = new Firebase("https://glowing-inferno-8985.firebaseio.com/" + contentTypeName + "/" + id);
            var syn = $firebase(firebaseobject);

            $scope.entityToUpdate = syn.$asObject();

            $(modalId).modal();
        }

        //update
        $scope.update = function (contentTypeName, id, modalId) {

            var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/" + contentTypeName + "/" + $scope.entityToUpdate.$id);
            var entity = $firebase(fb);
            var user = CommonProp.getUser();

            //check which content type it is and update accordingly
            if (contentTypeName === 'Destinations') {
                entity.$update({
                    id: $scope.entityToUpdate.id,
                    title: $scope.entityToUpdate.title,
                    fromDate: $scope.entityToUpdate.fromDate,
                    toDate: $scope.entityToUpdate.toDate,
                    coverphotolink: $scope.entityToUpdate.coverphotolink,
                    coverphotoposition: $scope.entityToUpdate.coverphotoposition,
                    addedBy: user
                }).then(function (ref) {
                    $scope.handleToastEvents('Destination Updated', false);
                    $(modalId).modal('hide');
                }, function (error) {
                    $scope.handleToastEvents(error, true);
                });
            }
            else if (contentTypeName === 'Photos') {
                entity.$update({
                    id: $scope.entityToUpdate.id,
                    visitedPlaceId: $scope.entityToUpdate.visitedPlaceId,
                    title: $scope.entityToUpdate.title,
                    link: $scope.entityToUpdate.link,
                    position: $scope.entityToUpdate.position,
                    addedBy: user
                }).then(function (ref) {
                    $scope.handleToastEvents('Photo Updated', false);
                    $(modalId).modal('hide');
                }, function (error) {
                    $scope.handleToastEvents(error, true);
                });
            }
            else if (contentTypeName === 'Visited_places') {

                entity.$update({
                    id: $scope.entityToUpdate.id,
                    destinationId: $scope.entityToUpdate.destinationId,
                    title: $scope.entityToUpdate.title,
                    description: $scope.entityToUpdate.description,
                    addedBy: user
                }).
                then(function (ref) {
                    $scope.handleToastEvents('Visited place Updated', false);
                    $(modalId).modal('hide');
                }, function (error) {
                    $scope.handleToastEvents(error, true);
                });
            }

        }

        //confirm delete
        $scope.confirm = function (contentTypeName, entityFBId, id, modalId) {

            if(contentTypeName != '' && entityFBId != '' && id != '') {
                var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/" + contentTypeName + "/" + entityFBId);

                var entity = $firebase(fb);

                $scope.entityToDelete = entity.$asObject();
                $scope.id = id;

            }

            $(modalId).modal();
        }

        //delete
        $scope.delete = function (contentTypeName, modalId) {

            var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/" + contentTypeName + "/" + $scope.entityToDelete.$id);
            var entity = $firebase(fb);
            entity.$remove().then(function (ref) {
                $scope.handleToastEvents(contentTypeName + ' deleted', false);
                $(modalId).modal('hide');
            }, function (error) {
                $scope.handleToastEvents(error, true);
            });

            //removes all associated data
            if (contentTypeName === 'Destinations') {
                //remove all associated visited places
                //var visited_place_id;

                angular.forEach($scope.visitedplaces, function (value) {

                    if (value.destinationId == $scope.id) {

                        var visitedPlaceId = value.id;
                        //remove all associated photos
                        angular.forEach($scope.photos, function (value) {

                            if (value.visitedPlaceId == visitedPlaceId) {
                                var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/Photos/" + value.$id);
                                var entity = $firebase(fb);

                                entity.$remove();
                            }
                        }, $scope);


                        //remove the visited place
                        var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/Visited_places/" + value.$id);
                        var entity = $firebase(fb);

                        entity.$remove();
                    }

                }, $scope);

                var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/Destinations/" + $scope.entityToDelete.$id);
                var entity = $firebase(fb);

                entity.$remove().then(function (ref) {
                    $scope.handleToastEvents('Destination deleted', false);
                }, function (error) {
                    $scope.handleToastEvents(error, true);
                });
            }

            else if (contentTypeName === 'Visited_places') {

                //remove all associated photos
                angular.forEach($scope.photos, function (value) {


                    // var visitedPlaceId = value.id;
                    if (value.visitedPlaceId == $scope.id) {
                        //delete
                        //this $scope.entityToDelete.$id is now value.$id
                        var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/Photos/" + value.$id);
                        var entity = $firebase(fb);

                        entity.$remove();
                    }
                }, $scope);

                //delete
                //this $scope.entityToDelete.$id is now value.$id
                var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/Visited_places/" + $scope.entityToDelete.$id);
                var entity = $firebase(fb);

                entity.$remove().then(function (ref) {
                    $scope.handleToastEvents('Visited Place Deleted', false);
                }, function (error) {
                    $scope.handleToastEvents(error, true);
                });


            }
            else if (contentTypeName === 'Photos') {

                //delete
                //this $scope.entityToDelete.$id is now value.$id
                var fb = new Firebase("https://glowing-inferno-8985.firebaseio.com/Photos/" + $scope.entityToDelete.$id);
                var entity = $firebase(fb);

                entity.$remove().then(function (ref) {
                    $scope.handleToastEvents('Related Photos Deleted', false);
                }, function (error) {
                    $scope.handleToastEvents(error, true);
                });

            }
        }
    }]);
