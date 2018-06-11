// This is the js for the default/index.html view.
//
var app = function () {

    var self = {};

    Vue.config.silent = false; // show all warnings

    self.login_redirect = function () {
        self.logged_in = true;
        sessionStorage.setItem("logged_in", self.logged_in.toString())
        window.location = "/Xplo/default/user/login";
    }

    self.logout_redirect = function () {
        self.logged_in = false;
        sessionStorage.setItem("logged_in", self.logged_in.toString())
        window.location = "/Xplo/default/user/logout";

    }

    // Extends an array
    self.extend = function (a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    self.close_uploader = function () {
        $("div#uploader_div").hide();
        self.vue.is_uploading = false;
        $("input#file_input").val(""); // This clears the file choice once uploaded.
    };

    self.open_uploader = function () {
        $("div#uploader_div").show();
        self.vue.is_uploading = true;
    };


    // args: a location consisting of a latitude and longitude
    // returns: a marker object
    self.add_story_button = function () {
        self.is_adding = !self.is_adding;
        self.confirm_location();
    }

    self.placeMarker = function placeMarker(location) {
        var marker = new google.maps.Marker({
            position: location,
            map: map,
        });
        return marker
    }

    self.confirm_button = function (confirmed) {
        self.vue.confirming = false;

        if (confirmed) {
            if (placed_marker != null) {
                self.vue.entering_text = true;
                placed_marker.setAnimation(null);
                //adds story in self.add_story after getting the input info in 
                // enter_text_button
            } else {
                console.error("confirm_button error. placed_marker is null");
            }
        } else {
            if (placed_marker != null) {
                placed_marker.setMap(null);
                self.vue.entering_text = false;
                console.log(self.vue.entering_text)
            } else {
                console.error("confirm_button error. placed_marker is null");

            }
        }
    }

    var placed_marker = null;
    self.confirm_location = function () {
        if (self.is_adding) {
            listener = map.addListener('click', function (event) {
                placed_marker = self.placeMarker(event.latLng);
                placed_marker.setAnimation(google.maps.Animation.BOUNCE);
                google.maps.event.removeListener(listener);
                self.is_adding = !self.is_adding;


                //confirm if you want to put it in this location
                self.vue.confirming = true;

            });
        }
    };


    self.enter_text_button = function () {
        console.log("sharing story with world")
        self.vue.entering_text = false;
        self.add_story(placed_marker, self.vue.title_text, self.vue.body_text);

        self.vue.title_text = null;
        self.vue.body_text = null;
        placed_marker = null;
    }

    self.add_story = function (marker, title, body) {
        console.log("add_story")
        marker.addListener('click', function () {
            self.marker_clicked(marker)
        })

        $.post(add_story_url,
            {
                lat: marker.position.lat,
                lng: marker.position.lng,
                title: title,
                body: body
            },
            function (data) {
                self.get_all_stories(); //update the stories list
                // self.vue.stories.unshift(data.story);

            }
        )
    }


    self.marker_clicked = function (mark) {
        console.log("clicked marker: ")
        if (self.vue.deletevar) {
            self.delete_story_button(mark);
            console.log("delete called");
        }
    }


    self.delete_story_button = function (marker) {
        console.log("made it");
        //map.addListener(marker, 'click', function (point) { id = this.__gm_id; self.delMarker(id)});
        marker.setMap(null);
        self.vue.deletevar = !self.vue.deletevar;
        console.log(self.vue.deletevar);
    };


    self.deleteins = function () {
        self.vue.deletevar = !self.vue.deletevar;
    };

    self.get_all_stories = function () {
        $.getJSON(get_all_stories_URL,
            function (data) {
                self.vue.stories = data.stories //sets the vue variable to the list of variables


                //shows every marker
                for (var index = 0; index < self.vue.stories.length; index++) {

                    var story = self.vue.stories[index];
                    var lat = story.latitude;
                    var long = story.longitude;
                    var latlong = new google.maps.LatLng(lat, long);

                    self.placeMarker(latlong);
                }
            }
        )
    }

    self.upload_file = function (event) {
        // Reads the file.
        var input = $("input#file_input")[0];
        console.log(event);
        var file = input.files[0];
        if (file) {
            // First, gets an upload URL.
            console.log("Trying to get the upload url");
            $.getJSON('https://upload-dot-luca-teaching.appspot.com/start/uploader/get_upload_url',
                function (data) {
                    // We now have upload (and download) URLs.
                    var put_url = data['signed_url'];
                    var get_url = data['access_url'];
                    console.log("Received upload url: " + put_url);
                    // Uploads the file, using the low-level interface.
                    var req = new XMLHttpRequest();
                    req.addEventListener("load", self.upload_complete(get_url));
                    // TODO: if you like, add a listener for "error" to detect failure.
                    req.open("PUT", put_url, true);
                    req.send(file);
                });
        }
    };


    self.upload_complete = function(get_url) {
        // Hides the uploader div.
        self.close_uploader();
        console.log('The file was uploaded; it is now available at ' + get_url);
        // $.post(add_image_url, { 
        //     image_url: get_url,
        //     image_price: self.vue.form_price,
        //     },
        //     function(data) {
        //         self.vue.user_images.unshift(data);
        //         self.vue.form_price = 0.00;
        //     }
        // )
        // setTimeout(self.get_user_images, 750, users[0].id);
    };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        mounted: function () {
            setTimeout(function () { 
                initMap(),
                self.get_all_stories(); 
            }, 1000);
        },

        data: {
            is_adding: false,
            locations: [],
            stories: [],
            logged_in: (sessionStorage.getItem("logged_in") == "true"),
            confirming: false,
            id: 0,
            deletevar: false,
            entering_text: false,
            title_text: null,
            body_text: null,
            is_uploading: false,
        },
        methods: {
            add_story: self.add_story,
            add_story_button: self.add_story_button,
            login_redirect: self.login_redirect,
            logout_redirect: self.logout_redirect,
            confirm_button: self.confirm_button,
            confirm_location: self.confirm_location,
            delMarker: self.delMarker,
            delete_story_button: self.delete_story_button,
            marker_clicked: self.marker_clicked,
            deleteins: self.deleteins,
            enter_text_button: self.enter_text_button,
            get_all_stories: self.get_all_stories,
            upload_file: self.upload_file,
            upload_complete: self.upload_complete,
            open_uploader: self.open_uploader,
            close_uploader: self.close_uploader,
        }

    });
    $("#vue-div").show();
    return self;
};
var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () { APP = app(); });
