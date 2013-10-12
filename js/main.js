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
            var thet = this;

        }
    });
    var Friends = Backbone.Collection.extend({
        model: Friend,
        allFriend: "",
        initialize: function () {
            this.getIdFriends();
            this.on('chang:allFriend', this.getFriends)

        },
        getFriends: function () {
            if (this.allFriend.length > 999) {
                console.error("Количество элементов должно составлять не более 1000 http://vk.com/dev/users.get, так что надо дописать условия для последователных запросв")
                //TODO: Дописать условия для людей у кого больше 1000 друзей
            }
            VK.api('users.get', {
                user_id: this.allFriend.toString(),
                fields: "can_write_private_message,online,counters,contacts, photo_50, photo_100, photo_200_orig,verified",
                name_case: "Nom"
            }, function (data) {
                thet.add(data.response.items)
            });
        },
        getIdFriends: function () {

            var thet = this;
            VK.api('friends.get', {}, function (data) {
                thet.set('allFriend', data.response.items)
            });
        }
    });

    var ViweFriends = Backbone.View.extend({
        region: $('#list'),
        template: _.template($('#itemList').html()),
        initialize: function () {
            this.friends = new Friends();
//            this.listenTo(this.friends, 'addAllFriends', this.startSort)
            this.listenTo(this.friends, 'change', this.startSort)
            this.on("afterRender", function () {
                this.region.html(this.$el)
            }, this)
        },
        startSort: function () {
            this.friends.sortBy(function (item) {
                var counters = item.get('counters')
                debugger;
                return counters.friends + counters.followers
            });
            this.render();
        },
        render: function () {
            var thet = this
            this.trigger("beforeRender")
            this.friends.each(function (item) {
                thet.$el.append(function () {
                    return thet.template(item);
                });
            })
            this.trigger("afterRender")
            return this
        }
    })
    VK.init(function () {
        new ViweFriends();

    }, function () {
        alert('жопа че')
    }, '5.2');


})
;