define([
  'jquery',
  'underscore',
  'backbone',
  'models/store',
  'localStorage'
],
function($, _, Backbone, Store) {

  var RegionalStores = Backbone.Collection.extend({

    localStorage: new Backbone.LocalStorage("RegionalStores"),

    model: Store,

    empty: function(){
      _.chain(this.models).clone().each(function(localmodel){
        localmodel.destroy();
      });
      return this;
    }

  });

  return new RegionalStores();
});