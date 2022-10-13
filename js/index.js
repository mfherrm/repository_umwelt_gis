window.addEventListener("DOMContentLoaded", event=>{
    console.log("Alles bereit")
    initMap();
})

function initMap(){
    var map = L.map('map').setView([59.95, 30.3], 10);

    var marker = new L.marker([]);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    
    
    
}

function markerOnClick(e){
    console.log(this.getLatLlng());
}