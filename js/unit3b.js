//Width and height
var width = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 2548);


//Create SVG element // viewBox for responsive Map
var svg = d3.select("#germany")
    .append("svg")
    //responsive size
    .attr("viewBox", [0, 0, width, height])
    //dunno seems nice
    .attr("preserveAspectRatio", "xMinYMin meet")
    .append("g")
    .attr("class", "mapbox")

//Define map projection

var projection = d3.geoAzimuthalEqualArea()
    .scale(.4)
    .translate([0.005, -0.02])  //1.left/right (lon) 2.up/down (lat)
    .rotate([-10, -52]); // 1.right/left (lon) 2.up/down (lat) e.g. negative lon/lat at center            
//if parallels --> analoge

var color = d3.scaleOrdinal(d3.schemeSet3);

//Define path generator
var path = d3.geoPath()
    .projection(projection);

//Load in GeoJSON data //Promise resolve
d3.json("../geojson/germany_overview.geojson")
    .then(drawMap)
    .catch(error => { console.log(error) });

//Build Map
function drawMap(data) {
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
            return d.properties.LEVL_CODE == 0 ? "country" : "admin";
        })
        .attr("fill", function (d) {
            return d.properties.LEVL_CODE == 0 ? "lightgrey" : "darkgrey";
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
        select4.pop();
    } else if (admin.attr("fill") != "#00677F" && select.length < 3) {
        select.push(admin)
        return admin.attr("fill", "#00677F")
    } else if (admin.attr('name')){
        select = select.filter(element => element.attr("name") !== admin.attr("name"));
        return admin.attr("fill", "darkgrey")
    }
};


function getPyramid(country) {
    let elemid = country.attr('name');
    let elempyr = country.attr('pyramid');
    let elemstat = country.attr('state');
    if ((country.attr("fill") == "green")) {
        select4.pop();
    } else if (country.attr("fill") != "#00677F" && select4.length < 1 && country.attr("continent") != 0) {
        select4.push(country);
        return country.attr("fill", "#00677F")
    } else {
        if (select4[0]._groups[0][0].__data__.properties.NAME_ENGL == elemid) {
            select4.pop();
            return country.attr("fill", "grey")

        }



    }
}
/*d3.select("#check").on("click",function(){
                for (let i in select){
                    if (select[i].attr("name").includes("Germany") || select[i].attr("name").includes("Kenya") || select[i].attr("name").includes("South Africa")){
                            select[i].attr("fill","green");
                    } else {
                            select[i].attr("fill","red");
                    }                              
                }                                               
            })

d3.select("#restart").on("click",function(){
                select = [];
                d3.selectAll(".country").attr("fill","grey");
                d3.select("#result").html("");
});*/