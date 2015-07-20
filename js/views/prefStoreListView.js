define([
  'jquery',
  'underscore',
  'backbone',
  'collections/nearbyStores',
  'collections/regionalstores',
  'text!templates/pref-center/pref_store_locator_list_item.html',
  'models/subscriber',
  'models/store',
  'accordion'
],
function($, _, Backbone, NearbyStores, RegionalStores, StoreItemForPref, Subscriber, PrefStore){

  var PrefStoreListView = Backbone.View.extend({
    user: null,
    templateOpt: null,
    isPrefPage: null,
    slugOpt: null,
    mapIconUrl: null,
    tagName: 'li',

    className : 'clearfix',

    templateStoreLocatorForPref: _.template(StoreItemForPref),

    events: {
        'click .result__button--toggle' : 'toggleOpen',
        'click .js-list-remove-store-btn': 'removeStore',
        'click .js-list-add-store-btn': 'addStore'
    },

    initialize: function(options){
      this.user = options.user;
      this.isAdditional = options.isAdditional;
      this.isAvailable = options.isAvailable;
      this.isHomeStore = options.isHomeStore;
      this.isClicked = options.isClicked;
      this.eventBus = options.eventBus;

      this.subscriber = Subscriber;
      this.store = new PrefStore({});
    },

    render: function(){
      this.$el.html( this.templateStoreLocatorForPref(
          $.extend({},
              this.model.toJSON(),
              { currentStore : this.user.get('store_number') || null },
              { chosenStores : this.store || null},
              {isAvailable : this.isAvailable || null},
              {isAdditional : this.isAdditional || null},
              {isHomeStore : this.isHomeStore || null},
              {subscriberID : window.localStorage.getItem('subscriberID')}
          )
      ));
      return this;
    },

    toggleOpen : function(event, artificial){
      // $(event.currentTarget).closest('.result__button--toggle').toggleClass('is-open');
      this.eventBus.trigger('storeClicked', this.model);
      if (!artificial)
      {
        this.trigger('list:storeClicked',this.model);
      }
      FB.XFBML.parse();
    },

    removeStore:function(){
      this.eventBus.trigger('StoreRemoveFromSubscriber', this.model);
    },

    addStore: function(){
      this.eventBus.trigger('StoreAddToSubscriber', this.model);
    }

  });

  return PrefStoreListView;
});