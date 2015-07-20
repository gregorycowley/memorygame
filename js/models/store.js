define([
  'jquery',
  'underscore',
  'backbone',
  'localStorage'
],
function($, _, Backbone) {
  var Store = Backbone.Model.extend({
    localStorage: new Backbone.LocalStorage("Store"),

    fetchStoreDataUrl : "/api/store/",

    circularUrl : "/api/store/circular-url.php",

    storeNumberUrl : "/api/store/by-number.php",

    defaults: {
      fillerProperty: function(){ 
        return Math.floor((Math.random() * 100)); 
      },
      distance_to_store:null,
      store_image:null
    },

    initialize: function(){
      _.bindAll(this, 'updateModelAfterManualFetch');
    },

    fetchCiruclarUrl: function(){
      var storeNumber = this.get("StoreNumber");
      if(storeNumber){
        return $.ajax({
          type: "GET",
          cache: true,
          dataType: "json",
          data: {"StoreNumber": storeNumber},
          url: this.circularUrl
        });
      }
      else{
        return false;
      }
    },

    fetchStoreByNumber: function(){
      var storeNumber = this.get("StoreNumber");
      var resp = false;
      
      if(storeNumber){
        resp = $.ajax({
          type: "GET",
          cache: true,
          dataType: "json",
          data: {"StoreNumber": storeNumber},
          url: this.storeNumberUrl
        }).done(this.updateModelAfterManualFetch);
      }

      return resp;
    },

    updateModelAfterManualFetch: function(resp, status){
      if(status === "success" && !_.isEmpty(resp)){
        this.set(resp);
      }
    }

  });

  return Store;

});