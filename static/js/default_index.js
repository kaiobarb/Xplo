// This is the js for the default/index.html view.
// 
var app = function () {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function (a, b) {
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

    self.add_story_button = function () {
        self.is_adding = !self.is_adding;
        self.confirm_location();
    }

    self.confirm_button = function (confirmed) {
        self.vue.confirming = false;

        if (confirmed) {
            if (placed_marker != null) {
                self.add_story(placed_marker);
            } else {
                console.error("confirm_button error. placed_marker is null");
            }
        } else {
            if (placed_marker != null) {
                placed_marker.setMap(null);
            } else {
                console.error("confirm_button error. placed_marker is null");

            }
        }

        placed_marker = null;
    }

    var placed_marker = null;
    self.confirm_location = function () {
        if (self.is_adding) {
            listener = map.addListener('click', function (event) {
                console.log("clicked map")
                placed_marker = self.placeMarker(event.latLng);
                google.maps.event.removeListener(listener);
                self.is_adding = !self.is_adding;


                //confirm if you want to put it in this location
                self.vue.confirming = true;

            });
        }
    };

    self.add_story = function (marker) {
        $.post(add_story_url,
            {
                lat: marker.position.lat,
                lng: marker.position.lng,
            }
        )
    }

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        mounted() {
            // initMap();
            setTimeout(function () { initMap() }, 1000)
        },
        data: {
            is_adding: false,
            locations: [],
            confirming: false,
        },
        methods: {
            add_story: self.add_story,
            add_story_button: self.add_story_button,
            confirm_button: self.confirm_button,
        }

    });
    $("#vue-div").show();
    return self;
};
var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () { APP = app(); });
