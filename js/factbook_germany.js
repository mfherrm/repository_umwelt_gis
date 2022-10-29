//Width and height
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var width = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);


//Create SVG element // viewBox for responsive Map
var svg = d3.select("#germany-overview")
            .append("svg")
            //responsive size
            .attr("viewBox", [0, 0, width, height])
            //dunno seems nice
            .attr("preserveAspectRatio", "xMinYMin meet")
            .append("g")
            .attr("class","mapbox");

//Define map projection

var projection = d3.geoAzimuthalEqualArea()
            .scale(.4)
            .translate([0.005,-0.02])  //1.left/right (lon) 2.up/down (lat)
            .rotate([-10,-52]); // 1.right/left (lon) 2.up/down (lat) e.g. negative lon/lat at center            
            //if parallels --> analoge
/*
var projection = d3.geoMercator()
    //.fitSize([mapWidth, mapHeight], geojson)
    .translate([.1,-.66])
    .scale(.4)
*/
var color = d3.scaleOrdinal(d3.schemeSet3);

//Define path generator
var path = d3.geoPath()
            .projection(projection);
            
//Load in GeoJSON data //Promise resolve
d3.json("../geojson/germany_overview.geojson")
    .then(drawMap)
    .catch(error => {console.log("Ooops, Error: " + error)});

//Build Map
function drawMap(data){
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    var bbox = path.bounds(data),
        s = .92 / Math.max((bbox[1][0]-bbox[0][0])/ width, (bbox[1][1] - bbox[0][1]) / height),
        t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];
    // Update the projection    
    projection
        .scale(s)
        .translate(t); 

    //Bind data and create one path per GeoJSON feature
    svg.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class",function(d) {
            return d.properties.LEVL_CODE == 0 ? "country" : "bundesland";
        })
        .attr("fill", function(d,i){
            console.log(color(i))
            return d.properties.LEVL_CODE == 0 ? "lightgrey" : color(i);
        })
};
