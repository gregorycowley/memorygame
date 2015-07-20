define([
  'jquery',
  'underscore',
  'backbone',
  'lib/smoothScroll',
  'lib/applyToStore',
  'models/user',
  'collections/stores',
  'jQueryValidation',
  'jQueryValidationPhoneUS',
  'jQueryValidationMimetypes'
],
function($, _, Backbone, smoothScroll, applyToStore, User, Stores, jQueryValidate) {

  var WorkInAStoreForm = Backbone.View.extend({
    user: null,
    store: null,
    $viewport : null,
    
    events :{
      'click .resume-upload-btn' : 'resumeFile',
      'click .work__location-link' : 'smoothScrollEvent',
      'click .apply-store-btn' : 'applyToStoreEvent'
    },

    initialize : function(){
      var that = this;
      


      // var store_number = User.get('store_number');
      // if(store_number){ //if store_number is set...
      //   this.store = Stores.findWhere({ "store_number" : store_number })
      //   var homeEmail = this.store.get('email_address');
      //   this.$el.find('.store_address').val(homeEmail);
      // }


      $('.work-in-a-store-form').validate({
        errorClass: "has-error",
        errorElement: "p",

        rules : {          
          first_name: {
            required: true
          },
          last_name: {
            required: true
          },
          // resume_upload: {
          //   required: true
          // },
          cover_letter: {
            required: true
          },
          phone: {
            required: true,
            phoneUS: true
          },
          email: {
            required: true,
            email: true
          },
          resume_upload: {
            required: true,
            accept: 'application/pdf'
//           },
//           store_select: {
//             required: true,
//             storeselect:true 
          }
        }
      });

      Stores.on('reset', this.onUserChange, this);
      User.on('change', this.onUserChange, this);
      this.onUserChange();

      $('#resume-file').change(function(){that.resumeFileChanged();});
    },

    onUserChange: function(){
        

      if(!User || !Stores || !Stores.length) { return; }

      var store_number = User.get('store_number');

      if(store_number){ //if store_number is set...
        this.store = Stores.findWhere({ "store_number" : store_number })

        if(!this.store) { return; }

        var homeStoreTitle = this.store.get('title');
        var homeStoreAddress = this.store.get('address') + ' ' + this.store.get('city') + ', ' + this.store.get('state') + ' ' + this.store.get('zip');
        var homeStorePhone = this.store.get('phone_number');
        var homeEmail = this.store.get('email_address');

        this.$el.find("#selected_store").find('option').each(function() {
          if(store_number == $(this).attr('data-storenumber')){
            $(this).attr('selected', 'selected');
          }
        });

        this.$el.find('.store_address').val(homeEmail);
      }
    },

    resumeFile : function(){
      $('#resume-file').click();  
    },

    resumeFileChanged : function(){
      // Check for the File API support.
      var filename = "";
      if ( window.File && window.FileReader ) {
        var files = $('#resume-file').get(0).files[0]; //gets the 'file' object
        filename = files.name;
      } else {

        filename = $('#resume-file').val();
        if(filename.indexOf('fakepath') != -1) {
          filename = filename.substr(12);
        } else if(filename == '') {
          filename = 'No file selected';
        }

      }
      this.$el.find( '#resume-span' ).text( filename );
    },

    smoothScrollEvent : function(e){
        smoothScroll(e);
    },

    applyToStoreEvent : function(e){
        applyToStore(this.$el.find("#selected_store").find('option'), e);
        this.smoothScrollEvent(e);
    }
    
  });
  
  return WorkInAStoreForm;
  
});

