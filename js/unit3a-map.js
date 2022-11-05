//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 2548);
let prov
let size
let max
let projection
let tooltip
let circles
let color
let csize

Promise.all([d3.json("../geojson/zaf_provinces.geojson"), d3.json("../geojson/germany_bundeslaender.geojson"), d3.json("../geojson/kenya_counties.geojson")])
    .then(draw).catch(error => { console.log(error) })

//Create tooltip for mouseover on body for absolute position -- https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/ -- https://bl.ocks.org/d3noob/a22c42db65eb00d4e369

//Build Map

function draw(data) {
    let target = '#southafrica';
    let id = "mzaf"
    projection = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, 0]); // 1.right/left (lon) 2.up/down (lat) e.g. negative lon/lat at center 
    color = d3.scaleThreshold().domain([75, 80, 85, 90, 95, 100]).range(d3.schemeReds[6]);
    csize= 50;
    drawMap(data[0], target, id, projection, color, csize)
    target = '#germany';
    id = "mger"
    projection = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, 0.0]).rotate([-10, -52]);
    color = d3.scaleThreshold().domain([5, 7, 10, 13, 15, 17, 20]).range(d3.schemeReds[7]);
    csize= 80;
    drawMap(data[1], target, id, projection, color, csize)
    target = '#kenya';
    id = "mken"
    projection = d3.geoAzimuthalEqualArea().scale(1).translate([.03, -.01]).rotate([-38, 0]);
    color = d3.scaleThreshold().domain([75, 80, 85, 90, 95, 100]).range(d3.schemeReds[6]);
    csize= 50;
    drawMap(data[2], target, id, projection, color, csize)

}


//Create tooltip for mouseover on body for absolute position -- https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/ -- https://bl.ocks.org/d3noob/a22c42db65eb00d4e369


//Build Map
function drawMap(data, target, id, projection, color, csize) {
    //Create SVG element // viewBox for responsive Map
    var svg = d3.select(target)
        .append("svg")
        //responsive size
        .attr("viewBox", [0, 0, width, height])
        //dunno seems nice
        .attr("preserveAspectRatio", "xMinYMin")
        .append("g")
        .attr("class", "mapbox")
        .attr('id', id);
    //Define path generatoryx   
    var path = d3.geoPath()
        .projection(projection);
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    var bbox = path.bounds(data),
        s = .92 / Math.max((bbox[1][0] - bbox[0][0]) / width, (bbox[1][1] - bbox[0][1]) / height),
        t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    // Update the projection    
    projection
        .scale(s)
        .translate(t);
    //Bind data and create one path per GeoJSON feature
    svg.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", function (d) {
            return d.properties.LEVL_CODE == 0 ? "countryU3" : "adminarea3a";
        })
        .attr("poverty", function (d) {
            return d.properties.poverty_rel;
        })
        .attr("population", function (d) {
            return d.properties.population;
        })
        //get province name  
        .attr("name", function (d) {
            return d.properties.name_1;
        })
        //get color for Value of Population Density from "var color"
        .style("fill", function (d) {
            return d.properties.poverty_rel ? color(d.properties.poverty_rel) : 'lightgray';
        })

    drawDiagram();
    drawScalebar(projection, id);
    drawLegend(id);

    function drawDiagram(d) {
        let popTot = []
        for (let i = 0; i < data.features.length; i++) {
            popTot.push(data.features[i].properties.population)

        }
        circles = svg.selectAll(null)
            .data(data.features)
            .enter()
            .append("circle")
            .attr('class', 'circle')
            .attr("transform", function (d) {
                return d.properties.name_1 == 'Brandenburg' ? "translate(" + (path.centroid(d)[0] + 40 + ',' + path.centroid(d)[1]) + ")" : "translate(" + path.centroid(d) + ")";
            })
            .attr("r", function (d) {
                max = d3.max(popTot);
                size = csize * d.properties.population / max
                return size
            })
            .attr('population', function (d) {
                return d.properties.population
            })
            .attr('name', function (d) {
                return d.properties.name_1
            })
            //Cursor on mouseover
            .style("cursor", "pointer")
            .on("mouseover", drawTooltip)
            .on("mouseout", eraseTooltip)


    }
    circles.raise();

    //Build Tooltip
function drawTooltip() {
    window.onresize = this.getBoundingClientRect();
    let bbox = this.getBoundingClientRect();
    tooltip = d3.select(target)
        .append("div")
        .attr("class", "tooltip")
        .attr("opacity", 0)
        .attr('id', 'tt');
    if (document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1].getAttribute('class') == 'circle') {
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
                update.html("<p>" + d3.select(this).attr("name") + "</p><p>" + d3.select(this).attr("population") + "</p>")
        )
    }
    let name = d3.select(this).attr("name");
    prov = document.querySelector('[name="' + name + '"]');
    this.style.stroke = 'white';
    prov.style.strokeWidth = '3px';
};

};

function eraseTooltip() {
    this.style.stroke = 'none';
    d3.selectAll('#tt').remove();

    prov.style.strokeWidth = '0.5px'

};

//Build Vertical-Legend -- https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e
function drawLegend(id) {
    let size = d3.scaleSqrt()
        .domain([1, max])
        .range([1, csize]);
    let valuesToShow = [(Math.round(1 / 4 * max / 1000000) * 1000000), (Math.round(2 / 3 * max / 1000000) * 1000000), max];
    let xCircle = 90;
    let yCircle = 361;
    let xLabel = 190;
    //set Title
    //create svg for Legend
    var legendSvg = d3.select('#' + id)
        .append("g")
        .attr("class", "legend")
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
            return "Population in poverty [%]";
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + -8 + ")";
        });
    //fill rects by color domain (d) & range (i)                  
    legend.append("rect")
        //rect on position (5,5) in SVG with the width and height 30            
        .attr("x", 5)
        .attr("y", 10)
        .attr("width", 30)
        .attr("height", 30)
        .attr("fill", function (d, i) {
            //return color corresponding to no. of domain // (d-1) for right color, dunno why it's that way
            return color(d - 1);
        })


    var legendCircle = legendSvg.selectAll('.legend')
        .data(valuesToShow)
        .enter()
        .append('g')
        .attr('class', 'legendCircle')
        .append("circle")
        .attr("cx", xCircle)
        .attr("cy", function (d) { return csize==50 ? yCircle - size(d) + 70 : yCircle - size(d) + 125})
        .attr('r', function (d) {
            return size(d)
        })
        .style('fill', 'none')
        .style('stroke', 'black')

    legendSvg
        .append("g")
        .append("text")
        .text("Total Population")
        .attr("transform", 'translate(0,315)');

    var legendSegments = legendSvg.selectAll('.legend')
        .data(valuesToShow)
        .enter()
        .append('line')
        .attr('x1', function (d) { return xCircle })
        .attr('x2', xLabel)
        .attr('y1', function (d) { return csize==50 ? yCircle - size(d) * 2 + 70 : yCircle - size(d) * 2 + 125})
        .attr('y2', function (d) { return csize==50 ? yCircle - size(d) * 2 + 70 : yCircle - size(d) * 2 + 125})
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))

    var legendLabels = legendSvg.selectAll('.legend')
        .data(valuesToShow)
        .enter()
        .append('text')
        .attr('x', xLabel)
        .attr('y', function (d) { return csize==50 ? yCircle - size(d) * 2 + 70 : yCircle - size(d) * 2 + 130})
        .text(function (d) { return d })
        .style('font-size', 17)
        .attr('alignment-basline', 'middle')

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

function drawScalebar(mapProjection, mapID) {
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

    var scaleSvg = d3.select(('#' + mapID))
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

