      function initMap() {
        var santacruz = {lat: 36.9741, lng: -122.0308};
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: santacruz
        });
        var marker = new google.maps.Marker({
          position: santacruz,
          map: map
        });
      }


    