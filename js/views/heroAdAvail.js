define([
  'jquery',
  'underscore',
  'backbone',
  'models/user',
  'models/store',
  'collections/nearbyStores'
], 
function($, _, Backbone, User, Store, NearbyStores){

  var heroAdAvail = Backbone.View.extend({

    events: {
      'click .hero-enter-zip' : 'toggleHeroAdCTAs',
      'click .hero-see-local-ad--btn' : 'submitZip'
    },

    initialize: function(options){
      _.extend(this, options);
      _.bindAll(this, 'render', 'toggleHeroAdCTAs', 'submitZip');

      this.onUserChange();
    },

    render: function() {
      this.$el.html( this.template( { data: _.extend({}, this.model.attributes) } ) );

      return this;
    },

    onUserChange : function(){
      var that = this;
      var store_number = User.get('store_number');

      if(store_number){ //if store_number is set...
        var userStoreFetch = User.fetchStoreData();
        userStoreFetch.done(function(resp){
          var store = new Store(resp);
          that.$el.find('.hero-see-local-ad--link').attr('href', '/circulars/storeid/'+store.get('store_number'));
        });
      }
      else{
        that.toggleHeroAdCTAs();
      }
    },

    submitZip: function(event){
      var address = this.$el.find('#hero-zip-input').val();
      if(/^\d{5}$/.test(address)){
        this.hideZipError();
        this.getNearestStoreByZip(address);
      }
      else{
        this.showZipError();
      }
    },

    showZipError: function(){
      this.$el.find('.hero-zip-item').addClass('has-error').find('.error-msg').removeClass('hidden');
    },

    hideZipError: function(){
      this.$el.find('.hero-zip-item').removeClass('has-error').find('.error-msg').addClass('hidden');
    },

    toggleHeroAdCTAs: function(){
      this.$el.find('.hero-zip-item').removeClass('hidden');
      this.$el.find('.hero-see-local-ad--btn').removeClass('hidden');
      this.$el.find('.hero-see-local-ad--link').addClass('hidden');
      this.$el.find('.hero-enter-zip').addClass('hidden');
    },

    getNearestStoreByZip: function(address){
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': address.toString()}, function(results, status){
        if(status == google.maps.GeocoderStatus.OK){
          var latlng = _.values(results[0].geometry.location);
          User.set({
            'enteredLocation' : address.toString(), 
            'location' : {'lat':latlng[0],'lng':latlng[1]} 
          }).save();
          NearbyStores.getNearByStores({
            count: 1,
            lat: User.get('location').lat,
            long: User.get('location').lng
          }).done(function(models, msg){
            var store = models.length ? new Store(models[0]) : {};
            store.fetchCiruclarUrl().done(function(resp, status){
              if(status === "success"){
                window.location = resp.url;
              }
              return this;
            }).fail(function(resp, status){
              console.log(resp, status);
            });
          });
        }
      });
    }

  });

  return heroAdAvail;

});