//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var i = 0
//Create SVG element // viewBox for responsive Map


/*
var projection =  d3.geoBromley()
            .scale(width / 2 / Math.PI)
            .rotate([0, 0])
            .center([0, 0])
            .translate([width / 2, height /2]);
*/


// Define Zoom

// Define Graticule 
var graticule = d3.geoGraticule();



//Define Ordinal Color scheme
var color = d3.scaleOrdinal(d3.schemeCategory10);

//Load in GeoJSON data //Promise resolve
d3.json("../geojson/world_countries2020.geojson")
    .then(drawMap)
    .catch(error => { console.log(error) });
//Define vars for unit
d3.json("../geojson/world_countries2020.geojson")
    .then(drawMap)
    .catch(error => { console.log(error) });




//Build Map
function drawMap(data) {


    i == 0 ? (projection = d3.geoMercator().translate([((width / 3.3)), (height)]).scale(1.75 * height / Math.PI)) :
        (projection = d3.geoMercator().translate([((width / 2.7)), (height * 0.73)]).scale(1.25 * height / Math.PI))

    //Define path generator
    var path = d3.geoPath().projection(projection);

    let target
    i == 0 ? target = '#worldmap' : target = "#worldmapall"

    var svg = d3.select(target)
        .append("svg")
        //responsive size
        .attr("viewBox", function () {
            if (i == 0) {
                return [0, 0, width, 2548]
            } else {
                return [0, 0, width, height]
            }
        })
        //.attr("preserveAspectRatio", "xMinYMin")
        ;
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    // Update the projection    
    //Bind data and create one path per GeoJSON feature

    //Add Graticular
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    svg.append("g").append("path")
        .datum({ type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]] })
        .attr("class", "equator")
        .attr("d", path);

    // so that all countries are displayed: https://stackoverflow.com/questions/48569159/d3-js-does-not-draw-all-lines-only-some-of-them

    svg.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", "grey")
        .attr('state', 'false')
        /*
        function(d,i){
            let min = Math.ceil(0);
            let max = Math.floor(27)
            return color(Math.floor(Math.random()*(max-min)+min))
        })
        */
        .attr("name", function (d) {
            return d.properties.NAME_ENGL;
        })
        .attr('continent', function (d) {
            return d.properties.continent;
        })
        .attr('pyramid', function (d) {
            return d.properties.pyramid;
        })
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("click", function () {
            let country = d3.select(this);
            console.log($(svg).click(function(event) {
                var text = $(event.target);
            }))
            console.log(country.attr('pyramid'));
            console.log(country.attr('continent'));
            console.log(country.attr('state'));
            getCountry(country); //mit parent arbeiten!
        });
    i++;
};


let select = [{
    'germany': false,
    'kenya': false,
    'southafrica': false,
    'selected': []
}] //Array for selected countries

function getCountry(country) {
    let elemid = country._groups[0][0].__data__.properties.NAME_ENGL
    console.log(elemid.toLowerCase())
    if (select[0].germany == true && select[0].kenya == true && select[0].southafrica == true) {
        console.log(select[0].selected[0])
        select[0].selected.pop();
    } else if ((elemid.toLowerCase() == 'germany' && select[0].germany == true) || (elemid.toLowerCase() == 'kenya' && select[0].kenya == true) || (elemid.toLowerCase() == 'south africa' && select[0].southafrica == true)) {
        console.log(select[0].selected[0])
        select[0].selected.pop();
    } else if (country.attr("fill") != "#00677F" && select[0].selected.length < 1 && country.attr("continent") != 0) {
        select[0].selected.push(country);

        return country.attr("fill", "#00677F")
    } else {
        if (select[0].selected[0]._groups[0][0].__data__.properties.NAME_ENGL == elemid) {
            select[0].selected.pop();
            return country.attr("fill", "grey")

        }



    }
}

d3.select("#pyr_countries").on("mouseup", function () {
    let elem = document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1]
    let elemid = elem.getAttribute('id')
    console.log(elemid)
    let con = select[0].selected[0]._groups[0][0].__data__.properties.NAME_ENGL
    console.log(con)
    if ((con.includes("Germany") && elemid.includes('pyr_germany'))) {
        select[0].germany = true;
        select[0].selected[0].attr("fill", "green");
        select[0].selected.pop();
    } else if ((con.includes('Kenya') && elemid.includes('pyr_kenya'))) {
        select[0].kenya = true;
        select[0].selected[0].attr("fill", "green");
        select[0].selected.pop();
    } else if (con.includes('South Africa') && elemid.includes('pyr_southafrica')) {
        select[0].southafrica = true;
        select[0].selected[0].attr("fill", "green");
        select[0].selected.pop();
    } else if (select[0].germany == true && select[0].kenya == true && select[0].southafrica == true) {

    } else {
        select[0].selected[0].attr("fill", "red");
    }
}
);

function getPyramid(country) {
    let elemid = country._groups[0][0].__data__.properties.NAME_ENGL
    let elempyr = country._groups[0][0].__data__.properties.pyramid
    let elemstat = country._groups[0][0].__data__.properties.state
    if (elemstat == true) {
        console.log(select[0].selected[0])
        select[0].selected.pop();
    } else if (country.attr("fill") != "#00677F" && select[0].selected.length < 1 && country.attr("continent") != 0) {
        select[0].selected.push(country);
        return country.attr("fill", "#00677F")
    } else {
        if (select[0].selected[0]._groups[0][0].__data__.properties.NAME_ENGL == elemid) {
            select[0].selected.pop();
            return country.attr("fill", "grey")

        }



    }
}

d3.select("#pyr_imgs").on("click", function () {
    let elem = document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1]
    let elemid = elem.getAttribute('id')
    console.log(elemid)
    if ((con.includes("Germany") && elemid.includes('pyr_stg0'))) {
        select[0].selected[0].attr("fill", "green");
        select[0].selected.pop();
    } else if ((con.includes('Kenya') && elemid.includes('pyr_stg1'))) {
        select[0].kenya = true;
        select[0].selected[0].attr("fill", "green");
        select[0].selected.pop();
    } else if ((con.includes('Kenya') && elemid.includes('pyr_stg2'))) {
        select[0].kenya = true;
        select[0].selected[0].attr("fill", "green");
        select[0].selected.pop();
    } else if (con.includes('South Africa') && elemid.includes('pyr_stg3')) {
        select[0].southafrica = true;
        select[0].selected[0].attr("fill", "green");
        select[0].selected.pop();
    } else if (select[0].germany == true && select[0].kenya == true && select[0].southafrica == true) {

    } else {
        select[0].selected[0].attr("fill", "red");
    }
}
);

d3.select("#restart").on("click", function () {
    select[0].germany = false;
    select[0].southafrica = false;
    select[0].kenya = false;
    select[0].selected.pop();
    d3.selectAll(".country").attr("fill", "grey");
})

