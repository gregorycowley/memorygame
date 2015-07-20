
define([
  'jquery',
  'underscore',
  'backbone'
],
function($, _, Backbone) {
  
  var Product = Backbone.Model.extend({
    
    defaults: {
        "brandname":          "",
        "productname":        "",
        "upc":                "",
        "packedpercase":      "",
        "unitsize":           "",
        "itemdesc":           "",
        "numofcases":         "",
        "orglistcost":        "",
        "closeoutoffercost":  "",
        "msrp":               "",
        "reasonavail":        "",
        "remarks":             ""
    }

  });

  return Product;

});