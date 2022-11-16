//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var i = 0
// Define Graticule 
var graticule = d3.geoGraticule();
let country

//Define Ordinal Color scheme
var color = d3.scaleOrdinal(d3.schemeCategory10);

//Super clunky load, way more elegant in other scripts (3a, 3b)
//Load in GeoJSON data //Promise resolve
d3.json("../geojson/world_countries2020.geojson")
    .then(drawMap)
    .catch(error => { console.log(error) });
d3.json("../geojson/world_countries2020.geojson")
    .then(drawMap)
    .catch(error => { console.log(error) });

//Build Map
function drawMap(data) {
    //Define projection
    i == 0 ? (projection = d3.geoMercator().translate([((width / 3.3)), (height*.95)]).scale(1.6 * height / Math.PI)) :
    (projection = d3.geoMercator().translate([((width / 2.7)), (height *.95)]).scale(1.6 * height / Math.PI))

    //Define path generator
    var path = d3.geoPath().projection(projection);

    //Draw into different divs based on which iteration of drawMap() this is
    let target
    i == 0 ? target = '#worldmapu2' : target = "#worldmapall"

    //Create new svg for each map
    var svg = d3.select(target)
        .append("svg")
        //responsive size
        .attr("viewBox", function () {
            return [0, 0, width, width*1.5]
        })
        //different IDs will be needed to access data later on
        .attr('id', function () {
            if (i == 0) {
                return 'wmu3'
            } else {
                return 'wmu4'
            }
        })

        ;
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
        .attr("class", function (d) {
            //To make clickable countries more intuitively emphasized
            return d.properties.pyramid == null ? 'nonCountry' : "country"
        })
        .attr("fill", "grey")
        .attr('state', function () { return false })
        .attr("name", function (d) {
            return d.properties.NAME_ENGL;
        })
        .attr('continent', function (d) {
            return d.properties.continent;
        })
        .attr('pyramid', function (d) {
            return d.properties.pyramid;
        })
        //Pointer on mouseover, but only clickable countries
        .style("cursor", function (d) {
            return d.properties.pyramid ? "pointer" : ''
        })
        //Get country, decide what to do based on which element this was triggered from
        .on("click", function (event) {
            country = d3.select(this);
            let src = document.querySelectorAll(':hover')[9].id
            console.log(src)
            if (src == 'wmu3') {
                //Do nothing if already true, otherwise get country
                country.attr("fill") == '#4FE34F' ? '' : getCountry(country)
            } else if (src == 'wmu4') {
                //Do nothing if already true, otherwise get country
                (country.attr("fill") == "#fdb462" || country.attr("fill") == "#fccde5" || country.attr("fill") == "#b3de69" || country.attr("fill") == "#bc80bd") ? '' : getPyramid(country)
            }
        });
    i++;
};

//Array for selected countries
let select = [{
    'germany': false,
    'kenya': false,
    'southafrica': false,
    'selected': []
}]

//Used in the second map
//Do nothing if all selections are right, fill green and return true if right, fill red and pop() if wrong
//If undefined do not throw error, just log undefined, If already selected fill grey and pop()
//In essence, checks if selections are right, wrong, previously selected, acts accordingly 
function getCountry(country) {
    let elemid = country._groups[0][0].__data__.properties.NAME_ENGL
    //All countries are already true
    if (select[0].germany == true && select[0].kenya == true && select[0].southafrica == true) {
        console.log(select[0].selected[0])
        select[0].selected.pop();
        //Is the selected country right?
    } else if ((elemid.toLowerCase() == 'germany' && select[0].germany == true) || (elemid.toLowerCase() == 'kenya' && select[0].kenya == true) || (elemid.toLowerCase() == 'south africa' && select[0].southafrica == true)) {
        console.log(select[0].selected[0])
        select[0].selected.pop();
        //Select new country
    } else if (country.attr("fill") != "#00677F" && select[0].selected.length < 1 && country.attr("continent") != 0) {
        select[0].selected.push(country);
        return country.attr("fill", "#00677F")
        //Country is already selected, deselect
    } else {
        if (select[0].selected[0] == undefined) {
            console.log('undefined')
        } else if (select[0].selected[0]._groups[0][0].__data__.properties.NAME_ENGL == elemid) {
            select[0].selected.pop();
            return country.attr("fill", "grey")
        }
    }
}

//So that even my project partner can use the population pyramids
d3.select("#pyr_countries").on("mouseup", getPyr)
d3.select("#pyr_southafrica").on("mouseup", getPyr)
d3.select("#pyr_germany").on("mouseup", getPyr)
d3.select("#pyr_kenya").on("mouseup", getPyr)

//Gets hovered element (either div -> [length-5] or pyramid [8])
//Compares names of selected element from previous method and the element this was triggered from
//Because of this two-pronged users will have to select a country first
//Do nothing if all selections are right, fill green and return true if right, fill red and pop() if wrong
//If undefined do not throw error, just log undefined, if already selected fill grey and pop()
function getPyr() {
    console.log(document.querySelectorAll(':hover'))
    let elem;
    //Get element from trigger
    document.querySelectorAll(':hover')[8] == null ? elem = document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 5] : elem = document.querySelectorAll(':hover')[8]
    let elemid = elem.getAttribute('id')
    console.log(elemid)
    //Do nothing if undefined
    if (select[0].selected[0] != undefined) {
        let con = select[0].selected[0]._groups[0][0].__data__.properties.NAME_ENGL
        console.log(con)
        //If Germany was clicked, fill green, set Germany true and pop()
        if ((con.includes("Germany") && elemid.includes('pyr_germany'))) {
            select[0].germany = true;
            select[0].selected[0].attr("fill", "#4FE34F");
            select[0].selected.pop();
            //If Kenya was clicked, fill green, set Kenya true and pop()
        } else if ((con.includes('Kenya') && elemid.includes('pyr_kenya'))) {
            select[0].kenya = true;
            select[0].selected[0].attr("fill", "#4FE34F");
            select[0].selected.pop();
            //If ZAF was clicked, fill green, set it true and pop()
        } else if (con.includes('South Africa') && elemid.includes('pyr_southafrica')) {
            select[0].southafrica = true;
            select[0].selected[0].attr("fill", "#4FE34F");
            select[0].selected.pop();
            //Do nothing if everything is already correct
        } else if (select[0].germany == true && select[0].kenya == true && select[0].southafrica == true) {
            //Fill red if it is not right
        } else {
            select[0].selected[0].attr("fill", "#EC5B5B");
        }
    }
};
//Used in the third map (Page4)
let select4 = [];
//Used in the third map
//Adds a country if not already selected, not clickable, array not full (Only one country can be added)
//Prevent error if undefined by logging undefined
function getPyramid(country) {
    let elemid = country.attr('name');
    //Add new country if empty, fill blue
    if (country.attr("fill") != "#00677F" && select4.length < 1 && country.attr("continent") != 0) {
        select4.push(country);
        return country.attr("fill", "#00677F")
    } else {
        //Do nothing if undefined
        if (select4[0] == undefined) {
            console.log('undefined')
            //If already selected pop()
        } else if (select4[0]._groups[0][0].__data__.properties.NAME_ENGL == elemid) {
            select4.pop();
            return country.attr("fill", "grey")
        }
    }
}
//Used in the third map
//Checks which element this was triggered from
//Checks which country was selected
//If the selected country is a country with the right population pyramid
//Fill green, pop()
//Else fill red
d3.select("#pyr_imgs").on("click", function () {
    let elem = document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1]
    let elemid = elem.getAttribute('id')
    let con = select4[0]._groups[0][0].__data__.properties.pyramid
    console.log(con)
    //Check which pyramid was clicked, return fill on true, pop()
    if ((con == 1 && elemid.includes('pyrstg0')) || (con == 2 && elemid.includes('pyrstg1')) || (con == 3 && elemid.includes('pyrstg2')) || (con == 4 && elemid.includes('pyrstg3'))) {
        con == 1 ? select4[0].attr("fill", "#bc80bd") : con == 2 ? select4[0].attr("fill", "#b3de69") : con == 3 ? select4[0].attr("fill", "#fccde5") : con == 4 ? select4[0].attr("fill", "#fdb462") : ''
        select4.pop();
        //Fill red if wrong
    } else {
        select4[0].attr("fill", "#EC5B5B");
    }
}
);
