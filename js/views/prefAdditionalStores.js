define([
    'jquery',
    'underscore',
    'backbone',
    'models/subscriber',
    'models/store',
    'views/prefStore'
],
function($, _, Backbone, Subscriber, StoreModel, StoreView){
  
  var AdditionalStore = Backbone.View.extend({

    storeKeys: ['StoreB','StoreC','StoreD','StoreE'],

    events:{
      'click .additional-stores-submit' : 'saveWrapper'
    },

    initialize : function(options){
      this.showMessage = options.showMessage;
      this.subscriber = Subscriber;
      this.eventBus = options.eventBus;
      this.collection = new (Backbone.Collection.extend({}));
      this.googleMapsAPIKey = options.googleMapsAPIKey;

      _.bindAll(this, 'render', 'getFreeSubscirberStoreKey', 'removeStoreFromSubscriber', 'saveWrapper');

      //this.listenToOnce(this.subscriber, 'subscriberDataFetched', this.setupCollection, this);
      this.listenTo(this.collection, 'add remove change', this.render);
      this.listenTo(this.eventBus, 'prefStoreAddToSubscriber', this.addToAdditionalStores, this);
      this.listenTo(this.eventBus, 'prefStoreRemvoeFromSubscriber', this.removeFromSubscriber, this);

    },

    render: function(){
      var $ul = $('<ul>');
      //var $btn = $('<button type="submit" class="btn-default additional-stores-submit">Save Settings</button>');

      this.collection.forEach(function(model, i){
        var isFirstAdditional = i === 0 ? true : false;
        var store = new StoreView({
          model: model,
          el: $('<li>'),
          isFirstAdditional: isFirstAdditional,
          isAdditional : true,
          eventBus: this.eventBus,
          googleMapsAPIKey: this.googleMapsAPIKey
        });
        $ul.append(store.render().el);
      }, this);

      //this.$el.html($ul).append($btn);
      this.$el.html($ul);

      return this;
    },

    setupCollection: function(){
      var stores = [];

      this.storeKeys.forEach(function(key){
        if(this.subscriber.has(key) && !_.isEmpty(this.subscriber.get(key)) ){
          var store = new StoreModel({
            'StoreNumber': this.subscriber.get(key)
          });
          store.fetchStoreByNumber();
          stores.push(store);
        }
      }, this);
        
      this.collection.reset(stores);
    },

    removeFromSubscriber: function(model){
      var storeNumber = model.get('store_number') || model.get('StoreNumber');
      this.collection.remove( this.collection.findWhere({'store_number': storeNumber}) );
      this.removeStoreFromSubscriber(storeNumber);
    },

    removeStoreFromSubscriber: function(storeNumber){
      this.storeKeys.every(function(key){
        if(this.subscriber.get(key) == storeNumber){
          this.subscriber.set(key, null);
          return false;
        }
        return true;
      }, this);
    },

    addToAdditionalStores: function(newStore){
      // checks to see if store_number is already in collection;
      var alreadyAdded = _.chain(this.collection.models).reduce(function(memo, store){ memo.push( store.get('store_number') ); return memo; }, []).contains(newStore.get('store_number')).value();
      if(this.collection.length < 4 && !alreadyAdded){
        this.collection.add(newStore);
        this.addToSubscriber(newStore);
        this.eventBus.trigger('pref.additionalStores.added', newStore);
      }
    },

    addToSubscriber: function(model){
      var availKey = this.getFreeSubscirberStoreKey();
      var storeNumber = model.get('StoreNumber') || model.get('store_number');
      
      if(availKey && storeNumber){
        this.subscriber.set(availKey, storeNumber);
      }
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

    saveWrapper: function(){
      var that = this;
      var $spinner = $('<span class="spinner">Saving...</span>');

      this.$el.append($spinner).find('.additional-stores-submit').attr('disabled', 'disabled');

      this.subscriber.save(null, {
        success: function (data, response) {
          if(response.OverallStatus !== "OK"){
            that.showMessage(response.OverallStatus + ": " + response.message);
          }
          that.$el.find('.spinner').remove();
          that.$el.find('.additional-stores-submit').removeAttr('disabled');
        },
        error: function (request, type, errorThrown) {
          if ( type.responseJSON ){
            that.showMessage(type.responseJSON.OverallStatus + ": " + type.responseJSON.message);
          } else {
            that.showMessage(type.statusText);
          }
          that.$el.find('.spinner').remove();
          that.$el.find('.additional-stores-submit').removeAttr('disabled');
        }
      });
    }

  });

  return AdditionalStore;
});
