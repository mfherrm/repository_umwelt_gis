//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//Create SVG element // viewBox for responsive Map
var svg = d3.select(".map")
    .append("svg")
    .attr("viewBox", [0, 0, width, height]) //responsive size
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
    .domain([10, 20, 50, 100, 250, 500])
    //either d3.schemeCOLOR or own range e.g. ['#fee5d9','#fcbba1','#fc9272','#fb6a4a','#de2d26','#a50f15']
    .range(d3.schemeReds[6]);

//Create tooltip for mouseover on body for absolute position
var tooltip = d3.select(".map")
    .append("div")
    .attr("class", "tooltip")
    .attr("opacity", 0);

var radius = d3.scaleSqrt()
    .domain([0, 1e6])
    .range([0, 10]);

var circles = svg.append('g')
    .attr('id', 'circles');

//Load in GeoJSON data //Promise resolve
d3.json("../geojson/zaf_adm1-pop_dense2020.geojson")
    .then(drawMap).catch(error => { console.log("Ooops, Error: " + error) });

//Build Map
function drawMap(data) {
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    var bbox = path.bounds(data),
        s = .92 / Math.max((bbox[1][0] - bbox[0][0]) / width, (bbox[1][1] - bbox[0][1]) / height),
        t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    // Update the projection    
    projection
        .scale(s)
        .translate(t);

    var pop = [];

    data => data.forEach(function (d) {
        var i = 0;
        pop.push({
            name: d.properties.ADM1_EN,
            population: +d.properties.pop_dense_2020_adm1
        })
        i = i + 1;

    });
    var min = d3.min(pop, pop.population);
    var max = d3.max(pop, pop.population);

    //Bind data and create one path per GeoJSON feature
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "province")
        .attr("pop_dense2020", function (d) {
            return d.properties.pop_dense_2020_adm1;
        })
        //get province name  
        .attr("name", function (d) {
            return d.properties.ADM1_EN;
        })
        //get color for Value of Population Density from "var color"
        .style("fill", function (d) {
            return d.properties.pop_dense_2020_adm1 ? color(d.properties.pop_dense_2020_adm1) : undefined;
        })
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("mouseover", drawTooltip)
        .on("mouseout", eraseTooltip);


    /*svg.selectAll('circle')
        .data(data.features)
        .enter().append('circle')
        /*.attr("transform", function(d){
            let coords = path.centroid(d.geometry);

            return 'translate(${coords[0]}, ${coords[1]})'
        })
        .attr("r",  '4px')*/

    var features = path;
    var centroids = (function (feature) {
        return path.centroid(features);
    });


    g.selectAll(".circle").data(centroids)
        .enter().append("circle")
        .attr("class", "centroid")
        .attr("r", '50px')
        .attr("cx", 100)
        .attr("cy", 200);


};



//Build Tooltip
function drawTooltip() {
    let bbox = this.getBoundingClientRect();
    //let bbox = this.getBBox();
    //console.log(this);
    //console.log(bbox.x); 
    tooltip.transition()
        .duration(200)
        .style("opacity", .7)
        .style("left", bbox.x + bbox.width / 1.8 + 30 + "px")
        .style("top", bbox.y + bbox.height / 1.8 + 30 + "px");
    tooltip.join(
        enter =>
            enter.append("p", d3.select(this).attr("name")),
        update =>
            update.html(d3.select(this).attr("name"))
    );
};

function eraseTooltip() {
    tooltip.transition()
        .duration(200)
        .style("opacity", 0);
};


function getPosition() {
    boundingClientRect = this.getBoundingClientRect();

    var left = boundingClientRect.left;
    var top = boundingClientRect.top;
    var rectHeight = boundingClientRect.height;
    var rectWidth = boundingClientRect.width;

    console.log("left: " + left, ", top: " + top, ", width: " + rectWidth + " ,height: " + rectHeight);
}

// Start Scale ---------------------------------------------------------

let g = svg.append("g");

function scale() {
    // baseWidth refers to ideal scale width on the screen it also is the width of the initial measurement point
    var baseWidth = width / 4;
    var p1 = projection.invert([width / 2 - baseWidth / 2, height / 2]);
    var p2 = projection.invert([width / 2 + baseWidth / 2, height / 2]);
    var distance = getDistance(p1, p2);
    var unit = "m";
    var multiply = 1;
    var bestFit = 1;
    var increment = width / 10000; // This could be scaled to map width maybe width/10000;
    var scaleDistance = 0;
    var scaleWidth = 0;

    if (distance > 1000) {
        unit = "km"; multiply = 0.001;
    }
    // Adjust distance to a round(er) number
    var i = 0;
    while (i < 400) {
        var temp = getDistance(projection.invert([width / 2 - (baseWidth / 2) + (increment * i), height / 2]), projection.invert([width / 2 + baseWidth / 2 - (increment * i), height / 2]));
        var ratio = temp / temp.toPrecision(1);

        // If the second distance is moving away from a cleaner number, reverse direction.
        if (i == 1) {
            if (Math.abs(1 - ratio) > bestFit) { increment = - increment; }
        }
        // If we are moving away from a best fit after that, break
        else if (i > 2) {
            if (Math.abs(1 - ratio) > bestFit) { break }
        }
        // See if the current distance is the cleanest number
        if (Math.abs(1 - ratio) < bestFit) {
            bestFit = Math.abs(1 - ratio);
            scaleDistance = temp;
            scaleWidth = (baseWidth) - (2 * increment * i);
        }
        i++;
    }

    // Now to build the scale			
    var bars = [];
    var smallBars = 10;
    var bigBars = 4;
    var odd = true;
    var label = false;

    // Populate an array to represent the bars on the scale
    for (i = 0; i < smallBars; i++) {
        if (smallBars - 1 > i) { label = false; } else { label = true; }
        bars.push({ width: 1 / (smallBars * (bigBars + 1)), offset: i / (smallBars * (bigBars + 1)), label: label, odd: odd });
        odd = !odd;
    }
    for (i = 0; i < bigBars; i++) {
        bars.push({ width: 1 / (bigBars + 1), offset: (i + 1) / (bigBars + 1), label: true, odd: odd });
        odd = !odd;
    }

    // Append the scale
    var scaleBar = g.selectAll(".scaleBar")
        .data(bars);

    // enter bars with no width
    scaleBar
        .enter()
        .append("rect")
        .attr("x", 20)
        .attr("y", height - 40)
        .attr("height", 20)
        .attr("width", 0)
        .attr("class", "scaleBar")
        .merge(scaleBar) // merge so that rect are updates if they are in the enter selection or the update selection.
        .transition()
        .attr("x", function (d) { return d.offset * scaleWidth + 20 })
        //.attr("y", height - 30)
        .attr("width", function (d) { return d.width * scaleWidth })
        //.attr("height", 10)
        .attr("fill", function (d) { if (d.odd) { return "#eee"; } else { return "#222"; } })
        .duration(1000);

    g.selectAll(".scaleText").remove();

    g.selectAll(".scaleText")
        .data(bars).enter()
        .filter(function (d) { return d.label == true })
        .append("text")
        .attr("class", "scaleText")
        .attr("x", 0)
        .attr("y", 0)
        .style("text-anchor", "start")
        .text(function (d) { return d3.format(",")(((d.offset + d.width) * scaleDistance).toPrecision(2) * multiply); })
        .attr("transform", function (d) { return "translate(" + ((d.offset + d.width) * scaleWidth + 20) + "," + (height - 45) + ") rotate(-45)" })
        .style("opacity", 0)
        .transition()
        .style("opacity", 1)
        .duration(1000);


    g.append("text")
        .attr("x", scaleWidth / 2 + 20)
        .attr("y", height - 5)
        .text(function () { if (unit == "km") { return "kilometers"; } else { return "metres"; } })
        .style("text-anchor", "middle")
        .attr("class", "scaleText")
        .style("opacity", 0)
        .transition()
        .style("opacity", 1)
        .duration(1000);
}
// End Scale -----------------------------------------
//scale();

var currentScale = 750;


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Latitude/longitude spherical geodesy tools                         (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong.html                                                    */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-spherical.html                       */
/*function getDistance(p1, p2) {

    var lat1 = p1[1];
    var lat2 = p2[1];
    var lon1 = p1[0];
    var lon2 = p2[0];

    var R = 6371e3; // metres
    var φ1 = lat1 * Math.PI / 180;
    var φ2 = lat2 * Math.PI / 180;
    var Δφ = (lat2 - lat1) * Math.PI / 180;
    var Δλ = (lon2 - lon1) * Math.PI / 180;

    var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    var distance = R * c;

    return distance;



}

*/




