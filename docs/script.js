const mapid = "mapid";
const mapElement = document.getElementById(mapid);

const initMap = function(){
    const mymap = L.map(mapid).setView([51.505, -0.09], 16);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery ? <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoic2F0b3NoaS1oYXNoaW1vdG8iLCJhIjoiY2p4Y2pkcTE4MDQyZzN1bzl4amg5eXZjdyJ9.f7wdt7KnSc3nUmH91yuzuw'
    }).addTo(mymap);
    return mymap;
}

const mymap = initMap();

const succeeded = function(position){
    mapElement.dispatchEvent(new CustomEvent("get-current-position", {detail:{
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }}))
}

const getPosition = function(){
    navigator.geolocation.getCurrentPosition(succeeded);
}


let markers = [];
const removeMarkers = function(){
    for(let i = 0, imax = markers.length; i < imax; ++i){
        mymap.removeLayer(markers[i]);
    }
    markers = [];
}

const createPopupElement = function(item){
    const lat = item.latitude;
    const lon = item.longitude;
    const id = item.id;
    const num = item.num;
    const price = item.price;
    const description = item.description;
    const onclick = "mapElement.callReserve('" + id + "','" + lat + "','" + lon + "')";
    return "<br>名前:" + name + "</br>" +
    "<br>緯度:" + lat + "</br>" +
    "<br>経度:" + lon + "</br>" +
    "<br>設置数:" + num + "</br>" +
    "<br>説明:" + description + "</br>" +
    "<br>価格:" + price + "</br>" +
    "<button onClick=" + onclick + ">予約</button>" 
}

const addMarkers = function(info){
    for(let i = 0, imax = info.length; i < imax; ++i){
        const item = info[i];
        const lat = item.latitude;
        const lon = item.longitude;
        const element = createPopupElement(item);
        const marker = L.marker([lat, lon]).addTo(mymap)
        .bindPopup(element);
        markers[i] = marker
    }
}

const $loading = $("#loading");
const showLoading = function(){
    $loading.show();
};
const hideLoading = function(){
    $loading.hide();
}

class Server{
    constructor(){}
    login(id, password){
        const DUMMY_USERNAME = "テストユーザ0001";
        mapElement.dispatchEvent(new CustomEvent("login-succeeded", {
            detail: DUMMY_USERNAME
        }))
    }
    sendCurrentPosition(lat, lon){
        const DUMMY_NUM = 40;
        let info = []
        for( let i = 0; i < DUMMY_NUM; ++i){
            const latitude = +lat + Math.random() * 0.01 - 0.005;
            const longitude = +lon + Math.random() * 0.01 - 0.005;
            info.push({
                name: "ダミー" + i,
                latitude: latitude,
                longitude: longitude,
                id: "item000" + i,
                description:"ダミー",
                price: "無料",
                num: Math.round(Math.random() * 20) + 5
            })
        }
        setTimeout(function(){
            mapElement.dispatchEvent(new CustomEvent("get-marker-info", {
                detail: info
            }))
        }, 1000)
    }
    reserve(id, lat, lon){
        setTimeout(function(){
            mapElement.dispatchEvent(new CustomEvent("reserve-succeeded", {
                detail: {
                    id: id,
                    lat: lat,
                    lon: lon
                }
            }))
        }, 2000);
    }
    removeReservation(){
        setTimeout(function(){
            mapElement.dispatchEvent(new CustomEvent("remove-reservation-succeeded", {
                detail: {
                    id: id
                }
            }))
        }, 2000);
    }
};
const server = new Server();

let currentPosition = {

}

mapElement.callReserve = function(id, lat, lon){
    mapElement.dispatchEvent(new CustomEvent("reserve-clicked", {
        detail: {
            id: id,
            lat: lat,
            lon: lon
        }
    }))
}

const $displayQRButton = $("#display-qr-button");
$displayQRButton.on("click", function(){
    $('#reserveSucceededModal').modal();
})
mapElement.addEventListener("remove-reservation-succeeded", function(e){
    $displayQRButton.removeClass("btn-primary").addClass("btn-secondary").attr("disabled", "disabled");
});

let routing;
mapElement.addEventListener("reserve-succeeded", function(e){
    const id = e.detail.id;
    const target = {
        lat: e.detail.lat,
        lon: e.detail.lon
    };
    $("#qrcode").children().remove();
    new QRCode(document.getElementById("qrcode"), {
        text: "userid:testuser01, locationid:" + id,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    if(routing !== undefined){
        mymap.removeLayer(routing);
    }
    routing = L.Routing.control({
       waypoints: [
         L.latLng(currentPosition.lat, currentPosition.lon),
         L.latLng(target.lat, target.lon)
       ]
     }).addTo(mymap);
     hideLoading();
    $('#reserveSucceededModal').modal();
    $displayQRButton.removeClass("btn-secondary").addClass("btn-primary").removeAttr("disabled");
});
mapElement.addEventListener("reserve-clicked", function(e){
    const result = confirm("予約しますか？");
    if(result){
        const id = e.detail.id;
        const lat = +e.detail.lat;
        const lon = +e.detail.lon
        showLoading();
        server.reserve(id, lat, lon);
    }
})

mapElement.addEventListener("get-current-position", function(e){
    const lat = +e.detail.lat;
    const lon = +e.detail.lon;
    currentPosition = {
        lat: lat,
        lon: lon
    }
    mymap.setView([ lat,lon ]);
    server.sendCurrentPosition(lat, lon);
    hideLoading();
})

mapElement.addEventListener("get-marker-info", function(e){
    const info = e.detail;
    addMarkers(info);
})

mapElement.addEventListener("login-succeeded", function(e){
    const username = e.detail;
    $("#user-name").text(username);
    getPosition()
})

server.login();