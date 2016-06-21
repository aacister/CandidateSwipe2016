angular.module('candidateSwipe.services', [])
.factory('Candidate', function($http, $q, SERVER) {
  var o = {
    queue: []
  };


  o.getCandidates = function() {

   return $http.get(SERVER.url + '/candidates')
   .success(function(data){
      o.queue = o.queue.concat(data);
   });
 }

 o.addCandidates = function(candidate){
   if (!candidate) return false;

   return $http.get(SERVER.url + '/candidates/locality/' + candidate.locality)
   .success(function(data){
     o.queue = o.queue.concat(data);
   });

 }

 o.nextCandidates = function(skipped) {

   //store current candidates
   var currentCandidates = o.queue.filter(function(value, index){
        return index === 0 || index ===1;
   })

   //retrieve next candidates randomly
   var random = Math.round(Math.random() * (o.queue.length - 1));
   var randomCandidate = o.queue[random];
   console.log('Random Candidate: ' + randomCandidate.name);
   var randomCandidates = o.queue.filter(function(value){
     return value.locality === randomCandidate.locality;
   })
   console.log('Random Candidates' + randomCandidates[0].name + ' ' + randomCandidates[1].name);

   //Remove current Candidates and random candidates from queue
   o.queue = o.queue.filter(function(value, index ){
        return (index !== 0 || index !== 1) && value.locality !== randomCandidate.locality;
   })

   //Add random candidates to beginning
   o.queue = randomCandidates.concat(o.queue);


   //if skipped, add current candidates back to queue
   if(skipped)
    o.queue = o.queue.concat(currentCandidates);

  }

  return o;
})

.factory('User', function() {

  var o = {
    results: []
  }

 o.addCandidateToResults = function(candidate) {
   if (!candidate) return false;
   o.results.unshift(candidate);
 }

 o.removeCandidateFromResults = function(candidate, index) {
    if (!candidate) return false;
    //remove from results array
    o.results.splice(index, 1);
  }

  return o;
});
