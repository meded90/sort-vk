(function ($,window) {

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
            counters: {}
        },
        initialize: function () {
            this.on('all', function (e) {
                console.warn("item: " + e);
            });
            this.getInfo()
        },
        getInfo: function () {
            var thet = this;
            VK.api('users.get', {
                user_ids: this.get("id"),
                fields: "counters",
                name_case: "Nom"
            }, function (data) {
                if (data.error) {
                    new Error(data.error.error_msg)
                } else {
                    thet.set(data.response[0]);
                    thet.set("isComplit",true)
                }
            });
        }
    });
    var Friends = Backbone.Collection.extend({
        model: Friend,
        allFriend: "",
        initialize: function () {
            this.on('all', function (e) {
                console.warn("Friends: " + e);
            });
            this.getIdFriends();
            this.on('change:allFriend', this.getFriends)
        },

        getFriends: function () {
            this.add(
                _.map(this.allFriend, function (id) {
                    return {"id": id};
                })
            )
        },
        getIdFriends: function () {

            var thet = this;
            VK.api('friends.get', {}, function (data) {
                if (data.error) {
                    new Error(data.error.error_msg)
                }
                thet.allFriend = data.response.items;
                thet.trigger('change:allFriend');
            });
        }
    });

    var ViweFriends = Backbone.View.extend({
        region: $('#list'),
        template: _.template($('#itemList').html()),
        initialize: function () {
            var thet = this;
            this.friends = new Friends();
//            this.listenTo(this.friends, 'addAllFriends', this.startSort)

            this.friends.on('addAllFrents', function () {
                this.startSort();
            }, this);
            this.friends.on('change', $.debounce(500, function () {
                thet.startSort()
            })) ;
            this.on("afterRender", function () {
                this.region.html(this.$el);
            }, this);
            this.on('all', function (e) {
                console.warn(e);
            });
        },
        startSort: function () {
            console.log("========================================");
            var isAllFredsComplt = this.friends.every(function (item) {
                console.log(item.get('first_name')+ "  "+item.get('isComplit')+" "+item.get('id'));

                if (_.isUndefined(item.get('first_name'))){
                    debugger;
                }
                return item.get('isComplit')
            })
            console.log("========================================");

            if (isAllFredsComplt) {

                this.friends.sortBy(function (item) {
                    var counters = item.get('counters');
                    if (counters) {
                        return counters.friends + counters.followers;
                    } else {
                        return 0
                    }

                });
                debugger;
            }
        },
        render: function () {
            var thet = this;
            this.trigger("beforeRender");
            this.friends.each(function (item) {
                thet.$el.append(function () {
                    return thet.template(item);
                });
            });
            this.trigger("afterRender");
            return this;
        }
    });
    VK.init(function () {
        window.viweFriend =  new ViweFriends();

    }, function () {
        alert('жопа че')
    }, '5.2');


})(jQuery,window);