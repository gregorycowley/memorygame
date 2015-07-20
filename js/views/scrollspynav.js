define([
  'jquery',
  'underscore',
  'backbone',
  'lib/smoothScroll',
  'scrollspy'
],
function($, _, Backbone, smoothScroll) {
 
  var ScrollSpy = Backbone.View.extend({
    
    events: {
      'click .fixed-nav__item--href' : 'smoothScrollEvent'
    },
    
    //Smooth scrolling.
    smoothScrollEvent: function(e){
      smoothScroll(e);
    }
    
  });
  
  return ScrollSpy;
  
});
