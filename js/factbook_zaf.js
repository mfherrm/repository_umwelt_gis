//Width and height
let height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
let width = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);


//Create SVG element // viewBox for responsive Map
let svg = d3.select("#zaf-overview")
    .append("svg")
    //responsive size
    .attr("viewBox", [0, 0, width, height])
    //dunno seems nice
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("class", "mapbox");

//Define map projection

let projection = d3.geoAzimuthalEqualArea()
    .scale(.45)
    .translate([-.013, .56])  //1.left/right (lon) 2.up/down (lat)
    .rotate([-24, -28]); // 1.right/left (lon) 2.up/down (lat) e.g. negative lon/lat at center            
//if parallels --> analoge

let color = d3.scaleOrdinal(['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#bc80bd','#ccebc5','#ffed6f','#62B0E4']);

//Define path generator
let path = d3.geoPath()
    .projection(projection);

//Load in GeoJSON data //Promise resolve
d3.json("../geojson/zaf_overview.geojson")
    .then(drawMap)
    .catch(error => { console.log("Ooops, Error: " + error) });

//Build Map
function drawMap(data) {
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    let bbox = path.bounds(data),
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
            return d.properties.ADM1_NAME == null ? "country-overview" : d.properties.LEVEL== 2? "district" : "province";
        })
        .attr("fill", function (d, i) {
            console.log()
            if (d.properties.ADM0_NAME == "South Africa" && d.properties.LEVEL == 0) {
                return "none"
            } else if (d.properties.LEVEL == 2) {
                return "none"
            } else {
                console.log(color(i))
                return d.properties.LEVEL == 0 ? "lightgrey" : color(i);
            }
        })
        .attr('name', function(d){
            return d.properties.ADM2_NAME
        })
        .attr("stroke", "grey")
        .on("mouseover", drawTooltip)
        .on("mouseout", eraseTooltip)
    //Build Tooltip
    function drawTooltip() {
        if (d3.select(this).attr('class') == 'district') {
            window.onresize = this.getBoundingClientRect();
            let bbox = this.getBoundingClientRect();
            tooltip = d3.select('#zaf-overview')
                .append("div")
                .attr("class", "tooltip")
                .attr("opacity", 0)
                .attr('id', 'tt');
            tooltip
                .style("opacity", .7)
                .style("left", bbox.x + bbox.width / 2 + "px")
                .attr('id', 'tt')
                .style("top", bbox.y + bbox.height / 2 + "px")
                ;
            tooltip.join(
                enter =>
                    enter.html("<p>" + d3.select(this).attr("name") + "</p>"),
                update =>
                    update.html("<p>" + d3.select(this).attr("name") + "</p>")
            )
        }
    };


    function eraseTooltip() {
        d3.selectAll('#tt').remove();

    };;

    drawScalebar();
};

function drawScalebar() {
    let scaleBar = d3.geoScaleBar()
        .projection(projection)
        //for other procejtion sepcify ".radius"??? ---https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar#scaleBarPositioned ---https://github.com/HarryStevens/d3-geo-scale-bar#sizing 
        .size([width, height])
        //sets the vertical tick size of the scale bar in pixels
        //sets ticks on specified distances OR use distance for automatic specification
        .top(.97)
        .left(.03)
        .distance(200)
        .tickValues([0, 200])
        .orient(d3.geoScaleTop)
        .tickSize(2)
        .tickFormat((d, i, e) => i === e.length - 1 ? `${d} km` : d)
        .zoomClamp(false)
        .tickPadding(8)
        .label(null)
        ;
    // How far the tick text labels are from the line

    let scaleSvg = d3.select(".mapbox")
        .append("g")
        .attr("class", "scalebar");

    scaleSvg.append("g").call(scaleBar);

    d3.selectAll(".tick").attr("class", "scalebartick")
};