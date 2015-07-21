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
                
                
//                var GameTile = Backbone.View.extend({
//                    tileTemplate: '<div class="col game-tile"></div>',
//                    events: {
//                        'click .game-tile': 'onClickTile'
//                    },
//                    initialize: function (options) {
//                        this.el = options.el;
//                        this.render();
//                    },
//                    render: function () {
//                        this.$el.append(_.template( this.tileTemplate ));
//                        console.log(this);
//                    },
//                    onClickTile: function () {
//                        alert('hi');
//                    }
//                });

//                    this.gameTile = new GameTile({
//                        el: '.game-tile-' + this.position
//                    });
                //                this.gameTile = this.$el.find('.game-tile-' + this.position);
                //                this.gameTile.name = '.game-tile-' + this.position;
                //console.log(typeof(this.gameTile));
                //this.gameTile.on('render', this.onClickTile, this); 
                //this.listenTo( this.gameTile, 'click', this.onClickTile );
            },
            
            update: function (){
                this.select();  
            },

            select: function () {
                console.log('selecting :: ' + this.selected);
                if ( this.selected ){
                    this.gameTile.addClass('active');
                }else{
                    this.gameTile.removeClass('active');
                }
            },

            onClickTile: function ( event ) {
                var position = $(event.currentTarget).data("position");
                if (position == this.position){
                    console.log('clicked tile ' + this.model);
                    this.model.select(this.position);
                }
               
            }


        });

        return GameBoardTileView;
    });