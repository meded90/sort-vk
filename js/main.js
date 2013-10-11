$(function () {


    VK.init(function () {

// test
        alert("вроде все гуд")

        VK.api('users.get', function (data) {
            console.log(data);
        });
    }, function () {
        alert('жопа че')
    }, '5.2');
});