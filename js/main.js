(function ($, window) {
    if (jQuery.when.all === undefined) {
        jQuery.when.all = function (deferreds) {
            var deferred = new jQuery.Deferred();
            $.when.apply(jQuery, deferreds).then(
                function () {
                    deferred.resolve(Array.prototype.slice.call(arguments));
                },
                function () {
                    deferred.fail(Array.prototype.slice.call(arguments));
                });

            return deferred;
        }
    }
    ;

    var Friend = Backbone.Model.extend({
        defaults: {
            id: "",
            first_name: '',
            last_name: '',
            city: '',
            photo_50: '',
            photo_100: '',
            photo_200_orig: '',
            online: 0,
            can_write_private_message: 0,
            mobile_phone: '',
            home_phone: '',
            verified: 0,
            isComplit: false,
            counters: {},
            last_seen: {
                time: 0
            }

        },
        initialize: function () {
            this.set("deferred", $.Deferred());
            this.set("promise", this.get("deferred").promise());
            this.on('all', function (e) {
//                console.warn("item: " + e);
            });
            this.getInfo()
        },
        getInfo: function () {
            var thet = this;
            VK.api('users.get', {
                user_ids: this.get("id"),
                fields: "counters,photo_100,can_write_private_message,online,last_seen",
                name_case: "Nom"
            }, function (data) {
                if (data.error) {
//                    console.error(data.error.error_msg);
                    if (data.error.error_code === 6) {
                        setTimeout(function () {
                            thet.getInfo.apply(thet)
                        }, 500);
                        return;
                    }
                    thet.get("deferred").resolve()
                } else {
                    thet.set(data.response[0]);
                    thet.set("isComplit", true);
                    console.log("deferred resolve " + thet.cid);
                    thet.get("deferred").resolve();
                }
            });
        }
    });
    var Friends = Backbone.Collection.extend({
        model: Friend,
        allFriend: "",
        cauntAddInOneTime: 3,
        initialize: function () {
            this.on('all', function (e) {
                console.warn("Friends: " + e);
            });
            this.getIdFriends();
            this.on('change:allFriend', this.getFriends)
            this.on('change:addAllFriend', this.isAllFredsComplt)
        },
        getIdFriends: function () {

            var thet = this;
            VK.api('friends.get', {}, function (data) {
                if (data.error) {
                    new Error(data.error.error_msg)
                }
                thet.allFriend =
                    _.map(data.response.items, function (id) {
                        return {"id": id};
                    });
                thet.trigger('change:allFriend');
            });
        },
        getFriends: function (indexEnd) {
            var thet = this;
            var isLastPack = false

            var indexStart = indexEnd || 0;

            var indexTo = indexStart + this.cauntAddInOneTime
            //TODO: убрать огоничине нужно для дебага
//            if (indexTo > 100){
            if (indexTo > this.allFriend.length) {
                indexTo = this.allFriend.length;
                isLastPack = true
            }
            this.indexNow = indexTo

            this.add(
                this.allFriend.slice(indexStart, indexTo)
            )

            var arreyPromess = this.map(function (item) {
                return item.get("deferred")
            });
            var promess = $.when.all(arreyPromess);
            promess.always(function () {
                if (isLastPack) {
                    console.log("===================================");
                    thet.trigger('change:complitAllFriend');

                } else {
                    console.log("-------------------------------------" + indexTo);
                    setTimeout(
                        function () {
                            thet.getFriends(indexTo + 1)
                        }, 400
                    )
                }
            });
        }
    });
    moment.lang("ru");
    var ViweFriends = Backbone.View.extend({
        region: $('#list'),
        parsing: $("#parsing"),
        progres: $("#progres"),
        filter: $("#filter"),
        template: _.template($('#itemList').html()),
        initialize: function () {
            var that = this;
            this.friends = new Friends();
            this.friends.on('change:complitAllFriend', function () {
                that.filter.find("label").removeAttr("disabled");

                var radiButon = that.filter.find("input");
                var sortTo = function () {
                    var filterName = radiButon.filter(":checked").val();
                    that[filterName]();
                };
                sortTo();
                radiButon.change(function () {
                    sortTo();
                });
            });

            this.on("afterRender", function () {
                this.parsing.hide();
                this.progres.parent().hide();
                this.region.html(this.$el);
            }, this);

//            this.on('all', function (e) {
//                console.warn(e);
//            });

            this.friends.on("add", this.renderParsing, this);

            this.on("sortComplain", this.render, this);
        },
        renderParsing: function () {
            this.parsing.html("спарсилось " + this.friends.indexNow + " из " + this.friends.allFriend.length + " друзей");
            this.progres.css({
                "width": this.friends.indexNow / this.friends.allFriend.length * 100 + "%"
            })
        },
        sortRang: function () {
            this.friends.models = this.friends.sortBy(function (item) {
                var counters = item.get('counters');
                if (counters.friends + counters.followers) {
                    console.log(counters.friends + counters.followers);
                    return -(counters.friends + counters.followers) || 0;
                } else {
                    return 0;
                }
            });

            this.trigger("sortComplain")
        },
        sortTime: function () {
            this.friends.models = this.friends.sortBy(function (item) {
                return item.get("last_seen").time || -99999;
            });
            this.trigger("sortComplain")
        },
        render: function () {
            var thet = this;

            this.trigger("beforeRender");
            this.$el.html("");
            this.friends.each(function (item) {
                thet.$el.append(function () {
                    return thet.template(item.toJSON());
                });
            });
            this.trigger("afterRender");
            return this;
        }
    });
    VK.init(function () {
        window.viweFriend = new ViweFriends();

    }, function () {
        alert('жопа че')
    }, '5.2');


})(jQuery, window);