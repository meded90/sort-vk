$(function () {

    var Friend = Backbone.Model.extend({
        default: {
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
            counters: {}
        },
        initialize: function () {
            this.getInfo()
        },
        getInfo: function () {

        }
    });
    var Friends = Backbone.Collection.extend({
        model: Friend,
        initialize: function () {
            this.getAllFriends();
        },
        getAllFriends: function () {
            var thet = this;
            VK.api('friends.get', {
                fields: "can_write_private_message,online,counters,contacts, photo_50, photo_100, photo_200_orig,verified",
                name_case: "Nom"
            }, function (data) {
                _.each(data.response.items, function (item) {
                    thet.add(item)
                });
                thet.trigger("addAllFriends");
            });
        }
    });

    var ViweFriends = Backbone.View.extend({
        region: $('#list'),
        template: $('#itemList').html(),
        initialize: function () {
            this.friends = new Friends();
            this.listenTo(this.friends, 'addAllFriends', this.startSort)
        },
        startSort: function () {
            this.friends.sortBy(function (item) {
                debugger;
            });
        },
        render: function () {

        }
    })
    VK.init(function () {
        new ViweFriends();

    }, function () {
        alert('жопа че')
    }, '5.2');


})
;