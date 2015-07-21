define([
    'jquery',
    'underscore',
    'backbone',
    'models/game'
],
    function ($, _, Backbone, GameModel) {

        var GameBoardTileView = Backbone.View.extend({

            el: null,
            
            model: null,

            gameTile: null,

            position: null,
            
            selected: false,
            
            tileTemplate: '<div class="col game-tile"></div>',

            name: '',

            events: {
                'click .game-tile': 'onClickTile'
            },

            initialize: function (options) {
                this.name = options.name;
                this.position = options.position;
                this.el = options.el
                this.render();
                this.model.on('change', this.update, this);
            },

            render: function () {
                this.tileTemplate = '<div data-position="'+this.position+'" class="col game-tile"></div>';
                var tile = this.$el.append( this.tileTemplate ).find(":last");
                this.gameTile = tile;
            },
            
            update: function (){
                this.select();  
            },

            select: function () {
                if ( this.selected ){
                    this.gameTile.addClass('active');
                }else{
                    this.gameTile.removeClass('active');
                }
            },

            onClickTile: function ( event ) {
                var position = $(event.currentTarget).data("position");
                if (position == this.position){
                    this.model.select(this.position);
                }
            }


        });

        return GameBoardTileView;
    });