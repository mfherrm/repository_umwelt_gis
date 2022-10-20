//16.10.22 to Do legend: Positioning, Spacing; From To Value-Class e.g. (0-10 ... 11-50)
//16.10.22 to Do tooltip: More Values than 1 e.g. Province AND Pop Dense
//16.10.22 to Do NEXT Scalebar -- https://stackoverflow.com/questions/44222003/how-to-add-or-create-a-map-scale-bar-to-a-map-created-with-d3-js
//MAYBE MAYBE MAYBE write code so you only have to populate a map with the data e.g. key(province) + value1(pop-dense) +...+valueN and change the text

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
    //.fitSize([mapWidth, mapHeight], geojson)
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

//Build Map -------------------------------------------------------------------------------------------------------------------------
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
    drawLegend();
    drawScalebar()
};

//Build Tooltip -------------------------------------------------------------------------------------------------------------------------
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

//Build Vertical-Legend -- https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e -----------------------------------------------------------
function drawLegend(){
    //set Title
    d3.select(".legend-title").html("<p>Population Density South Africa 2020 per km²</p>");

    //create svg for Legend
    var legendSvg = d3.select(".legend")
                    .append("svg")
                    .attr("width", "100%")
                    //good height --> no. of class*spacing
                    .attr("height", function(d,i){
                        return 6*30
                    });

    var legend = legendSvg.selectAll(".legend")
                        .data(color.domain())
                        .enter()
                        .append("g")
                        .attr("class","legend entry")
                        .attr("transform", function(d,i) {
                            //set spacing
                            return "translate(0,"+ i * 25 +")";
                        });

    //fill rects by color domain (d) & range (i)                  
    legend.append("rect")
            //rect on position (5,5) in SVG with the width and height 20            
            .attr("x",5)
            .attr("y",5)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", function (d,i){
                //return color corresponding to no. of domain // (d-1) for right color, dunno why it's that way
                return color(d-1);
            })

    //get and set of color by domain (d) & range (i)
    legend.append("text")
            //play around for nice positonioning
            //General tip for x--> Rect.X(5)+Rect.Width(20)+buffer(6)
            //Genral tip for y--> anchor of text is at the bottom
            .attr("x", 31)
            .attr("y", 21)
            .text(function (d,i){
                return d
            })
    console.log("grün gelb blau ich bin Legende");
};
//Build Scalebar -------------------------------------------------------------------------------------------------------------------------
function drawScalebar(){
    //Create Scalebar Generator, passing projection + dimension of map
    var scaleBar = d3.geoScaleBar()
                        .projection(projection)
                        //function for size?
                        .size([width, height])
                        //positioning .top etc.
                        .left(.005)
                        .top(0.08)
                        // A formatter function adds a "comma..." to "1,000"
                        .tickFormat(d3.format(" "))
                        // Set this to true to keep the bar's width constant
                        .zoomClamp(false)
                        //label + anchor
                        .label("km")
                        .labelAnchor("right")

    //Create svg for scalebar
    var scaleSvg = d3.select(".scale")
                    .append("svg")
                    .attr("class","scalebar")
                    .attr("width","100%")
                    .attr("height","20%");

    //Call scaleBar to Create it
    scaleSvg.append("g").call(scaleBar);


    console.log("0 10 1000000 ich bin Masstab");
};

function getPosition(){
    boundingClientRect = this.getBoundingClientRect();

    var left = boundingClientRect.left;
    var top = boundingClientRect.top;
    var rectHeight = boundingClientRect.height;
    var rectWidth = boundingClientRect.width;

    console.log("left: " + left,", top: " + top, ", width: " + rectWidth +" ,height: "+rectHeight);
};