angular.module('candidateSwipe.controllers', ['ionic', 'ionic.contrib.ui.tinderCards', 'candidateSwipe.services'])
.directive('noScroll', function() {
    return {
        restrict: 'A',
        link: function($scope, $element, $attr) {
            $element.on('touchmove', function(e) {
                e.preventDefault();
            });
        }
    }
  })
.controller('AppCtrl', function($scope, $state, $ionicModal, $ionicSideMenuDelegate, User, auth) {

  $scope.user = {};
  $scope.error = '';
  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };


  $scope.login = function() {
    $scope.modal.show();
  };

  var toggleMenuLeft = function(){
    $ionicSideMenuDelegate.toggleLeft();
  };



  var clearForm = function(){
    $scope.user = {};
    $scope.error = '';
  }

  $scope.submitForm = function(signingUp) {
    User.auth($scope.user, signingUp).then(function(){
      clearForm();
      $state.go('app.discover');

    }, function() {
      alert('Try again.');
      $scope.error="Try again."

    });
  }

  $scope.currentUser = function(){
    return User.currentUser();
  };
  $scope.isLoggedIn = function(){
    return auth.isLoggedIn();
  };

  $scope.logOut = function(){
    User.logOut().then(function(){
      toggleMenuLeft();
      $state.go('home');
    });

  };



})

.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, TDCardDelegate, SERVER, Candidate, User, resolvedResults) {
var showLoading = function() {
    $ionicLoading.show({
      template: '<ion-spinner icon="spiral" ></ion-spinner>',
      noBackdrop: true
    });
  }

  var hideLoading = function() {
    $ionicLoading.hide();
  }

  $scope.cardsExist = function(){
    return User.candidatesAvail && User.candidatesAvail.length>0;

  }
  showLoading();

      $scope.loaded = false;
      $scope.currentCandidates = Array.prototype.slice.call(User.candidatesAvail, 0, 2);
      hideLoading();
      $scope.loaded = true;

  $scope.cardSwiped = function(index) {
  }

  $scope.cardPartialSwipe = function(index){
  }

  $scope.cardSnapBack = function(index){
  }

  $scope.cardDestroyed = function(index){
    console.log('Card destroyed.');
    var swipedCandidate = $scope.currentCandidates[index];
    User.addCandidateToResults(swipedCandidate).then(function(user){
      $scope.sendFeedback(false);

    });

  }

  $scope.sendFeedback = function (skipped) {
    showLoading();
    User.nextCandidates(skipped);

    $timeout(function() {
      $scope.currentCandidates = Array.prototype.slice.call(User.candidatesAvail, 0, 2);
      hideLoading();
    }, 250);
  }

  $scope.retrieveImage = function(img){
    if(img.length > 0)
      return SERVER.url + SERVER.imagePath  + img;
    else {
      return SERVER.url + SERVER.imagePath + 'Unknown.jpg';
    }
  }

})

.controller('ResultsCtrl', function($scope, SERVER, User, Candidate, resolvedResults) {

  $scope.results = resolvedResults[1];

  $scope.removeCandidate = function(candidate, index) {

  //  console.log('Removing candidate: ' + candidate._id + ' ' + candidate.name);
    User.removeCandidateFromResults(candidate, index)
    .then(function(user){
      User.addCandidateToDeck(candidate);
    });


  }

  $scope.retrieveImage = function(img){
    if(img && img.length > 0)
      return SERVER.url + SERVER.imagePath + img;
    else {
      return SERVER.url + SERVER.imagePath + 'Unknown.jpg';
    }
  }
})

.controller('TabsCtrl', function($scope, User, auth) {
  $scope.resultsCount =  User.resultsCount;

  $scope.enteringResults = function() {
   User.newResults = 0;

 }

 $scope.isLoggedIn = function(){
   return auth.isLoggedIn();
 };


});
