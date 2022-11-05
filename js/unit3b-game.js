//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerHeight || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 2548);
let mode = false;

Promise.all([d3.json("../geojson/zaf_provinces.geojson"), d3.json("../geojson/germany_bundeslaender.geojson"), d3.json("../geojson/kenya_counties.geojson")])
    .then(draw).catch(error => { console.log(error) })

//Create tooltip for mouseover on body for absolute position -- https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/ -- https://bl.ocks.org/d3noob/a22c42db65eb00d4e369

//Build Map

function draw(data) {
    let target = '#southafrica';
    let id = "exzaf"
    let projection = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, 0]) // 1.right/left (lon) 2.up/down (lat) e.g. negative lon/lat at center    
    drawMap(data[0], target, id, projection)
    target = '#germany';
    id = "exger"
    projection = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, 0.0]).rotate([-10, -52])
    drawMap(data[1], target, id, projection)
    target = '#kenya';
    id = "exken"
    projection = d3.geoAzimuthalEqualArea().scale(1).translate([.03, -.01]).rotate([-38, 0]);
    drawMap(data[2], target, id, projection)
}



//Load in GeoJSON data //Promise resolve

//Build Map
function drawMap(data, target, id, projection) {
    //Create SVG element // viewBox for responsive Map
    var svg = d3.select(target)
        .append("svg")
        //responsive size
        .attr("viewBox", [0, 0, width, height])
        //dunno seems nice
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("class", "mapbox")

    //Define map projection     


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
        .attr("class", function (d) {
            return d.properties.LEVEL == 0 ? "countryU3" : d.properties.LEVL_CODE == 0 ? "countryU3" : "adminarea";
        })
        .attr("fill", function (d) {
            if (target == "#kenya") {
                return d.properties.LEVEL == 1 ? 'none' : d.properties.LEVEL == 2 ?  "lightgrey" : "darkgrey";
            } else {
                if (d.properties.NUTS_NAME == "Deutschland") {
                    return "none"
                } else {
                    return d.properties.LEVL_CODE == 0 ? "lightgrey" : "darkgrey";
                }
            }
        })
        .on("click", function (d) {
            let admin = d3.select(this);
            let id = document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 4].id
            d3.select(this).attr('class')=='adminarea'? getAdmin(admin, id) : ''
            
        })
};

let selectger = ['X', 'X', 'X']
let selectken = ['X', 'X', 'X']
let selectzaf = ['X', 'X', 'X']

function getAdmin(admin, id) {
    let target;
    id == 'germany' ? target = selectger : id == 'kenya' ? target = selectken : id == 'southafrica' ? target = selectzaf : console.log('error')
    if ((admin.attr("fill") == "green")) {
    } else if (admin.attr("fill") != "#00677F" && admin.attr("fill") != "red" && target.includes('X')) {
        addSelected(target, admin)
        return admin.attr("fill", "#00677F")
    } else if (target[0] != 'X' && target[0]._groups[0][0].__data__.properties.name_1 == admin._groups[0][0].__data__.properties.name_1) {
        admin.attr('fill', 'darkgrey');
        delSelected(target, target[0])
    } else if (target[1] != 'X' && target[1]._groups[0][0].__data__.properties.name_1 == admin._groups[0][0].__data__.properties.name_1) {
        admin.attr('fill', 'darkgrey');
        delSelected(target, target[1])
    } else if (target[2] != 'X' && target[2]._groups[0][0].__data__.properties.name_1 == admin._groups[0][0].__data__.properties.name_1) {
        admin.attr('fill', 'darkgrey');
        delSelected(target, target[2])

    }
    id == 'germany' ? selectger = target : id == 'kenya' ? selectken = target : id == 'southafrica' ? selectzaf = target : console.log('error')

};

d3.select("#checkger").on("click", function () {
    if (mode == false) {
        for (let i in selectger) {
            if (selectger[0]._groups[0][0].__data__.properties.name_1 == "Thüringen" || selectger[0].attr("fill") == 'green') {
                selectger[0].attr("fill", "green");

            } else {
                selectger[0].attr("fill", "red");
            }
            if (selectger[1]._groups[0][0].__data__.properties.name_1 == "Mecklenburg-Vorpommern" || selectger[1].attr("fill") == 'green') {
                selectger[1].attr("fill", "green");
            } else {
                selectger[1].attr("fill", "red");
            }
            if (selectger[2]._groups[0][0].__data__.properties.name_1 == "Brandenburg" || selectger[2].attr("fill") == 'green') {
                selectger[2].attr("fill", "green");
            } else {
                selectger[2].attr("fill", "red");
            }

        }
    } else {
        for (let i in selectger) {
            if (selectger[0]._groups[0][0].__data__.properties.name_1 == "Bremen" || selectger[0].attr("fill") == 'green') {
                selectger[0].attr("fill", "green");

            } else {
                selectger[0].attr("fill", "red");
            }
            if (selectger[1]._groups[0][0].__data__.properties.name_1 == "Schleswig-Holstein" || selectger[1].attr("fill") == 'green') {
                selectger[1].attr("fill", "green");
            } else {
                selectger[1].attr("fill", "red");
            }
            if (selectger[2]._groups[0][0].__data__.properties.name_1 == "Nordrhein-Westfalen" || selectger[2].attr("fill") == 'green') {
                selectger[2].attr("fill", "green");
            } else {
                selectger[2].attr("fill", "red");
            }
        }
    }
})

d3.select("#checkzaf").on("click", function () {
    if (mode == false) {
        for (let i in selectzaf) {
            if (selectzaf[0]._groups[0][0].__data__.properties.name_1 == "Free State") {
                selectzaf[0].attr("fill", "green");
            } else {
                selectzaf[0].attr("fill", "red");
            }
            if (selectzaf[1]._groups[0][0].__data__.properties.name_1 == "Limpopo") {
                selectzaf[1].attr("fill", "green");
            } else {
                selectzaf[1].attr("fill", "red");
            }
            if (selectzaf[2]._groups[0][0].__data__.properties.name_1 == "Eastern Cape") {
                selectzaf[2].attr("fill", "green");
            } else {
                selectzaf[2].attr("fill", "red");
            }
        }
    } else {
        for (let i in selectzaf) {
            if (selectzaf[0]._groups[0][0].__data__.properties.name_1 == "Western Cape") {
                selectzaf[0].attr("fill", "green");
            } else {
                selectzaf[0].attr("fill", "red");
            }
            if (selectzaf[1]._groups[0][0].__data__.properties.name_1 == "Northern Cape") {
                selectzaf[1].attr("fill", "green");
            } else {
                selectzaf[1].attr("fill", "red");
            }
            if (selectzaf[2]._groups[0][0].__data__.properties.name_1 == "KwaZulu-Natal") {
                selectzaf[2].attr("fill", "green");
            } else {
                selectzaf[2].attr("fill", "red");
            }
        }

    }


})

d3.select("#checkken").on("click", function () {
    if (mode == false) {
        for (let i in selectger) {

            if (selectken[0]._groups[0][0].__data__.properties.name_1 == "") {
                selectken[0].attr("fill", "green");
            } else {
                selectken[0].attr("fill", "red");
            }
            if (selectken[1]._groups[0][0].__data__.properties.name_1 == "") {
                selectken[1].attr("fill", "green");
            } else {
                selectken[1].attr("fill", "red");
            }
            if (selectken[2]._groups[0][0].__data__.properties.name_1 == "") {
                selectken[2].attr("fill", "green");
            } else {
                selectken[2].attr("fill", "red");
            }

        }
    } else { }
})

function addSelected(target, selection) {
    //find first empty entry
    let idx = target.indexOf('X')
    //add element to first empty entry
    target.splice(idx, 1, selection);
    console.log(target)
}

function delSelected(target, selection) {
    console.log(selection._groups[0][0].__data__.properties)
    let idx = target.indexOf(selection)
    console.log(idx)
    target.splice(idx, 1, 'X')
    console.log(target)
}

function setMode() {
    mode = !mode;
    mode==true? d3.selectAll('.mode').html('<i class="bi bi-caret-down-fill"></i> Lowest') : d3.selectAll('.mode').html('<i class="bi bi-caret-up-fill"></i> Highest') 
}


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