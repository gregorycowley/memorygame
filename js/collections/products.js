define([
  'jquery',
  'underscore',
  'backbone',
  'models/product',
  'localStorage'
],
function($, _, Backbone, Product) {

  var Products = Backbone.Collection.extend({
    
    localStorage: new Backbone.LocalStorage("Products"),

    model: Product,

    empty: function(){
      _.chain(this.models).clone().each(function(localmodel){
        localmodel.destroy();
      });
      return this;
    }

  });

  return new Products();
});