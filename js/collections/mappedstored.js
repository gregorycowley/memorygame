define([
  'jquery',
  'underscore',
  'backbone',
  'models/store',
  'localStorage'
],
function($, _, Backbone, Store) {

  var MappedStores = Backbone.Collection.extend({

    localStorage: new Backbone.LocalStorage("MappedStores"),

    model: Store,

    empty: function(){
      _.chain(this.models).clone().each(function(localmodel){
        localmodel.destroy();
      });
      return this;
    }

  });

  return new MappedStores();
});