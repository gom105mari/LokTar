var cnt_place = 0;

var language = "ko";
var distance_mode = "driviing";

var default_start = "Start";
var default_waypoint = "Waypoint";
var default_end = "End";

var max_place = 5;
var places = [];

var weather_api_key = " 5112765d5cf84fb1786e55f9836758db";
var directionsDisplay;
var directionsService;

var current_index;

// Initialize function
var init = function() {
    console.log("init() called");

    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if (e.keyName == "back") {
            try {
                tizen.application.getCurrentApplication().exit();
            } catch (error) {
                console.error("getCurrentApplication(): " + error.message);
            }
        }
    });
    var default_name;
    for (var i = 0; i < max_place; i++) {
        if (i === 0) {
            default_name = default_start;
        } else if (i === (max_place - 1)) {
            default_name = default_end;
        } else {
            default_name = default_waypoint + " " + i;
        }
        places.push({
            "name" : default_name
        });
    }

    makeRoute(0);
    makeRoute(1);
    makeRoute(max_place - 1);

    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
};
// window.onload can work without <body onload="">
window.onload = init;
// /////////////////////////

function setLatLng(index) {
    var name = places[index]["name"];
    current_index = index;
    rest.get('http://maps.googleapis.com/maps/api/geocode/json', null, {
        "address" : name,
        "sensor" : "false",
        "language" : language
    }, function(data, xhr) {
        var lat = data["results"][0]["geometry"]["location"]["lat"];
        var lng = data["results"][0]["geometry"]["location"]["lng"];
        console.log("success: name[" + name + "], lat[" + lat + "], lng[" + lng
                + "]");
        places[index]["lat"] = lat;
        places[index]["lng"] = lng;
        showDisplay(lat, lng);
        getAddress(lat + "," + lng);
    }, function(data, xhr) {
        console.log("error");
    });
}

function showDisplay(lat, lng) {
    var mapOptions = {
        zoom : 10,
        center : new google.maps.LatLng(lat, lng),
        mapTypeId : google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document
            .getElementById('div_direction_display'), mapOptions);

    var marker = new google.maps.Marker({
        position : map.getCenter(),
        draggable : true,
        map : map
    });

    directionsDisplay.setMap(map);

    google.maps.event.addListener(marker, 'mouseup', function() {
        var latlng = marker.getPosition();
        map.setCenter(latlng);
        getAddress(latlng.lat() + "," + latlng.lng());
    });

}

function getAddress(latlng) {
    rest
            .get(
                    'http://maps.googleapis.com/maps/api/geocode/json',
                    null,
                    {
                        "latlng" : latlng,
                        "sensor" : "false"
                    },
                    function(data, xhr) {
                        if (data["status"] === "ZERO_RESULTS") {
                            console.log("Unsupported places");
                        } else {
                            places[current_index]["name"] = data["results"][0]["formatted_address"];
                            makeRoute(current_index);
                        }
                    }, function(data, xhr) {
                    });
}

function callWeather(index) {
    if (places[index]["name"] !== "" && (places[index]["name"].indexOf(default_waypoint) == -1)) {
        var lat = places[index]["lat"];
        var lng = places[index]["lng"];
        rest.get('http://api.openweathermap.org/data/2.5/weather', null, {
            "lat" : lat,
            "lon" : lng
        }, function(data, xhr) {
            getWeather(data);
            getWeatherForWeek(lat, lng);
        }, function(data, xhr) {
        });
    }
}

function getWeather(data) {
    var place_display = document.getElementById("weather_place");
    var display = document.getElementById('div_weather_main_display');
    var weather = data["weather"];
    place_display.innerHTML = "<label>" + data["name"] + ", "
            + data["sys"]["country"] + "</label><br>";

    makeMainWeather(data);
}

function convertTemp(temp) {
    return (temp - 273.15).toFixed(1);
}

function btnClick(index) {
    var div_weather = document.getElementById("div_weather_display");
    if (div_weather.style.display === 'block') {
        callWeather(index);
    } else {
        var div;
        var msg;
        var id;
        if (index === 0) {
            div = document.getElementById("div_start");
            id = "input_start";
            msg = "Input the place of departure";
        } else if (index === (max_place - 1)) {
            div = document.getElementById("div_end");
            id = "input_end";
            msg = "Input the place of arrival";
        } else {
            div = document.getElementById("div_waypoint");
            id = "input_waypoint";
            msg = "Input the place of waypoint";
        }
        div.innerHTML = "<input type='text' id='" + id + "' placeholder='"
                + msg + "' onkeypress='setPlace(" + index + ")'>";
    }
}

function setPlace(index) {
    if (event.keyCode == 13) {
        convertDiv(0);
        var place;
        if (index === 0) {
            place = document.getElementById("input_start").value;
        } else if (index === max_place - 1) {
            place = document.getElementById("input_end").value;
        } else {
            place = inter = document.getElementById("input_waypoint").value;
        }
        if (place !== "") {
            places[index]["name"] = place;
            setLatLng(index);
        } else {
            makeRoute(index);
        }
    }
}

function makeRoute(index) {
    var place = places[index]["name"];
    if (index === 0) {
        div = document.getElementById("div_start");
    } else if (index === max_place - 1) {
        div = document.getElementById("div_end");
    } else {
        div = document.getElementById("div_waypoint");
    }
    if (place !== "") {
        if (index == 0) {
            div.innerHTML = "<label class='route_label' id='lbl_start' onclick='btnClick(0)'>"
                    + place + "</label>";
        } else if (index == (max_place - 1)) {
            div.innerHTML = "<label class='route_label' id='lbl_end' onclick='btnClick("
                    + index + ")'>" + place + "</label>";
        } else {
            div.innerHTML = "";
            var prefix = "";
            var postfix = "";
            if (index === 1) {
                postfix = "<label class='route_label' id='lbl_waypoint_post' onclick='makeRoute("
                        + (index + 1) + ")'> ▶</label>";
            } else if (index === (max_place - 1)) {
                prefix = "<label class='route_label' id='lbl_waypoint_pre' onclick='makeRoute("
                        + (index - 1) + ")'>◀ </label>";
            } else {
                if ((index + 1) < (max_place - 1)) {
                    postfix = "<label class='route_label' id='lbl_waypoint_post' onclick='makeRoute("
                            + (index + 1) + ")'> ▶</label>";
                }
                prefix = "<label class='route_label' id='lbl_waypoint_pre' onclick='makeRoute("
                        + (index - 1) + ")'>◀ </label>";
            }
            div.innerHTML += prefix;
            div.innerHTML += "<label class='route_label' id='lbl_waypoint' onclick='btnClick("
                    + index + ")'>" + place + "</label>";
            div.innerHTML += postfix;
        }
    }
}

function callRoute(callback) {
    if (places[0]["name"] === "" || places[max_place - 1]["name"] === "") {
        console.log("Please check the departure or arraival place");
    } else {
        var start = places[0]["lat"] + "," + places[0]["lng"];
        var end = places[max_place - 1]["lat"] + ","
                + places[max_place - 1]["lng"];
        var ways = [];
        for (var i = 1; i < (places.length - 1); i++) {
            if (places[i]["name"] !== "" && (places[i]["name"].indexOf(default_waypoint) == -1)) {
                ways.push({
                    location : places[i]["lat"] + "," + places[i]["lng"]
                });
            }
        }
        if(ways.length == 0) {
            ways = null;
        }

        var request = {
            origin : start,
            destination : end,
            waypoints : ways,
            travelMode : google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, callback);
    }
}

function showDirection() {
    convertDiv(0);
    callRoute(function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else if (status === "ZERO_RESULTS") {
            console.log("Unsupported places");
        }
    });
}

function showDistance() {
    convertDiv(1);
    callRoute(function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var div = document.getElementById("div_distance_display");
            div.innerHTML = "";

            var route = response.routes[0];
            for (var i = 0; i < route.legs.length; i++) {
                if (i === 0) {
                    div.innerHTML += "<label id='place'>"
                            + route.legs[i].start_address + "</label>";
                }
                div.innerHTML += "<label id='distance'>"
                        + route.legs[i].distance.text + "</label>";
                div.innerHTML += "<label id='distance'>"
                        + route.legs[i].duration.text + "</label>";
                div.innerHTML += "<label id='place'>"
                        + route.legs[i].end_address + "</label>";
            }
        } else if (status === "ZERO_RESULTS") {
            console.log("Unsupported places");
        }
    });
}

function showWeather() {
    convertDiv(2);
    callWeather(0);
}

function convertDiv(index) {
    var div_direction = document.getElementById("div_direction_display");
    var div_distance = document.getElementById("div_distance_display");
    var div_weather = document.getElementById("div_weather_display");

    if (index === 0) {
        if (div_direction.style.display == 'none') {
            div_direction.style.display = 'block';
        }
        if (div_distance.style.display == 'block') {
            div_distance.style.display = 'none';
        }
        if (div_weather.style.display == 'block') {
            div_weather.style.display = 'none';
        }
    } else if (index === 1) {
        if (div_distance.style.display == 'none') {
            div_distance.style.display = 'block';
        }
        if (div_direction.style.display == 'block') {
            div_direction.style.display = 'none';
        }
        if (div_weather.style.display == 'block') {
            div_weather.style.display = 'none';
        }
    } else {
        if (div_weather.style.display == 'none') {
            div_weather.style.display = 'block';
        }
        if (div_direction.style.display == 'block') {
            div_direction.style.display = 'none';
        }
        if (div_distance.style.display == 'block') {
            div_distance.style.display = 'none';
        }
    }
}

function getWeatherForWeek(lat, lon) {
    rest.get('http://api.openweathermap.org/data/2.5/forecast/daily', null, {
        "lat" : lat,
        "lon" : lon,
        "cnt" : "7",
        "mode" : "json"
    }, function(data, xhr) {
        makeSubWeather(data);
    }, function(data, xhr) {
    });
}

function makeMainWeather(data) {
    var div = document.getElementById("div_weather_main_display");
    div.innerHTML = "";
    div.innerHTML += "<table id='main_table'><thead><tr><th>Temperature</th><th>Wind</th><th>Cloudiness</th><th>Pressure</th><th>Humidity</th></tr></thead><tbody><tr><td>"
            + convertTemp(data["main"]["temp"])
            + "°C</td><td>"
            + data["wind"]["speed"]
            + "ms</td><td>"
            + data["clouds"]["all"]
            + "%</td><td>"
            + data["main"]["pressure"]
            + "hpa</td><td>"
            + data["main"]["humidity"] + "%</td></tr></tbody></table>";
}

function makeSubWeather(data) {
    var div = document.getElementById("div_weather_sub_display");
//    for ( var i in data["list"]) {
//        console.log(data["list"][i]["weather"][0]["main"]);
//    }
    div.innerHTML = "";
    div.innerHTML += "<table id='sub_table'><thead><tr><td>"
        + data["list"][0]["weather"][0]["main"] + "</td><td>"
        + data["list"][1]["weather"][0]["main"] + "</td><td>"
        + data["list"][2]["weather"][0]["main"] + "</td><td>"
        + data["list"][3]["weather"][0]["main"] + "</td><td>"
        + data["list"][4]["weather"][0]["main"] + "</td><td>"
        + data["list"][5]["weather"][0]["main"] + "</td><td>"
        + data["list"][6]["weather"][0]["main"] + "</td><td>"
        + "</td></tr></thead><tbody><tr><td>"
        + "<img src='http://openweathermap.org/img/w/" + data["list"][0]["weather"][0]["icon"] + ".png'></td><td>"
        + "<img src='http://openweathermap.org/img/w/" + data["list"][1]["weather"][0]["icon"] + ".png'></td><td>"
        + "<img src='http://openweathermap.org/img/w/" + data["list"][2]["weather"][0]["icon"] + ".png'></td><td>"
        + "<img src='http://openweathermap.org/img/w/" + data["list"][3]["weather"][0]["icon"] + ".png'></td><td>"
        + "<img src='http://openweathermap.org/img/w/" + data["list"][4]["weather"][0]["icon"] + ".png'></td><td>"
        + "<img src='http://openweathermap.org/img/w/" + data["list"][5]["weather"][0]["icon"] + ".png'></td><td>"
        + "<img src='http://openweathermap.org/img/w/" + data["list"][6]["weather"][0]["icon"] + ".png'></td><td>"
        + "</tbody></table>";
}