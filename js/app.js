// SET UP HANDLEBARS TEMPLATES
var template1 = $('#article-template').html();
var articleTemplate = Handlebars.compile(template1);

var template2 = $('#link-template').html();
var linkTemplate = Handlebars.compile(template2);


// SET UP APP OBJECT
var Feedr = {
  // MASHABLE OBJECT
  Mashable: {
    articles: []
  },
  // REDDIT OBJECT
  Reddit: {
    articles: []
  },
  // DIGG OBJECT
  Digg: {
    articles: []
  },

  // CREATE A FUNCTION TO HANDLE THE JSON RESPONSE
  responseMashable : function(response) {
      console.log(response);
      var self = this;

      response.new.forEach(function(result){

        // PUSH OBJECT W/ REQUIRED ARTICLE DETAILS FOR EACH ARTICLE
        self.Mashable.articles.push({
          featuredImage: result.responsive_images[0].image,
          articleLink: result.link,
          articleTitle: result.title,
          articleCategory: result.channel,
          impressions: result.shares.total,
          description: result.content.plain,
          dateTime: Utilities.convertDate(result.post_date)
        });

        // POPULATE TEMPLATE WITH ARTICLE CONTENT
        var articleContents = { sourceName: "mashable",
                                dateTime: Utilities.convertDate(result.post_date),
                                featuredImage: result.responsive_images[0].image,
                                articleLink: result.link,
                                articleTitle: result.title,
                                articleCategory: result.channel,
                                impressions: result.shares.total
        };

        // COMPILE AND APPEND TEMPLATE
        var compiledTemplate = articleTemplate(articleContents);
        $("#main").append(compiledTemplate)

      })
  },

  // CREATE A FUNCTION TO HANDLE THE JSON RESPONSE
  responseReddit : function(response) {
      // CONSOLE LOG JSON RESPONSE
      console.log(response);
      var self = this;

      response.data.children.forEach(function(result){

        // PUSH OBJECT WITH ALL REQUIRED ARTICLE DETAILS FOR EACH ARTICLE
        self.Reddit.articles.push({
          featuredImage: result.data.thumbnail,
          articleLink: "http://www.reddit.com" + result.data.permalink,
          articleTitle: result.data.title,
          articleCategory: result.data.subreddit,
          impressions: result.data.ups,
          description: "Reddit doesn't do body text. Click the button and check out the media",
          // multiply by 1000 to adjust to milliseconds
          dateTime: Utilities.convertDate(result.data.created_utc * 1000)
        });

        // POPULATE TEMPLATE WITH ARTICLE CONTENT
        var articleContents = { sourceName: "reddit",
                                dateTime: Utilities.convertDate(result.data.created_utc * 1000),
                                featuredImage: result.data.thumbnail,
                                articleLink: "http://www.reddit.com" + result.data.permalink,
                                articleTitle: result.data.title,
                                articleCategory: result.data.subreddit,
                                impressions: result.data.ups
        };

        // COMPILE AND APPEND TEMPLATE
        var compiledTemplate = articleTemplate(articleContents);
        $("#main").append(compiledTemplate)

      })
  },

  // CREATE FUNCTION TO HANDLE THE JSON RESPONSE
  responseDigg : function(response) {
      console.log(response);
      var self = this;

      response.data.feed.forEach(function(result){

        // PUSH OBJECT WITH ALL REQUIRED ARTICLE DETAILS FOR EACH ARTICLE
        self.Digg.articles.push({
          featuredImage: result.content.media.images[0].url,
          articleLink: result.content.url,
          articleTitle: result.content.title,
          articleCategory: result.content.tags[0].display,
          impressions: result.digg_score,
          description: result.content.description,
          // MULTIPLY BY 1000 TO ADJUST TO MILLISECONDS
          dateTime: Utilities.convertDate(result.date_published * 1000)
        });

        // POPULATE TEMPLATE WITH ARTICLE CONTENT
        var articleContents = { sourceName: "digg",
                                dateTime: Utilities.convertDate(result.date_published * 1000),
                                featuredImage: result.content.media.images[0].url,
                                articleLink: result.content.url,
                                articleTitle: result.content.title,
                                articleCategory: result.content.tags[0].display,
                                impressions: result.digg_score
        };

        // COMPILE AND APPEND TEMPLATE
        var compiledTemplate = articleTemplate(articleContents);
        $("#main").append(compiledTemplate)

      })
  },

  // DISPLAYS ONLY THE ARTICLES FROM THE SOURCE CHOSEN
  filterArticles : function(source) {
    $('#' + source).on("click", function(){
      $('.article').not('.' + source).hide();
      $('.' + source).show();
      $('#current-source').html(source);
    })
  },

  // DISPLAYS ALL ARTICLES WHEN FEEDR LOGO IS CLICKED
  showAllArticles : function() {
    $('#feedr').on('click', function(){
      $('.article').show();
      $('#current-source').html('All');
    })
  },

  // GET SOURCES
  // HEROKU PROXY REQUIRED FOR CORS ISSUE. JQUERY PROXY REQUIRED TO RESET CONTEXT FROM WINDOW TO FEEDR.
  getSourceMashable : function() {
    $.get('https://accesscontrolalloworiginall.herokuapp.com/http://mashable.com/stories.json', $.proxy(Feedr.responseMashable, Feedr))
        .done(function(){ console.log( "loaded Mashable"); })
        .fail(function() { alert( "error, failed to load Mashable" ); });
  },

  getSourceReddit : function() {
    $.get('https://www.reddit.com/top.json', $.proxy(Feedr.responseReddit, Feedr))
        .done(function(){ console.log( "loaded Reddit"); })
        .fail(function() { alert( "error, failed to load Reddit" ); });
  },

  getSourceDigg : function() {
    $.get('https://accesscontrolalloworiginall.herokuapp.com/http://digg.com/api/news/popular.json', $.proxy(Feedr.responseDigg, Feedr))
        .done(function(){ console.log( "loaded Digg"); })
        .fail(function() { alert( "error, failed to load Digg" ); });
  },

  openPopUp : function(title, source) {
    $("#popUp").removeClass("hidden loader");
    var contents = Feedr.findByProperty(title, source);
    // POPULATE TEMPLATE WITH ARTICLE CONTENT
    var linkContents = {  articleLink: contents[1],
                          articleTitle: title,
                          articleDescription: contents[0]
    };

    // COMPLILE AND APPEND TEMPLATE
    var compiledLinkTemplate = linkTemplate(linkContents);
    $("#popUp").append(compiledLinkTemplate)

  },

  closePopUp : function() {
    $("#popUp").addClass("hidden loader");
    $("#popUp > .container").remove();
  },

  findByProperty : function(title, source) {
    switch (source) {
      case 'mashable':
        for(var i = 0 ; i < Feedr.Mashable.articles.length; i++){
          if(Feedr.Mashable.articles[i].hasOwnProperty("articleTitle") && Feedr.Mashable.articles[i].articleTitle === title) {
            return [Feedr.Mashable.articles[i].description, Feedr.Mashable.articles[i].articleLink];
          }
        }
        break;
      case 'reddit':
        for(var i = 0 ; i < Feedr.Reddit.articles.length; i++){
          if(Feedr.Reddit.articles[i].hasOwnProperty("articleTitle") && Feedr.Reddit.articles[i].articleTitle === title) {
            return [Feedr.Reddit.articles[i].description, Feedr.Reddit.articles[i].articleLink];
          }
        }
        break;
      case 'digg':
        for(var i = 0 ; i < Feedr.Digg.articles.length; i++){
          if(Feedr.Digg.articles[i].hasOwnProperty("articleTitle") && Feedr.Digg.articles[i].articleTitle === title) {
            return [Feedr.Digg.articles[i].description, Feedr.Digg.articles[i].articleLink];
          }
        }
        break;
      default:
        console.log("no match");
    }
  }
};

// GENERAL PURPOSE
var Utilities = {
  // CONVERTS DATE/TIME TO ISO
  convertDate : function (dateTime) {
    var x = new Date(dateTime);
    var d = x.toISOString();
    return d;
  },

};

// READY DOM
$(function() {

  // WHENEVER AN AJAX CALL IS MADE, WHILE IT IS BEING MADE THIS WILL FIRE THE LOADER ANIMATION.
  $(document).on({

    // WHILE AJAX IS GOING...
    ajaxStart: function() {
       // DISPLAYS POPUP ONLY WHILE AJAX IS LOADING
       $("#popUp").removeClass("hidden");
       $(".closePopUp").hide();
    },

    // WHILE AJAX ISN'T GOING...
     ajaxStop: function() {
       // HIDES POPUP ONCE AJAX HAS LOADED
       $("#popUp").addClass("hidden");
       $(".closePopUp").show();
       // SORTS ARTICLES CHRONOLOGICALLY
       $(".article").sort(function(a,b){
         return new Date($(a).attr("data-date")) - new Date($(b).attr("data-date"));
       }).each(function(){
         $("#main").prepend(this);
       })

       // SET UP ARTICLE FILTERS
       Feedr.filterArticles("mashable");
       Feedr.filterArticles("reddit");
       Feedr.filterArticles("digg");
       Feedr.showAllArticles();

       // TRIGGER THE POP UP
       $('article h3').on('click', function(){
            var title = this.innerHTML;
            var source = this.getAttribute("class");
            Feedr.openPopUp(title, source);
          });
       $('.closePopUp').on('click', Feedr.closePopUp);
     }
   });

  // GET JSON FEEDS FROM MASHABLE, REDDIT AND DIGG. DISPLAY MASHABLE AS DEFAULT
  Feedr.getSourceMashable();
  // .ONE, RATHER THAN .ON ENSURES IT ONLY RUNS ONCE.
  $('#reddit').one('click', Feedr.getSourceReddit);
  $('#digg').one('click', Feedr.getSourceDigg);

  // TOGGLE SEARCH FIELD ON CLICK
  $('#search-button').on('click', function(){
    $('#search').toggleClass('active');
  });

  // TOGGLE SEARCH CLICK ON <ENTER>
  $(document).keypress(function(e) {
    if(e.which == 13) {
      $('#search').toggleClass('active');
    }
  });

  // CAPTURES QUERY ON EACH CHARACTER
  $('input').on('input', function(){
    var query = ($('input').val());

    // SORTS ARTICLES BASED ON SEARCH QUERY
    $(".article").sort(function(a,b){

      var x = $( a ).text().indexOf( query ) > -1;
      var y = $( b ).text().indexOf( query ) > -1;
      return x < y ? -1 : x > y ? 1 : 0;

    }).each(function(){
      $("#main").prepend(this);
    })
  });

});