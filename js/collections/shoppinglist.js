define([
  'jquery',
  'underscore',
  'backbone',
  'models/user',
  'localStorage'
],
function($, _, Backbone, User) {
  var ShoppingList = Backbone.Collection.extend({

    localStorage: new Backbone.LocalStorage("ShoppingList"),

    empty: function(){
      _.chain(this.models).clone().each(function(localmodel){
        localmodel.destroy();
      });
      return this;
    }

  });
  return new ShoppingList();
});