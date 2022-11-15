//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 2548) + 30;
//Used to set stroke on circle hover
let prov
//Used to get maximum value of dataset
let max
//Used to draw tooltip
let tooltip
//Used to store circles
let circles
//Define color scale
let colorScaleBlues5 = ['#f1eef6', '#d0d1e6', '#a6bddb', '#74a9cf', '#2b8cbe']
//Load data for all maps, then draw 
Promise.all([d3.json("../geojson/zaf_provinces.geojson"), d3.json("../geojson/germany_bundeslaender.geojson"), d3.json("../geojson/kenya_counties.geojson")])
    .then(draw).catch(error => { console.log(error) })

//Parameter function, defining parameters that differ between the countries
function draw(data) {
    drawMap(data[0], '#southafrica', "mzaf", d3.geoAzimuthalEqualArea().scale(1).translate([0, 0]).rotate([-24, -28]), d3.scaleThreshold().domain([61, 62, 63, 64, 65]).range(colorScaleBlues5), 50)
    drawMap(data[1], '#germany', "mger", d3.geoAzimuthalEqualArea().scale(1).translate([0, 0.0]).rotate([-10, -52]), d3.scaleThreshold().domain([26, 27, 28, 30, 31]).range(colorScaleBlues5), 80)
    drawMap(data[2], '#kenya', "mken", d3.geoAzimuthalEqualArea().scale(1).translate([0, -.01]).rotate([-38, 0]), d3.scaleThreshold().domain([32, 36, 40, 48, 52]).range(colorScaleBlues5), 50)
}

//Draw Map
function drawMap(data, target, id, projection, color, csize) {
    //Create SVG element // viewBox for responsive Map, target as specified to create three svgs
    var svg = d3.select(target)
        .append("svg")
        //responsive size
        .attr("viewBox", [0, 0, width, height])
        //dunno seems nice
        .attr("preserveAspectRatio", "xMinYMin")
        .append("g")
        .attr("class", "mapbox")
        //So that the svg is accessible later on
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
        .attr("class", "adminarea3a")
        .attr('gini', function (d) {
            return d.properties.gini_t;
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
            return color(d.properties.gini_t)
        })

    drawDiagram();
    drawScalebar(projection, id);
    drawLegend(id, csize, color);

    function drawDiagram(d) {
        //Used to store all population data
        let popTot = []
        //Add all data to array, so that d3.Max() can be used
        for (let i = 0; i < data.features.length; i++) {
            popTot.push(data.features[i].properties.population)
        }
        //Create circles
        circles = svg.selectAll(null)
            .data(data.features)
            .enter()
            .append("circle")
            .attr('class', 'circle')
            .attr("transform", function (d) {
                //Manually change position of Brandenburg so that it does not overlap with Berlin
                return d.properties.name_1 == 'Brandenburg' ? "translate(" + (path.centroid(d)[0] + 40 + ',' + path.centroid(d)[1]) + ")" : "translate(" + path.centroid(d) + ")";
            })
            .attr("r", function (d) {
                //Get max value of all admin areas of this country
                max = d3.max(popTot);
                //Circle size equals target size * share of current population with max
                size = csize * d.properties.population / max
                return size
            })
            .attr('population', function (d) {
                return d.properties.population
            })
            .attr('name', function (d) {
                return d.properties.name_1
            })
            .attr('gini', function (d) {
                return d.properties.gini_t;
            })
            //Cursor on mouseover
            .style("cursor", "pointer")
            .style("fill", "#1e1e1e")
            .style("stroke", "white")
            .on("mouseover", drawTooltip)
            .on("mouseout", eraseTooltip)
    }
    //Sort circles by population, raise afterwards, this way the smaller circles are always on top of the bigger ones, making them always visible (e.g. south-western Kenya)
    circles = circles.sort(function (x, y) {
        return d3.descending(x.properties.population, y.properties.population)
    });
    circles.raise();


    //Build Tooltip, creates new tooltip each time, which is why erase tooltip is more important than ever
    function drawTooltip() {
        window.onresize = this.getBoundingClientRect();
        let bbox = this.getBoundingClientRect();
        tooltip = d3.select(target)
            .append("div")
            .attr("class", "tooltip")
            .attr("opacity", 0)
            .attr('id', 'tt');
        //Only show tooltips for circles
        if (document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1].getAttribute('class') == 'circle') {
            tooltip
                .style("opacity", .7)
                .style("left", bbox.x + bbox.width / 2 + 10 + "px")
                .attr('id', 'tt')
                .style("top", bbox.y + bbox.height / 2 + "px");
            tooltip.join(
                enter =>
                    enter.html("<p>" + d3.select(this).attr("name") + "</p>"),
                update =>
                    update.html("<p><strong>" + d3.select(this).attr("name") + "</strong></p><p>Total Population: " + d3.select(this).attr("population") + "</p><p>Gini: " + d3.select(this).attr("gini") + "%</p>")
            )
        }
        //Get hovered element and increase its boundary, same for the province it belongs to
        let name = d3.select(this).attr("name");
        prov = document.querySelector('[name="' + name + '"]');
        this.style.strokeWidth = '3px';
        prov.style.strokeWidth = '3px';
    };

};
//Erase 
function eraseTooltip() {
    this.style.strokeWidth = '1px';
    d3.selectAll('#tt').remove();

    prov.style.strokeWidth = '0.5px'
};

//Build Vertical-Legend -- https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e
function drawLegend(id, csize, color) {
    //Get circle size for legend
    let size = d3.scaleSqrt()
        .domain([1, max])
        .range([1, csize]);
    //Define which values shall be shown in the legend
    let valuesToShow = [(Math.round(1 / 4 * max / 1000000) * 1000000), (Math.round(2 / 3 * max / 1000000) * 1000000), max];
    //Hardcoded positions for circle
    let xCircle = 90;
    let yCircle = 361;
    let xLabel = 190;
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
    //Add entries for choropleth map
    var legend = legendSvg.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "entry")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 40 + ")";
        });
    //Return entry text
    legendSvg.append("g")
        .append("text")
        .text(function () {
            return "Gini-Coefficient [%]";
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
            //For some reason the legend returns the second to last value twice, this fixes it
            if (i == 4) {
                return colorScaleBlues5[i]
            } else {
                //return color corresponding to no. of domain // (d-1) for right color, dunno why it's that way
                return color(d - 1);
            }
        })
    //Append three circles, change their position based on what their max size is 
    var legendCircle = legendSvg.selectAll('.legend')
        .data(valuesToShow)
        .enter()
        .append('g')
        .attr('class', 'legendCircle')
        .append("circle")
        .attr("cx", xCircle)
        .attr("cy", function (d) { return csize == 50 ? yCircle - size(d) + 70 : yCircle - size(d) + 125 })
        .attr('r', function (d) {
            return size(d)
        })
        .style('fill', 'none')
        .style('stroke', '#1e1e1e')
        .attr("transform", function () {
            return "translate(0,-25)"
        })

    legendSvg
        .append("g")
        .append("text")
        .text("Total Population")
        .attr("transform", 'translate(0,280)');
    //Append three lines to label the circles, position based on the max circle size
    var legendSegments = legendSvg.selectAll('.legend')
        .data(valuesToShow)
        .enter()
        .append('line')
        .attr('x1', function (d) { return xCircle })
        .attr('x2', xLabel)
        .attr('y1', function (d) { return csize == 50 ? yCircle - size(d) * 2 + 70 : yCircle - size(d) * 2 + 125 })
        .attr('y2', function (d) { return csize == 50 ? yCircle - size(d) * 2 + 70 : yCircle - size(d) * 2 + 125 })
        .attr('stroke', '#1e1e1e')
        .style('stroke-dasharray', ('2,2'))
        .attr("transform", function () {
            return "translate(0,-25)"
        })
    //Add labels to the endn of the lines 
    var legendLabels = legendSvg.selectAll('.legend')
        .data(valuesToShow)
        .enter()
        .append('text')
        .attr("transform", function () {
            return "translate(0,-20)"
        })
        .attr('x', xLabel)
        .attr('y', function (d) { return csize == 50 ? yCircle - size(d) * 2 + 77 : yCircle - size(d) * 2 + 130 })
        .text(function (d) { return d })
        .style('font-size', '20px')
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
            //There surely is a better way to do this
            if (i == 0) {
                //Set upper-left value to smallest value of the dataset
                if (id == "mger") {
                    return "25 to " + (d)
                } else if (id == "mzaf") {
                    return "60 to " + (d)
                } else {
                    return "28 to " + (d)
                }

            } else if (i == color.domain().length - 1) {
                //Set lower-right value to highest value of the dataset
                if (id == "mger") {
                    return (d) + " to 32"
                } else if (id == "mzaf") {
                    return 64.01 + " to 65"
                } else {
                    return (d) + " to 62"
                }

            } else {
                //Next value with a 0.01 increment
                return d3.format(".2f")(color.domain()[i - 1] + 0.01) + " to  " + (d)
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
        .tickValues([0, 200])
        //.distance(200)
        // How far the tick text labels are from the lines
        .tickPadding(8)

    var scaleSvg = d3.select(('#' + mapID))
        .append("g")
        .attr("class", "scalebar")
        //move the Scalebar like the legend
        .attr("transform", function () {
            return "translate(10," + height * .9 + ")";
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

