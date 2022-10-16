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

//Define map projection
var projection = d3.geoMercator()
    .translate([0, 0])
    .scale(1);

//Define path generator
var path = d3.geoPath()
            .projection(projection);

//Create colors scheme    
var color = d3.scaleThreshold()
                //thresholds of data
                .domain([10,20,50,100,250,500])
                //either d3.schemeCOLOR or own range e.g. ['#fee5d9','#fcbba1','#fc9272','#fb6a4a','#de2d26','#a50f15']
                .range(d3.schemeReds[6]);

//Create tooltip for mouseover on body for absolute position
var tooltip = d3.select(".map")
                    .append("div")
                    .attr("class","tooltip")
                    .attr("opacity",0);

            
//Load in GeoJSON data //Promise resolve
d3.json("../geojson/zaf_adm1-pop_dense2020.geojson")
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
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "province")
        .attr("pop_dense2020", function(d){
            return d.properties.pop_dense_2020_adm1;
        })
        //get province name  
        .attr("name", function(d) {
            return d.properties.ADM1_EN;
        })      
        //get color for Value of Population Density from "var color"
        .style("fill", function(d) {
            return d.properties.pop_dense_2020_adm1 ? color(d.properties.pop_dense_2020_adm1): undefined;
        })
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("mouseover", drawTooltip)
        .on("mouseout", eraseTooltip);
};

//Build Tooltip
function drawTooltip(){
    let bbox = this.getBoundingClientRect();
    //let bbox = this.getBBox();
    //console.log(this);
    //console.log(bbox.x); 
    tooltip.transition()
        .duration(200)
        .style("opacity", .7)
        .style("left", bbox.x + bbox.width/1.8 + 30 +"px")
        .style("top", bbox.y + bbox.height/1.8 + 30  + "px");
    tooltip.join(
        enter => 
            enter.append("p",d3.select(this).attr("name")),
        update =>
            update.html(d3.select(this).attr("name"))
    );
    
    /*
    html("<p>"+ d3.select(this).attr("name")+"</p>"
                +"<p>"+ "Population Density 2020: <strong>"+d3.select(this).attr("pop_dense2020") + "</p>");
    */
};

function eraseTooltip(){
    tooltip.transition()
            .duration(200)
            .style("opacity", 0);
};


function getPosition(){
    boundingClientRect = this.getBoundingClientRect();

    var left = boundingClientRect.left;
    var top = boundingClientRect.top;
    var rectHeight = boundingClientRect.height;
    var rectWidth = boundingClientRect.width;

    console.log("left: " + left,", top: " + top, ", width: " + rectWidth +" ,height: "+rectHeight);
}
