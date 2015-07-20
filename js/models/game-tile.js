define([
  'jquery',
  'underscore',
  'backbone'
],
function($, _, Backbone) {
  var CircularProduct = Backbone.Model.extend({

    initialize: function(){
      // console.log('CircularProduct Model init');
    }

  });

  return CircularProduct;

});