angular.module('candidateSwipe.services', ['http-auth-interceptor'])

.factory('Candidate', function($http, $q, SERVER) {
  var o = {
    queue: []
  };


  o.getCandidates = function() {
   return $http.get(SERVER.url + '/candidates')
   .success(function(data){
      o.queue = data;
   });
 }


  return o;
})
.factory('auth', ['$http', '$window', '$state', '$q', 'SERVER', function($http, $window, $state, $q, SERVER) {
    var auth = {};
    auth.saveToken = function(token) {
        $window.localStorage['candidateSwap2016-token'] = token;
    };

    auth.getToken = function() {
        return $window.localStorage['candidateSwap2016-token'];
    }

    auth.isLoggedIn = function() {

        var token = auth.getToken();

        if (token) {
          return true;
        } else {
            return false;
        }

    };






    return auth;
}])

.factory('User', ['$http', '$window','$q', 'SERVER', 'auth', 'Candidate', function($http, $window, $q, SERVER, auth, Candidate) {

  var o = {
    userName: '',
    results: [],
    newResults: 0,
    candidatesAvail: []
  }

  o.nextCandidates = function(skipped) {

    //store current candidates
    var currentCandidates = o.candidatesAvail.filter(function(value, index){
         return index === 0 || index ===1;
    });
    //remove current candidates from candidatesAvail array
    o.candidatesAvail = o.candidatesAvail.filter(function(value, index){
      return (index !== 0 && index !==1);
    });

    //check if any candidates exist
    if(o.candidatesAvail.length>0 && !skipped){
    //retrieve next candidates randomly
    var random = Math.round(Math.random() * (o.candidatesAvail.length - 1));
    var randomCandidate = o.candidatesAvail[random];
    //get the pair of random candidates (repub and dem for the locality)
    var randomCandidates = o.candidatesAvail.filter(function(value){
      return value.locality === randomCandidate.locality;
    });

    //Remove  random candidates from candidatesAvail
    o.candidatesAvail = o.candidatesAvail.filter(function(value, index ){
         return value.locality !== randomCandidate.locality;
    });

    //Add random candidates to beginning
    o.candidatesAvail = randomCandidates.concat(o.candidatesAvail);

    //if skipped, add current candidates back to queue
    if(skipped)
     o.candidatesAvail = o.candidatesAvail.concat(currentCandidates);
   }

   }

   o.addCandidateToDeck = function(candidate){

     if (!candidate) return false;

     //retrieve both party's candidates for the locality
      $http.get(SERVER.url + '/candidates/locality/' + candidate.locality)
     .success(function(data){
       //add back to candidatesAvail
       o.candidatesAvail = o.candidatesAvail.concat(data);

     });
  }

 o.addCandidateToResults = function( candidate) {
   var deferred = $q.defer();
   if (!candidate)
      deferred.reject(false);
   o.results.unshift(candidate);
   o.newResults++;
   console.log('Bearer Token: ' + auth.getToken());
   //Persist
   $http.put(SERVER.url + '/user/' + o.currentUserId() + '/results/' + candidate._id + '/vote',  {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(user){
                  deferred.resolve(user);
                });
    return deferred.promise;

 }

 o.removeCandidateFromResults = function( candidate, index) {
   var deferred = $q.defer();
    if (!candidate)
      deferred.reject(false);

    o.results.splice(index, 1);
    console.log('Bearer Token: ' + auth.getToken());
    $http.delete(SERVER.url + '/user/' + o.currentUserId() + '/results/' + candidate._id, {
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    }
                }).success(function(user){

                  deferred.resolve(user);
                });

    return deferred.promise;

  }

  o.populateResults = function() {
    var deferred = $q.defer();
   $http.get(SERVER.url + '/users/' + o.currentUserId() + '/results', {
     headers: {
         Authorization: 'Bearer ' + auth.getToken()
     }
 }).success(function(data){
     o.results = data.results;
     deferred.resolve(o.results);
   });
   return deferred.promise;
 }

 o.populateCandidatesAvail = function(){

  o.candidatesAvail = Candidate.queue.filter(function(obj)
  {
      var flag=false;
      for (var x=0; x < o.results.length; x++)
      {
        var currentRes = o.results[x];
        if(obj.locality === currentRes.locality)
          flag=true;

      }
      if(!flag)
        return true;
      else {
        return false;
      }

  });

 }
  o.resultsCount = function() {
    return o.newResults;
  }

  o.setSession = function(token){
    var deferred = $q.defer();
    auth.saveToken(token);
    o.userName= o.currentUser();
    o.newResults = 0;
    Candidate.getCandidates().then(function(){
    o.currentUserResults().then(function(res){
      o.results = res;
      o.populateCandidatesAvail();
      deferred.resolve(true);
    })
  });
  return deferred.promise;



  };

  o.destroySession = function(){
    $window.localStorage.removeItem('candidateSwap2016-token');
    o.userName = '';
    o.results = [];
    o.newResults = 0;
    o.candidatesAvail = [];

  };

  o.checkSession = function() {
  var defer = $q.defer();


    var token = auth.getToken();
    if (token) {
      o.setSession(token).then(function(){
        defer.resolve(true);
      })

    } else {
      defer.resolve(false);
    }

  return defer.promise;
};

  o.auth = function(user, signingUp) {
    var deferred = $q.defer();
    var authRoute;

    if (signingUp) {
      authRoute = 'register';
    } else {
      authRoute = 'login'
    }

    $http.post(SERVER.url + '/' + authRoute, user)
    .success(function(data){
      console.log('Success');
      o.setSession(data.token);
      deferred.resolve(data.token);
    }).error(function(msg){
      console.log('rejected.');
      deferred.reject(msg);
    });

    return deferred.promise;

  };


o.logOut = function() {
    var deferred = $q.defer();
    o.destroySession();
    deferred.resolve(true);
    return deferred.promise;
};

o.getCurrentUser = function() {
    if (auth.isLoggedIn()) {
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        var id = payload._id;
        return $http.get(SERVER.url + '/users/' + id).then(function(res) {
            return res.data;
        });
    }
};

o.currentUserId = function() {
    if (auth.isLoggedIn()) {
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload._id;
    }
};


o.currentUser = function() {
    if (auth.isLoggedIn()) {
        var token = auth.getToken();
        var payload = JSON.parse($window.atob(token.split('.')[1]));

        return payload.username;
    }
};

o.currentUserResults = function(){
  var deferred = $q.defer();
  if (auth.isLoggedIn()) {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
       $http.get(SERVER.url + '/users/' + payload._id + '/results' , {
                       headers: {
                           Authorization: 'Bearer ' + auth.getToken()
                       }
                   }).then(function(data) {
          deferred.resolve( data.data.results);
      });
  }
  else {
    deferred.resolve([]);
  }
  return deferred.promise;
};

  return o;
}]);
