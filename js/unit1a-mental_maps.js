//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//Create SVG element // viewBox for responsive Map
var svg = d3.select(".map")
            .append("svg")
            //responsive size
            .attr("viewBox", [0, 0, width, height])
            //dunno seems nice
            .attr("preserveAspectRatio", "xMinYMin")
            .append("g")
            .attr("class","mapbox");

var projection = d3.geoMercator()
                    //.fitSize([mapWidth, mapHeight], geojson)
                    .fitSize([width, height])
                    .translate([0, 0])
                    .scale(1);


//Define path generator
var path = d3.geoPath()
            .projection(projection);

//Load in GeoJSON data //Promise resolve
d3.json("../geojson/world_countries2020.geojson")
    .then(drawMap)
    .catch(error => {console.log("Ooops, Error: " + error)});

//Build Map
function drawMap(data){
    console.log(data)
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    var bbox = path.bounds(data),
        s = .92 / Math.max((bbox[1][0]-bbox[0][0])/ width, (bbox[1][1] - bbox[0][1]) / height),
        t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];
    // Update the projection    
    projection
        .scale(s)
        .translate(t); 
    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("name", function(d){
            return d.properties.NAME_ENGL;
        })
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("click", function(d){
            console.log(this);
        });
};