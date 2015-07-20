define([
        'jquery',
        'underscore',
        'backbone',
        'models/store',
        'views/prefStoreListView',
        'views/storemapview',
        'models/user',
        'collections/stores',
        'collections/nearbyStores',
        'collections/shoppinglist',
        'collections/regionalstores',
        'collections/mappedstored',
        'models/subscriber',
        'text!templates/pref-center/prefPrimaryStoreTemplate.html',
        'googlemaps'
    ],
    function($, _, Backbone, Store, StoreListItemView, StoreMapView, User, Stores, NearbyStores, ShoppingList, RegionalStores, MappedStores, Subscriber, PrimaryStoreTemplate){
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
            clickedStore: null,
            storeKeys: ['StoreB','StoreC','StoreD','StoreE'],
            additionalKeys: [],
            storeA: new Store({}),

            events:{
                'submit .store-locator-form':'updateUserLocation',
                'change .go-regions-select' : 'updateRegion',
                'click .js-remove-store-btn' : 'removeStoreFromAdditionalList',
                'click .js-select-home-store' : 'selectHomeStore'
            },

            initialize : function(){
                var that = this;
                $.support.cors = true;

                that.subscriber = Subscriber;
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

                that.primaryStoreTemplate = _.template(PrimaryStoreTemplate);
                that.additionalStoresTemplate = '';

                this.eventBus = _.clone(Backbone.Events);
                this.listenToOnce(this.subscriber, 'subscriberDataFetched', this.getStorekey, this);
                this.listenTo(this.eventBus, 'StoreAddToSubscriber', this.addToAdditionalStores, this);
                this.listenTo(this.eventBus, 'StoreRemoveFromSubscriber', this.removeFromSubscriber, this);
                this.listenTo(this.eventBus, 'storeClicked', this.getClickedStore, this);
                this.listenTo(this.subscriber, 'change', this.getStorekey, this);
                this.listenTo(this.subscriber, 'change:StoreA', this.renderStoreA, this);
            },

            renderStoreA: function(){
                var that = this;
                this.storeA.set( 'StoreNumber', this.subscriber.get('StoreA'), { silent: true});
                var storeFetched = this.storeA.fetchStoreByNumber();
                storeFetched.done(function(){
                    var options = { data: that.storeA.toJSON() };
                    options.data.isPrimary = true;
                    options.data.googleMapsAPIKey = this.googleMapsAPIKey;
                    $(".go_pref_center--expand .go_pref_center__pref_stores").html(that.primaryStoreTemplate(options));
                })
            },

            renderAdditionalStores: function(){
                var that = this;
                $(".go_pref_center--expand .go_pref_center__additional_stores").html('');
                that.additionalKeys.forEach(function(storeNumber){
                    var store = that.allStores.findWhere({ "store_number" : storeNumber });
                    var options = { data: store.toJSON() };
                    options.data.isAdditional = true;
                    options.data.googleMapsAPIKey = this.googleMapsAPIKey;
                    $(".go_pref_center--expand .go_pref_center__additional_stores").append(that.primaryStoreTemplate(options));
                });
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
                this.updateNearByStores();
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
                    var isAdditional = false;
                    var isAvailable = true;
                    var isHomeStore = false;
                    var homeStore = that.subscriber.get("StoreA");
                    var storeNumber = store.get('store_number') || store.get('StoreNumber');
                    if (that.additionalKeys.indexOf(storeNumber) >= 0){
                        isAdditional = true;
                        isAvailable = false;
                    }
                    else if (storeNumber == homeStore){
                        isAdditional = isAvailable = false;
                        isHomeStore = true;
                    }
                    if (that.clickedStore == storeNumber){
                        isClicked = true;
                    }
                    var storeView = new StoreListItemView({
                        eventBus: eventBus,
                        model: store,
                        user: User,
                        isHomeStore: isHomeStore,
                        isAdditional: isAdditional,
                        isAvailable: isAvailable,
                        isClicked: isClicked
                    });

                    $frag.append( storeView.render().el );

                    storeView.on('list:storeClicked',_.bind(this.synchronizeListWithMap, this));
                }, this);

                if (this.listViewContainer){
                    this.listViewContainer.html($frag);
                }

                this.renderAdditionalStores();
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
                var params = $.extend({"count":30}, location);
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
            },

            getStorekey:function(){
                var that = this;
                that.additionalKeys = [];
                this.storeKeys.every(function(key){
                    if(this.subscriber.has(key) && !_.isEmpty(this.subscriber.get(key)) ){
                        that.additionalKeys.push(this.subscriber.get(key));
                    }
                    return true;
                }, this);
                that.renderListView();
            },

            getFreeSubscirberStoreKey: function(){
                var availKey = null;
                this.storeKeys.every(function(key){
                    if(!this.subscriber.has(key) || _.isEmpty(this.subscriber.get(key)) ){
                        availKey = key;
                        return false
                    }
                    return true;
                }, this);

                return availKey;
            },
            addToAdditionalStores: function(newStore){
                this.addToSubscriber(newStore);
            },
            removeFromSubscriber: function(store){
                $(".additional-stores-error.pref-center-popup").hide();
                var storeNumber = store.get('store_number') || store.get('StoreNumber');
                this.removeStoreFromSubscriber(storeNumber);
            },
            addToSubscriber: function(model){
                var that = this;
                var availKey = this.getFreeSubscirberStoreKey();
                var storeNumber = model.get('StoreNumber') || model.get('store_number');

                if(availKey && storeNumber){
                    this.subscriber.set(availKey, storeNumber).save();
                    $(".additional-stores-error.pref-center-popup").hide();
                }
                else {
                    var error = "<div>ERROR:</div><div>You have already selected 5 stores</div><div>Please remove a store before you can add another.</div>"
                    $(".additional-stores-error .add-store-error").html(error);
                    $(".additional-stores-error").show();
                    if (!$(".see-my-store").hasClass('active')){
                        $(".see-my-store").trigger('click');
                    }
                }
            },
            removeStoreFromSubscriber: function(storeNumber){
                this.storeKeys.every(function(key){
                    if(this.subscriber.get(key) == storeNumber){
                        this.subscriber.set(key, null);
                        return false;
                    }
                    return true;
                }, this);
                this.subscriber.save();
            },
            removeStoreFromAdditionalList: function(event){
                var storeNumber = $(event.currentTarget).attr("data-store-number");
                this.removeStoreFromSubscriber(storeNumber);
            },
            selectHomeStore: function(event){
                var storeNumber = $(event.currentTarget).attr("data-store-number");

                if(storeNumber){
                    this.subscriber.set('StoreA', storeNumber);
                    this.removeStoreFromSubscriber(storeNumber);
                }
            }

        });

        return StoreLocator;
    });
