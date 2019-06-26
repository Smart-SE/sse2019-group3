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
const addElement = function(){
    var marker = L.marker([51.5, -0.09]).addTo(mymap);
    var circle = L.circle([51.508, -0.11], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
    }).addTo(mymap);
    var polygon = L.polygon([
        [51.509, -0.08],
        [51.503, -0.06],
        [51.51, -0.047]
    ]).addTo(mymap);
    marker.bindPopup("<br>Hello world!</br><br>I am a popup.").openPopup();
    circle.bindPopup("I am a circle.");
    polygon.bindPopup("I am a polygon.");
    var popup = L.popup();
    
    function onMapClick(e) {
        popup
            .setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(mymap);
    }
    
    mymap.on('click', onMapClick);
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
    const onclick = "mapElement.callReserve('" + id + "')";
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

const createDummyInfo = function(args){
    const lat = args[0];
    const lon = args[1];
    const DUMMY_NUM = 40;
    let info = []
    for( let i = 0; i < DUMMY_NUM; ++i){
        const latitude = lat + Math.random() * 0.01 - 0.005;
        const longitude = lon + Math.random() * 0.01 - 0.005;
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
    mapElement.dispatchEvent(new CustomEvent("get-marker-info", {
        detail: info
    }))
}

mapElement.callReserve = function(id){
    mapElement.dispatchEvent(new CustomEvent("reserve-clicked", {
        detail: id
    }))
}

mapElement.addEventListener("reserve-clicked", function(e){
    const id = e.detail;
    console.log(id);
})

mapElement.addEventListener("get-current-position", function(e){
    console.log(e.detail)
    const lat = +e.detail.lat;
    const lon = +e.detail.lon;
    mymap.setView([ lat,lon ]);
    setTimeout(createDummyInfo, 1000, [lat, lon]);
})

mapElement.addEventListener("get-marker-info", function(e){
    const info = e.detail;
    addMarkers(info);
})

getPosition()