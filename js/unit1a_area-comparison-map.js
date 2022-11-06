
//Width and height
var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//rgb2hex use as method rgb2hex(COLOR IN RGB) -- https://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value 
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

//Create SVG element // viewBox for responsive Map
var svgBoundaries = d3.select("#area-map")
            .append("svg")
            //responsive size
            .attr("viewBox", [0, 0, width, height])
            //dunno seems nice


Promise.all([d3.json("../geojson/zaf_nation.geojson"),d3.json("../geojson/germany_nation.geojson"),d3.json("../geojson/kenya_nation.geojson")])
    .then(drawZaf)
    .catch(error => {console.log("Ooops, Error: " + error)});

    //Build Map
function drawZaf(data){
    //Define Projection
    let projectionZaf = d3.geoAzimuthalEqualArea()
                .translate([0,0])
                .scale(1)
                .rotate([-24,-28]);

    //Define path generator
    let pathZaf = d3.geoPath()
            .projection(projectionZaf);

    let bbox = pathZaf.bounds(data[0]),
    s = .92 / Math.max((bbox[1][0]-bbox[0][0])/ width, (bbox[1][1] - bbox[0][1]) / height),
    t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    projectionZaf
        .scale(s)
        .translate(t); 

    svgBoundaries.selectAll("null")
                    .data(data[0].features)
                    .enter()
                    .append("path")
                    .attr("d", pathZaf)
                    .attr("id","Zaf")
                    .attr("fill", "blue")
                    .attr("opacity",".8")

   //set value of range slider for opacity
   d3.select("#zafRange").attr("value",function(){return d3.select("#Zaf").style("opacity")*100})
    
    //Trigger other Build Map
    drawKenya(data[2], s);
    drawGermany(data[1], s);
}

function drawKenya(data, s){
    let projectionKenya = d3.geoAzimuthalEqualArea()
            .translate([0,-.025])
            .scale(1)
            .rotate([-39,0]); 

    let pathKenya = d3.geoPath()
                .projection(projectionKenya);
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    let bbox = pathKenya.bounds(data)
    let t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];
    // Update the projection  
    projectionKenya
        .scale(s)
        .translate(t); 

    svgBoundaries.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathKenya)
        .attr("id","Kenya")
        .attr("fill", "grey")
        .attr("opacity",".7");

        //set value of range slider for opacity
        d3.select("#kenRange").attr("value",function(){return d3.select("#Kenya").style("opacity")*100})
}

function drawGermany(data, s) {
    let projectionGermany = d3.geoAzimuthalEqualArea()
                    .translate([0,-.02])
                    .scale(1)
                    .rotate([-10,-52]); 

    let pathGermany = d3.geoPath()
            .projection(projectionGermany);

    let bbox = pathGermany.bounds(data);
    let t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    projectionGermany
        .scale(s)
        .translate(t); 

    svgBoundaries.selectAll("null")
                    .data(data.features)
                    .enter()
                    .append("path")
                    .attr("d", pathGermany)
                    .attr("id","Germany")
                    .attr("fill", "yellow")
                    .attr("opacity",".6")

     //set value of range slider for opacity
     d3.select("#gerRange").attr("value",function(){return d3.select("#Germany").style("opacity")*100})
}
//Drag n Drop trigger
d3.selectAll(".sortlist").on("mousedown", function(){
    slistArea(this.id);
    checkBackground();
})

//Drag n Drop
function slistArea(target) {
    // (A) SET CSS + GET ALL LIST ITEMS
    let items = d3.selectAll("#"+target+" li").nodes(), current = null;

    // (B) MAKE ITEMS DRAGGABLE + SORTABLE
    for (let i of items) {
    // (B1) ATTACH DRAGGABLE
    
    // (B2) DRAG START - YELLOW HIGHLIGHT DROPZONES
    i.ondragstart = (ev) => {
      current = i;
      for (let it of items) {
        if (it != current) { it.classList.add("hint"); }
      }
    };
    
    // (B3) DRAG ENTER - RED HIGHLIGHT DROPZONE
    i.ondragenter = (ev) => {
      if (i != current) { i.classList.add("active"); }
    };

    // (B4) DRAG LEAVE - REMOVE RED HIGHLIGHT
    i.ondragleave = () => {
      i.classList.remove("active");
    };

    // (B5) DRAG END - REMOVE ALL HIGHLIGHTS
    i.ondragend = () => { for (let it of items) {
        it.classList.remove("hint");
        it.classList.remove("active");
    }};
 
    // (B6) DRAG OVER - PREVENT THE DEFAULT "DROP", SO WE CAN DO OUR OWN
    i.ondragover = (evt) => { evt.preventDefault(); };
    
    // (B7) ON DROP - DO SOMETHING
    i.ondrop = (evt) => {
      evt.preventDefault();
      items = d3.selectAll(".slist li").nodes();
      if (current != i) {
        let currentpos = 0, droppedpos = 0;
        for (let it=0; it<items.length; it++) {
            if (current == items[it]) {
                currentpos = it;
            }
          if (i == items[it]) { droppedpos = it; }
        }
        if (currentpos < droppedpos) {
          i.parentNode.insertBefore(current, i.nextSibling);
        } else {
          i.parentNode.insertBefore(current, i);
        }
      }
    };
  }
}

function checkBackground(){
   rgb2hex(d3.select(".page2 .slist li").style("background")) == '#60E660'||'#f08080' ? d3.selectAll(".slist li").style("background-color","") : console.log() ;
}

d3.select("#check-area").on("click",function(){
    let areas_right = ["South Africa","Kenya","Germany"]
    let populations_right = ["Germany","South Africa","Kenya"]
    let areas = d3.selectAll("#area li").nodes()
    let populations = d3.selectAll("#population li").nodes();
    for(i in areas){
        areas[i].outerText == areas_right[i] ? d3.select(areas[i]).style("background-color","#60E660") : d3.select(areas[i]).style("background-color","lightcoral")
    }
    for(i in populations){
        populations[i].outerText == populations_right[i] ? d3.select(populations[i]).style("background-color","#60E660") : d3.select(populations[i]).style("background-color","lightcoral")
    }
});

d3.select("#restart-area").on("click",function(){
    d3.selectAll(".slist li").style("background-color","") 
});


//Range slider functions
d3.select("#zafRange").on("input",function(){
  let opacity = this.valueAsNumber/100
  d3.select("#Zaf").style("opacity",function(){return opacity})
});

d3.select("#gerRange").on("input",function(){
  let opacity = this.valueAsNumber/100
  d3.select("#Germany").style("opacity",function(){return opacity})
});

d3.select("#kenRange").on("input",function(){
  let opacity = this.valueAsNumber/100
  d3.select("#Kenya").style("opacity",function(){return opacity})
});