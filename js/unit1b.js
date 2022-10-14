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
            
            
//Load in GeoJSON data //Promise resolve
d3.json("../geojson/zaf_adm1-pop_dense2020.geojson")
    .then(drawMap)
    .catch(error => {console.log("Ooops, Error: " + error)});

//Build Map
function drawMap(data){

    //Define map projection
    var projection = d3.geoMercator()
                        .translate([0, 0])
                        .scale(1);

    //Define path generator
    var path = d3.geoPath()
                    .projection(projection);
    
    //colors for population density
    var color = d3.scaleThreshold()
        .domain([10,20,50,100,250,500])
        .range(['#fee5d9','#fcbba1','#fc9272','#fb6a4a','#de2d26','#a50f15']);

    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    var bbox = path.bounds(data),
        s = .92 / Math.max((bbox[1][0]-bbox[0][0])/ width, (bbox[1][1] - bbox[0][1]) / height),
        t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    // Update the projection    
    projection
        .scale(s)
        .translate(t); 

    var populationDensity = {};

    data.features.forEach(function (d) {
        populationDensity[d.properties.ADM0_EN] = {
            province: +d.properties.ADM1_EN,
            pop_density: +d.properties.pop_dense_2020_adm1,
            area_sqkm: +d.properties.Area_km2,
            total_pop: +d.properties.T_TL
        }
    });

    console.log(populationDensity)
    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", "province")
        //get province name  
        .attr("name", function(d) {
            return d.properties.ADM1_EN;
        })      
        //get color for Value of Population Density from "var color"
        .style("fill", function(d) {
            return d.properties.pop_dense_2020_adm1 ? color(d.properties.pop_dense_2020_adm1): undefined;
        })
        .style("stroke","white")
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("mouseover", function(d){
            console.log(d)
            d3.select(this)
                .style("stroke","black")
                .style("stroke-width",2);
            
            d3.select("#province")
                .text(this.name)
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("stroke","white")
                .style("stroke-width",1)
        });
}  