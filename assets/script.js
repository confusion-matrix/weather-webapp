async function apiCall(event) {
    var cityURL, forecastURL;
    if (event.data !== null) {
        cityURL = "https://api.openweathermap.org/data/2.5/weather?q=" + event.data.param + "&units=imperial&appid=dc13b3e193f3a4a5ad7ecc00213ab023";
        forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + event.data.param + "&units=imperial&appid=dc13b3e193f3a4a5ad7ecc00213ab023";

    } else {
        cityURL = "https://api.openweathermap.org/data/2.5/weather?q=" + $("#text-box").val() + "&units=imperial&appid=dc13b3e193f3a4a5ad7ecc00213ab023";
        forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + $("#text-box").val() + "&units=imperial&appid=dc13b3e193f3a4a5ad7ecc00213ab023";
    }
    // Day Data
    Promise.all([
        fetch(cityURL),
        fetch(forecastURL)
    ])
        .then(function(res) {
            return Promise.all(res.map(function (res) {
                return res.json();
            }));
        })
        .then(function(data) {
            console.log(data);
            $("#text-box").val("");
            $("#city-stats").empty();
            $("#five-day").empty();

            if (event.data === null)
                addHistory(data[0].name);

            // !!! --- CITY CONTAINER --- !!!
            $("<h2/>", {
                id: "cityHeader"
            }).text(data[0].name + " ").appendTo("#city-stats");
            $("<span/>").text(moment().format("MM/DD/YYYY")).appendTo("#cityHeader");
            $("<span/>", {
                id: "img1",
                display: "inline-block"
            }).appendTo("#cityHeader");
            $("<img/>", {
                src: "https://openweathermap.org/img/w/" + data[0].weather[0].icon + ".png"
            }).appendTo("#img1");
            $("<p/>").text("Temp: " + data[0].main.temp + "\xB0F").appendTo("#city-stats");
            $("<p/>").text("Wind: " + data[0].wind.speed + "mph").appendTo("#city-stats");
            $("<p/>").text("Humidity: " + data[0].main.humidity + "%").appendTo("#city-stats");
            getUV(data[0].coord.lat, data[0].coord.lon);
            
            // !!! --- 5 DAY FORECAST CONTAINER --- !!!
            $("<h2/>", {
                id: "forecast-head"
            }).text("5-Day Forecast:").appendTo("#five-day");
            $("<div/>", {
                id: "forecast-container"
            }).appendTo("#forecast-head");
            for (var i = 0, j = 9; i < 5; i++, i === 4 ? j = 39 : j += 8) {
                $("<div/>", {
                    id: "day" + i,
                    class: "days"
                }).appendTo("#forecast-container");
                $("<h3/>").text(moment(data[1].list[j].dt_txt.split(" ")[0], "YYYY-MM-DD").format("MM/DD/YYYY")).appendTo("#day" + i);
                // Dislay icon here;
                $("<img/>", {
                    src: "https://openweathermap.org/img/wn/" + data[1].list[j].weather[0].icon + "@2x.png"
                }).appendTo("#day" + i);
                $("<p/>").text("Temp: " + data[1].list[j].main.temp + "\xB0F").appendTo("#day" + i);
                $("<p/>").text("Wind: " + data[1].list[j].wind.speed + "mph").appendTo("#day" + i);
                $("<p/>").text("Humidity: " + data[1].list[j].main.humidity + "%").appendTo("#day" + i);
                
            }
        })
}

async function getUV(lat, lon) {
    var UV = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=dc13b3e193f3a4a5ad7ecc00213ab023";
    await fetch(UV)
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {
            console.log(data);
            $("<p/>").text("UV: " + data.current.uvi).appendTo("#city-stats");
        })
}

function createHistory() {
    var data = JSON.parse(localStorage.getItem("weatherHistory"));
    // create containers
    for (var i = 0; i < 8; i++) {
        $("<div/>", {
            id: "history-box" + i,
            class: "history-style",
        }).hide().appendTo("#history");
        $("<button/>", {
            id: "history-btn" + i,
            class: "history-button",
        }).appendTo("#history-box" + i);
        // initialize if contained in local storage
        if (data !== null && i < data.length) {
            $("#history-btn" + i).text(data[i]).click({param: data[i]}, apiCall);;
            $("#history-box" + i).show();
        }
    }
}

function addHistory(city) {
    console.log("add history")
    var data = JSON.parse(localStorage.getItem("weatherHistory"));
    // update local storage
    if (data !== null && !data.includes(city)) {
        if (data.length < 8)
            data.unshift(city);
        else {
            data.pop();
            data.unshift(city);
        }
        localStorage.setItem("weatherHistory", JSON.stringify(data));
    } else if (data !== null && data.includes(city)) {
        console.log("Reshape");
        // move existing data to the top - ADD THIS ON CLICK
        data.splice(data.indexOf(city), 1);
        data.unshift(city);
        console.log("SPLICE RESULT: " + data)
        localStorage.setItem("weatherHistory", JSON.stringify(data));
    } else
        localStorage.setItem("weatherHistory", JSON.stringify([city]));
    // retrieve local storage data and update HTML
    data = JSON.parse(localStorage.getItem("weatherHistory"));
    // reassign button on click function and name
    if (data !== null && data.length > 1) {
        for (var i = 0; i < (data.length - 1); i++) {
            $("#history-btn" + i).text(data[i]).click({param: data[i]}, apiCall);
            $("#history-box" + i).show();
            $("#history-btn" + (i + 1)).text(data[i + 1]).click({param: data[i + 1]}, apiCall);
            $("#history-box" + (i + 1)).show();
        }        
    } else {
        $("#history-btn0").text(city).click({param: city}, apiCall);
        $("#history-box0").show();
    } 
}

$(function() {
    console.log("Ready!");
    $("#submit-btn").click(apiCall);
    createHistory();

})
