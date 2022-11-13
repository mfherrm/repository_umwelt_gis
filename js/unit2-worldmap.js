//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var i = 0
//Create SVG element // viewBox for responsive Map

// Define Graticule 
var graticule = d3.geoGraticule();
let country


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
    i == 0 ? target = '#worldmapu2' : target = "#worldmapall"

    var svg = d3.select(target)
        .append("svg")
        //responsive size
        .attr("viewBox", function () {
            if (i == 0) {
                return [0, 0, width, 2548]
            } else {
                return [0, 0, width, 2548]
            }
        })
        .attr('id', function () {
            if (i == 0) {
                return 'wmu3'
            } else {
                return 'wmu4'
            }
        })

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
        .attr("class", function(d){
                return d.properties.pyramid==null? 'nonCountry' : "country"
        })
        .attr("fill", "grey")
        .attr('state', function () { return false })

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
        .style("cursor", function(d){
          return d.properties.pyramid? "pointer": '' 

        }
        )
        .on("click", function (event) {
            country = d3.select(this);
            let src = document.querySelectorAll(':hover')[9].id
            console.log(src)
            if (src=='wmu3'){
                country.attr("fill") == 'green'? '': getCountry(country)
            } else if (src=='wmu4'){
                (country.attr("fill") == "#90CEC4" || country.attr("fill") == "#BEBADA" || country.attr("fill") == "#F8CDE2" || country.attr("fill") == "#F8B365")?'':getPyramid(country)
                }
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
        if (select[0].selected[0] == undefined){
            console.log('undefined')
        }else if (select[0].selected[0]._groups[0][0].__data__.properties.NAME_ENGL == elemid) {
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

let select4 = [];

function getPyramid(country) {
    let elemid = country.attr('name');
    let elempyr = country.attr('pyramid');
    let elemstat = country.attr('state');
    if (country.attr("fill") != "#00677F" && select4.length < 1 && country.attr("continent") != 0) {
        select4.push(country);
        return country.attr("fill", "#00677F")
    } else {
        if (select4[0]== undefined){
            console.log('undefined')
        }else if (select4[0]._groups[0][0].__data__.properties.NAME_ENGL == elemid) {
            select4.pop();
            return country.attr("fill", "grey")
        }



    }
}

d3.select("#pyr_imgs").on("click", function () {
    let elem = document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1]
    let elemid = elem.getAttribute('id')
    let conid = country.attr('name')
    let con = select4[0]._groups[0][0].__data__.properties.pyramid
    console.log(con)
    if ((con == 1 && elemid.includes('pyrstg0')) || (con == 2 && elemid.includes('pyrstg1')) || (con == 3 && elemid.includes('pyrstg2')) || (con == 4 && elemid.includes('pyrstg3'))) {
        con == 1 ? select4[0].attr("fill", "#F8B365") : con == 2 ? select4[0].attr("fill", "#F8CDE2") : con == 3 ? select4[0].attr("fill", "#BEBADA") : con == 4 ? select4[0].attr("fill", "#90CEC4") : ''
        select4.pop();
    } else {
        select4[0].attr("fill", "red");
    }
}
);
