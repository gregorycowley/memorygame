define([
    'jquery',
    'underscore',
    'backbone',
    'models/game',
    'views/gameboardtile'
],
    function ($, _, Backbone, GameModel, GameBoardTileView) {

        var GameBoardView = Backbone.View.extend({

            el: '.game-board',

            rows: 5,

            columns: 5,

            parent: null,

            rowTemplate: '<div class="game-row"></div>',

            gridArray: [],

            model: 'null',

            events: {

            },

            initialize: function (options) {
                
                this.initGrid(this.rows, this.columns);
                this.model.set({
                    'tiles': this.gridArray
                })
                
                this.model.on('change', this.render, this);
            },

            render: function () {
                
            },

            initGrid: function (rows, columns) {
                var that = this;
                var rowArray = null;
                var tile = null;
                var tileRow = null;
                var count = 0;

                // Build Array
                _(rows).times(function(n){ 
                    rowArray = [];
                    //tileRow = that.$el.append( _.template('<div class="row game-row-' + n + '"></div>') );
                    _(columns).times(function(i){
                        tile = new GameBoardTileView({
                            model: that.model, 
                            position: count, 
                            name: 'tile' + count++, 
                            el: '.game-board' 
                        });
                        that.gridArray.push(tile);
                    });
                });
            },
            
            begin: function (){
                this.model.begin();
            }


        });

        return GameBoardView;
    });
