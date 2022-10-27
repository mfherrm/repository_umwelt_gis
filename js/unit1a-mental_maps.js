console.log("dont use me, i am an Artefact")

//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//Create SVG element // viewBox for responsive Map
var svg = d3.select("#worldmap")
            .append("svg")
            //responsive size
            .attr("viewBox", [0, 0, width, height])
            //dunno seems nice
            //.attr("preserveAspectRatio", "xMinYMin")
            ;

/*
var projection =  d3.geoBromley()
            .scale(width / 2 / Math.PI)
            .rotate([0, 0])
            .center([0, 0])
            .translate([width / 2, height /2]);
*/
projection = d3.geoMercator()
                .translate([(width/2), (height/1.5)])
                .scale( width / 2 / Math.PI);

// Define Zoom

// Define Graticule 
var graticule = d3.geoGraticule();

//Define path generator
var path = d3.geoPath()
            .projection(projection);

//Define Ordinal Color scheme
var color = d3.scaleOrdinal(d3.schemeCategory10);

//Load in GeoJSON data //Promise resolve
d3.json("../geojson/world_countries2020.geojson")
    .then(drawMap)
    .catch(error => {console.log("Ooops, Error: " + error)});
//Define vars for unit
let select = [] //Array for selected countries

//Build Map
function drawMap(data){
    console.log(data)
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    // Update the projection    
    //Bind data and create one path per GeoJSON feature

    //Add Graticular
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);
    
    svg.append("g").append("path")
        .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
        .attr("class", "equator")
        .attr("d", path);
    
    svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", "grey")
        /*
        function(d,i){
            let min = Math.ceil(0);
            let max = Math.floor(27)
            return color(Math.floor(Math.random()*(max-min)+min))
        })
        */
        .attr("name", function(d){
            return d.properties.NAME_ENGL;
        })
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("click", function(){
            let country = d3.select(this);
            getCountry(country);
        });
};

function getCountry(country){
    console.log(select)
    if (country.attr("fill")!="#00677F" && select.length < 3){
        select.push(country);
        return country.attr("fill","#00677F")
    } else {
        select = select.filter(element => element.attr("name") !== country.attr("name"));
        return country.attr("fill","grey")
    }
}

d3.select("#check").on("click",function(){
                console.log(select[0].attr("name").includes("Germany" || "Kenya" || "South Africa"))
                for (let i in select){
                    if (select[i].attr("name").includes("Germany") 
                        || select[i].attr("name").includes("Kenya") 
                        || select[i].attr("name").includes("South Africa")){
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
})

