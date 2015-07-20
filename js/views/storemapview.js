define([
    'jquery',
    'underscore',
    'backbone',
    'models/user',
    'gmapsClusterer',
    'googlemaps'
], 
function($, _, Backbone, User, MarkerClusterer){
  var StoreLocator = Backbone.View.extend({

    map : null,
    infoWindow: null,
    user: null,
    markerCache: null,

    markerCollectionView: null,

    initialize : function(options){
      this.allStores = options.allStores;
      this.infoWindow = new google.maps.InfoWindow();
      this.user = User;
      // console.log('User: ',this.user);
      
      this.setupMap();
      this.setupLocationsCollection();
      this.setupLocationsView();
      // this.renderMarkers();
    },

    setupMap: function(){
     var latlng = ($('#lat').length) ? new google.maps.LatLng($('#lat').val(), $('#long').val()) : new google.maps.LatLng(37.793276, -122.445089);
//       var latlng = new google.maps.LatLng($('#lat').val(), $('#long').val());
      this.map = new google.maps.Map(
        this.el, 
        {
          center: latlng,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
      );
    },

    setupLocationsCollection: function(){
      this.LocationCollection = new Backbone.GoogleMaps.LocationCollection(this.allStores.toJSON());
    },

    setupLocationsView: function(){
      markers = [];
      this.markerCache = {};
      
      for (var i = 0, l = this.allStores.length; i<l; i++) {
        var that = this;
        var latLng = new google.maps.LatLng(this.allStores.models[i].get('lat'), this.allStores.models[i].get('lng'));
        var marker = new google.maps.Marker({
          'position': latLng,
          'icon': js_image_folder + 'icon_go.png'
        });
        
        var markup = $('<div class="infowindow__content"><strong>'+this.allStores.models[i].get('title')+'</strong></div>');
        if ($('[data-slug]').length && $('[data-slug]').data('slug') == 'ad-locator.php')
        {
          markup.append('<br/><span>'+this.allStores.models[i].get('address')+'</span>');
          markup.append('<br/><span>'+this.allStores.models[i].get('city')+', '+this.allStores.models[i].get('state')+'<br/>'+this.allStores.models[i].get('zip')+'</span>');
          markup.append('<br/><a href="'+this.allStores.models[i].get('guid')+'" class="btn-default ad-locator-btn" data-storenumber="'+this.allStores.models[i].get('store_number')+'">Choose</a>');
        }
        
        this.createInfoWindow( marker, $(markup)[0], this.allStores.models[i].get('store_number') );
        
        markers.push(marker);
        this.markerCache[this.allStores.models[i].get('store_number')] = marker;
      }
      
      this.markerView = new MarkerClusterer(this.map, markers);
    },

    createInfoWindow : function(marker, popupContent, storeNumber) {
      var that = this;
      google.maps.event.addListener(marker, 'click', function (artificial) {
        that.infoWindow.setContent(popupContent);
        that.infoWindow.open(that.map, this);
        if (typeof artificial !== 'boolean')
        {
          that.trigger('map:markerClicked',storeNumber);
        }
      });
      google.maps.event.addListener(that.infoWindow, 'domready', function(){
        $(this.getContent()).find('a').on('click',function(event){
          event.preventDefault();

          var storenum = $(event.target).data('storenumber').toString();
          var store = that.allStores.findWhere({'store_number': storenum});

          that.user.set({
            'store_number':           storenum,
            'store_id':               store.get('id'),
            'distance_to_home_store': store.get('distance_to_store')
          }).save();

          window.location = event.target.attributes.href.value;
        });
      });
    },

    setStore: function(e)
    {
      e.preventDefault();
      // console.log('clicked!',e);
    },

    renderMarkers: function(){
      // this.markerView.render();
    },

    centerMap : function(store,zoom){
      // console.log('center map',store);
      this.map.setCenter( new google.maps.LatLng( store.get('lat'), store.get('lng') ));
      if (zoom)
      {
        this.map.setZoom(12);
      }
    },
    
    triggerMarker: function(store, artificial)
    {
      var storenum = store.get('store_number');
      google.maps.event.trigger(this.markerCache[storenum],'click', artificial);
    }

  });

  return StoreLocator;
});