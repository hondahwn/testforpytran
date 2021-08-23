// const { route } = require("../../../routes/auth-routes");

var lat
var lng
var beachMarker
var connection = new WebSocket('ws://localhost:34000')
var current_lat;
var current_lng;
var user_email
connection.onopen = function () {
  // จะทำงานเมื่อเชื่อมต่อสำเร็จ
  console.log("connect webSocket");
  // connection.send("Hello ESUS"); // ส่ง Data ไปที่ Server
};
connection.onerror = function (error) {
  console.error('WebSocket Error ' + error);
};

var maps;
// var position = { lat: current_lat, lng: current_lng};

function geocoderAddress(geocoder, resultsMap) {
  var address = document.getElementById('address').value;
  geocoder.geocode({ 'address': address }, function (results, status) {
    if (status === 'OK') {
      resultsMap.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
        map: resultsMap,
        position: results[0].geometry.location,
      });
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function getLocation() {
  console.log('hi')
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function showPosition(position) {
  current_lat = position.coords.latitude
  current_lng = position.coords.longitude;
}

$(document).ready(function () {
  getemail()
  getLocation();
  $('.request').click(function () {
    $('.popup_box').css({
      "opacity": "1", "pointer-events": "auto"
    });
  });
  $('.btn1').click(function () {
    $('.popup_box').css({
      "opacity": "0", "pointer-events": "none"
    });
    requesttodb(0)
  });
  $('.btn2').click(function () {
    $('.popup_box').css({
      "opacity": "0", "pointer-events": "none"
    });
    requesttodb(1)
  });
  $("#Logout").click(function (e) {
    e.preventDefault();
    window.location.replace('/auth/logout')
  });
 
})

function requesttodb(direction) {
  $.ajax({
    type: "POST",
    url: "/request",
    data: { user_email: user_email, lat: current_lat, lng: current_lng, status: 0, route: direction },
    success: function (response) {
      Swal.fire({
        title: 'Add request success',
        text: "Request success!!!! Please wait",
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.replace('/mapping')
        }
      })
    },
    error: function (xhr) {
      Swal.fire({
        icon: "error",
        title: xhr.responseText,
      });
    }
  });
}

function getemail(){
  $.ajax({
    type: "GET",
    url: "/verify",
    success: function (response) {
      user_email = response.email
    },
    error: function (xhr) {
      Swal.fire({
        icon: "error",
        title: xhr.responseText,
      });
    }
  });
}
// This example creates a 2-pixel-wide red polyline showing the path of
// the first trans-Pacific flight between Oakland, CA, and Brisbane,
// Australia which was made by Charles Kingsford Smith.
function initMap() {
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const map = new google.maps.Map(document.getElementById("map"), {

  });

  directionsRenderer.setMap(map);
  calculateAndDisplayRoute(directionsService, directionsRenderer);


  var image = '/image/car_13260.png';
  var myLatLng = new google.maps.LatLng(19.024647, 99.943809); //or wherever you want the marker placed
  beachMarker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    icon: image

  });


}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  directionsService
    .route({
      origin:
        "19.024647,99.943809"
      ,
      destination:
        "19.040660, 99.931254"
      ,
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
      directionsRenderer.setDirections(response);
    })
    .catch((e) => window.alert("Directions request failed due to " + status));
}

connection.onmessage = function (e) {
  var yourString = e.data;
  var array = [];
  yourString.split(':').forEach(function (value) {
    array.push(value.split(' '));
  });
  // log ค่าที่ถูกส่งมาจาก server
  // console.log("message from server: ", e.data);
  // const map = new google.maps.Map(document.getElementById("map"), {
  //   zoom: 18,
  //   center: { lat: 19.024647, lng: 99.943809 },
  // });

  lat = parseFloat(array[2])
  lng = parseFloat(array[4])
  var latlng = new google.maps.LatLng(lat, lng);
  redraw()
  beachMarker.setPosition(latlng);

};

