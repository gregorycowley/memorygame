define([
    'jquery',
    'underscore',
    'backbone',
    'models/user',
    'models/store',
    'googlemaps'
  ], 
  function($, _, Backbone, User, Store){
    var ViewLocalAd = Backbone.View.extend({
    
    user:null,
      
    events:{
      'focus #ad_zipcode':'beginListening',
      'blur #ad_zipcode':'stopListening'
    },

    initialize : function(options){
      this.user = User;

      this.setState();
      this.user.on('change', this.setState, this);
      this.$el.find('#ad_zipcode').val('');
    },

    setState: function(){
      var that = this;
      var usrStoreNum = this.user.get('store_number');
      var usrStoreid = this.user.get('store_id');

      if(!this.$el.hasClass('future-override')){
        if(usrStoreid){
          var userStoreData = this.user.fetchStoreData();
          userStoreData.done(function(msg){
            var store = new Store(msg);
            var url = store.get('store_number');
            var isScheduled = (store.get('circular_scheduled') == 'scheduled');
      
            if (url != null && isScheduled == true)
            { //if scheduled circular
              var scheduled_date = store.get('circular_scheduled_date');

              that.$el.
                removeClass('hidden').
                addClass('scheduled-circular-parent').
                find('.local-ad__copy--text').
                text('The next ad will be available on ' + scheduled_date);
              return;
            }
            else if (url != null) //home store set AND has a circular.
            {
              that.$el.removeClass('hidden').removeClass('no-home').addClass('has-home').find('a.home-store-ad').attr('href', '/circulars/storeid/'+url);
            }
          });
          userStoreData.fail(function(){
            console.error('userStoreData fail');
          });
        }
        else{
          this.$el.removeClass('hidden').addClass('no-home');
        }
      }
    },

    beginListening: function()
    {
      this.$el.find('#ad_zipcode').on('keyup',_.bind(this.validateForm, this));
    },

    endListening: function()
    {
      this.$el.find('#ad_zipcode').off('keyup',_.bind(this.validateForm, this));
    },

    validateForm: function()
    {
      this.$el.find('.error-msg').remove();
      this.$el.find('#ad_zipcode').removeClass('has-error');
    
      var that = this;
      var zipValue = parseInt(this.$el.find('#ad_zipcode').val());

      var error = '';
      if (this.$el.find('#ad_zipcode').val() == '')
      {
        error = 'You must fill in your ZIP code.';
      }
      else if (Math.ceil(Math.log(zipValue + 1) / Math.LN10) != 5)
      {
        error = 'Please enter a valid 5-digit ZIP code.';
      }
      
      if (error.length)
      {
        this.$el.find('#ad_zipcode').addClass('has-error');
        this.$el.find('.ad_zip_selector').append('<div class="error-msg">'+error+'</div>');
      }
      else
      {
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': zipValue.toString()}, function(results, status){
          if(status == google.maps.GeocoderStatus.OK){
            var latlng = _.values(results[0].geometry.location);
            that.$el.find('#lat').val(latlng[0]);
            that.$el.find('#long').val(latlng[1]);
            that.user.set({
              'enteredLocation' : zipValue.toString(), 
              'location' : {'lat':latlng[0],'long':latlng[1]} 
            }).save();
            that.$el.find('#submit').removeAttr('disabled');
          }
          else
          {
            this.$el.find('#ad_zipcode').addClass('has-error');
            this.$el.find('.ad_zip_selector').append('<div class="error-msg">That is not a valid ZIP code.</div>');
          }
        });
      }
    }

  });

  return ViewLocalAd;
});