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

            gameModel: 'null',

            events: {

            },

            initialize: function (options) {
                this.gameModel = new GameModel();
                this.initGrid(this.rows, this.columns);
                this.gameModel.set({
                    'tiles': this.gridArray
                })
                
                this.gameModel.on('change', this.render, this);
            },

            render: function () {
                console.log("Rendering");
                
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
                            model: that.gameModel, 
                            position: count, 
                            name: 'tile' + count++, 
                            el: '.game-board' 
                        });
                        that.gridArray.push(tile);
                    });
                });
            },
            
            begin: function (){
                this.gameModel.begin();
            }


        });

        return GameBoardView;
    });
