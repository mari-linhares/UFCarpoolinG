
app.service('Api', function($q, $http, Cookie) {
    var self = this;

    var realm = null;
    var nonce = null;
    var cnonce = null;
    var nc = null;

    function nc2str() {
        return ('00000000' + nc.toString(16)).slice(-8);
    }

    function genNonce() {
        return Math.random().toString(16).substring(8) +
               Math.random().toString(16).substring(8);
    }

    function queryString(params) {
        var sorted = {};
        var keys = [];

        for(key in params) if(params[key] != null)
            keys.push(key);

        keys.sort();
        keys.forEach(function(key) {
            sorted[key] = params[key];
        });

        return jQuery.param(sorted);
    }

    function make_header(args) {
        if(realm == null) return null;

        var cache = self.getCache();

        var uri = args.url;
        if(args.params != null)
            uri += '?' + queryString(args.params);

        var response = CryptoJS.MD5(
            cache.passwd +':'+ nonce +':'+ nc2str() +':'+ cnonce +':auth:'+
            CryptoJS.MD5(args.method +':'+ uri)
        );

        return {
            'Authorization':
                'Digest '+
                'username="'+ cache.uid +'", '+
                'realm="'+ realm +'", '+
                'nonce="'+ nonce +'", '+
                'uri="'+ uri +'", '+
                'qop=auth, '+
                'nc='+ nc2str() +', '+
                'cnonce="'+ cnonce +'", '+
                'response="'+ response +'"'
        }
    }

    function request(args) {
        args.headers = make_header(args);
        nc += 1;

        return $q(function(resolve, reject) {
            $http(args).then(resolve, function(resp) {
                var header = resp.headers('WWW-Authenticate');
                if(header == null) return reject(resp);

                header = {
                    realm: /realm="(.*?)"/.exec(header),
                    nonce: /nonce="(.*?)"/.exec(header),
                    stale: /stale="(.*?)"/.exec(header)
                };

                var stale = header.stale && header.stale[1] == 'true';
                var repeat = stale || args.headers == null;

                realm = header.realm[1];
                nonce = header.nonce[1];
                cnonce = genNonce();
                nc = 1;

                if(repeat) request(args).then(resolve, reject);
                else reject(resp);
            });
        });
    }


    var cacheUID = new Cookie('garupa.uid');
    var cachePWD = new Cookie('garupa.passwd');

    var cachePending = false;

    this.getCache = function() {
        if(cachePending)
            self.commitCache();
        return {
            uid: cacheUID.get(),
            passwd: cachePWD.get()
        };
    };

    this.setCache = function(uid, passwd) {
        cachePending = true;
        self.commitCache = function() {
            cacheUID.set(uid);
            cachePWD.set(CryptoJS.MD5(uid +':'+ realm +':'+ passwd));
            cachePending = false;
        };
    };

    this.clearCache = function() {
        cacheUID.erase();
        cachePWD.erase();
    };


    this.registerUser = function(user) {
        return request({
            method: 'POST',
            url: '/api/users',
            data: user
        });
    };

   this.recoverPassword = function(uid) {
        return request({
            method: 'POST',
            url: '/api/users/' + uid + '/password-reset'
        });
    };

    this.viewUser = function(uid) {
        return request({
            method: 'GET',
            url: '/api/users/' + uid
        });
    };

    this.updateUser = function(uid, attr, value) {
        return request({
            method: 'PUT',
            url: '/api/users/' + uid + '/' + attr,
            data: {value: value}
        });
    };

    this.addFriend = function(uid, fuid) {
        return request({
            method: 'POST',
            url: '/api/users/' + uid + '/friends',
            data: {fuid: fuid}
        });
    };

    this.removeFriend = function(uid, fuid) {
        return request({
            method: 'DELETE',
            url: '/api/users/' + uid + '/friends/' + fuid
        });
    };

    this.registerRide = function(ride) {
        return request({
            method: 'POST',
            url: '/api/rides',
            data: ride
        });
    };

    this.requestRide = function(uid, rid, district, complement) {
        return request({
            method: 'POST',
            url: '/api/rides/' + rid + '/requests',
            data: {
                uid: uid,
                district: district,
                complement: complement
            }
        });
    };

    this.acceptRide = function(uid, rid, district, complement) {
        return request({
            method: 'POST',
            url: '/api/rides/' + rid + '/passengers',
            data: {
                uid: uid,
                district: district,
                complement: complement
            }
        });
    };

    this.cancelRide = function(uid, rid) {
        return request({
            method: 'DELETE',
            url: '/api/users/' + uid + '/rides/' + rid
        });
    };

    this.searchRides = function(dest, district, date, weekly, page, limit) {
        return request({
            method: 'GET',
            url: '/api/rides',
            params: {
                dest: dest, district: district,
                date: date, weekly: weekly,
                page: page, limit: limit
            }
        });
    };

    this.getNotifications = function(uid) {
        return request({
            method: 'GET',
            url: '/api/users/' + uid + '/notifications',
        });
    };

    this.removeNotification = function(uid, nid) {
         return request({
            method: 'DELETE',
            url: '/api/users/' + uid + '/notifications/' + nid,
         });
    };

    this.markNotification = function(uid, nid) {
         return request({
            method: 'PUT',
            url: '/api/users/' + uid + '/notifications/' + nid + '/seen',
         });
    };

});
