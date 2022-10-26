//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//Create SVG element // viewBox for responsive Map
var svgBoundaries = d3.select("#adm-map")
            .append("svg")
            //responsive size
            .attr("viewBox", [0, 0, width, height])
            //dunno seems nice
            .attr("preserveAspectRatio", "xMinYMin");


var projectionGermany = d3.geoMercator()
            .translate([0,0])
            .scale(1);

var pathBoundaries = d3.geoPath()
            .projection(projectionGermany);

Promise.all([d3.json("../geojson/kenya_nation.geojson"),d3.json("../geojson/germany_nation.geojson"),d3.json("../geojson/zaf_nation.geojson")])
    .then(drawGermany)
    .catch(error => {console.log("Ooops, Error: " + error)});

function drawGermany(data){
    console.log(data)
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    var bbox = pathBoundaries.bounds(data[0]),
    s = .92 / Math.max((bbox[1][0]-bbox[0][0])/ width, (bbox[1][1] - bbox[0][1]) / height),
    t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];
    // Update the projection    
    projectionGermany
        .scale(s)
        .translate(t); 

    svgBoundaries.selectAll("path")
        .data(data[1].features)
        .enter()
        .append("path")
        .attr("d", pathBoundaries)
        .attr("class", "country")
        .attr("fill", "grey");
}