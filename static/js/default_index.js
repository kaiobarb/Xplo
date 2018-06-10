// This is the js for the default/index.html view.
//
var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // args: a location consisting of a latitude and longitude
    // returns: a marker object
    self.placeMarker = function placeMarker(location,title) {
        var marker = new google.maps.Marker({
            position: location,
            map: map,
            title: title,
        });
        return marker
    }

    self.marker_clicked = function (mark,title) {
          console.log("clicked marker: " + title)
          if(self.vue.deletevar){
            self.delete_story_button(mark);
            console.log("delete called");
          }
    }

    self.add_story_button = function() {
        console.log("before: ",self.is_adding);
        self.is_adding = !self.is_adding;
        console.log("after: ",self.is_adding);
        self.add_story("placeholder title: " + new Date().getTime());
    }

    self.add_story = function(storyTitle) {
        var marker = null;
        console.log("pre: ",self.is_adding);
        if (self.is_adding) {
            listener = map.addListener('click', function(event) {
                marker = self.placeMarker(event.latLng,storyTitle);
                console.log(" it");
                //self.vue.id = marker.__gm_id;
                //self.vue.locations[self.vue.id] = marker;
                //its me
                marker.addListener('click', function () {
                    self.marker_clicked(marker,marker.title)
                })
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
              console.log("what it");

              console.log("some it");
        }
    };

   self.delete_story_button = function(marker){
      console.log("made it");
      //map.addListener(marker, 'click', function (point) { id = this.__gm_id; self.delMarker(id)});
      marker.setMap(null);
      self.vue.deletevar = !self.vue.deletevar;
      console.log(self.vue.deletevar);
   };

  /* self.delMarker = function(id){
     var marker = self.vue.locations[id];
    marker.setMap(null);
  };*/

  self.deleteins = function(){
    self.vue.deletevar = !self.vue.deletevar;
  };

    // Complete as needed.
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],
        unsafeDelimiters: ['!{', '}'],
        mounted() {
            initMap();
        },
        data: {
            is_adding: false,
            locations: [],
            id:0,
            deletevar:false,
        },
        methods: {
            add_story: self.add_story,
            add_story_button: self.add_story_button,
            delMarker: self.delMarker,
            delete_story_button: self.delete_story_button,
            marker_clicked: self.marker_clicked,
            deleteins: self.deleteins,
        }

    });
    $("#vue-div").show();
    return self;
};
var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
