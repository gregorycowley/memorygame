define([
  'jquery',
  'underscore',
  'backbone',
  'models/user',
  'collections/shoppinglist',
  'text!templates/shoppinglistmenuitem.html',
  'views/plugins.jquery'
],
function($, _, Backbone, User, ShoppingList, ShoppingListMenuItemTemplate) {
 
  var ShoppingListMenu = Backbone.View.extend({

    shoppingListBadge: null,

    template: ShoppingListMenuItemTemplate,

    events: {
      'click .shopping-list-item-remove' : 'removeItem',
      'submit form' : 'submitShoppingList'
    },

    initialize: function(){
      ShoppingList.fetch();
      this.render();
  
      ShoppingList.on('add destroy reset', this.render, this);
      User.on('change:store_number', this.emptyList, this);
    },

    render : function(){
      this.updateBadge();
      this.updateShoppingListDropdown();
    },

    emptyList: function(){
      ShoppingList.empty();
    },

    updateShoppingListDropdown: function(){
      this.$el.find('.main-nav-dropdown-js').html( _.template( this.template, {items:ShoppingList.toJSON()} ) );
    },

    updateBadge: function(){
      this.$el.find('.shopping-list__badge').text(_.size(ShoppingList.models));
    },

    removeItem: function(e){
      e.stopPropagation();
      var num = $(e.target).parent().data('num');
      ShoppingList.findWhere({num: num}).destroy();
    },

    submitShoppingList: function(e){
      e.preventDefault();
      var that = this;
      var emailValidate = function(value){
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(re.test(value)){
          return true;
        }
        else{
          return false;
        }
      };
      var shoppingListSubmitUrl = this.$el.find('.main-nav--shopping__list').attr('action');
      var emailAddress = this.$el.find('input[name="go_shopping_list_email"]').val();
      var $products = this.$el.find('input[name^="go_product"]');
      var productFields = this.$el.find('input[name^="go_product"]').serializeObject();
      var emailValid = emailValidate(emailAddress);

      if(emailValid && $products.length){
        this.$el.find('.email-shopping-list-msg').text('');
        this.$el.find('input[name="go_shopping_list_email"]').next('.error-msg').text("");
        productFields.go_email_address = emailAddress;
        var shoppingListAjax = $.post( shoppingListSubmitUrl, productFields );
        shoppingListAjax.done(function(resp){
          var response = JSON.parse(resp);
          if(!response.success){
            that.$el.find('.email-shopping-list-msg').text('There was a problem emailing your shopping list. Please try again later. Sorry about the inconvenience.');
          }
        });
        shoppingListAjax.fail(function(){
          that.$el.find('.email-shopping-list-msg').text('There was a problem emailing your shopping list. Please try again later. Sorry about the inconvenience.');
        });
        that.$el.find('.email-shopping-list-msg').text('Your shopping list has been emailed.');
      }
      if(!emailValid){
        that.$el.find('input[name="go_shopping_list_email"]').next('.error-msg').text("Please enter a valid email address.");
      }
    }

  });
  
  return ShoppingListMenu;
  
});