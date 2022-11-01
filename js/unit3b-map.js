var tooltip;
//Create colors scheme    
var color = d3.scaleThreshold()
    //thresholds of data
    .domain([75, 80, 85, 90, 95, 100])
    //either d3.schemeCOLOR or own range e.g. ['#fee5d9','#fcbba1','#fc9272','#fb6a4a','#de2d26','#a50f15']
    .range(d3.schemeReds[6]);

//Load in GeoJSON data //Promise resolve

Promise.all([d3.json("../geojson/zaf_provinces.geojson"), d3.json("../geojson/ger_overview.geojson"), d3.json("../geojson/kenya_overview.geojson")])
    .then(draw).catch(error => { console.log(error) })

//Create tooltip for mouseover on body for absolute position -- https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/ -- https://bl.ocks.org/d3noob/a22c42db65eb00d4e369

//Build Map
let l = 0;
function draw(data) {
    let drawTarget = '#zaf';
    let mapID = "solzaf"
    let mapProjection = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, -0.02])
    drawMapSol(data[0], drawTarget, mapID, mapProjection)
    drawTarget = '#ger';
    mapID = "solger"
    mapProjection = projection = d3.geoAzimuthalEqualArea().scale(.4).translate([0.005, -0.02]).rotate([-10, -52])
    l = 1;
    drawMapSol(data[1], drawTarget, mapID, mapProjection)
    drawTarget = '#ken';
    mapID = "solken"
    mapProjection = d3.geoAzimuthalEqualArea().scale(.25).translate([.03, -.01]).rotate([-38, 0]);
    l = 2;
    drawMapSol(data[2], drawTarget, mapID, mapProjection)
    drawLegend();
    
}

function drawMapSol(data, drawTarget, mapID, mapProjection) {

    var pathM = d3.geoPath().projection(mapProjection);

    var bbox = pathM.bounds(data),
        s = .92 / Math.max((bbox[1][0] - bbox[0][0]) / width, (bbox[1][1] - bbox[0][1]) / height),
        t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    // Update the projection    
    mapProjection
        .scale(s)
        .translate(t);

    //Create SVG element // viewBox for responsive Map
    var svgM = d3.select(drawTarget)
        .append("svg")
        //responsive size
        .attr("viewBox", [0, 0, width, height])
        .attr('id', mapID)
        .attr("preserveAspectRatio", "xMinYMin")
        .append("g")
        .attr("class", "mapboxSol");
    //Bind data and create one path per GeoJSON feature
    svgM.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathM)
        .attr("class", "adminarea")
        .attr("education_rel", function (d) {
            return d.properties.education_rel;
        })
        //get province name  
        .attr("name", function (d) {
            return d.properties.name_1?d.properties.name_1 : d.properties.ADM2_NAME;
        })
        //get color for Value of education from "var color"
        .style("fill", function (d) {
            return d.properties.education_rel ? color(d.properties.education_rel) : (d.properties.ADM0_NAME=='Kenya') ? 'darkgrey' : 'lightgrey';
        })
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("mouseover", drawTooltip)
        .on("mouseout", eraseTooltip)

        drawScalebar(mapProjection, mapID);

};

//Build Tooltip
function drawTooltip() {
    window.onresize = this.getBoundingClientRect();
    let bbox = this.getBoundingClientRect();
    let path = this;
    tooltip = d3.selectAll('.mapboxsol')
        .append("div")
        .attr("class", "tooltip")
        .attr('id', 'tt')
        .attr("opacity", 0);
    tooltip
        .style("opacity", .7)
        .style("left", bbox.x + bbox.width / 2 + 10 + "px")
        .attr('id', 'tt')
        .style("top", bbox.y + bbox.height / 2 + "px")
        ;
    tooltip.join(
        enter =>
            enter.html("<p>" + d3.select(this).attr("name") + "</p>"),
        update =>
            update.html("<p>" + d3.select(this).attr("name") + "</p><p>" + d3.select(this).attr("education_rel") + "% </p>")
    )
};

function eraseTooltip() {
    d3.selectAll('#tt').remove();
};

//Build Vertical-Legend -- https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e
function drawLegend() {
    //set Title
    //create svg for Legend
    var legendSvg = d3.selectAll(".mapboxSol")
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
            return "translate(5," + 30 + ")";
        });

    var legend = legendSvg.selectAll(null)
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "entry")
        .attr("transform", function (d, i) {
            return "translate(5," + i * 33 + ")";
        });

    legendSvg.append("g")
        .append("text")
        .text(function () {
            return "Percentage of children taking part in pre-primary education";
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + -8 + ")";
        });
    //fill rects by color domain (d) & range (i)                  
    legend.append("rect")
        //rect on position (5,5) in SVG with the width and height 20            
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 25)
        .attr("height", 25)
        .attr("fill", function (d, i) {
            //return color corresponding to no. of domain // (d-1) for right color, dunno why it's that way
            return color(d - 1);
        })

    //get and set of color by domain (d) & range (i)
    legend.append("text")
        //play around for nice positonioning
        //General tip for x--> Rect.X(5)+Rect.Width(20)+buffer(6)
        //Genral tip for y--> anchor of text is at the bottom
        .attr("x", 46)
        .attr("y", 31)
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
function drawScalebar(mapProjection, mapID) {
    let mapbox = getPosition($(".mapboxSol")[0]);
    console.log(d3.select(this))
    var scaleBar = d3.geoScaleBar()
        .projection(mapProjection)
        //for other projection specify ".radius"??? ---https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar#scaleBarPositioned ---https://github.com/HarryStevens/d3-geo-scale-bar#sizing 
        .size([mapbox.width, 180])
        .zoomClamp(false)
        //sets the vertical tick size of the scale bar in pixels
        .tickSize([8])
        //sets ticks on specified distances OR use distance for automatic specification
        .tickValues([0, 150, 300])
        //.distance(200)
        // How far the tick text labels are from the lines
        .tickPadding(8)

    var scaleSvg = d3.select(('#'+mapID))
        .append("g")
        .attr("class", "scalebar")
        //move the Scalebar like the legend
        .attr("transform", function () {
            return "translate(10," + '970' + ")";
        });

    scaleSvg.append("g").call(scaleBar);

    d3.selectAll(".tick").attr("class", "scalebartick")
};

//Function to get Position of an Element, implement on Event e.g. "click"
function getPosition(ele) {
    boundingClientRect = ele.getBoundingClientRect();

    var left = boundingClientRect.left;
    var top = boundingClientRect.top;
    var rectHeight = boundingClientRect.height;
    var rectWidth = boundingClientRect.width;

    return boundingClientRect;
}