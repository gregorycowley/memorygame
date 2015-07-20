define([
  'jquery',
  'underscore',
  'backbone',
  'jQueryPlaceholder'
],
function($, _, Backbone) {
 
  var PlaceholderView = Backbone.View.extend({

    initialize : function(){
      $('input, textarea').placeholder();
    },

  });

  return PlaceholderView;
});
