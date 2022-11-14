//Width and height
var widthC = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var heightC = Math.max(document.documentElement.clientWidth, window.innerHeight || 0)
//Create SVG element // viewBox for responsive Map


/*Definde Projection
var projection =  d3.geoBromley()
            .scale(width / 2 / Math.PI)
            .rotate([0, 0])
            .center([0, 0])
            .translate([width / 2, height /2]);
*/
projection = d3.geoMercator()
    .translate([((widthC / 2)), (heightC/ 2)])
    .scale((widthC / 2.1 / Math.PI));

// Define Zoom

// Define Graticule 
var graticuleC = d3.geoGraticule();

//Define path generator
var pathC = d3.geoPath()
    .projection(projection);

//Define Ordinal Color scheme
var colorC = d3.scaleOrdinal(d3.schemeCategory10);

//Load in GeoJSON data //Promise resolve
d3.json("../geojson/continents.geojson")
    .then(drawMap)
    .catch(error => { console.log(error) });
//Define vars for unit



//Build Map
function drawMap(data) {
    var svgC = d3.select('#continentmap')
    .append("svg")
    //responsive size
    .attr("viewBox", [0, 0, widthC, heightC])
    //.attr("preserveAspectRatio", "xMinYMin")
    ;
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    // Update the projection    
    //Bind data and create one path per GeoJSON feature

    //Add Graticular
    svgC.append("path")
        .datum(graticuleC)
        .attr("class", "graticule")
        .attr("d", pathC);

    svgC.append("g").append("path")
        .datum({ type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]] })
        .attr("class", "equator")
        .attr("d", pathC);

    svgC.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathC)
        .attr("class", "continent")
        .attr("fill", "grey")
        .attr("name", function (d) {
            return d.properties.CONTINENT;
        })
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("click", function () {
            let continent = d3.select(this);
           if (continent.attr("fill")!='green'){
            getContinent(continent);
           }
        });
        
};

let selectC = [{
    'africa': false,
    'europe': false,
    'selected': []
}] //Array for selected countries

function getContinent(continent) {
    let elemid = continent._groups[0][0].__data__.properties.CONTINENT
    console.log(elemid.toLowerCase())
    console.log(selectC.europe)
    if (selectC[0].africa == true && selectC[0].europe == true) {
        selectC[0].selected.pop();
    } else if ((elemid.toLowerCase() == 'africa' && selectC[0].africa == true) || (elemid.toLowerCase() == 'europe' && selectC[0].europe == true)) {
        selectC[0].selected.pop();
    } else if (continent.attr("fill") != "#00677F" && selectC[0].selected.length < 1) {
        selectC[0].selected.push(continent);
        return continent.attr("fill", "#00677F")
    } else {
        if (selectC[0].selected[0]._groups[0][0].__data__.properties.CONTINENT == elemid) {
            selectC[0].selected.pop();
            return continent.attr("fill", "grey")

        }



    }
}

d3.select("#pyr_continents").on("mouseup", getPyrC);
d3.select("#pyr_europe").on("mouseup", getPyrC);
d3.select("#pyr_africa").on("mouseup", getPyrC);


function getPyrC() {
    console.log(document.querySelectorAll(':hover'))
    let elem;
    document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 4]==null? elem = document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 5] : elem = document.querySelectorAll(':hover')[8]
    let elemid = elem.getAttribute('id')
    console.log(elemid)
    if(selectC[0].selected[0]!=undefined){
    let con = selectC[0].selected[0]._groups[0][0].__data__.properties.CONTINENT
    console.log(con)
    if ((con.includes("Africa") && elemid.includes('pyr_africa'))) {
        selectC[0].africa = true;
        selectC[0].selected[0].attr("fill", "#4FE34F");
        selectC[0].selected.pop();
    } else if ((con.includes('Europe') && elemid.includes('pyr_europe'))) {
        selectC[0].europe = true;
        selectC[0].selected[0].attr("fill", "#4FE34F");
        selectC[0].selected.pop();
    } else if (selectC[0].africa == true && selectC[0].europe == true ){
        
    } else {
        selectC[0].selected[0].attr("fill", "#EC5B5B");
    }
}}

d3.select("#restart").on("click", function () {
    selectC[0].africa = false;
    selectC[0].europe = false;
    selectC[0].selected.pop();
    d3.selectAll(".continent").attr("fill", "grey");
})
