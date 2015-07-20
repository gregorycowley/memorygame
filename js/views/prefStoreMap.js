define([
    'jquery',
    'underscore',
    'backbone'
], 
function($, _, Backbone){
  
  var StoreMap = Backbone.View.extend({

    currentMarker: null,

    map: null,

    initialize : function(options){
      this.eventBus = options.eventBus;

      // this.listenTo(this.eventBus, 'prefStoreMapSelected', this.updateMap);
    },

    updateMap: function(location){
      this.initMap();
      this.clearOldMarker();
      this.addMarker(location);
      this.centerMap(location);
    },

    centerMap: function(location){
      var centerLatLng = new google.maps.LatLng(location.lat, location.lng);
      this.map.setCenter(centerLatLng);
    },

    addMarker: function(location){
      var markerLatLng = new google.maps.LatLng(location.lat, location.lng);
      this.currentMarker = new google.maps.Marker({
        map: this.map,
        position: markerLatLng,
        animation: google.maps.Animation.DROP
      });
    },

    clearOldMarker: function(){
      if(this.currentMarker){
        this.currentMarker.setMap(null);
      }
    },

    createMap: function(){
      var latlng = new google.maps.LatLng(37.793276, -122.445089);

      return new google.maps.Map(
        this.$el.find('.js-pref-map-wrapper')[0], 
        {
          center: latlng,
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
      );
    },

    initMap: function(){
      if(!this.$el.is(':visible')){
        this.$el.removeClass('hidden');
      }
      if(!this.map){
        this.map = this.createMap();
      }
    }

  });

  return StoreMap;
});
