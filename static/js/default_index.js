// This is the js for the default/index.html view.
// 
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    self.login_redirect = function() {
        self.logged_in = true;
        window.location = "/Xplo/default/user/login";
    }

    self.logout_redirect = function() {
        self.logged_in = false;
        window.location = "/Xplo/default/user/logout";

    }

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // args: a location consisting of a latitude and longitude
    // returns: a marker object
    self.placeMarker = function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location, 
            map: map
        });
        return marker
    }

    self.add_story_button = function() {
        console.log("before: ",self.is_adding);
        self.is_adding = !self.is_adding;
        console.log("after: ",self.is_adding);
        self.add_story();
    }

    self.add_story = function() {
        var marker = null;
        console.log("pre: ",self.is_adding);
        if (self.is_adding) {
            listener = map.addListener('click', function(event) {
                marker = self.placeMarker(event.latLng);
                $.post(add_story_url,
                {
                    lat: marker.position.lat,
                    lng: marker.position.lng,
                },
                function(data) {
                    google.maps.event.removeListener(listener);
                    self.is_adding = !self.is_adding;
                    console.log("done: ",self.is_adding);
                }
            )
            });
        }   
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        mounted: function() {
            setTimeout(function() { initMap() }, 1000) 
        },

        data: {
            is_adding: false,
            locations: [],
            stories: [1, 2, 3],
            logged_in: false,
        },
        methods: {
            add_story: self.add_story,
            add_story_button: self.add_story_button,
            login_redirect: self.login_redirect,
        }

    });
    $("#vue-div").show();
    return self;
};
var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
