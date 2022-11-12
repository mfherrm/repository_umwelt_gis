
//Width and height
var widthArea = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var heightArea = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

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


Promise.all([d3.json("../geojson/zaf_provinces.geojson"), d3.json("../geojson/germany_bundeslaender.geojson"), d3.json("../geojson/kenya_counties.geojson")])
    .then(drawZaf)
    .catch(error => { console.log(error) });

//Build Map
function drawZaf(data) {
    color1 = d3.scaleThreshold().domain([19, 21.8, 36.8, 43.2, 52.3]).range(d3.schemeBlues[6])
    color4 = d3.scaleThreshold().domain([85.3, 89.3, 91.2, 93.2, 98.3]).range(d3.schemeReds[6])
    //Define Projection
    let projectionZaf = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, 0]);

    //Define path generator
    let pathZaf = d3.geoPath()
        .projection(projectionZaf);

    let bbox = pathZaf.bounds(data[0]),
        s = .92 / Math.max((bbox[1][0] - bbox[0][0]) / widthArea, (bbox[1][1] - bbox[0][1]) / heightArea),
        t = [(widthArea - s * (bbox[1][0] + bbox[0][0])) / 2, (heightArea - s * (bbox[1][1] + bbox[0][1])) / 2];

    projectionZaf
        .scale(s)
        .translate(t);

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

    drawLegend(color1, 'mapboxZAF', "Population in poverty [%]", 10)

    drawLegend(color4, 'mapboxZAF', "Children taking part in pre-primary education [%]", 235)
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
    color1 = d3.scaleThreshold().domain([24, 30, 36.7, 51.2, 79.3]).range(d3.schemeBlues[6])
    color4 = d3.scaleThreshold().domain([1.6, 3.7, 5.1, 7.2, 10]).range(d3.schemeReds[6])
    let projectionKenya = d3.geoAzimuthalEqualArea().scale(1).translate([-.01, .005]).rotate([-38, 0]);

    let pathKenya = d3.geoPath()
        .projection(projectionKenya);
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    let bbox = pathKenya.bounds(data)
    let t = [(widthArea - s * (bbox[1][0] + bbox[0][0])) / 2, (heightArea - s * (bbox[1][1] + bbox[0][1])) / 2];
    // Update the projection  
    projectionKenya
        .scale(s)
        .translate(t);



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

    drawLegend(color1, 'mapboxKEN', "Population in poverty [%]", 10)



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

    drawLegend(color4, 'mapboxKEN', "Children taking part in pre-primary education [%]", 235)
    drawScalebar(projectionKenya, 'mapboxKEN')
    //set value of range slider for opacity
    d3.select("#sdgRange").attr("value", function () { return d3.select("#kenya-4").style("opacity") * 100 })

    //get fill for next unit list
    d3.selectAll("#slist-kenya li").style("background", function () {
        return d3.select("#kenya-area").attr("fill")
    });
}

function drawGermany(data, s) {
    color1 = d3.scaleThreshold().domain([12.4, 15.6, 17.2, 19.5, 25]).range(d3.schemeBlues[6])
    color4 = d3.scaleThreshold().domain([85.3, 89, 91.7, 93.5, 94.8]).range(d3.schemeReds[6])

    let projectionGermany = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, 0.0]).rotate([-10, -52]);

    let pathGermany = d3.geoPath()
        .projection(projectionGermany);

    let bbox = pathGermany.bounds(data);
    let t = [(widthArea - s * (bbox[1][0] + bbox[0][0])) / 2, (heightArea - s * (bbox[1][1] + bbox[0][1])) / 2];

    projectionGermany
        .scale(s)
        .translate(t);

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

    drawLegend(color1, 'mapboxGER', "Population in poverty [%]", 10)

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

    drawLegend(color4, 'mapboxGER', "Children taking part in pre-primary education [%]", 235)
    drawScalebar(projectionGermany, 'mapboxGER')
    //set value of range slider for opacity
    d3.select("#sdgRange").attr("value", function () { return d3.select("#germany-4").style("opacity") * 100 })

    //get fill for next unit list
    d3.selectAll("#slist-germany li").style("background", function () {
        return d3.select("#map").attr("fill")
    });
}

function drawLegend(color, mclass, txt, pos) {
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
                return "≤ " + d
            } else if (i == color.domain().length - 1) {
                return "≥ " + + d
            } else {
                return color.domain()[i - 1] + 1 + " to " + d
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
        .tickValues([0, 150, 300])
        //.distance(200)
        // How far the tick text labels are from the lines
        .tickPadding(8)

    var scaleSvg = d3.select(('.mapbox'))
        .append("g")
        .attr("class", mclass)
        //move the Scalebar like the legend
        .attr("transform", function () {
            return "translate(10," + '650' + ")";
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
    let selected = d3.select("input[type=radio]:checked").property("value");
    if (selected == "germany") {
        //Load in GeoJSON data //Promise resolve
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

