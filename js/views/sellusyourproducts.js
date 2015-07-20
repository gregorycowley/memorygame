define([
  'jquery',
  'underscore',
  'backbone',
  'text!templates/sell-us-your-products-user-summary.html',
  'text!templates/sell-us-your-products-product-summary.html',
  'jQueryPlaceholder'
],
function($, _, Backbone, UserSummaryTemp, ProductSummaryTemp) {
  var convertInputsToObj = function($arrOfInputs){
    var obj = {};
    $arrOfInputs.each(function(i, el){
      var $el = $(el);
      if ($el.data('name') == 'go_uploadattachment')
      {
        var filename = el.value;
        if (filename.indexOf('fakepath') != -1)
        {
          filename = filename.substr(12);
        }
        obj[$el.data('name')] = filename;
      }
      else
      {
        obj[$el.data('name')] = $el.val();
      }
    });
    return obj;
  };

  var SellUsYourProducts = Backbone.View.extend({

    events: {
      'click .form-submit-user'             : 'captureUserForm',
      'click .form-submit-products'         : 'captureProductForm',
      'click .submit-form-data'             : 'submitProductsForm',
      'click .add-product'                  : 'addProduct',
      'click .remove-product-button'        : 'removeProduct',
      'click .upload-btn'                   : 'uploadFile',
      'submit .sell-us-your-products-form'  : 'captureFormSubmit',
      'click .edit-user-info-btn'           : 'showUserEdit',
      'click .edit-product-info-btn'        : 'showProductEdit'
    },

    initialize: function(){
      this.$el.find('input, textarea').placeholder();
    },

    captureFormSubmit: function(event){
      if( $(event.target).find("[name='complete']").val() === "true"){
        return true;
      }
      else{
        event.preventDefault();
        return false;
      }
    },

    captureUserForm: function(event){
      event.preventDefault();
      var good2Go = this.valid( this.$el.find('.user-edit-wrapper').find('input, select') );
      if( good2Go.valid ){
        this.showUserSummary( this.renderUserSummary() );
        this.showProductEdit();
        this.$el.find('input, textarea').placeholder();
      }
      else{
        this.removeErrors(this.$el.find('.user-edit-wrapper'));
        this.showErrors(good2Go.errors);
      }
    },

    captureProductForm: function(event){
      event.preventDefault();
      var good2Go = this.valid( this.$el.find('.product-edit-wrapper').find('input, select') );
      if( good2Go.valid ){
        this.$el.find('.section-wrapper').addClass('hidden');
        this.showProductSummary( this.renderProductSummary() );
        this.$el.find('input, textarea').placeholder();
        window.scrollTo(0, 0);
      }
      else{
        this.removeErrors(this.$el.find('.product-edit-wrapper'));
        this.showErrors(good2Go.errors);
      }
    },

    submitProductsForm: function(){
      this.$el.find("[name='complete']").val("true");
      this.$el.find('.sell-us-your-products-form').submit();
      this.$el.off('change', 'input[type="file"]');
    },

    showUserEdit: function(){
      this.$el.find('.section-wrapper').addClass('hidden');
      this.$el.find('.user-edit-wrapper').removeClass('hidden');
      this.$el.off('change', 'input[type="file"]');
    },

    showProductEdit: function(){
      this.$el.find('.section-wrapper').addClass('hidden');
      this.$el.find('.product-edit-wrapper').removeClass('hidden');

      // attaches event to file field after div is visible.
      var uploadFileChangedProxy = $.proxy(this.uploadFileChanged, this);
      this.$el.find('input[type="file"]').change( uploadFileChangedProxy );
    },

    showUserSummary: function(markup){
      this.$el.find('.sell-us-your-products-user-summary').html(markup).removeClass('hidden');
      this.$el.off('change', 'input[type="file"]');
    },

    showProductSummary: function(markup){
      this.$el.find('.summary-wrapper').removeClass('hidden').find('.sell-us-your-products-product-summary').html(markup);
      this.$el.off('change', 'input[type="file"]');
    },

    valid: function($inputs){
      var that = this;
      var errors = [];
      $inputs.each(function(i, input){
        var $input = $(input);
        if($input.data('validations')){
          var validations = $input.data('validations').split(' ');
          _.each(validations, function(methodName){
            var value = $input[0].type === "checkbox" ? $input.prop('checked') : $input.val();
            var response = that.validate[methodName]( value );
            if(!response.valid){
              errors.push( _.extend({}, response, {$el : $input}) );
            }
          });
        }
      });

      if(errors.length === 0){
        return {valid: true}
      }
      else{
        return {"valid": false, "errors": errors}
      }
    },

    validate: {
      existance: function(value){
        if(value.length || value){
          return {valid: true};
        }
        else{
          return {valid: false, msg: "This field is required."};
        }
      },
      email: function(value){
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(re.test(value)){
          return {valid: true};
        }
        else{
          return {valid: false, msg: "Please enter a valid email address."};
        }
      }
    },

    addProduct: function(event){
      event.preventDefault();
      var $productEditTemplate = this.$el.find('.productedit-form').first().clone();
      var uploadFileChangedProxy = $.proxy(this.uploadFileChanged, this);

      $productEditTemplate.find('input, select').val('');

      var $fileField = $productEditTemplate.find('input[type="file"]');
      $fileField.replaceWith( $fileField = $fileField.val('').clone(true) );
      $productEditTemplate.find('.attachement-span').text('Nothing Selected');

      $productEditTemplate.find('.remove-product-button').removeClass('hidden');
      $productEditTemplate.find('input, select, label').each(function(i, el){
        var $el = $(el);
        if($el.attr('for')){
          $el.attr('for', $el.attr('for').replace('[0]', '[1]') );
        }
        if($el.attr('id')){
          $el.attr('id', $el.attr('id').replace('[0]', '[1]') );
        }
        if($el.attr('name')){
          $el.attr('name', $el.attr('name').replace('[0]', '[1]') );
        }
      });

      $productEditTemplate.find('input[type="file"]').change( uploadFileChangedProxy );
      $productEditTemplate.prepend('<hr>');
      $(event.target).addClass('hidden')
      this.$el.find('.productedit-form').first().after($productEditTemplate);
    },

    removeProduct: function(event){
      event.preventDefault();
      this.$el.find('.add-product').first().removeClass('hidden');
      $(event.target).closest('.productedit-form').remove();
    },

    renderUserSummary : function () {
      var userInputs = convertInputsToObj( this.$el.find('.user-edit-wrapper').find('input, select') );
      return _.template(UserSummaryTemp, {user: userInputs});
    },

    renderProductSummary : function(){
      var productsArr = [];
      this.$el.find('.product-edit-wrapper').find('.productedit-form').each(function(i, product){
        productsArr.push( convertInputsToObj( $(product).find('input, select') ) );
      });

      return _.template(ProductSummaryTemp, {"products": productsArr});
    },

    removeErrors: function($section){
      $section.find('.input-group').find('.error-msg').remove();
      $section.find('.input-group').removeClass('has-error');
    },

    showErrors: function(errors){
      _.each(errors, function(error, i){
        error.$el.closest('.input-group').addClass('has-error');
        if(error.$el.next('span').length){
          error.$el.next('span').addClass('error-msg').text(error.msg);
        }
        else{
          error.$el.after( $("<span>").addClass('error-msg').text(error.msg) );
        }
      });
    },

    uploadFile : function(event){
      var $el = $(event.target);
      $el.siblings(".sell-us-your-products-file-field").click();
    },

    uploadFileChanged : function(event){
      var target = event ? event.target : window.event.srcElement;
      //  Check for the File API support.
      var filename = "";
      if ( window.File && window.FileReader ) {
        var files = $(event.target).get(0).files[0]; //gets the 'file' object
        filename = files.name;
      } 
      else {
        filename = event.target.value;
        if(filename.indexOf('fakepath') != -1)
        {
          filename = filename.substr(12);
        }
        else if(filename == '')
        {
          filename = 'No file selected';
        }
      }
      var extension = filename.split('.').pop();
      if (['doc','docx','xls','xlsx','jpg','jpeg','pdf','png'].indexOf(extension) == -1)
      {
        filename = 'No file selected';
        $(target).parent().append('<span class="error-msg">Uploaded file must be a DOC, XLS, PDF, JPG, PNG.</span>');
      }
      else
      {
        $(target).parent().find('.error-msg').remove();
      }
      $(target).prev().text( filename );
    }
  });

  return SellUsYourProducts;
});