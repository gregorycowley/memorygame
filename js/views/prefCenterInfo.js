define([
  'jquery',
  'underscore',
  'backbone',
  'models/subscriber',
  'lib/validation',
  'models/store',
  'text!templates/pref-center/infoRead.html',
  'text!templates/pref-center/infoEdit.html',
  'models/user',
], 

function($, _, Backbone, Subscriber, validation, Store, InfoReadTemplate, InfoEditTemplate, User){

  var PrefCenterInfo = Backbone.View.extend({

    model: null,

    cache: null,

    stores: null,

    getNearByStoresUrl: 'https://services2.groceryoutlet.com/DataService/public/getneareststores?',// ?long=-122.29983&lat=37.86742&count=10

    events: {
      'click #js-edit-info' : 'changeCurrentTemplateToEdit',
      'submit #pref-info-edit-form' : 'updateUserInfo',
      'keyup #ZipCode': 'saveZipToCache',
      'change #StoreA': 'setStyledSelectActiveState'
    },

    initialize: function(options){
      _.extend(this, options);

      _.bindAll(this, 'render', 'changeTemplate', 'changeCurrentTemplateToEdit', 'changeCurrentTemplateToRead', 'updateSuccess','updateFailure', 'getStoreA', 'getLocalStores', 'reformatStoresResp', 'fetchNearByStores', 'updateCacheZip');

      this.model = Subscriber;
      this.geocoder = new google.maps.Geocoder();

      if(!this.model.fetched){
        this.model.setupLocalStorage();
        if(!this.model.get('ID')){
          window.location = '/preference-center-login'
        }
      }

      this.cache = new (Backbone.Model.extend({}));
      this.template = _.template(InfoReadTemplate);
      this.cache.set('currentTemplate', 'read');

      this.listenTo(this.cache, 'change:currentTemplate', this.changeTemplate);
      this.listenTo(this.cache, 'change:storeAName', this.render);
      this.listenTo(this.model, 'change', this.render);

      this.listenTo(this.model, 'change:StoreA', this.getStoreA);

      this.listenTo(this.cache, 'change:c_ZipCode', this.geoCode);
      this.listenTo(this.cache, 'change:c_localStores', this.render);
      this.listenTo(this.model, 'change:ZipCode', this.updateCacheZip);
    },

    render: function() {
        var firstName = typeof $("#pref-info-edit-form #FirstName").val()=="undefined" ? this.model.get("FirstName") : $("#FirstName").val();
        var lastName = typeof $("#pref-info-edit-form #LastName").val()=="undefined" ? this.model.get("LastName") : $("#LastName").val();
        var phone = typeof $("#pref-info-edit-form #MobileNumber").val() == "undefined" ? this.model.get("MobileNumber") : $("#MobileNumber").val();
        var email = typeof $("#pref-info-edit-form #EmailAddress").val() == "undefined" ? this.model.get("EmailAddress") : $("#EmailAddress").val();

        this.$el.html( this.template( { data: _.extend({}, this.model.attributes, this.cache.attributes) } ) );

        if (this.cache.get('currentTemplate') == "edit"){
            $("#pref-info-edit-form #FirstName").val(firstName);
            $("#pref-info-edit-form #LastName").val(lastName);
            $("#pref-info-edit-form #MobileNumber").val(phone);
            $("#pref-info-edit-form #EmailAddress").val(email);
        }
      return this;
    },

    changeCurrentTemplateToEdit: function(){
      this.cache.set('currentTemplate', 'edit');
      jQuery("#go_pref_center__user-email, #go_pref_center__user-stores, .go_store_locator").addClass('disabled');
    },

    changeCurrentTemplateToRead: function(){
      this.cache.set('currentTemplate', 'read');
    },

    changeTemplate: function(){
      var template = this.cache.get('currentTemplate');

      switch(template){
        case 'edit':
          this.template = _.template(InfoEditTemplate);
          break;
        case 'read':
          this.template = _.template(InfoReadTemplate);
          break;
        default:
          this.template = _.template(InfoReadTemplate);
          break;
      }

      this.render();
    },

    updateSuccess: function ( object, response ){
      if(response.OverallStatus === "OK"){
        if(response.ID){
          //this.setCachedID(response.ID);
          this.changeCurrentTemplateToRead();
        } else {
          this.showMessage(response.OverallStatus + ": " + response.message + " -- Mising ID for User");
        }
      }
      else{
        this.showMessage(response.OverallStatus + ": " + response.message);
      }
    },

    updateFailure: function (request, type, errorThrown){
      this.showMessage( 'There was a problem updating your info' );
    },

    updateUserInfo: function(event){
      event.preventDefault();
      jQuery("#go_pref_center__user-email, #go_pref_center__user-stores, .go_store_locator").removeClass('disabled');
      var $els = this.$el.find('input, select');
      var good2Go = validation.valid( $els );
      if( good2Go.valid ){
        var newValues = _.reduce($els, function(memo, el){
          var $el = $(el);
          memo[$el.attr('name')] = $el.val();
          return memo;
        }, {});
        this.model.save(newValues, {
          success: this.updateSuccess,
          error: this.updateFailure
        });
      }
      else{
        validation.removeErrors(this);
        validation.showErrors(good2Go.errors);
        return false;
      }
    },

    getStoreA: function(subscriber, storeNumber){
      var storeModel = new Store({'StoreNumber': storeNumber});
      storeModel.fetchStoreByNumber();
      this.listenToOnce(storeModel, 'change:title', function(model, storeName){
          //this.model.set({"ZipCode":storeModel.get("zip")}).save();
          User.set({
              'store_id': storeModel.get('id'),
              'store_number': storeModel.get('store_number')
          });

          User.save({
              success:function(){
                  FB.XFBML.parse($('.main-nav--store-locator .location__fb-like')[0])
              }
          });
        this.cache.set({'storeAName': storeName});
        storeModel = null;
      }, this);
    },

    setStyledSelectActiveState: function (){
      var select = this.$el.find('[name="StoreA"]');
      if( select.val() == "" ) {
        select.addClass("empty");
      } else {
        select.removeClass("empty");
      }
    },

    saveZipToCache: function(event){
      var $el = $(event.target);
      var val = $el.val();
      var zipRegex = /^[0-9]{5}$/;

      if(zipRegex.test(val)){
        this.cache.set('c_ZipCode', val);
      }
    },

    updateCacheZip: function(model, zip){
      var zipRegex = /^[0-9]{5}$/;

      if(zipRegex.test(zip)){
        this.cache.set('c_ZipCode', zip);
      }
    },

    getLocalStores: function(results, status){
      if(status==='OK'){
        var latlng = _.values(results[0].geometry.location);
        this.fetchNearByStores({
          "count": 10, 
          "lat" : latlng[0], 
          "long" : latlng[1]
        }).done(this.reformatStoresResp);
      }
    },

    reformatStoresResp: function(response, status){
      if(status === "success"){
        var now = new Date().getTime();
        var stores = _.reduce(response, function(memo, el){
          if(el.OpenDate && parseInt(el.OpenDate.replace(/[Date\,\/\,()]/g, ''), 10) < now){
            var store = {
              "storeName" : el.StoreName,
              "storeNumber" : el.StoreNumber,
              "streetAddress": el.Address1
            };
            memo.push(store);
          }
          return memo;
        }, []);

        this.cache.set('c_localStores', stores);
      }
    },

    geoCode : function(cache){
      this.geocoder.geocode({ 'address': cache.get('c_ZipCode')}, this.getLocalStores);
    },

    /**
     * [getNearByStores return promise that gets near by stores]
     * @param  {[object]} { "count": int, "lat": float, "lng": float}
     * @return {[object]} jQuery Promise
     */
    fetchNearByStores: function(options){
      //make api call to get 10 nearest stores
      return $.ajax({
        type: "GET",
        url: this.getNearByStoresUrl,
        jsonp: "callback",
        dataType: "jsonp",
        data: options
      });
    }

  });

  return PrefCenterInfo;

});