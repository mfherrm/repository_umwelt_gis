//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//Create SVG element // viewBox for responsive Map
let svg = d3.select("#zaf-popdense")
    .append("svg")
    //responsive size
    .attr("viewBox", [0, 0, width, height])
    //dunno seems nice
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("class", "mapbox");

//get Size, Position ... for nice positioning
let svgBox = d3.select("#zaf-popdense").nodes()
svgBox = svgBox[0]

//Define map projection
let projection = d3.geoAzimuthalEqualArea()
            .translate([0,0])
            .scale(1)
            .rotate([-24,-28]);

//Define path generator
let path = d3.geoPath()
    .projection(projection);

let csize = 50;

//Create colors scheme    
let color = d3.scaleThreshold()
    //thresholds of data
    .domain([10, 20, 40, 100,200, 500]) 
    .range(['#fef0d9','#fdd49e','#fdbb84','#fc8d59','#e34a33','#b30000']);

//Load in GeoJSON data //Promise resolve
d3.json("../geojson/zaf_provinces.geojson")
    .then(drawMap)
    .catch(error => { console.log(error) });

let tooltip = d3.select("#zaf-popdense")
    .append("div")
    .attr("class", "tooltip")
    .attr("opacity", ".7");

let circles = d3.select(".mapbox")
    .append("g")
    .attr("class", "circles");

//mapQuestions for creating random MCT
let mapQuestions = [
    {question:"Which administrative level does the map show?",answer:"1",labels:["1","2","3","1.5"]},
    {question:"What is the administrative level shown called?",answer:"Provinces",labels:["Provinces","Federal States","District municipalities","Nations"]},
    {question:"Is the population density a relative or absolute value?",answer:"relative",labels:["absolute","relative","none of them"]},
    {question:"How is the population density calculated?",answer:"total population divided by area",labels:["total population divided by area","total population divided by no. of admin levels","area divided by total population","total population times area"]},
    {question:"Why is the diagram of 'North Cape' so small?",answer:"area",labels:["Only 1000 people live there","Large area and relatively small population","Large area"]}
]

d3.shuffle(mapQuestions)

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
        .attr("class", "country mapdata")
        .attr("population", function (d) {
            return d.properties.population;
        })
        .attr("popdense",function(d){
            return d.properties.population_density
        })
        //get province name  
        .attr("name", function (d) {
            return d.properties.name_1;
        })
        //get color for Value of Population Density from "var color"
        .style("fill", function (d) {
            return color(d.properties.population_density)
        })

    drawDiagram();
    drawScalebar();
    drawLegend();

    function drawDiagram(d) {
        let popTot = []
        for (let i = 0; i < data.features.length; i++) {
            popTot.push(data.features[i].properties.population)
        }
        circles = svg.selectAll(null)
            .data(data.features)
            .enter()
            .append("circle")
            .attr('class', function(d){
                if(d.properties.name_1 == "Gauteng"){
                    return "circle mapdata"
                }else{
                    return "circle mapdata"
                }})
            .attr("transform", function (d) {
                return d.properties.name_1 == 'Western Cape' ? "translate(" + (path.centroid(d)[0] + ',' + (path.centroid(d)[1]+37)) +  ")" : "translate(" + path.centroid(d) + ")";
            })
            .attr("r", function (d) {
                max = d3.max(popTot);
                size = csize * d.properties.population / max
                return size
            })
            .attr('population', function (d) {
                return d.properties.population
            })
            .attr('name', function (d) {
                return d.properties.name_1
            })
            .attr("popdense",function(d){
                return d.properties.population_density
            })
            //Cursor on mouseover
            .style("cursor", "pointer")
            .style("fill", "#1e1e1e")
            .style("stroke", "white")
            .style("opacity",".7")
    }

    d3.selectAll(".mapdata")
            .on("mouseover", drawTooltip)
            .on("mouseout", eraseTooltip)
}

circles= circles.sort(function(x,y){
    return d3.descending(x.properties.population, y.properties.population)
});

circles.raise();

//Build Tooltip
function drawTooltip() {

    let bbox = this.getBoundingClientRect();


    tooltip.transition()
        .duration(200)
        .style("opacity", ".7")
        .style("left", bbox.x + bbox.width / 2 + 30 + "px")
        .style("top", bbox.y + bbox.height / 2 + "px");


    tooltip.html("<p><strong>"+d3.select(this).attr("name")+"</strong></p>"+
                "<p>Total Population: "+d3.select(this).attr("population")+"</p>"+
                "<p>Population Density: "+d3.select(this).attr("popdense")+"</p>")
};

function eraseTooltip() {
    tooltip.transition()
        .duration(200)
        .style("opacity", 0);
};

function drawLegend() {
    let size = d3.scaleSqrt()
        .domain([1, max])
        .range([1, 50]);
    let valuesToShow=[(Math.round(1/4*max/1000000)*1000000) ,(Math.round(2/3*max/1000000)*1000000), max];
    let xCircle=90;
    let yCircle=361;
    let xLabel=190;
    //set Title
    d3.select(".legend");
    //create svg for Legend
    var legendSvg = d3.select(".mapbox")
        .append("g")
        .attr("class", "legend")
        .attr("width", "100%")
        //good height --> no. of class*spacing
        .attr("height", function (d, i) {
            return 6 * 45
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + 45 + ")";
        });

    var legend = legendSvg.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "entry")
        .attr("transform", function (d, i) {
            
            return "translate(0," + (i * 40 +40) + ")";
        });

    legendSvg.append("g")
        .append("text")
        .text(function () {
            return "Population Density"
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + -8 + ")";
        });
       

    legendSvg.append("g")
        .append("text")
        .text(function(){ return "[ Inhabitants/km² ]"})
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + 25 + ")";
        });


    //fill rects by color domain (d) & range (i)                  
    legend.append("rect")
        //rect on position (5,5) in SVG with the width and height 30            
        .attr("x", 5)
        .attr("y", 10)
        .attr("width", 30)
        .attr("height", 30)
        .attr("fill", function (d, i) {
            //return color corresponding to no. of domain // (d-1) for right color, dunno why it's that way
            return color(d - 1);
        })

    legendSvg
        .append("g")
        .append("text")
        .text("Total Population")
        .attr("transform", function(){
            return "translate(310,-8)"
        });
    
    //legendCircle
    legendSvg.selectAll('.legend')
        .data(valuesToShow)
        .enter()
        .append('g')
        .attr('class', 'legendCircle')
        .append("circle")
        .attr("transform", function(){
            return "translate(280,-240)"
        })
        .attr("cx", xCircle)
        .attr("cy", function(d){return yCircle - size(d)})
        .attr('r', function(d){return size(d)
        })
        .style('fill', 'none')
        .style('stroke', 'black')
    
    //legendSegments
    legendSvg.selectAll('.legend')
        .data(valuesToShow)
        .enter()
        .append('line')
        .attr("transform", function(){
            return "translate(280,-240)"
        })
        .attr('x1', function(d){ return xCircle})
        .attr('x2', xLabel)
        .attr('y1', function(d){ return yCircle -size(d)*2})
        .attr('y2', function(d){ return yCircle -size(d)*2})
        .attr('stroke', 'black')
        .style('stroke-dasharray', ('2,2'))
    
    //legendLabels
    legendSvg.selectAll('.legend')
        .data(valuesToShow)
        .enter()
        .append('text')
        .attr("transform", function(){
            return "translate(282,-238)"
        })
        .attr('x', xLabel)
        .attr('y', function(d){ return yCircle -size(d)*2 + 5})
        .text( function(d,i,e){
            return d})
        .style('font-size', "20px")
        .attr('alignment-basline', 'middle')

    //get and set of color by domain (d) & range (i)
    legend.append("text")
        //play around for nice positonioning
        //General tip for x--> Rect.X(5)+Rect.Width(20)+buffer(6)
        //Genral tip for y--> anchor of text is at the bottom
        .attr("x", 56)
        .attr("y", 36)
        .attr("color", "white")
        .text(function (d, i) {
            if (i == 0) {
                return 3 +" to "+ d
            } else if (i == color.domain().length - 1) {
                return d +" to 853"
            } else {
                return color.domain()[i - 1] + 1 + " to " + d
            };
        })
};

//Build Scalebar -- 
function drawScalebar() {
    let scaleBar = d3.geoScaleBar()
        .projection(projection)
        //for other procejtion sepcify ".radius"??? ---https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar#scaleBarPositioned ---https://github.com/HarryStevens/d3-geo-scale-bar#sizing 
        .size([svgBox.offsetLeft,svgBox.offsetTop])
        //sets the vertical tick size of the scale bar in pixels
        .distance(200)
        //sets ticks on specified distances OR use distance for automatic specification
        //.distance(200)
        // How far the tick text labels are from the lines
        .labelAnchor("middle")
        .tickSize([5])
        .tickValues([0,200])
        .tickPadding([8])
     

    let scaleSvg = d3.selectAll(".mapbox")
        .append("g")
        .attr("class", "scalebar")
        .attr("transform",function(){
            return "translate(10,"+height*.9+")"
        });

    scaleSvg.append("g").call(scaleBar);
    d3.selectAll("#zaf-popdense .tick").attr("class", "legendtick")

    createMapQuestions()
};

//Function to get Position of an Element, implement on Event e.g. "click"
function getPosition(ele) {
    boundingClientRect = ele.getBoundingClientRect();

    var left = boundingClientRect.left;
    var top = boundingClientRect.top;
    var rectHeight = boundingClientRect.height;
    var rectWidth = boundingClientRect.width;

    return boundingClientRect;
};


//creates mapquiz with random order, just add remove from mapquestions as you like, just keep the syntax
function createMapQuestions(){

    mapQuestions.splice(5,)

    let answers = []

    let questionsContainer = d3.select("#map-quiz");

    

    questionsContainer.selectAll(null)
        .data(mapQuestions)
        .enter()
        .append("div")
        .attr("class","map-question")
        .attr("id",function(d,i){return "map-question"+i})
        .append("p")
        .attr("class","")
        .text(function(d,i){return i+1 +". "+ d.question})

    d3.selectAll(".map-question")
        .append("div")
        .attr("class","map-answers")
        .attr("id",function(d,i){return "map-answer"+i})

    for(let i in mapQuestions){
            answers.push(mapQuestions[i].labels)
            let answerContainer = d3.select("#map-answer"+i)
            d3.shuffle(answers[i])
            answerContainer.selectAll(null)
                    .data(answers[i])
                    .enter()
                    .append("div")
                    .attr("class","form-check")
                    .append("label")
                    .attr("class","form-check-label")
                    .attr("value",function(d){return d})
                    .attr("name",function(){return i})
                    .html(function(d){
                        return "<input class='form-check-input' type='radio' name='"+i+"' value='"+d+"'>"+d+"</input>"})             
    }
}
  
d3.select("#restart-mapquiz").on("click",function(){
    d3.selectAll("#map-quiz input").property("checked",false);
    d3.selectAll(".map.questions p").nodes()
})

d3.select("#check-mapquiz").on("click",function(){
    let userInput = d3.selectAll("#map-quiz input:checked").nodes()

    let index = 0;

    for(let item of userInput){
        console.log(item.value)
        let result = d3.select("#map-question"+index+" p").nodes()
        console.log(result)
        if (mapQuestions[index].answer == item.value){
            result[0].classList.add("slist-correct")
        }else{
            result[0].classList.add("slist-wrong")
        }
        index++;
    }
})

d3.selectAll("#map-quiz input").on("change",function(){

})