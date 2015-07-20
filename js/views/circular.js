define([
  'jquery',
  'underscore',
  'backbone',
  'models/circularproduct',
  'models/user',
  'collections/shoppinglist'
],
function($, _, Backbone, CircularProduct, User, ShoppingList) {
 
  var Circular = Backbone.View.extend({

    events: {
      "click .add-item-js": "getLiParent",
      "click .remove-item-js": "getLiParent",
      "click .hover-item": "getLiParent"
    },

    initialize: function(){
      ShoppingList.fetch();
      this.render();

      ShoppingList.on('add destroy', this.render, this);
    },

    render : function(){
      var that = this;
      var $items = that.$el.find('.go_circular-product-js');

      $items.each(function(){
        var $this = $(this);
        if( User.get('store_number') ){
          var num = $this.data('num');
          $this.find('.circular-product--product').find('.hover-item').removeClass('hidden');
          if(that.isSaved(num).length){
            that.showRemoveItemButton($this, false);
            $this.find('.circular-product--product').find('.hover-item').text('Remove From List -').addClass('is-selected');
          }
          else{
            that.showRemoveItemButton($this, true);
          }
        }
        else{
          $this.find('.circular-product--product').find('.hover-item').addClass('hidden');
          $this.find('.add-item-js').addClass('hidden');
          $this.find('.remove-item-js').addClass('hidden');
        }
      });
    },

    showRemoveItemButton: function($item, state){
      var $addBtn = $item.find('.add-item-js');
      var $removeBtn = $item.find('.remove-item-js');

      if(state){
        $addBtn.removeClass('hidden');
        $removeBtn.addClass('hidden');
      }
      else{
        $addBtn.addClass('hidden');
        $removeBtn.removeClass('hidden');
      }
    },

    //Gets the clicked element and find it's "li" parent.
    getLiParent : function(e){
      e.preventDefault();
      var closestLi = $(e.target).closest('li');
      this.toggleItemFromShoppingList(closestLi);
    },

    // Logic for item add or remove
    toggleItemFromShoppingList : function($el){
      var itemDetails = this.getItemDetails($el);
      var shoppingListItem = new CircularProduct(itemDetails);
      var matchingItems = this.isSaved(shoppingListItem.get('num'));
      
      if( matchingItems.length ){
        matchingItems[0].destroy();
        $el.find('.hover-item').removeClass('is-selected').text('Add To List +');
      }
      else{
        ShoppingList.create(shoppingListItem);
        $el.find('.hover-item').addClass('is-selected').text('Remove From List -');
      }
    },

    isSaved: function(num){
      return ShoppingList.where({ "num": num });
    },

    getItemDetails: function($item){
      var item = {};
      item.num = $item.data('num');
      item.name = $item.find('.circular-product__name').text();
      item.img_url = $item.find('.circular-product__img').attr('src');
      item.description = $item.find('.circular-product__body').text();
      item.price = $item.find('.circular-product__price .price').text();
      item.saved = $item.find('.circular-saved-on-item').text();

      return item;
    }

  });
  
  return Circular;
  
});
