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

  // Enumerates an array.
  var enumerate = function (v) { var k = 0; return v.map(function (e) { e._idx = k++; }); };

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
    self.deletevar = false;
    self.confirm_location();
  }

  self.placeMarker = function placeMarker(location) {
    var marker = new google.maps.Marker({
      position: location,
      map: map,
    });
    return marker
  };


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


  self.delete_story_button = function (id) {
    //map.addListener(marker, 'click', function (point) { id = this.__gm_id; self.delMarker(id)});
    self.vue.deletevar = !self.vue.deletevar;
    self.vue.is_adding = false;
    id_as_string = String(id);
    console.log(id_as_string);
    var marker = self.vue.marker_dict[id_as_string];
    marker.setMap(null);
    $.post(delete_url,
      {
        // lat: marker.position.lat,
        // lng: marker.position.lng,
        post_id: id
      },
      function (data) {
        delete self.vue.marker_dict[id_as_string];
        delete self.vue.comment_dict[id_as_string];
        self.get_all_stories(); //update list
      }
    )
    self.vue.deletevar = !self.vue.deletevar;
  };

  self.enter_text_button = function () {
    self.vue.entering_text = false;
    self.add_story(placed_marker, self.vue.title_text, self.vue.body_text, self.vue.image_url);

    self.vue.image_url = null;
    self.vue.title_text = null;
    self.vue.body_text = null;
    placed_marker = null;
  }

  self.add_story = function (marker, title, body, url) {

    setTimeout(function () {


      marker.addListener('click', function () {
        self.marker_clicked(this)
      })

      $.post(add_story_url,
        {
          lat: marker.position.lat,
          lng: marker.position.lng,
          title: title,
          body: body,
          url: url
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

          //make a new comment list for the new story
          self.vue.comment_dict[id_as_string] = []
        }
      )
    }, 750)
  }


  self.marker_clicked = function (mark) {
    if (self.vue.deletevar) {
      self.delete_story_button(mark);
    } else {
      document.getElementById(mark.story_id).scrollIntoView({ behavior: "smooth" });
      mark.setAnimation(google.maps.Animation.BOUNCE);
      mark.setAnimation(null);
    }
  }


  self.deleteins = function () {
    self.vue.deletevar = !self.vue.deletevar;
    self.vue.is_adding = false;
  };

  self.get_all_stories = function () {
    $.getJSON(get_all_stories_URL,
      function (data) {
        self.vue.stories = data.stories; //sets the vue variable to the list of variables
        enumerate(self.vue.stories);

        for (var i = 0; i < data.stories; i++) {
          story = data.stories[i]
          id_as_string = String(story.id)
          self.vue.like_dict[id_as_string] = JSON.parse(story.likes)
        }
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
  self.search_button = function (e) {
    if (self.vue.search_phrase != null) {
      if (e.keyCode == 13) {
        self.search();
      }
    } else {
      self.vue.search_results = [];
      self.vue.get_all_stories();
      self.vue.search_phrase = null;
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

        if (self.vue.search_results.length <= 0) {
          alert("No stories found")
        } else {
          self.vue.stories = data.results;
        }

      }
    )
  }

  self.expandins = function (story, id) {
    console.log(id);
    self.vue.expandvar = !self.vue.expandvar;
    self.vue.expandstory = story;
    sessionStorage.setItem("stories_id", id.toString())
    self.vue.stories.splice(id, 1);
    enumerate(self.vue.stories);
  };

  self.closeins = function () {
    var index = 0;
    self.vue.expandvar = !self.vue.expandvar;
    index = sessionStorage.getItem("stories_id");
    self.vue.stories.splice(index, 0, self.vue.expandstory);
    self.vue.expandstory = null;
    enumerate(self.vue.stories);
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
        }
      })
  };

  self.upload_file = function (event) {
    // Reads the file.
    var input = $("input#file_input")[0];
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
          self.vue.image_url = get_url;
        });
    }
  };

  self.toggle_heatmap = function () {
    heatmap.setMap(heatmap.getMap() ? null : map);
  }

  self.upload_complete = function (get_url) {
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

  //like and comment stuff
  self.add_comment_button = function (post_id) {
    if (self.vue.commenting_post_id == null) {
      self.vue.entering_comment = true;
      console.log(post_id);
      self.vue.commenting_post_id = post_id;
    } else {
      alert("Please finish the comment you're working on!")
    }

  }

  self.confirm_comment = function (confirmed_comment) {
    self.vue.entering_comment = false;

    if (confirmed_comment) {
      $.post(add_comment_URL,
        {
          post_id: self.vue.commenting_post_id,
          comment_text: self.vue.comment_text
        },
        function (data) {
          id_as_string = String(self.vue.commenting_post_id)

          self.vue.comment_dict[id_as_string].push(data.comment);
          self.vue.get_comments(self.vue.commenting_post_id);
          self.vue.comment_text = null;
          self.vue.commenting_post_id = null;
        }
      )
    } else {
      self.vue.comment_text = null;
      self.vue.commenting_post_id = null;
    }

  }

  self.get_all_comments = function () {
    //for all posts, call get_comments

    $.getJSON(get_all_stories_URL,
      function (data) {

        for (var index = 0; index < data.stories.length; index++) {
          var story = data.stories[index];
          self.get_comments(story.id)
        }
      })
  }

  self.get_comments = function (post_id) {
    var id_as_string = String(post_id);

    $.getJSON(get_comments_URL,
      {
        post_id: post_id
      },
      function (data) {
        self.vue.comment_dict[id_as_string] = data.comments
      }
    )
  }

  //make the marker bounce when you over over the corresponding story
  self.marker_bounce = function (post_id) {
    var id_as_string = String(post_id);
    console.log("in: " + id_as_string)

    var marker = self.vue.marker_dict[id_as_string]

    if (marker != null) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
    }

    setTimeout(function () {
      if (marker != null) {
        marker.setAnimation(null);
      }
    }, 250);
  }

  //liking
  self.liked = function (post_id, user_id) {
    console.log(user_id)
    self.vue.my_likes.push(post_id)

    $.post(liked_URL,
      {
        user_id: user_id,
        post_id: post_id
      },
      function (data) {

        var list = JSON.parse(data.liked_list)
        list.push(user_id)
        $.post(liked_update_URL,
          {
            new_list: JSON.stringify(list),
            post_id: post_id
          }, function (data) {
            id_as_string = String(post_id)
            self.vue.like_dict[id_as_string] = list
            self.get_all_stories()
          }

        )

      }
    )
  }


  // Complete as needed.
  self.vue = new Vue({
    el: "#vue-div",
    delimiters: ['${', '}'],
    unsafeDelimiters: ['!{', '}'],
    mounted: function () {
      setTimeout(function () {
        initMap(),
          self.get_all_stories(),
          self.place_all_markers(),
          self.get_all_comments()
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
      search_phrase: null,
      search_results: [],
      expandvar: false,
      expandstory: null,
      marker_dict: {},
      expanded_story: null,
      image_url: "https://i.imgur.com/kla8wkX.png",
      entering_comment: false,
      comment_text: null,
      commenting_post_id: null,
      comment_dict: {},
      like_dict: {},
      my_likes: [],

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
      toggle_heatmap: self.toggle_heatmap,
      update_heatmap: self.update_heatmap,
      place_all_markers: self.place_all_markers,
      closeins: self.closeins,
      search: self.search,
      search_button: self.search_button,
      expandins: self.expandins,
      confirm_comment: self.confirm_comment,
      add_comment_button: self.add_comment_button,
      get_all_comments: self.get_all_comments,
      get_comments: self.get_comments,
      marker_bounce: self.marker_bounce,
      liked: self.liked,

    }
  }

  );
  $("#vue-div").show();
  return self;
}
var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function () { APP = app(); });
