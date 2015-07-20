define([
  'jquery',
  'underscore',
  'backbone'
],
function($, _, Backbone) {

  // var heroOffest = parseInt(hero.offset().top, 10) + 15;

  // $(window).bind('scroll',function(e){
  //   parallaxScroll();
  // });
 
  var ParallaxView = Backbone.View.extend({

    hero : $('.go_hero-jumbotron'),
    puppets : $('.hero--brand-overlay'),
    // indicators : $('.carousel-indicators'),

    events : {
      "scroll" : "parallaxScroll"
    },

    initialize: function() {
      _.bindAll(this, 'parallaxScroll');
      // bind to window
      $(window).scroll(this.parallaxScroll);
    },

    parallaxScroll : function (){
      if(!Modernizr.touch){      
        var scrolledY = $(window).scrollTop();

        $('.parallax-item').css('top', ((scrolledY* 0.5))+'px');
        this.puppets.css('top', '-' + (scrolledY* .5) + 'px');
      }
    }

  });
  
  return ParallaxView;
  
});
