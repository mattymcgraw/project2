/*
  Please add all Javascript code to this file.
*/

var techCrunchApi = 'https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=' + config.apiKey

//The main feed functionality
$(function(){

	$( window ).on( "load", function(e) {
      e.preventDefault();

        $.get(techCrunchApi,function(response){
        	alert( "Response success: " + response );
        });

  });

})