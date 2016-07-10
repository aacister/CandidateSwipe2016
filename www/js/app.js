
angular.module('candidateSwipe', [
  'ionic',
 'LocalStorageModule',
 'candidateSwipe.services',
 'candidateSwipe.controllers'])

.run(function($ionicPlatform, Candidate) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });




})
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl',
    resolve: {
      resolvedResults: function(User, $q) {
          var deferred = $q.defer();
          User.checkSession().then(function(res){
          deferred.resolve([User.candidatesAvail, User.results]);
        })
        return deferred.promise;
      }
    },
   onEnter: function($state, auth, Candidate){
       if (!auth.isLoggedIn())
       {

         $state.go('home');
       }

     }

  })


  .state('app.discover', {
    url: "/discover",
    views: {
      'tab-discover': {
        templateUrl: "templates/discover.html",
        controller: "DiscoverCtrl"
      }
    }
  })

  .state('app.results', {
    url: "/results",
    views: {
      'tab-results': {
        templateUrl: "templates/results.html",
        controller: "ResultsCtrl"
      }
    },

  })

  .state('home', {
    url: '/',
    templateUrl: "templates/login.html",
    controller: "AppCtrl",
   onEnter: function($state, User){
      User.checkSession().then(function(hasSession) {
        if (hasSession)
        {

          $state.go('app.discover');
        }
      });

    }

  });


  $urlRouterProvider.otherwise('/');

})

.constant('SERVER', {
  // Local server
  url: 'http://localhost:3000',
  imagePath: '/images/Candidates/'

});
