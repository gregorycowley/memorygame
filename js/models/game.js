define([
  'jquery',
  'underscore',
  'backbone'
],
    function ($, _, Backbone) {

        var GameModel = Backbone.Model.extend({

            "tileHistory": [],

            "currentTileSelectionArray": [],

            "memorizing": false,

            defaults: {
                "tiles": [],
                "msg": null,
                "priority": null
            },

            select: function (position) {
                var good = false;
                var recentArray = this.tileHistory[this.tileHistory.length - 1];
                if (recentArray === undefined || this.memorizing) return;
                this.get('tiles')[position].selected = true;
                _.each(recentArray, function (pos) {
                    if (pos == position) {
                        good = true;
                    }
                });
                if (good) {
                    console.log('good : ' + position);
                    this.gameContinue(position);
                } else {
                    console.log('bad');
                    this.gameOver();
                }
                this.trigger('change');
            },

            reset: function () {
                _.each(this.get('tiles'), function (tile) {
                    tile.selected = false;
                });
                this.trigger('change');
            },

            randomize: function () {
                var tileList = _.sample(this.get('tiles'), 9)
                var posList = [];
                _.each(tileList, function (tile) {
                    tile.selected = true;
                    posList.push(tile.position);
                });
                this.tileHistory.push(posList);
                this.trigger('change');
            },

            begin: function () {
                var that = this;
                this.memorizing = true;
                this.currentTileSelectionArray = [];
                this.randomize()
                setTimeout(function () {
                    that.memorizing = false;
                    that.reset();
                    that.message('Go', 'primary');
                }, 5000);
            },

            gameContinue: function (position) {
                if (this.currentTileSelectionArray.indexOf(position) === -1) {
                    this.currentTileSelectionArray.push(position);
                }
                var recentArray = this.tileHistory[this.tileHistory.length - 1];
                recentArray.sort(function (a, b) { return a - b });
                this.currentTileSelectionArray.sort(function (a, b) { return a - b });
                if (this.arraysAreIdentical(recentArray, this.currentTileSelectionArray)) {
                    this.gameWon();
                }
            },

            gameOver: function () {
                this.message('BooHoo Game Over', 'danger');
            },

            gameWon: function () {
                this.message('Congratulations!', 'success');
            },

            message: function (msg, priority) {
                console.log('Message :: ' + msg);
                this.set({
                    'msg': msg
                });
                this.set({
                    'priority': priority
                });
                this.trigger('change');
            },

            arraysAreIdentical: function (arr1, arr2) {
                if (arr1.length !== arr2.length) return false;
                for (var i = 0, len = arr1.length; i < len; i++) {
                    if (arr1[i] !== arr2[i]) {
                        return false;
                    }
                }
                return true;
            }



        });

        return GameModel;

    });