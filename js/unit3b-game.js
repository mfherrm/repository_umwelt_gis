//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerHeight || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 2548) + 30;
//Used for game mode -> False = Highest, True = Lowest
let mode = false;


//Load in GeoJSON data //Promise resolve
Promise.all([d3.json("../geojson/zaf_provinces.geojson"), d3.json("../geojson/germany_bundeslaender.geojson"), d3.json("../geojson/kenya_counties.geojson")])
    .then(draw).catch(error => { console.log(error) })

//Parameter function to draw different maps
function draw(data) {
    drawMap(data[0], '#southafrica', "exzaf", d3.geoAzimuthalEqualArea().scale(1).translate([0, 0]).rotate([-24, -28]))
    drawMap(data[1], '#germany', "exger", d3.geoAzimuthalEqualArea().scale(1).translate([0, 0.0]).rotate([-10, -52]))
    drawMap(data[2], '#kenya', "exken", d3.geoAzimuthalEqualArea().scale(1).translate([0, .005]).rotate([-38, 0]))
}

//Build Map
function drawMap(data, target, id, projection) {
    //Create SVG element // viewBox for responsive Map // creates three new svgs
    var svg = d3.select(target)
        .append("svg")
        //responsive size
        .attr("viewBox", [0, 0, width, height])
        //dunno seems nice
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("class", "mapbox")

    //Define path generator
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
        .attr("class", "adminarea")
        .attr("fill", "darkgrey")
        .on("click", function (d) {
            //Gets selected area and returns it, calls getAdmin()
            let admin = d3.select(this);
            let id = document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 4].id
            d3.select(this).attr('class') == 'adminarea' ? getAdmin(admin, id) : ''

        })
};
//Used to store the selected areas in the right order
let selectger = ['X', 'X', 'X']
let selectken = ['X', 'X', 'X']
let selectzaf = ['X', 'X', 'X']

//Selects / deselects the area
function getAdmin(admin, id) {
    let target;
    //Checks for where this was triggered from
    id == 'germany' ? target = selectger : id == 'kenya' ? target = selectken : id == 'southafrica' ? target = selectzaf : console.log('error')
    //Do nothing if true
    if ((admin.attr("fill") == "#4FE34F")) {
        //If X included(Empty space) and not already selected, add to array
    } else if (admin.attr("fill") != "#00677F" && admin.attr("fill") != "#EC5B5B" && target.includes('X')) {
        addSelected(target, admin)
        return admin.attr("fill", "#00677F")
        //Deselect if already selected (slot 0)
    } else if (target[0] != 'X' && target[0]._groups[0][0].__data__.properties.name_1 == admin._groups[0][0].__data__.properties.name_1) {
        admin.attr('fill', 'darkgrey');
        delSelected(target, target[0])
        //Deselect if already selected (slot 1)
    } else if (target[1] != 'X' && target[1]._groups[0][0].__data__.properties.name_1 == admin._groups[0][0].__data__.properties.name_1) {
        admin.attr('fill', 'darkgrey');
        delSelected(target, target[1])
        //Deselect if already selected (slot 2)
    } else if (target[2] != 'X' && target[2]._groups[0][0].__data__.properties.name_1 == admin._groups[0][0].__data__.properties.name_1) {
        admin.attr('fill', 'darkgrey');
        delSelected(target, target[2])

    }
    //updates the selected array as this was not done before to keep things general
    id == 'germany' ? selectger = target : id == 'kenya' ? selectken = target : id == 'southafrica' ? selectzaf = target : console.log('error')

};
//Checks for values in Germany
d3.select("#checkger").on("click", function () {
    //Select areas with highest values
    if (mode == false) {
        //Fill green if true, red if false
        for (let i in selectger) {
            if (selectger[0]._groups[0][0].__data__.properties.name_1 == "Thüringen") {
                selectger[0].attr("fill", "#4FE34F");
            } else {
                selectger[0].attr("fill", "#EC5B5B");
            }
            if (selectger[1]._groups[0][0].__data__.properties.name_1 == "Mecklenburg-Vorpommern") {
                selectger[1].attr("fill", "#4FE34F");
            } else {
                selectger[1].attr("fill", "#EC5B5B");
            }
            if (selectger[2]._groups[0][0].__data__.properties.name_1 == "Brandenburg") {
                selectger[2].attr("fill", "#4FE34F");
            } else {
                selectger[2].attr("fill", "#EC5B5B");
            }

        }
        //Select areas with lowest values
    } else {
        //Fill green if true, red if false
        for (let i in selectger) {
            if (selectger[0]._groups[0][0].__data__.properties.name_1 == "Bremen") {
                selectger[0].attr("fill", "#4FE34F");
            } else {
                selectger[0].attr("fill", "#EC5B5B");
            }
            if (selectger[1]._groups[0][0].__data__.properties.name_1 == "Schleswig-Holstein") {
                selectger[1].attr("fill", "#4FE34F");
            } else {
                selectger[1].attr("fill", "#EC5B5B");
            }
            if (selectger[2]._groups[0][0].__data__.properties.name_1 == "Nordrhein-Westfalen") {
                selectger[2].attr("fill", "#4FE34F");
            } else {
                selectger[2].attr("fill", "#EC5B5B");
            }
        }
    }
})
//Checks for values in South Africa
d3.select("#checkzaf").on("click", function () {
    //Select areas with highest values
    if (mode == false) {
        //Fill green if true, red if false
        for (let i in selectzaf) {
            if (selectzaf[0]._groups[0][0].__data__.properties.name_1 == "Free State") {
                selectzaf[0].attr("fill", "#4FE34F");
            } else {
                selectzaf[0].attr("fill", "#EC5B5B");
            }
            if (selectzaf[1]._groups[0][0].__data__.properties.name_1 == "Limpopo") {
                selectzaf[1].attr("fill", "#4FE34F");
            } else {
                selectzaf[1].attr("fill", "#EC5B5B");
            }
            if (selectzaf[2]._groups[0][0].__data__.properties.name_1 == "Eastern Cape") {
                selectzaf[2].attr("fill", "#4FE34F");
            } else {
                selectzaf[2].attr("fill", "#EC5B5B");
            }
        }
         //Select areas with lowest values
    } else {
        //Fill green if true, red if false
        for (let i in selectzaf) {
            if (selectzaf[0]._groups[0][0].__data__.properties.name_1 == "Western Cape") {
                selectzaf[0].attr("fill", "#4FE34F");
            } else {
                selectzaf[0].attr("fill", "#EC5B5B");
            }
            if (selectzaf[1]._groups[0][0].__data__.properties.name_1 == "Northern Cape") {
                selectzaf[1].attr("fill", "#4FE34F");
            } else {
                selectzaf[1].attr("fill", "#EC5B5B");
            }
            if (selectzaf[2]._groups[0][0].__data__.properties.name_1 == "KwaZulu-Natal") {
                selectzaf[2].attr("fill", "#4FE34F");
            } else {
                selectzaf[2].attr("fill", "#EC5B5B");
            }
        }

    }


})

d3.select("#checkken").on("click", function () {
    //Select areas with highest values
    if (mode == false) {
         //Fill green if true, red if false
        for (let i in selectken) {
            if (selectken[0]._groups[0][0].__data__.properties.name_1 == "Samburu") {
                selectken[0].attr("fill", "#4FE34F");
            } else {
                selectken[0].attr("fill", "#EC5B5B");
            }
            if (selectken[1]._groups[0][0].__data__.properties.name_1 == "Turkana") {
                selectken[1].attr("fill", "#4FE34F");
            } else {
                selectken[1].attr("fill", "#EC5B5B");
            }
            if (selectken[2]._groups[0][0].__data__.properties.name_1 == "West Pokot") {
                selectken[2].attr("fill", "#4FE34F");
            } else {
                selectken[2].attr("fill", "#EC5B5B");
            }

        }
        //Select areas with lowest values
    } else {
         //Fill green if true, red if false
        for (let i in selectken) {
            if (selectken[0]._groups[0][0].__data__.properties.name_1 == "Nairobi") {
                selectken[0].attr("fill", "#4FE34F");
            } else {
                selectken[0].attr("fill", "#EC5B5B");
            }
            if (selectken[1]._groups[0][0].__data__.properties.name_1 == "Mombasa") {
                selectken[1].attr("fill", "#4FE34F");
            } else {
                selectken[1].attr("fill", "#EC5B5B");
            }
            if (selectken[2]._groups[0][0].__data__.properties.name_1 == "Garissa") {
                selectken[2].attr("fill", "#4FE34F");
            } else {
                selectken[2].attr("fill", "#EC5B5B");
            }
        }
    }
})

function addSelected(target, selection) {
    //find first 'empty' entry
    let idx = target.indexOf('X')
    //Replace first 'empty' entry with element
    target.splice(idx, 1, selection);
    console.log(target)
}

function delSelected(target, selection) {
    //Find selected entry
    console.log(selection._groups[0][0].__data__.properties)
    let idx = target.indexOf(selection)
    console.log(idx)
    //Replace selected entry with 'empty' entry
    target.splice(idx, 1, 'X')
    console.log(target)
}
//Sets mode, changes label on change
function setMode() {
    mode = !mode;
    mode == true ? d3.selectAll('.mode').html('<i class="bi bi-caret-down-fill"></i> Lowest') : d3.selectAll('.mode').html('<i class="bi bi-caret-up-fill"></i> Highest')
}

//To restart reset everything
d3.select("#restartger").on("click", function () {
    selectger = ['X', 'X', 'X'];
    d3.selectAll('#germany').selectAll(".adminarea").attr("fill", "darkgrey");
});
d3.select("#restartken").on("click", function () {
    selectken = ['X', 'X', 'X'];
    d3.selectAll('#kenya').selectAll(".adminarea").attr("fill", "darkgrey");
});
d3.select("#restartzaf").on("click", function () {
    selectzaf = ['X', 'X', 'X'];
    d3.selectAll('#southafrica').selectAll(".adminarea").attr("fill", "darkgrey");
});