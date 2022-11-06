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
            return d.properties.LEVL_CODE == 0 ? "country-overview" : "bundesland";
        })
        .attr("fill", function(d,i){
            if(d.properties.NUTS_NAME == "Deutschland"){
                return "none"
            }else {
                return d.properties.LEVL_CODE == 0 ? "lightgrey" : color(i);
            }
        })
        .attr("stroke","grey")

    //Link to Map Labels: https://bost.ocks.org/mike/map/
    svg.selectAll(null)
        .data(data.features)
        .enter().append("text")
        .attr("class", "subunit-label")
        .attr("transform", function(d) { 
            //console.log(path.centroid(d))
            return "translate(" + path.centroid(d) +")"; 
        })
        .attr("dy", ".35em")
        .text(function(d) { 
            console.log(d)
            return d.properties.NAME_LATN
        });
    
    drawScalebar();
};

function drawScalebar(){
    var scaleBar = d3.geoScaleBar()
                        .projection(projection)
                        //for other procejtion sepcify ".radius"??? ---https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar#scaleBarPositioned ---https://github.com/HarryStevens/d3-geo-scale-bar#sizing 
                        .size([width, height])
                        //sets the vertical tick size of the scale bar in pixels
                        //sets ticks on specified distances OR use distance for automatic specification
                        .top(.97)
                        .left(.03)
                        .distance(200)
                        .tickValues( [0,200])
                        .orient(d3.geoScaleTop)
                        .tickSize(2)
                        .tickFormat((d, i, e) => i === e.length - 1 ? `${d} km` : d)
                        .zoomClamp(false)
                        .tickPadding(8)
                        .label(null)
                        ;
                        // How far the tick text labels are from the line

    var scaleSvg = d3.select(".mapbox")
                        .append("g")
                        .attr("class","scalebar");
    
    scaleSvg.append("g").call(scaleBar);

    d3.selectAll(".tick").attr("class","scalebartick") 
};