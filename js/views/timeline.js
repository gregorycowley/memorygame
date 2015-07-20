define([
  'jquery',
  'underscore',
  'backbone',
  'qtip2'
],
function($, _, Backbone) {
 
  var TimelineView = Backbone.View.extend({

    events : {
//       "scroll" : "timelineParallax"
    },

    initialize: function() {
      this.timelineParallax();
      this.$el.css('background-image','url("../../wp-content/themes/go/app/build/assets/img/backgrounds/circular-bg.min.png")');
      _.bindAll(this, 'timelineParallax');
      // bind to window
      $(window).scroll(this.timelineParallax);
      this.$el.find('.timeline__image-wrapper img').qtip(
        {
          content:
          {
            text:  function(event, api)
            {
              return $(this).parent().clone();
            }
          },
          position:
          {
            my: 'top left',
            at: 'top left',
            target: 'event'
          },
          hide:
          {
            fixed: true
          }
        }
      );
    },

    timelineParallax : function (){
      if(!Modernizr.touch){
        var scrolledY = $(window).scrollTop();
        var topOffset = this.$el.offset().top;
//         console.log(scrolledY);

//         this.$el.css('background-position', 'center '+(topOffset - (scrolledY * .36))+'px');
        this.$el.find('.timeline__balloon').css('margin-top',scrolledY*.25+'px');
      }
    }

  });
  
  return TimelineView;
  
});