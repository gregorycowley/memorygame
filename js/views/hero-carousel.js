define([
  'jquery',
  'underscore',
  'backbone',
  'carousel'
],
function($, _, Backbone) {
 
  var CarouselView = Backbone.View.extend({

    events: {
      'click .carousel__controls--prev' : 'goToPrevSlide',
      'click .carousel__controls--next' : 'goToNextSlide',
    },

    goToPrevSlide: function(){
      this.$el.carousel('prev');
    },

    goToNextSlide: function(){
      this.$el.carousel('next');
    }

  });
  
  return CarouselView;
  
});