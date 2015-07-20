define([
  'jquery',
  'underscore',
  'backbone',
  'models/store',
  'localStorage'
],
function($, _, Backbone, Store) {

  var Stores = Backbone.Collection.extend({
    
    localStorage: new Backbone.LocalStorage("Stores"),

    model: Store,

    initialize: function(){
      this.fetch();
    },

    loadStores: function() {

      // var now = new Date();
      // var cacheBust = now.getTime();
      // var url = '/stores.json';
      
      var url = '/api/stores';
      
      var resetMe = _.bind(this.reset, this);

      $.ajax( url, {
        type: 'GET',
        dataType: 'json',
        async: true,
      }).done( function(data, status, xhr) {
        resetMe(data);
      });

    }

  });

  return new Stores();
});
