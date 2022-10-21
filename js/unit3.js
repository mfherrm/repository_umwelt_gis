//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
let prov
var size
var max
var topX=(Math.cos(2) * 50 + 110)
var topY= (Math.sin(-1) * 50 + 295)
//Create SVG element // viewBox for responsive Map
var svg = d3.select(".map")
    .append("svg")
    //responsive size
    .attr("viewBox", [0, 0, width, height])
    //dunno seems nice
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("class", "mapbox");


//Define map projection
var projection = d3.geoMercator()
    //.fitSize([mapWidth, mapHeight], geojson)
    .fitSize([width, height])
    .translate([0, 0])
    .scale(1);

//Define path generator
var path = d3.geoPath()
    .projection(projection);

//Create colors scheme    
var color = d3.scaleThreshold()
    //thresholds of data
    .domain([10, 20, 50, 100, 250, 500])
    //either d3.schemeCOLOR or own range e.g. ['#fee5d9','#fcbba1','#fc9272','#fb6a4a','#de2d26','#a50f15']
    .range(d3.schemeReds[6]);

//Load in GeoJSON data //Promise resolve
d3.json("../geojson/zaf_adm1-pop_dense2020.geojson")
    .then(drawMap)
    .catch(error => { console.log(error) });

//Create tooltip for mouseover on body for absolute position -- https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/ -- https://bl.ocks.org/d3noob/a22c42db65eb00d4e369
var tooltip = d3.select(".map")
    .append("div")
    .attr("class", "tooltip")
    .attr("opacity", 0);
var circles = d3.select(".mapbox")
    .append("g")
    .attr("class", "circles");

//Build Map
function drawMap(data) {
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    var bbox = path.bounds(data),
        s = .92 / Math.max((bbox[1][0] - bbox[0][0]) / width, (bbox[1][1] - bbox[0][1]) / height),
        t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    console.log(bbox)
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
        .attr("class", "province_diag")
        .attr("pop_dense2020", function (d) {
            return d.properties.pop_dense_2020_adm1;
        })
        .attr("T_TL", function (d) {
            return d.properties.T_TL;
        })
        //get province name  
        .attr("name", function (d) {
            return d.properties.ADM1_EN;
        })
        //get color for Value of Population Density from "var color"
        .style("fill", function (d) {
            return d.properties.pop_dense_2020_adm1 ? color(d.properties.pop_dense_2020_adm1) : undefined;
        })

    drawDiagram();    
    drawScalebar();
    drawLegend();
    

    function drawDiagram(d) {
        let popTot = []
        for (let i = 0; i < data.features.length; i++) {
            console.log(data.features[i].properties.T_TL)
            popTot.push(data.features[i].properties.T_TL)

        }


        circles.selectAll("circle")
            .data(data.features)
            .enter()
            .append("circle")
            .attr("transform", function (d) { return "translate(" + projection([d.properties.xCentroid, d.properties.yCentroid]) + ")"; })
            .attr("r", function (d, i) {
                max = d3.max(popTot);
                size = 50 * d.properties.T_TL / max
                return size
            })
            .attr('population', function (d) {
                return d.properties.T_TL
            })
            .attr('province', function (d) {
                return d.properties.ADM1_EN
            })
            //Cursor on mouseover
            .style("cursor", "pointer")
            .on("mouseover", drawTooltip)
            .on("mouseout", eraseTooltip)


    }
    circles.raise();
};



//Build Tooltip
function drawTooltip() {
    window.onresize = this.getBoundingClientRect();
    let bbox = this.getBoundingClientRect();
    if (document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length-2].getAttribute('class') == 'circles'){
        tooltip.transition()
            .duration(200)
            .style("opacity", .7)
            .style("left", bbox.x + bbox.width / 1.8 + 30 + "px")
            .style("top", bbox.y + bbox.height / 1.8 + 30 + "px");

        tooltip.join(
            enter =>
                enter.append("p",  d3.select(this).attr("province")+ ': ' + d3.select(this).attr("population")),
            update =>
                update.html(d3.select(this).attr("province")+ ': ' + d3.select(this).attr("population"))
        );
    }
    let name= d3.select(this).attr("province");
    prov = document.querySelector('[name="'+ name + '"]');
    this.style.stroke='white';
    prov.style.stroke='white';
};

function eraseTooltip() {
    tooltip.transition()
        .duration(200)
        .style("opacity", 0);
    prov.style.stroke='none'
    this.style.stroke='none';
};

//Build Vertical-Legend -- https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e
function drawLegend() {
    //set Title
    d3.select(".legend");
    //create svg for Legend
    var legendSvg = d3.select(".mapbox")
        .append("g")
        .attr("class", "legend")
        //.attr("viewBox", [0, 0, width, height])
        .attr("width", "100%")
        //good height --> no. of class*spacing
        .attr("height", function (d, i) {
            return 6 * 45
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + 45 + ")";
        });

    var legend = legendSvg.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "entry")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 40 + ")";
        });

    legendSvg.append("g")
        .append("text")
        .text(function () {
            return "Population Density [%]";
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + -8 + ")";
        });
    //fill rects by color domain (d) & range (i)                  
    legend.append("rect")
        //rect on position (5,5) in SVG with the width and height 20            
        .attr("x", 5)
        .attr("y", 10)
        .attr("width", 30)
        .attr("height", 30)
        .attr("fill", function (d, i) {
            //return color corresponding to no. of domain // (d-1) for right color, dunno why it's that way
            return color(d - 1);
        })
        var legendCircleMax= d3.select('.legend')
        .append('g')
        .attr('class','legendCircle')
        .append("circle")
        //rect on position (5,5) in SVG with the width and height 20            
        .attr("cx", 90)
        .attr("cy", 305)
        .attr('r', 50)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', '1pt')
        
        var labelCircleRect= d3.select('.legendCircle')
        .append('rect')
        .attr('x', topX)
        .attr('y', topY+2)
        .attr('width', 90)
        .attr('height', '1pt')

        var labelCircle = d3.select('.legendCircle')
        .append('text')
        .attr('x', topX+92)
        .attr('y', topY+8)
        .text(max)

        var legendCircleMid= d3.select('.legend')
        .append('g')
        .attr('class','legendCircle')
        .append("circle")
        //rect on position (5,5) in SVG with the width and height 20            
        .attr("cx", 90)
        .attr("cy", 321)
        .attr('r', 50*Math.round(max/3/1000000*2)*1000000/max)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', '1pt')

        var labelCircleRect= d3.select('.legendCircle')
        .append('rect')
        .attr('x', topX)
        .attr('y', topY+33)
        .attr('width', 90)
        .attr('height', '1pt')

        var labelCircle = d3.select('.legendCircle')
        .append('text')
        .attr('x', topX+92)
        .attr('y', topY+41)
        .text(Math.round(max/3000000*2)*1000000)

        var legendCircleBot= d3.select('.legend')
        .append('g')
        .attr('class','legendCircle')
        .append("circle")
        //rect on position (5,5) in SVG with the width and height 20            
        .attr("cx", 90)
        .attr("cy", 341)
        .attr('r', 50*Math.round(max/4000000)*1000000/max)
        .style('fill', 'none')
        .style('stroke', 'black')
        .style('stroke-width', '1pt')

        var labelCircleRect= d3.select('.legendCircle')
        .append('rect')
        .attr('x', topX)
        .attr('y', topY+73)
        .attr('width', 90)
        .attr('height', '0.75pt')

        var labelCircle = d3.select('.legendCircle')
        .append('text')
        .attr('x', topX+92)
        .attr('y', topY+78)
        .text(Math.round(max/4/1000000)*1000000)

        console.log(Math.round(max/3/1000000*2)*1000000)

    //get and set of color by domain (d) & range (i)
    legend.append("text")
        //play around for nice positonioning
        //General tip for x--> Rect.X(5)+Rect.Width(20)+buffer(6)
        //Genral tip for y--> anchor of text is at the bottom
        .attr("x", 56)
        .attr("y", 36)
        .attr("color", "white")
        .text(function (d, i) {
            if (i == 0) {
                return "≤ " + d
            } else if (i == color.domain().length - 1) {
                return "≥ " + + d
            } else {
                return color.domain()[i - 1] + 1 + " to " + d
            };
        })
};

//Build Scalebar -- 
function drawScalebar() {
    let mapbox = getPosition($(".mapbox")[0]);
    console.log("test2: " + mapbox.width)

    var scaleBar = d3.geoScaleBar()
        .projection(projection)
        //for other procejtion sepcify ".radius"??? ---https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar#scaleBarPositioned ---https://github.com/HarryStevens/d3-geo-scale-bar#sizing 
        .size([mapbox.width, 180])
        .zoomClamp(false)
        //sets the vertical tick size of the scale bar in pixels
        .tickSize([8])
        //sets ticks on specified distances OR use distance for automatic specification
        .tickValues([0, 150, 300])
        //.distance(200)
        // How far the tick text labels are from the lines
        .tickPadding(8)

    var scaleSvg = d3.select(".mapbox")
        .append("g")
        .attr("class", "scalebar")
        //move the Scalbar like the legend
        .attr("transform", function () {
            return "translate(10," + mapbox.height * 1.5 + ")";
        });;

    scaleSvg.append("g").call(scaleBar);
};

//Function to get Position of an Element, implement on Event e.g. "click"
function getPosition(ele) {
    boundingClientRect = ele.getBoundingClientRect();

    var left = boundingClientRect.left;
    var top = boundingClientRect.top;
    var rectHeight = boundingClientRect.height;
    var rectWidth = boundingClientRect.width;

    console.log("left: " + left, ", top: " + top, ", width: " + rectWidth + " ,height: " + rectHeight);
    return boundingClientRect;
}

