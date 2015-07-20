define([
  'jquery',
  'underscore',
  'backbone',
  'models/store',
  'localStorage'
],
function($, _, Backbone, Store) {

  var NearbyStores = Backbone.Collection.extend({

    getNearByStoresUrl: 'https://services2.groceryoutlet.com/DataService/public/getneareststores?',// ?long=-122.29983&lat=37.86742&count=10

    localStorage: new Backbone.LocalStorage("NearbyStores"),

    model: Store,

    initialize: function(){
      _.bindAll(this, 'getNearByStores');
    },

    empty: function(){
      _.chain(this.models).clone().each(function(localmodel){
        localmodel.destroy();
      });
      return this;
    },

    /**
     * [getNearByStores return promise that gets near by stores]
     * @param  {[object]} { "count": int, "lat": float, "lng": float}
     * @return {[object]} jQuery Promise
     */
    getNearByStores: function(options){
      //get lat&lng from location
      var that = this;
      
      //make api call to get 10 nearest stores
      return $.ajax({
        type: "GET",
        url: this.getNearByStoresUrl,
        jsonp: "callback",
        dataType: "jsonp",
        data: options
      });

    },

  });

  return new NearbyStores();
});