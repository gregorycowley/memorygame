define([
  'jquery',
  'underscore',
  'backbone',
  'collections/nearbyStores',
  'collections/regionalstores',
  'text!templates/store_locator_list_item.html',
  'text!templates/store_locator_list_item_work_in_store.html',
  'text!templates/store_locator_list_item_for_ads.html',
  'accordion'
],
function($, _, Backbone, NearbyStores, RegionalStores, StoreItemTemplate, StoreItemTemplateWorkinStore, StoreItemTemplateForAds){

  var StoreListView = Backbone.View.extend({
    user: null,
    templateOpt: null,
    slugOpt: null,
    mapIconUrl: null,
    tagName: 'li',

    className : 'clearfix',

    templateStoreLocator: _.template(StoreItemTemplate),
    templateStoreLocatorWorkInStore: _.template(StoreItemTemplateWorkinStore), //second template is for the unique work-in-store/email-sign-up template.
    templateStoreLocatorForAds: _.template(StoreItemTemplateForAds),

    events: {
      'click .set-as-store': 'setUserStore',
      'click .ad-locator-btn': 'setUserStoreThenRedirect',
      'click .unset-as-store': 'unsetUserStore',
      'click .result__button--toggle' : 'toggleOpen'
    },

    initialize: function(options){
      this.user = options.user;
      this.templateOpt = options.template_opt === true ? 'work-in-store' : 'store-locator'; //determins the template.
      this.slugOpt = options.slug_opt === 'email-sign-up.php' ? 'Set As My Store' : (options.slug_opt === 'ad-locator.php') ? 'Choose' : 'Apply to this Store';
      this.isClicked = options.isClicked;
      this.eventBus = options.eventBus;

      if (options.slug_opt === 'ad-locator.php')
      {
        this.unsetUserStore();
      }

      this.$el.find('.result__button--toggle').on('hidden.bs.collapse', function () {
        console.log("Here!");
      })

      this.user.on('change:store_number', this.updateButtonStates, this);
      this.model.on('change:distance_to_store', this.updateButtonStates, this);

    },

    render: function(){
      if (this.slugOpt === 'Choose')
      {
        this.$el.html( this.templateStoreLocatorForAds(
          $.extend({},
            this.model.toJSON(),
            { currentStore : this.user.get('store_number') || null },
            {buttonText : this.slugOpt},
            {subscriberID : window.localStorage.getItem('subscriberID')}
            // { mapIconUrl : encodeURI('http://maps.googleapis.com/maps/api/staticmap?center='+this.model.get('lat')+','+this.model.get('lng')+'&zoom=16&size=100x100&maptype=roadmap&markers=color:red%7C'+this.model.get('lat')+','+this.model.get('lng')) }
          )
        ));
      }
      else if(this.templateOpt === 'work-in-store')
      { //populates the appropriate template.
        this.$el.html( this.templateStoreLocatorWorkInStore(
          $.extend({},
            this.model.toJSON(),
            { currentStore : this.user.get('store_number') || null },
            {buttonText : this.slugOpt},
            {subscriberID : window.localStorage.getItem('subscriberID')}
            // { mapIconUrl : encodeURI('http://maps.googleapis.com/maps/api/staticmap?center='+this.model.get('lat')+','+this.model.get('lng')+'&zoom=16&size=100x100&maptype=roadmap&markers=color:red%7C'+this.model.get('lat')+','+this.model.get('lng')) }
          )
        ));
      }
      else
      {
        var formatted_open_date = '';
        if (this.model.toJSON().open_date){
            var date = this.model.toJSON().open_date.replace(/-/g,"/");
            var open_date = new Date(date);
            var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            formatted_open_date = month[open_date.getMonth()] + " " + open_date.getFullYear();
        }
        this.$el.html( this.templateStoreLocator(
          $.extend({},
            this.model.toJSON(),
            { currentStore : this.user.get('store_number') || null },
            { openDate : formatted_open_date || null },
            { isClicked : this.isClicked || null },
            {subscriberID : window.localStorage.getItem('subscriberID')}
            // { mapIconUrl : encodeURI('http://maps.googleapis.com/maps/api/staticmap?center='+this.model.get('lat')+','+this.model.get('lng')+'&zoom=16&size=100x100&maptype=roadmap&markers=color:red%7C'+this.model.get('lat')+','+this.model.get('lng')) }
          )
        ));
      }

      return this;
    },

    updateButtonStates: function(){
      // console.log('get - update button states');
      if(this.user.get('store_number') !== this.model.get('store_number')){
        this.render();
      }
    },

    setUserStore: function(event){
      event.preventDefault();
      var nearStore = NearbyStores.findWhere({ "store_number" : this.model.get('store_number') }) || RegionalStores.findWhere({ "store_number" : this.model.get('store_number') });
      this.user.set({
        'store_id': this.model.get('id'),
        'store_number': this.model.get('store_number'),
        'distance_to_home_store': nearStore.get('distance_to_store')
      });

      this.user.save({
        success:function(){
          FB.XFBML.parse($('.main-nav--store-locator .location__fb-like')[0])
        }
      });

      $(event.currentTarget).addClass("hidden");
      this.$el.find('.result__copy').find('.unset-as-store').removeClass('hidden');
    },

    setUserStoreThenRedirect: function(event, artificial){
      this.setUserStore(event);
      if(!artificial){
        window.location = event.target.attributes.href.value;
      }
    },

    unsetUserStore: function(e){
      this.user.unset('store_id', true).save();
      this.user.unset('store_number').save();
      this.user.unset('distance_to_home_store').save();
    },

    toggleOpen : function(event, artificial){
      // $(event.currentTarget).closest('.result__button--toggle').toggleClass('is-open');
      this.eventBus.trigger('storeClicked', this.model);
      if (!artificial)
      {
        this.trigger('list:storeClicked',this.model);
      }
        FB.XFBML.parse();
    }

  });

  return StoreListView;
});
