
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
    let projectionZaf = d3.geoAzimuthalEqualArea()
        .translate([0, 0])
        .scale(1)
        .rotate([-24, -28]);

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
    let projectionKenya = d3.geoAzimuthalEqualArea()
        .translate([-0.01, -.02])
        .scale(1)
        .rotate([-39, 0]);

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

    let projectionGermany = d3.geoAzimuthalEqualArea()
        .translate([-0.005, -.015])
        .scale(1)
        .rotate([-10, -52]);

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

    //set value of range slider for opacity
    d3.select("#sdgRange").attr("value", function () { return d3.select("#germany-4").style("opacity") * 100 })

    //get fill for next unit list
    d3.selectAll("#slist-germany li").style("background", function () {
        return d3.select("#map").attr("fill")
    });
}
//Drag n Drop trigger
d3.selectAll(".sortlist").on("mousedown", function () {
    slistArea(this.id);
});


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