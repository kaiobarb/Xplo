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


  self.delete_story_button = function (marker) {
    //map.addListener(marker, 'click', function (point) { id = this.__gm_id; self.delMarker(id)});
    marker.setMap(null);
    $.post(delete_url,
      {
        lat: marker.position.lat,
        lng: marker.position.lng,
      },
      function (data) {
        self.get_all_stories(); //update list
      }
    )
    self.vue.deletevar = !self.vue.deletevar;
  };

  self.enter_text_button = function () {
    self.vue.entering_text = false;
    self.add_story(placed_marker, self.vue.title_text, self.vue.body_text);

    self.vue.title_text = null;
    self.vue.body_text = null;
    placed_marker = null;
  }

  self.add_story = function (marker, title, body) {

    marker.addListener('click', function () {
      self.marker_clicked(this)
    })

    $.post(add_story_url,
      {
        lat: marker.position.lat,
        lng: marker.position.lng,
        title: title,
        body: body
      },
      function (data) {
        //add marker to dict
        id_as_string = String(data.story.id)
        self.vue.marker_dict[id_as_string] = marker

        self.get_all_stories(); //update the stories list

        //add it to the heatmap info
        console.log(data.story.latitude + "  " + data.story.longitude)
        var google_lat_lng = new google.maps.LatLng(data.story.latitude, data.story.longitude);
        heatmap_data_points.push(google_lat_lng) //defined in maps
      }
    )
  }


  self.marker_clicked = function (mark) {
    if (self.vue.deletevar) {
      self.delete_story_button(mark);
    }
  }


  self.deleteins = function () {
    self.vue.deletevar = !self.vue.deletevar;
  };

  self.get_all_stories = function () {
    $.getJSON(get_all_stories_URL,
      function (data) {
        self.vue.stories = data.stories //sets the vue variable to the list of variables
      }
    )
  }

  self.place_all_markers = function (a) {

    $.getJSON(get_all_stories_URL,
      function (data) {

        //shows every marker
        var marker = null;
        for (var index = 0; index < data.stories.length; index++) {

          var story = data.stories[index];

          var lat = story.latitude;
          var long = story.longitude;
          var latlong = new google.maps.LatLng(lat, long);

          marker = self.placeMarker(latlong);
          marker.setAnimation(google.maps.Animation.DROP);

          //add the marker object to the dict
          var id_as_string = String(story.id)
          self.vue.marker_dict[id_as_string] = marker

          marker.addListener('click', function () {
            self.marker_clicked(this)
          })
        }
      })

    self.update_heatmap();
  }

  //search
  self.search_button = function () {
    if (self.vue.search_phrase != null) {
      self.search()
    }
  }
  //search for phrases in db
  self.search = function () {
    $.getJSON(search_URL,
      {
        search_phrase: self.vue.search_phrase
      },
      function (data) {
        self.vue.search_results = data.results;
        self.vue.search_phrase = null;
      }
    )
  }

  self.expandins = function (store) {
    self.vue.expandvar = !self.vue.expandvar;
    self.vue.expandstory = store;
    console.log(self.vue.expandvar);
    console.log(self.vue.expandstory.created_by);
  };

  self.closeins = function () {
    self.vue.expandvar = !self.vue.expandvar;
    self.vue.expandstory = null;
    console.log(self.vue.expandvar);
    console.log(self.vue.expandstory);
  };


  //heatmap

  self.update_heatmap = function () {
    $.getJSON(get_heatmap_data_URL,
      function (data) {
        //NOTE:
        //data.heatmap_locations is dicts of lat/long 
        //  data.heatmap_locations = [{lat=,long=},{lat=,long=}...]

        heatmap_data_points.clear();
        //heatmap_data_points is defined at top of maps.js 

        for (var i = 0; i < data.heatmap_locations.length; i++) {
          pos = data.heatmap_locations[i];
          google_lat_lng = new google.maps.LatLng(pos.lat, pos.long);

          heatmap_data_points.push(google_lat_lng);
          // heatmap_data_points.push({ location: google_lat_lng, weight: 5 })
        }

        //some random ones for testing NEED TO REMOVE THIS
        // for (var i = 0; i <= 1000; i++) {
        //   var rand_lat = (((Math.random() - 0.5) / 10.0) + 36.9741);
        //   var rand_long = (((Math.random() - 0.5) / 10.0) + -122.0308);
        //   google_lat_lng = new google.maps.LatLng(rand_lat, rand_long);
        //   heatmap_data_points.push(google_lat_lng);
        // }
      }

    )
  }

  self.toggle_heatmap = function () {
    heatmap.setMap(heatmap.getMap() ? null : map);
  }

  // Complete as needed.
  self.vue = new Vue({
    el: "#vue-div",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    mounted: function () {
      // setTimeout(function () { initMap(), self.get_all_stories(); self.place_all_markers() }, 1000);
      setTimeout(function () { initMap(); self.place_all_markers(); self.get_all_stories(); }, 1000);
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
      search_results: [],
      search_phrase: null,
      marker_dict: {},
      expandvar: false,
      expandstory: null,
      heatmap_set: false
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
      search: self.search,
      search_button: self.search_button,
      expandins: self.expandins,
      closeins: self.closeins,
      place_all_markers: self.place_all_markers,
      toggle_heatmap: self.toggle_heatmap,
      update_heatmap: self.update_heatmap
    }

  });
  $("#vue-div").show();
  return self;
};
var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () { APP = app(); });
