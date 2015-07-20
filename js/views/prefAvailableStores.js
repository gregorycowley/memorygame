define([
    'jquery',
    'underscore',
    'backbone',
    'models/store',
    'views/prefStore',
    'models/subscriber',
], 
function($, _, Backbone, StoreModel, StoreView, Subscriber){
  
  var PrefAvailableStores = Backbone.View.extend({

    getNearByStoresUrl: 'https://services2.groceryoutlet.com/DataService/public/getneareststores?',// ?long=-122.29983&lat=37.86742&count=10

    events:{},

    initialize : function(options){
      this.eventBus = options.eventBus;
      this.collection = new (Backbone.Collection.extend({}));
      this.subscriber = Subscriber;
      this.googleMapsAPIKey = options.googleMapsAPIKey;

      _.bindAll(this, 'geocodeCallback', 'getNearByStores', 'isAlreadySubscribed');

      this.listenTo(this.eventBus, 'pref.search.zipCode', this.geocodeZip, this);
      this.listenTo(this.eventBus, 'pref.geocode.success', this.getStoresByLocation, this);
      //this.listenTo(this.eventBus, 'pref.search.stores.retrieved', this.updateCollection, this);
      this.listenTo(this.collection, 'change remove add', this.render, this);
      this.listenTo(this.eventBus, 'pref.additionalStores.added', this.removeStoreFromAvailableStores, this);
      this.listenTo(this.eventBus, 'pref.prefStoreRemvoeFromSubscriber', this.addStoreFromAdditionalStores, this);
    },

    render: function(){
      var $ul = $('<ul>');

      this.collection.forEach(function(store, i){
        var storeView = new StoreView({
          model: store,
          el: $('<li>'),
          eventBus: this.eventBus,
          isAvailable: true,
          googleMapsAPIKey: this.googleMapsAPIKey
        });
        $ul.append(storeView.render().el);
      }, this);

      this.$el.html($ul);
    },

    geocodeZip: function(zip){
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': zip.toString()}, this.geocodeCallback);
    },

    geocodeCallback: function(results, status){
      if(status == google.maps.GeocoderStatus.OK){
        this.eventBus.trigger('pref.geocode.success', results);
      }
    },

    getStoresByLocation: function(results){
      var latlng = _.values(results[0].geometry.location);
      this.getNearByStores({
        count: 10,
        lat: latlng[0],
        long: latlng[1]
      })
      .done(function(models, msg){
        this.eventBus.trigger('pref.search.stores.retrieved', models, msg);
      });
    },

    getNearByStores: function(options){
      return $.ajax({
        type: "GET",
        url: this.getNearByStoresUrl,
        jsonp: "callback",
        dataType: "jsonp",
        context: this,
        data: options
      });
    },

    updateCollection: function(models, msg){
      if(msg === 'success'){
        var storeModels = [];
        var that = this;
        
        models.forEach(function(storeData){
          if( 
            this.isStoreOpen(storeData.OpenDate) &&
            !this.isAlreadySubscribed(storeData.StoreNumber)
          ){
            var storeModel = new StoreModel(storeData);
            var storeFetch = storeModel.fetchStoreByNumber();

            storeFetch.done(function(){
              that.collection.add(storeModel);
            }, this);
            storeFetch.fail(function(model){
              console.log('store fetch failed', arg1);
            });
          }
        }, this);
      }
    },

    isStoreOpen: function(openDate){
      var now = new Date().getTime();
      var isOpen = false;

      if(openDate && parseInt(openDate.replace(/[Date\,\/\,()]/g, ''), 10) < now){
        isOpen = true;
      }
      return isOpen;
    },

    isAlreadySubscribed: function(storeNumber){
      var values = [];
      var storeNumber = parseInt(storeNumber, 10);
      ['StoreA','StoreB','StoreC','StoreD','StoreE'].forEach(function(item){
        var storeNumber = this.subscriber.get(item);
        if(storeNumber){
          values.push(parseInt(storeNumber, 10));
        }
      }, this);
      return _.contains(values, storeNumber);
    },

    removeStoreFromAvailableStores: function(storeModel){
      var newStoreNumber = storeModel.get('store_number');
      var oldStoreModel = this.collection.findWhere({'store_number': newStoreNumber});

      if(oldStoreModel){
        this.collection.remove(oldStoreModel);
      }
    },

    addStoreFromAdditionalStores: function(storeModel){
      this.collection.add(storeModel);
    }

  });

  return PrefAvailableStores;
});
