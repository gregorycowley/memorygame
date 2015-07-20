define([
    'jquery',
    'underscore',
    'backbone',
    'models/user',
    'models/store',
    'collections/nearbyStores',
    'text!templates/store-dropdown.html',
    'localStorage'
],
function($, _, Backbone, User, Store, NearbyStores, StoreDropdownTemplate){
  var NavStore = Backbone.View.extend({
    store: null,
    currentStoreBtn: null,
    template: _.template(StoreDropdownTemplate),
    viewAdBtnSltr: '.main-nav__view-ad',

    events: {
      'click .unset-home-store' : 'unsetHomeStore'
    },

    initialize: function( options ){
      _.extend(this, options);
      var that = this;
      User.on('change', this.onUserChange, this);

      NearbyStores.fetch();
      User.fetch({
        success: function(model, response, options){
          if(response.length){
            User.set(response[0]);
          }
          else{
            that.onUserChange();
          }
        }
      });
    },

    onUserChange: function(){
      var that = this;
      var store_number = User.get('store_number');
      var usrStoreid = User.get('store_id');

      if(usrStoreid){ //if store_number is set...
        var userStoreFetch = User.fetchStoreData();

        userStoreFetch.done(function(resp){
          that.store = new Store(resp);
          var nearStore = NearbyStores.findWhere({ "store_number" : store_number });
          var nearStoreDistance = nearStore ? nearStore.get('distance_to_store') : 'distance';

          that.currentStoreBtn = that.$el.find('.main-nav--store-locator > button');
          var currentStoreCopy = that.currentStoreBtn.find('.store-locator__copy');

          var formattedDate = that.getFormatedDate(that.store.get('open_date'));
          var formattedNumber = that.getFormatedNumber(that.store.get('store_number'), 3);

          that.$el.find('.main-nav--store-locator >a').addClass('hidden');

          if(that.store.get('guid') && that.store.get('circular_scheduled') === 'published'){
            that.$el.find(that.viewAdBtnSltr).removeClass('hidden').find('a').attr('href', '/circulars/storeid/'+that.store.get('store_number'));
          }

          that.currentStoreBtn.removeClass('hidden').find('.store-locator__copy').text(that.store.get('title'));

          if(that.store.get('circular_scheduled') === 'published' || that.store.get('circular_scheduled') === 'past'){
            that.$el.find('.main-nav--shopping-list > button').removeClass('hidden');
          }else{
            that.$el.find('.main-nav--shopping-list > button').addClass('hidden');
          }

          that.$el.find('.dropdown-frag').html( that.template( $.extend({}, {
            store : that.store.toJSON(), 
            nearStoreDistance : User.toJSON(), 
            formattedDate : formattedDate, 
            formattedNumber : formattedNumber
          } ) ) );
        });
      }
      else{
        that.$el.find('.main-nav--shopping-list >button').addClass('hidden');
        that.$el.find('.main-nav--store-locator >button').addClass('hidden');
        that.$el.find('.main-nav--store-locator >a').removeClass('hidden');
        that.$el.find(that.viewAdBtnSltr).addClass('hidden');
      }
    },

    getFormatedNumber : function(storeNumber, max){ //converts a store number into a 3 digit number. (e.g: 1 => 001, 79 => 079.)
      storeNumber = storeNumber.toString();
      return (max - storeNumber.length > 0) ? new Array(max + 1 - storeNumber.length).join('0') + storeNumber: storeNumber;
    },

    unsetHomeStore : function(){
        this.$el.
          find('.main-nav--store-locator >a').
          removeClass('hidden');

        this.$el.find('.main-nav--shopping-list >button').addClass('hidden');
        this.currentStoreBtn.addClass('hidden');
        // this.$el.find('.main-nav--store-locator').removeClass('open is-open');
        User.set({'store_number': null, 'store_id' : null}).save();
        $(document).trigger('click');
    },

    getFormatedDate : function(rawDate){
      rawDate = new Date(rawDate.replace(/-/g, "/"));
      var monthNames = [ "January", "February", "March", "April", "May", "June",
                         "July", "August", "September", "October", "November", "December" ];
      var formattedDate = monthNames[rawDate.getMonth()] + ' ' + parseInt(rawDate.getFullYear());
      return formattedDate;
    }

  });

  return NavStore;
});
