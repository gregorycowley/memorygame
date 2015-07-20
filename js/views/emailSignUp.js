define([
  'jquery', 
  'underscore', 
  'backbone',
  'collections/nearbyStores',
  'lib/validation',
  'text!templates/email-sign-up/create.html',
  'text!templates/email-sign-up/thankYou.html',
  'text!templates/email-sign-up/welcomeBack.html',
  'jQueryValidation'
], 
function($, _, backbone, nearbyStores, validation, editTemplate, thankYouTemplate, welcomeBackTemplate){

  var emailSignUp = Backbone.View.extend({

    cache: null,

    nearbyStores: null,

    events: {
      'submit #email-sign-up-form' : 'signUpSubmit',
      'change #EmailAddress': 'saveInputToCache',
      'change #FirstName': 'saveInputToCache',
      'change #ZipCode': 'saveZipToCache',
      'change #StoreA': 'saveStoreAToCache',
      'click #resetCache' : 'resetCache' // used for easy debugging
    },

    initialize: function(options){
      this.showMessage = options.showMessage;
      this.cache = new (Backbone.Model.extend({}));
      this.cache.set(this.getDataFromWrapper());
      this.cache.set('ID', this.getCachedID());
      this.cache.set('FirstName', this.getSubscriberFirstName());
      this.nearbyStores = nearbyStores;
      this.geocoder = new google.maps.Geocoder();

      this.setTemplate();

      _.bindAll(this, 'render', 'saveInputToCache', 'createFailure', 'showMessage', 'createSuccess', 'geoCode', 'getLocalStores');

      this.listenTo(this.cache, 'change:ZipCode', this.geoCode);
      this.listenTo(this.cache, 'change:stores', this.render);

      _.defer(this.render);
    },

    render: function() {
      var modelAndCache = { data: _.extend({}, this.cache.attributes) };
      this.$el.html( this.template( modelAndCache ) );
      return this;
    },

    /**
     * help methods
     */
    
    getDataFromWrapper: function(){
      return this.$el.data('copy');
    },

    setTemplate: function(){
      if(this.cache.get('ID')){
        this.template = _.template( welcomeBackTemplate );
      }
      else{
        this.template = _.template( editTemplate );
      }
    },

    signUpSubmit: function(event){
      event.preventDefault();
      var $els = this.$el.find('input, select');
      
      var good2Go = validation.valid( $els );
      
      if( good2Go.valid ){

        this.cache.set('Loading', true);
        this.render();

        var formData = {};
        
        $els.each(function(i, el){
          var $el = $(el);
          var name = $el.attr('name');
          var val = $.trim($el.val());
          formData[name] = val;
        });

        formData['StoreA'] = this.cache.get('StoreA');

        $.ajax({
          type: 'POST',
          url : '/api/subscribers/index.php',
          data: formData,
          dataType: 'json'
        })
        .done(this.createSuccess)
        .fail(this.createFailure);
      }
      else{
        validation.removeErrors(this);
        validation.showErrors(good2Go.errors);
        return false;
      }
    },

    createFailure: function (response) {
      this.cache.set('Loading', false);
      this.render();
      if (response.responseJSON) {
        if( response.responseJSON.Errors ){
          var keys = Object.keys(response.responseJSON.Errors);
          var errors = new Array();
          for ( var i = 0; i < keys.length;  i = i + 1){
            if ( response.responseJSON.Errors[keys[i]].length ){
              var error = {valid: false, msg: response.responseJSON.Errors[keys[i]][0] }
              errors.push(_.extend({}, error, {$el: this.$el.find('input[name=' + keys[i] + ']')}));
            }
          }
          validation.showErrors( errors );
        } else {

          this.setCachedID(response.ID);
          window.location = this.$el.find('form').data('next');
        }
      } else {
        this.showMessage("Unable to create new user");
      }
    },

    createSuccess: function(response){
      if(response.OverallStatus === "OK"){
        if(response.ID){
            if (response.message == null){
                //this.setCachedID(response.ID);
                //window.location = this.$el.find('form').data('next');
                var form = document.createElement("form");
                form.setAttribute("method", "post");
                form.setAttribute("action", "/email-sign-up");

                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", "isAFan");
                hiddenField.setAttribute("value", "1");

                form.appendChild(hiddenField);

                this.$el.append(form);
                form.submit();
            }
            else {
                this.template = _.template( thankYouTemplate );
                this.render();
            }

        } else {
          this.showMessage(response.OverallStatus + ": " + response.message + " -- Mising ID for User");

        }
      }
      else{
        this.showMessage(response.OverallStatus + ": " + response.message);
      }
    },

    saveInputToCache: function(event){
      var $el = $(event.target);
      var val = $el.val();
      var name = $el.attr('name');

      this.cache.set(name, val);
    },

    saveZipToCache: function(event){
      var $el = $(event.target);
      var val = $el.val();
      var name = $el.attr('name');
      var zipRegex = /^[0-9]{5}$/;

      if(zipRegex.test(val)){
        this.cache.set(name, val);
      }
    },

    saveStoreAToCache: function(event){
      var $el = $(event.target);
      var val = $el.val();
      var name = $el.attr('name');

      this.cache.set(name, val);
    },

    geoCode : function(model){
      this.geocoder.geocode({ 'address': model.get('ZipCode')}, this.getLocalStores);
    },

    getLocalStores: function(results, status){
      var that = this;
      if(status === google.maps.GeocoderStatus.OK){
        var latlng = _.values(results[0].geometry.location);
        var gettingStores = this.nearbyStores.getNearByStores({
          "count": 10, 
          "lat" : latlng[0], 
          "long" : latlng[1]
        });
        
        gettingStores.done(function(response, status){
          if(status === "success"){
            var now = new Date().getTime();
            var stores = _.reduce(response, function(memo, el){
              if(el.OpenDate && parseInt(el.OpenDate.replace(/[Date\,\/\,()]/g, ''), 10) < now){
                var store = {
                  "storeName" : el.StoreName,
                  "storeNumber" : el.StoreNumber
                };
                memo.push(store);
              }
              return memo;
            }, []);

            that.cache.set('stores', stores);
          }
        });
      }
    },

    // for debuggering purposes only.
    resetCache: function(){
      window.localStorage.removeItem('subscriberID');
      window.localStorage.removeItem('FirstName');
      location.reload();
    },

    getCachedID: function(){
      return window.localStorage.getItem('subscriberID');
    },

    setCachedID: function(id){
      return window.localStorage.setItem('subscriberID', id);
    },

    getSubscriberFirstName: function(){
      return window.localStorage.getItem('FirstName');
    }

  });

  return emailSignUp;
});