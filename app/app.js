
var app = angular.module('app', [
    'ngAnimate', 'ui.router', 'door3.css'
]);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $cssProvider) {
    //$locationProvider.html5Mode(true);

    $urlRouterProvider
        .when('', '/')

        .when('/perfil', function($state, Users) {
            if(Users.loggedUser == null) return '/home';
            return '/perfil/' + Users.loggedUser.id;
        })

        .when('/perfil/:uid', function($state, $match, Users) {
            var user = Users.get($match.uid);
            if(user == null || Users.loggedUser == null)
                return '/404';

            $state.go(Users.areFriends(user, Users.loggedUser) || user === Users.loggedUser?
                'profile' : 'add-friend', { uid: user.id });
            })

        .otherwise('/404');

    $stateProvider
        .state('home', {
            url: '/',
            controller: 'home',
            templateUrl: 'app/views/home.html',
            css: 'app/views/home.css'
        })

        .state('login', {
            url: '/login',
            templateUrl: 'app/views/login.html',
            css: 'app/views/home.css'
        })

        .state('recover', {
            url: '/recover',
            controller: 'recover',
            templateUrl: 'app/views/recover.html',
            css: 'app/views/home.css'
        })

        .state('profile', {
            controller: 'profile',
            templateUrl: 'app/views/profile.html',
            css: 'app/views/profile.css',
            params: { uid: null }
        })

        .state('add-friend', {
            controller: 'add-friend',
            templateUrl: 'app/views/add-friend.html',
            params: { uid: null }
        })

        .state('404', {
            url: '/404',
            template: 'Not Found 404',
        });

    angular.extend($cssProvider.defaults, {
        persist: true,
        preload: true
    });
});
