console.log("hello")

//Width and height
var w = 500;
var h = 300;

//Define map projection
const projection = d3.geoMercator()
                       .translate([0, 0])
                       .scale(1);

//Define path generator
const path = d3.geoPath()
                 .projection(projection);

//Create SVG element
const svg = d3.select(".map")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

console.log(svg)

//Load in GeoJSON data
d3.json("../geojson/zaf_adm1-pop_dense2020.geojson", function(json) {

    console.log(json)

    // Calculate bounding box transforms for entire collection
    var b = path.bounds( json ),
    s = .95 / Math.max((b[1][0] - b[0][0]) / w, (b[1][1] - b[0][1]) / h),
    t = [(w - s * (b[1][0] + b[0][0])) / 2, (h - s * (b[1][1] + b[0][1])) / 2];

    // Update the projection    
    projection
      .scale(s)
      .translate(t);

    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
       .data(json.features)
       .enter()
       .append("path")
       .attr("d", path)
       .style("fill", "steelblue");
});