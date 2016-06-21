angular.module('candidateSwipe.controllers', ['ionic', 'ionic.contrib.ui.tinderCards', 'candidateSwipe.services'])

.controller('DiscoverCtrl', function($scope, TDCardDelegate, SERVER, Candidate, User) {

  Candidate.getCandidates().then(function(){
      $scope.currentCandidates = Array.prototype.slice.call(Candidate.queue, 0, 2);
    });


  $scope.cardSwiped = function(index) {
    var swipedCandidate = $scope.currentCandidates[index];
    User.addCandidateToResults(swipedCandidate);
    $scope.sendFeedback(false);
  }


  $scope.sendFeedback = function (skipped) {

    Candidate.nextCandidates(skipped);
    $scope.currentCandidates = Array.prototype.slice.call(Candidate.queue, 0, 2);

  }

  $scope.retrieveImage = function(img){
    if(img.length > 0)
      return SERVER.url + SERVER.imagePath  + img;
    else {
      return SERVER.url + SERVER.imagePath + 'Unknown.jpg';
    }
  }

})

.controller('ResultsCtrl', function($scope, SERVER, User, Candidate) {

  $scope.results = User.results;

  $scope.removeCandidate = function(candidate, index) {
    User.removeCandidateFromResults(candidate, index);
    Candidate.addCandidates(candidate);
  }

  $scope.retrieveImage = function(img){
    if(img.length > 0)
      return SERVER.url + SERVER.imagePath + img;
    else {
      return SERVER.url + SERVER.imagePath + 'Unknown.jpg';
    }
  }
})

.controller('TabsCtrl', function($scope, $window) {

});
