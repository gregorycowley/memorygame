define([
    'jquery',
    'underscore',
    'backbone',
    'models/store',
    'views/storelistview',
    'views/storemapview',
    'models/user',
    'collections/stores',
    'collections/nearbyStores',
    'collections/shoppinglist',
    'collections/regionalstores',
    'collections/mappedstored',
    'googlemaps'
],
function($, _, Backbone, Store, StoreListItemView, StoreMapView, User, Stores, NearbyStores, ShoppingList, RegionalStores, MappedStores){
  var StoreLocator = Backbone.View.extend({
    localStores: null,
    allStores : null,
    nearbyStores: null,
    mappedStores: null,
    user: null,
    mapView: null,
    getNearByStoresUrl: 'https://services2.groceryoutlet.com/DataService/public/getneareststores?',// ?long=-122.29983&lat=37.86742&count=10
    geocodeURL: 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&',
    distanceToStoreUrl: 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=95628&destinations=94111',
    listViewContainer: null,
    mapViewContainer: null,
    zipField:null,
    isWorkInStorePage:null,
    templateSlug: null,
    clickedStore: null,

    events:{
      'submit .store-locator-form':'updateUserLocation',
      'change .go-regions-select' : 'updateRegion',
      'click .region-select' : 'toggleRegionSelect'
    },

    initialize : function(){
      var that = this;
      $.support.cors = true;

      if(that.$el.find('#template-work-in-store').length){ //if id exists(if on work-in-a-store page) set var to true.
        that.isWorkInStorePage = true;
        that.templateSlug = that.$el.data('slug'); //gets page slug from WP. that will determine the storelistview button text!
      }

      that.user = User;
      that.user.fetch();

      that.allStores = Stores;
      that.allStores.loadStores();
      that.allStores.once('reset', function(){
        that.nearbyStores = NearbyStores;
        that.mappedStores = MappedStores;

        that.bootstrapNearBystores();
        that.checkForChildViews();

        User.on('change:enteredLocation', that.geoCode, that);
        User.on('change:location', that.updateNearByStores, that);

        NearbyStores.on('reset', that.renderListView, that);
        NearbyStores.on('reset', that.recenterMap, that);
        NearbyStores.on('reset', that.setDistances, that);

        RegionalStores.on('reset', that.renderListView, that);
        RegionalStores.on('reset', that.recenterMap, that);
        RegionalStores.on('reset', that.setDistances, that);

        MappedStores.on('reset', that.renderListView, that);
        MappedStores.on('reset', that.setDistances, that);

        if (that.$el.find('#zip-code').val())
        {
          that.updateUserLocation;
        }

        var proxiedgMapsEvent = $.proxy( that.getVisibleMarkers, that);
        var throttledGetVisibleMarkers = _.throttle(proxiedgMapsEvent, 1000);
        that.mapView.map.addListener('dragend', throttledGetVisibleMarkers);
        that.mapView.map.addListener('zoom_changed', throttledGetVisibleMarkers);
      });
        this.eventBus = _.clone(Backbone.Events);
        this.listenTo(this.eventBus, 'storeClicked', this.getClickedStore, this);
    },

    toggleRegionSelect: function(event){
      if( this.$el.find('.go-region-form').is(":visible") ){
        this.$el.find('.go-region-form').addClass('hidden');
        this.$el.find('.go-store-locator').removeClass('hidden');
        $(event.target).text("Region");
      }
      else{
        this.$el.find('.go-region-form').removeClass('hidden');
        this.$el.find('.go-store-locator').addClass('hidden');
        $(event.target).text("Location");
      }
    },

    updateRegion: function(event){
      var newRegion = event.target.value;
      var regionalStores = this.allStores.where({'webregion': newRegion});

      RegionalStores.reset(regionalStores);
    },

    checkForChildViews: function(){
      var that = this;

      this.$el.find('.store-map-container-js').each(function(){
        that.mapViewContainer = $(this);
        that.renderMapView();
      });

      this.$el.find('.store-list-container-js').each(function(){
        that.listViewContainer = $(this);
        that.renderListView();
      });
    },

    bootstrapNearBystores: function(){
//       if(_.isEmpty(User.get("location"))){ //if no location set by user, show default stores.
//         this.user.set('enteredLocation', '94611' );
//         this.geoCode(this.user);

//       }else{
        this.updateNearByStores(); //otherwise go with flow.
//      }
    },

    recenterMap: function(nearbyStores){
      this.mapView.centerMap(nearbyStores.at(0));
    },

    renderMapView: function(){
      var location = {};

      this.mapView = new StoreMapView({
        el : this.mapViewContainer,
        allStores : this.allStores
      });

      this.mapView.on('map:markerClicked',_.bind(this.synchronizeMapWithList,this));

      //this.mapView.centerMap(this.allStores.at(0));

    },

    renderListView: function(event){
      var $frag = $(document.createDocumentFragment());
      var stores = event === undefined ? NearbyStores.models : event.models;
      var eventBus = this.eventBus;
      var that = this;
      _.each(stores, function(store, i){
          var isClicked = false;
          var storeNumber = store.get('store_number') || store.get('StoreNumber');

          if (that.clickedStore == storeNumber){
              isClicked = true;
          }
        var storeView = new StoreListItemView({
            eventBus: eventBus,
            isClicked: isClicked,
            model: store,
            user: User,
            template_opt: this.isWorkInStorePage, //send isWorkInStorePage as an opt. to determine the template in the child view.
            slug_opt: this.templateSlug //send templateSlug as an opt. to determine the button text.
        });

        $frag.append( storeView.render().el );

        storeView.on('list:storeClicked',_.bind(this.synchronizeListWithMap, this));
      }, this);

        if (this.listViewContainer){
            this.listViewContainer.html($frag);
        }

    },

    getClickedStore:  function(storeModel){
        var storeNumber = storeModel.get("store_number") || storeModel.get("StoreModel");
        this.clickedStore = this.clickedStore!=storeNumber ? storeNumber : null;
    },

    synchronizeListWithMap: function(storeModel)
    {
      this.mapView.centerMap(storeModel,true);
      this.mapView.triggerMarker(storeModel,true);
    },

    synchronizeMapWithList: function(storeNumber)
    {
      this.listViewContainer.find('.collapse.in').removeClass('in');
      var targetButton = this.listViewContainer.find('[data-target=#'+storeNumber+']');
      this.listViewContainer.animate({scrollTop:(this.listViewContainer.scrollTop()-this.listViewContainer.offset().top+targetButton.offset().top)},300,function()
        {
          targetButton.trigger('click',true);
        }
      );
    },

    updateUserLocation: function(e){
      e.preventDefault();
      User.set('enteredLocation', this.$el.find('#zip-code').val());
    },

    geoCode : function(e){
      var that = this;
      var geocoder = new google.maps.Geocoder();

      geocoder.geocode( { 'address': e.get("enteredLocation")}, function(results, status){
        if(status == google.maps.GeocoderStatus.OK){
          var latlng = _.values(results[0].geometry.location);
          that.user.set("location", {"lat" : latlng[0], "lng" : latlng[1]} );
        }
      });
    },

    limitNearByStoresTo: function(stores, count){
      var storeModelsTemp = [];
      var i = 0;

      while(storeModelsTemp.length < count ){
        var store = stores[i];
        var nearbystore = this.allStores.findWhere({ "store_number" : store.StoreNumber });

        if(nearbystore){
          storeModelsTemp.push(nearbystore);
        }
        i++;
      }
      return storeModelsTemp;
    },

    updateNearByStores: function(){
      //get lat&lng from location
      var that = this;
      var location = User.get('location');
      if (!location.hasOwnProperty('lat'))
      {
        location = {"lat":37.81743,"lng":-122.26294};
      }
//       console.log(location);
      var params = $.extend({"count":30}, location);
      // console.log('params : ',params);
      if (params.lng)
      {
        params.long = params.lng;
        delete params.lng;
      }

      //make api call to get 10 nearest stores
      var getNearByStores = $.ajax({
        type: "GET",
        url: this.getNearByStoresUrl,
        jsonp: "callback",
        dataType: "jsonp",
        data: params
      });

      // successful store retrieval
      getNearByStores.done(function(stores){
        var limitedNearByStore = that.limitNearByStoresTo(stores, 10);
        NearbyStores.reset(limitedNearByStore);
      });
    },

    setDistances: function(nearByStoresCollection){
      var that = this;
      var origin = User.get("enteredLocation");
      var destination;
      var service = new google.maps.DistanceMatrixService();

      if(origin){
        var length = nearByStoresCollection.models.length;
        var count = 0;
        nearByStoresCollection.each(function(store){
          destination = store.get('zip');

          service.getDistanceMatrix(
            {
              origins: [origin],
              destinations: [destination],
              travelMode: google.maps.TravelMode.DRIVING
            },
            function(response, status) {
              if(status == google.maps.DistanceMatrixStatus.OK){

                var distanceInMeters = response.rows[0].elements[0].distance.value;
                distanceInMeters *= 0.000621371192; //convert to miles

                store.set('distance_to_store', distanceInMeters.toFixed(1)).save().done(function(){
                    count++;
                    if (count == length){
                        nearByStoresCollection.models.sort(function(a,b){
                            var distance_a = a.get("distance_to_store") ? parseFloat(a.get("distance_to_store")) : 0;
                            var distance_b = b.get("distance_to_store") ? parseFloat(b.get("distance_to_store")) : 0;
                            if (distance_a > distance_b){
                                return 1;
                            }
                            else if (distance_a < distance_b){
                                return -1;
                            }
                            return 0;
                        });
                        that.renderListView(nearByStoresCollection);
                    }
                });
                // console.log('nearByStoresCollection' , nearByStoresCollection.models[0].get('distance_to_store'));
              }

            }
          );
        }); // end of each
      }
    },

    getVisibleMarkers : function(){
      var map = this.mapView.map; // your map
      var markers = this.mapView.LocationCollection.models; // your markers
      var visibleStores = [];

      for (var i=0; i<markers.length; i++){
        try{
          if( map.getBounds().contains(markers[i].getLatLng()) ){
            visibleStores.push( this.allStores.findWhere({ 'store_number' : markers[i].get('store_number') }) );
          }
        }
        catch(err){}
      }
      MappedStores.reset(visibleStores);
      }

  });

  return StoreLocator;
});
