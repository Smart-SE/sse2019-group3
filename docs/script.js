const mapid = "mapid";
const mapElement = document.getElementById(mapid);
const DEMO_USERNAME = "テストユーザ0001";
const DEMO_USER_HID = 2;
const DEMO_USER_PASSWORD = "root";
const DEMO_POST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoidG9kb191c2VyIn0.NwfY6l1JIzSIj4fYWuaLWmlR1uDCYF0DqsZll0JHUHs";

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


const removeMarkers = function(){
    const markers = server.markers;
    for(let i = 0, imax = markers.length; i < imax; ++i){
        mymap.removeLayer(markers[i]);
    }
    server.markers = [];
}

const getRowString = function(name, value, style){
    if(style == null)  return "<tr><th>" + name + "</th><th>" + value + "</th></tr>";
    return "<tr style='" + style + "'><th>" + name + "</th><th>" + value + "</th></tr>";
}

const getSex = function(sex){
    if(sex == 1) return "男のみ";
    if(sex == 2) return "女のみ";
    return "男女"
}

const getFreqColor = function(freq){
    if(freq == 1) return "yellow";
    if(freq == 2) return "red";
    return "blue";
}

const getFreqMessage = function(freq){
    if(freq == 1) return "中";
    if(freq == 2) return "高";
    return "低";
}

const createPopupElement = function(item){
    const name = item.name;
    const lat = item.latitude;
    const lon = item.longitude;
    const id = item.id;
    const current_num = item.current_num;
    const max_num = item.max_num;
    const fee = item.fee;
    const address = item.address;
    const date = item.date;
    const freq = item.freq;
    const sex = item.sex;
    const color = getFreqColor(freq);
    const onclick = "mapElement.callReserve('" + id + "','" + lat + "','" + lon + "')";
    return "<div><table class='table'>" +
                "<tbody>" +
                getRowString("名前", name) +
                getRowString("階層", address + "F") +
                getRowString("使用頻度",  getFreqMessage(freq), "color:" + color) +
                getRowString("種別", getSex(sex)) +
                getRowString("予約数", current_num) +
                getRowString("最大数", max_num) +
                getRowString("価格", fee + "円") +
                getRowString("更新時刻", date) +
                "</tbody>" +
            "</table></div>" +
            "<div><button  class='btn btn-primary' onClick=" + onclick + ">予約</button></div>" ;
}

const addMarkers = function(){
    const info = server.locations;
    for(let i = 0, imax = info.length; i < imax; ++i){
        const item = info[i];
        const id = item.id;
        const lat = item.latitude;
        const lon = item.longitude;
        const element = createPopupElement(item);
        const marker = L.marker([lat, lon]).addTo(mymap)
        .bindPopup(element);
        server.markers[id] = marker
    }
}

const updateFreq = function(){
    $.ajax({
        type:"get",
        url: "http://13.112.165.3:3000/freq"
    })
    .done(function(result){
        for(let i = 0, imax = result.length; i < imax; ++i){
            const data = result[i];
            const tid = data.tid;
            const item = server.locations[tid];
            item.freq = data.freq;
            item.date = new Date().toLocaleString();
            server.markers[tid]._popup.setContent(createPopupElement(item));
        }
    })
}


const $loading = $("#loading");
const showLoading = function(){
    $loading.show();
};
const hideLoading = function(){
    $loading.hide();
}

const getToiletLocations = function(lat, lon){
    {
        $.when(
            $.ajax({
                type:"get",
                url: "http://13.112.165.3:3000/toilet_pos"
            }),
            $.ajax({
                type:"get",
                url: "http://13.112.165.3:3000/environment"
            }),
            $.ajax({
                type:"get",
                url: "http://13.112.165.3:3000/freq"
            }),
            $.ajax({
                type:"get",
                url: "http://13.112.165.3:3000/reserve_toilet"
            }),
        )
        .done((pos, environment, freq, reserve) => {
            let info = [];
            for( let i = 0, imax = pos[0].length; i < imax; ++i){
                const item = pos[0][i];
                info.push({
                    name: "トイレ" + item.tid,
                    latitude: item.longitude, /* 7/11 10:38時点でDB格納のダミーデータで緯度、経度が逆転しているため*/
                    longitude: item.latitude,/* 7/11 10:38時点でDB格納のダミーデータで緯度、経度が逆転しているため*/
                    id: item.tid,
                    address: item.address,
                    date: new Date().toLocaleString()
                })
            }
            for( let i = 0, imax = environment[0].length; i < imax; ++i){
                const item = environment[0][i]
                const tid = item.tid;
                info[tid].room = item.room;
                info[tid].sex = item.sex;
                info[tid].fee = item.fee;
            }
            for( let i = 0, imax = freq[0].length; i < imax; ++i){
                const item = freq[0][i]
                const tid = item.tid;
                info[tid].freq = item.freq;
            }
            for( let i = 0, imax = reserve[0].length; i < imax; ++i){
                const item = reserve[0][i]
                const tid = item.tid;
                info[tid].current_num = item.current_num;
                info[tid].max_num = item.max_num;
            }
            server.locations = info;
            addMarkers();
        })
    }
}

class Server{
    constructor(){
        this.markers = [];
        this.locations = [];
        this.id = null;
        this.reserve_id = null;
    }
    login(id, password){
        $.ajax({
            timeout:5000,
            type:"get",
            url: "http://13.112.165.3:3000/account?hid=eq." + id + "\&password=eq." + password
        }).
        done((data) => {
            mapElement.dispatchEvent(new CustomEvent("login-succeeded", {
                detail: DEMO_USERNAME
            }))
            setInterval(updateFreq, 1000000)
        })
    }
    sendCurrentPosition(lat, lon){
        getToiletLocations(lat, lon);
    }
    reserve(id, lat, lon){
        if(this.reserve_id != null){
            alert("二つ以上予約できません");
            mapElement.dispatchEvent(new CustomEvent("reserve-failed", {
                detail: {}
            }));
            return;
        }
        this.tid = +id;
        const reserveId = Math.round(Math.random() * 10000);
        const data = JSON.stringify({
            reserve_id: reserveId,
            tid: this.tid,
            hid: DEMO_USER_HID
        });
        $.ajax({
            type:"POST",
            url: "http://13.112.165.3:3000/reserve_info",
            dataType: "json",
            contentType: "application/json",
            data: data,
            beforeSend: function( xhr, settings ) {
                 xhr.setRequestHeader( 'Authorization', `Bearer ${DEMO_POST_TOKEN}`);
            },
            setTimeout: 3000
        }).
        done((data) => {
            this.reserve_id = reserveId;
            mapElement.dispatchEvent(new CustomEvent("reserve-succeeded", {
                detail: {
                    id: reserveId,
                    lat: lat,
                    lon: lon
                }
            }))
        })
        .fail((data) => {
            this.reserve_id = reserveId;
            mapElement.dispatchEvent(new CustomEvent("reserve-succeeded", {
                detail: {
                    id: reserveId,
                    lat: lat,
                    lon: lon
                }
            }))
        });
    }
    removeReservation(){
        if(this.reserve_id == null) return;
        $.ajax({
            type:"DELETE",
            url: "http://13.112.165.3:3000/reserve_info?reserve_id=eq." + this.reserve_id,
            dataType: "json",
            contentType: "application/json",
            beforeSend: function( xhr, settings ) {
                 xhr.setRequestHeader( 'Authorization', `Bearer ${DEMO_POST_TOKEN}`);
            },
            setTimeout: 3000
        }).
        done((data) => {
            this.reserve_id = null;
            mapElement.dispatchEvent(new CustomEvent("remove-reservation-succeeded", {
                detail: {}
            }))
        })
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

const $deReserveButton = $("#de-reserve-button");
$deReserveButton.on("click", function(){
    const result = confirm("予約解除しますか？");
    if(result){
        server.removeReservation();
    }
})

mapElement.addEventListener("remove-reservation-succeeded", function(e){
    confirm("予約解除しました");
    mymap.closePopup();
    mymap.removeControl(routing);
    $displayQRButton.removeClass("btn-primary").addClass("btn-secondary").attr("disabled", "disabled");
    $deReserveButton.removeClass("btn-primary").addClass("btn-secondary").attr("disabled", "disabled");
});

let routing;
mapElement.addEventListener("reserve-failed", function(e){
    hideLoading();
});
mapElement.addEventListener("reserve-succeeded", function(e){
    const id = e.detail.id;
    const target = {
        lat: e.detail.lat,
        lon: e.detail.lon
    };
    $("#qrcode").children().remove();
    new QRCode(document.getElementById("qrcode"), {
        text: "userid:" + DEMO_USER_HID + ", locationid:" + id,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    if(routing !== undefined){
        mymap.removeControl(routing);
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
    $deReserveButton.removeClass("btn-secondary").addClass("btn-primary").removeAttr("disabled");

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


mapElement.addEventListener("login-succeeded", function(e){
    const username = e.detail;
    $("#user-name").text(username);
    getPosition();
})

server.login(DEMO_USER_HID, DEMO_USER_PASSWORD);