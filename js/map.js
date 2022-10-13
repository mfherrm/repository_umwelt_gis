console.log("hi map.js ICH BIN D3 CODE VON TONI");

const width = d3.select(".map").innerWidth-50, //attr width/height ansprechen
    height = d3.select(".map").innerHeight-50;

const svg = d3.select(".map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const projection = d3.geoMercator().translate([0,0]).scale(1);

const path = d3.geoPath().projection(projection);

//Funktioniert
/*
d3.json("geojson/bundeslaender.geojson")
    .then(function (laender) {

    console.log(laender)

    var b = path.bounds(laender),
    s = .95 / Math.max((b[1][0]-b[0][0])/
        width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) /
        2, (height - s * (b[1][1] + b[0][1])) / 2];
    
    projection.scale(s).translate(t);
    
    var laender = svg.selectAll(".laender").data(laender.features)
        .enter().append("path").attr("d",path).attr("class","laender");

    d3.json("geojson/airport.geojson")
        .then(function (airport) {
            console.log(airport)
            
            var airport = svg.selectAll(".airport").data(airport.features)
                .enter().append("image")
                .attr("class","airport")
                .attr("xlink:href", "http://www.clker.com/cliparts/1/4/5/a/1331068897296558865Sitting%20Racoon.svg")
                .attr("width", 25)
                .attr("height", 25)
                .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; 
            })
        })
    });
*/

Promise.all([d3.json("geojson/bundeslaender.geojson"),d3.json("geojson/airport.geojson")])
    .then(makeMyMap).catch(error => {console.log("Error")})

function makeMyMap(data) { 
    console.log(data[0]);
    console.log(data[1]) 
    var b = path.bounds(data[1]),
    s = .92 / Math.max((b[1][0]-b[0][0])/
        width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) /
        2, (height - s * (b[1][1] + b[0][1])) / 2];
    
    projection.scale(s).translate(t);
    
    var laender = svg.selectAll(".laender").data(data[0].features)
        .enter().append("path").attr("d",path).attr("class","laender"); 

    var airport = svg.selectAll(".airport").data(data[1].features)
    .enter().append("image")
    .attr("class","airport")
    .attr("xlink:href", "http://www.clker.com/cliparts/1/4/5/a/1331068897296558865Sitting%20Racoon.svg")
    .attr("width", 25)
    .attr("height", 25)
    .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")";})   
}
