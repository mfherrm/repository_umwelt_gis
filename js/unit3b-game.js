//Width and height
var width = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 2548);


Promise.all([d3.json("../geojson/zaf_adm1-pop_dense2020.geojson"), d3.json("../geojson/ger_overview.geojson"), d3.json("../geojson/kenya_overview.geojson")])
    .then(draw).catch(error => { console.log(error) })

//Create tooltip for mouseover on body for absolute position -- https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/ -- https://bl.ocks.org/d3noob/a22c42db65eb00d4e369

//Build Map

function draw(data) {
    let target = '#southafrica';
    let id = "exzaf"
    let projection = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, -0.02]) // 1.right/left (lon) 2.up/down (lat) e.g. negative lon/lat at center    
    drawMap(data[0], target, id, projection)
    target = '#germany';
    id = "exger"
    projection = d3.geoAzimuthalEqualArea().scale(.4).translate([0.005, -0.02]).rotate([-10, -52])
    drawMap(data[1], target, id, projection)
    target = '#kenya';
    id = "exken"
    projection = d3.geoAzimuthalEqualArea().scale(.25).translate([.03, -.01]).rotate([-38, 0]);
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
            return d.properties.LEVL_CODE == 0 ? "country" : "adminarea";
        })
        .attr("fill", function (d) {
            if (target == "#kenya") {
                return d.properties.LEVEL == 1 ? 'none':d.properties.LEVEL == 2? "darkgrey" : "lightgrey";
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
            getAdmin(admin)
        })
        .style("cursor", function (d) {
            return d.properties.LEVL_CODE == 0 ? '' : "pointer";
        })
};

let select = []

function getAdmin(admin) {
    if ((admin.attr("fill") == "green")) {
    } else if (admin.attr("fill") != "#00677F" && select.length < 3) {
        select.push(admin)
        return admin.attr("fill", "#00677F")

    } else if (select[0]._groups[0][0].__data__.properties.NAME_LATN == admin._groups[0][0].__data__.properties.NAME_LATN || select[1]._groups[0][0].__data__.properties.NAME_LATN == admin._groups[0][0].__data__.properties.NAME_LATN || select[2]._groups[0][0].__data__.properties.NAME_LATN == admin._groups[0][0].__data__.properties.NAME_LATN) {
        select = select.filter(element => element._groups[0][0].__data__.properties.NAME_LATN !== (admin._groups[0][0].__data__.properties.NAME_LATN));
        console.log(admin._groups[0][0].__data__.properties.NAME_LATN)
        admin.attr('fill', 'darkgrey');
    }/*else {
        select = select.filter(element => element.attr("name") !== admin.attr("name"));
        return admin.attr("fill", "darkgrey")
    }*/
};

d3.select("#check_ger").on("click", function () {
    for (let i in select) {
        if (select[0]._groups[0][0].__data__.properties.NAME_LATN == "Brandenburg" || select[1]._groups[0][0].__data__.properties.NAME_LATN == "Hamburg" || select[2]._groups[0][0].__data__.properties.NAME_LATN == "Thüringen") {
            if (select[0]._groups[0][0].__data__.properties.NAME_LATN == "Brandenburg") {
                select[0].attr("fill", "green");
            } else {
                select[0].attr("fill", "red");
            }
            if (select[1]._groups[0][0].__data__.properties.NAME_LATN == "Hamburg") {
                select[1].attr("fill", "green");
            } else {
                select[1].attr("fill", "red");
            }
            if (select[2]._groups[0][0].__data__.properties.NAME_LATN == "Thüringen") {
                select[2].attr("fill", "green");
            } else {
                select[2].attr("fill", "red");
            }


        }
    }
})

d3.select("#restart").on("click", function () {
    select = [];
    d3.selectAll(".admin").attr("fill", "darkgrey");
});