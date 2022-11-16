
//Width and height
var widthArea = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var heightArea = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
//Color scale for poverty
let colorScaleBlues5 = ['#f1eef6', '#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe']
//Color scale for education in ZAF and GER
let colorScaleReds5 = ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#e34a33']
//Color sclae for education in Kenya (low values)
let colorScaleKReds5 = ['#ffffd4', '#fee391', '#fec44f', '#fe9929', '#d95f0e']
//rgb2hex use as method rgb2hex(COLOR IN RGB) -- https://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value 
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

//Create SVG element // viewBox for responsive Map
var svgBoundaries = d3.select("#map")
    .append("svg")
    //responsive size
    .attr("viewBox", [0, 0, widthArea, heightArea])
    //dunno seems nice
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("class", "mapbox");

//Load in GeoJSON data //Promise resolve
Promise.all([d3.json("../geojson/zaf_provinces.geojson"), d3.json("../geojson/germany_bundeslaender.geojson"), d3.json("../geojson/kenya_counties.geojson")])
    .then(drawZaf)
    .catch(error => { console.log(error) });

//draw function
function drawZaf(data) {
    //sets different domain according to data used, creates different color for easy use later on
    color1 = d3.scaleThreshold().domain([21.7, 36.7, 41.4, 43.2, 52.3]).range(colorScaleBlues5)
    color4 = d3.scaleThreshold().domain([90.3, 91.4, 92, 93.1, 97.7]).range(colorScaleReds5)
    //Define Projection
    let projectionZaf = d3.geoAzimuthalEqualArea().scale(1).translate([-0.03, 0]).rotate([-24, -28]);

    //Define path generator
    let pathZaf = d3.geoPath()
        .projection(projectionZaf);

    let bboxS = pathZaf.bounds(data[0]),
        s = .92 / Math.max((bboxS[1][0] - bboxS[0][0]) / widthArea, (bboxS[1][1] - bboxS[0][1]) / heightArea),
        t = [(widthArea - s * (bboxS[1][0] + bboxS[0][0])) / 2, (heightArea - s * (bboxS[1][1] + bboxS[0][1])) / 2];
    // Update the projection  
    projectionZaf
        .scale(s)
        .translate(t);
    //Create path for poverty
    svgBoundaries.selectAll("null")
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", pathZaf)
        .attr("id", "zaf-1")
        .attr('class', 'mapboxZAF')
        .attr("fill", function (d) { return color1(d.properties.poverty_rel) })
        .attr("stroke", "grey")
        .attr("stroke-width", "1.5px")
        .attr("opacity", "1")
    //Create path for education
    svgBoundaries.selectAll("null")
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", pathZaf)
        .attr("id", "zaf-4")
        .attr('class', 'mapboxZAF')
        .attr("fill", function (d) { return color4(d.properties.education_rel) })
        .attr("stroke", "grey")
        .attr("stroke-width", "1.5px")
        .attr("opacity", "1")
    //Draw legend twice with different parameters
    drawLegend(color1, 'mapboxZAF', "Population in poverty [%]", 10, 'z1')
    drawLegend(color4, 'mapboxZAF', "Children taking part in pre-primary education [%]", 235, 'z2')
    //Scalebar does not change so it is only drawn once
    drawScalebar(projectionZaf, 'mapboxZAF')

    //set value of range slider for opacity
    d3.select("#sdgRange").attr("value", function () { return d3.select("#zaf-4").style("opacity") * 100 })

    //get fill for next unit list
    d3.selectAll("#slist-zaf li").style("background", function () {
        return d3.select("#zaf-4").attr("fill")
    });
    //Trigger other Build Map
    drawKenya(data[2], s);
    drawGermany(data[1], s);
}

function drawKenya(data, s) {
    //sets different domain according to data used, creates different color for easy use later on
    color1 = d3.scaleThreshold().domain([24, 30, 36.7, 51.2, 69.7]).range(colorScaleBlues5)
    color4 = d3.scaleThreshold().domain([2.3, 3.7, 5.1, 7.2, 10]).range(colorScaleKReds5)
    //projection for kenya
    let projectionKenya = d3.geoAzimuthalEqualArea().scale(1).translate([-.01, .005]).rotate([-38, 0]);
    //path for kenya
    let pathKenya = d3.geoPath()
        .projection(projectionKenya);
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    let bboxK = pathKenya.bounds(data)
    let t = [(widthArea - s * (bboxK[1][0] + bboxK[0][0])) / 2, (heightArea - s * (bboxK[1][1] + bboxK[0][1])) / 2];
    // Update the projection  
    projectionKenya
        .scale(s)
        .translate(t);
    //Create path for poverty
    svgBoundaries.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathKenya)
        .attr("id", "kenya-1")
        .attr('class', 'mapboxKEN')
        .attr("fill", function (d) { return color1(d.properties.poverty_rel) })
        .attr("stroke", "grey")
        .attr("stroke-width", "1.5px")
        .attr("opacity", "1");

    drawLegend(color1, 'mapboxKEN', "Population in poverty [%]", 10, 'k1')

    //Create path for education
    svgBoundaries.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathKenya)
        .attr("id", "kenya-4")
        .attr('class', 'mapboxKEN')
        .attr("fill", function (d) { return color4(d.properties.education_rel) })
        .attr("stroke", "grey")
        .attr("stroke-width", "1.5px")
        .attr("opacity", "1");

    drawLegend(color4, 'mapboxKEN', "Children taking part in pre-primary education [%]", 235, 'k2')
    drawScalebar(projectionKenya, 'mapboxKEN')
    //set value of range slider for opacity
    d3.select("#sdgRange").attr("value", function () { return d3.select("#kenya-4").style("opacity") * 100 })

    //get fill for next unit list
    d3.selectAll("#slist-kenya li").style("background", function () {
        return d3.select("#kenya-area").attr("fill")
    });
}

function drawGermany(data, s) {
    //sets different domain according to data used, creates different color for easy use later on
    color1 = d3.scaleThreshold().domain([12.3, 15.6, 17.2, 18.5, 19.4]).range(colorScaleBlues5)
    color4 = d3.scaleThreshold().domain([90.3, 91.4, 92, 93.9, 94.8]).range(colorScaleReds5)
    //projection for germany
    let projectionGermany = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, 0.0]).rotate([-10, -52]);
    //path for germany
    let pathGermany = d3.geoPath()
        .projection(projectionGermany);

    let bboxG = pathGermany.bounds(data);
    let t = [(widthArea - s * (bboxG[1][0] + bboxG[0][0])) / 2, (heightArea - s * (bboxG[1][1] + bboxG[0][1])) / 2];
    //Update projection
    projectionGermany
        .scale(s)
        .translate(t);
    //Create path for poverty
    svgBoundaries.selectAll("null")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathGermany)
        .attr("id", "germany-1")
        .attr('class', 'mapboxGER')
        .attr("fill", function (d) { return color1(d.properties.poverty_rel) })
        .attr("stroke", "grey")
        .attr("stroke-width", "1.5px")
        .attr("opacity", "1")
    //draw legend for poverty
    drawLegend(color1, 'mapboxGER', "Population in poverty [%]", 10, 'g1')
    //Create path for education
    svgBoundaries.selectAll("null")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathGermany)
        .attr("id", "germany-4")
        .attr('class', 'mapboxGER')
        .attr("fill", function (d) { return color4(d.properties.education_rel) })
        .attr("stroke", "grey")
        .attr("stroke-width", "1.5px")
        .attr("opacity", "1")
    //draw legend for education
    drawLegend(color4, 'mapboxGER', "Children taking part in pre-primary education [%]", 235, 'g2')
    drawScalebar(projectionGermany, 'mapboxGER')
    //set value of range slider for opacity
    d3.select("#sdgRange").attr("value", function () { return d3.select("#germany-4").style("opacity") * 100 })

    //get fill for next unit list
    d3.selectAll("#slist-germany li").style("background", function () {
        return d3.select("#map").attr("fill")
    });
}
//Draws legend
function drawLegend(color, mclass, txt, pos, id) {
    //set Title
    //create svg for Legend
    var legendSvg = d3.selectAll('.mapbox')
        .append("g")
        .attr("class", mclass)
        //.attr("viewBox", [0, 0, width, height])
        .attr("width", "100%")
        //good height --> no. of class*spacing
        .attr("height", function (d, i) {
            return 6 * 45
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(5," + (30 + pos) + ")";
        });
    console.log(legendSvg)
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
        .text(txt)
        .attr("font-size", 24)
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + -8 + ")";
        });
    //fill rects by color domain (d) & range (i)                  
    legend.append("rect")
        //rect on position (5,5) in SVG with the width and height 20            
        .attr("x", 10)
        .attr("y", 10) //10
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
                //Hardcoded 'cause time
                //Lowest boundary
                if (id == "g1") {
                    return "11.9 to " + (d)
                } else if (id == "g2") {
                    return "85.3 to " + (d)
                } else if (id == "z1") {
                    return "19.3 to " + (d)
                } else if (id == "z2") {
                    return "85.2 to " + (d)
                } else if (id == "k1") {
                    return "17.1 to " + (d)
                } else if (id == "k2") {
                    return "1.6 to " + (d)
                }
                //Hardcoded 'cause time
                //Highest boundary
            } else if (i == color.domain().length - 1) {
                if (id == "g1") {
                    return (d) + " to 24.9"
                } else if (id == "g2") {
                    return (d) + " to 95.7"
                } else if (id == "z1") {
                    return (d) + " to 59.1"
                } else if (id == "z2") {
                    return (d) + " to 98.2"
                } else if (id == "k1") {
                    return (d) + " to 79.3"
                } else if (id == "k2") {
                    return (d) + " to 14.1"
                }
            } else {
                return d3.format(".2f")(color.domain()[i - 1] + 0.01) + " to " + d
            };
        })
};

//Build Scalebar -- 
function drawScalebar(mapProjection, mclass) {
    let mapbox = getPosition($(".mapbox")[0]);
    var scaleBar = d3.geoScaleBar()
        .projection(mapProjection)
        //for other projection specify ".radius"??? ---https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar#scaleBarPositioned ---https://github.com/HarryStevens/d3-geo-scale-bar#sizing 
        .size([mapbox.width, 180])
        .zoomClamp(false)
        //sets the vertical tick size of the scale bar in pixels
        .tickSize([8])
        //sets ticks on specified distances OR use distance for automatic specification
        .tickValues([0, 200])
        //.distance(200)
        // How far the tick text labels are from the lines
        .tickPadding(8)

    var scaleSvg = d3.select(('.mapbox'))
        .append("g")
        .attr("class", mclass)
        //move the Scalebar like the legend
        .attr("transform", function () {
            return "translate(10," + heightArea * .9 + ")";
        });

    scaleSvg.append("g").call(scaleBar);
    d3.selectAll("#page1 .tick").attr("class", "legendtick")
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

//Range slider functions
d3.select("#sdgRange").on("input", function () {
    let opacity = this.valueAsNumber / 100
    let selected = d3.select("input[type=radio]:checked").property("value");

    d3.selectAll("#germany-4").style("opacity", function () { return opacity })
    d3.selectAll("#zaf-4").style("opacity", function () { return opacity })
    d3.selectAll("#kenya-4").style("opacity", function () { return opacity })
});


//Trigger Map Functions on radio
d3.select(".adm-radio").on("change", drawMapTrigger);

function drawMapTrigger() {
    //Change map depending on which button is selected
    let selected = d3.select("input[type=radio]:checked").property("value");
    if (selected == "germany") {
        
        d3.selectAll(".mapboxGER").transition().duration(500).style("display", "flex");
        d3.selectAll(".mapboxZAF").transition().duration(500).style("display", "none");
        d3.selectAll(".mapboxKEN").transition().duration(500).style("display", "none");
    } else if (selected == "zaf") {
        d3.selectAll(".mapboxGER").transition().duration(500).style("display", "none");
        d3.selectAll(".mapboxZAF").transition().duration(500).style("display", "flex");
        d3.selectAll(".mapboxKEN").transition().duration(500).style("display", "none");
    } else {
        d3.selectAll(".mapboxGER").transition().duration(500).style("display", "none");
        d3.selectAll(".mapboxZAF").transition().duration(500).style("display", "none");
        d3.selectAll(".mapboxKEN").transition().duration(500).style("display", "flex");
    };
};

