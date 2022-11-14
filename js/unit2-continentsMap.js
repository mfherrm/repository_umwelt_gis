//Width and height
var widthC = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var heightC = Math.max(document.documentElement.clientWidth, window.innerHeight || 0)
//Define projection
projection = d3.geoBromley()
        .scale(widthC / 1 / Math.PI)
        .rotate([-8, 0])
        .center([0, 0])
        .translate([widthC/2, heightC /2]);

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
     svgC.append("defs").append("path")
     .datum({type: "Sphere"})
     .attr("id", "sphere")
     .attr("d", pathC);

     svgC.append("use")
     .attr("class", "stroke")
     .attr("xlink:href", "#sphere");

     svgC.append("use")
     .attr("class", "fill")
     .attr("xlink:href", "#sphere");

     svgC.append("path")
     .datum(graticule)
     .attr("class", "graticule")
     .attr("d", pathC);

     svgC.insert("path", ".graticule")
     .datum(data.features)
     .attr("class", "land")
     .attr("d", pathC);

     svgC.insert("path", ".graticule")
     .datum(data.features)
     .attr("class", "boundary")
     .attr("d", pathC);
    //append continents
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
            //Do nothing if already right
           if (continent.attr("fill")!='#4FE34F'){
            getContinent(continent);
           }
        });
        
};
//Array for selected continents
let selectC = [{
    'africa': false,
    'europe': false,
    'selected': []
}] 

//Get continent and check if answer is right
//Already right answer: do nothing
//Right answer: fill green -> pop()
//Wrong answer: fill red
//Already selected: deselect -> pop()

function getContinent(continent) {
    let elemid = continent._groups[0][0].__data__.properties.CONTINENT
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

//So that users can click either the div or one of the individual pyramids -> Can't click wrong
d3.select("#pyr_continents").on("mouseup", getPyrC);
d3.select("#pyr_europe").on("mouseup", getPyrC);
d3.select("#pyr_africa").on("mouseup", getPyrC);

//Gets hovered element (either div -> [length-5] or pyramid [8])
function getPyrC() {
    console.log(document.querySelectorAll(':hover'))
    let elem;
    document.querySelectorAll(':hover')[8]==null? elem = document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 5] : elem = document.querySelectorAll(':hover')[8]
    let elemid = elem.getAttribute('id')
    //Prevent error in case selection is undefined
    if(selectC[0].selected[0]!=undefined){
    let con = selectC[0].selected[0]._groups[0][0].__data__.properties.CONTINENT

    //If right, fill and pop(), do nothing if already right, else fill red 

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
