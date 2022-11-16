
//Width and height
var widthArea = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var heightArea = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//rgb2hex use as method rgb2hex(COLOR IN RGB) -- https://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value 
const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, '0')).join('')}`

//Create SVG element // viewBox for responsive Map
var svgBoundaries = d3.select("#area-map")
            .append("svg")
            //responsive size
            .attr("viewBox", [0, 0, widthArea, heightArea])
            //dunno seems nice
            .attr("preserveAspectRatio", "xMinYMin")
            .append("g")
            .attr("class", "mapbox");


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
    s = .92 / Math.max((bbox[1][0]-bbox[0][0])/ widthArea, (bbox[1][1] - bbox[0][1]) / heightArea),
    t = [(widthArea - s * (bbox[1][0] + bbox[0][0])) / 2, (heightArea - s * (bbox[1][1] + bbox[0][1])) / 2];

    projectionZaf
        .scale(s)
        .translate(t); 

    svgBoundaries.selectAll("null")
                    .data(data[0].features)
                    .enter()
                    .append("path")
                    .attr("d", pathZaf)
                    .attr("id","zaf-area")
                    .attr("fill", "#B2D06C")
                    .attr("stroke","grey")
                    .attr("stroke-width","1.5px")
                    .attr("opacity","1")

  //set value of range slider for opacity
  d3.select("#zafRange").attr("value",function(){return d3.select("#zaf-area").style("opacity")*100})

  //get fill for next unit list
  d3.selectAll("#slist-zaf li").style("background",function(){
    return d3.select("#zaf-area").attr("fill")
  });
    //Trigger other Build Map
    drawKenya(data[2], s);
    drawGermany(data[1], s);
}

function drawKenya(data, s){
    let projectionKenya = d3.geoAzimuthalEqualArea()
            //translate for left/right and up/down 
            .translate([-0.01,-.02])
            //scale > 1 --> smaller view
            .scale(1)
            //rotations: "central coordinates of projection" 
            //left value: lon; right value: lat
            .rotate([-39,0]); 

    let pathKenya = d3.geoPath()
                .projection(projectionKenya);
    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    let bbox = pathKenya.bounds(data)
    let t = [(widthArea - s * (bbox[1][0] + bbox[0][0])) / 2, (heightArea - s * (bbox[1][1] + bbox[0][1])) / 2];
    // Update the projection  
    projectionKenya
        .scale(s)
        .translate(t); 

    svgBoundaries.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", pathKenya)
        .attr("id","kenya-area")
        .attr("fill", "#F8B365")
        .attr("stroke","grey")
        .attr("stroke-width","1.5px")
        .attr("opacity","1");

    //set value of range slider for opacity
    d3.select("#kenRange").attr("value",function(){return d3.select("#kenya-area").style("opacity")*100})

     //get fill for next unit list
    d3.selectAll("#slist-kenya li").style("background",function(){
      return d3.select("#kenya-area").attr("fill")
    });
}

function drawGermany(data, s) {
    let projectionGermany = d3.geoAzimuthalEqualArea()
                    .translate([-0.005,-.015])
                    .scale(1)
                    .rotate([-10,-52]); 

    let pathGermany = d3.geoPath()
            .projection(projectionGermany);

    let bbox = pathGermany.bounds(data);
    let t = [(widthArea - s * (bbox[1][0] + bbox[0][0])) / 2, (heightArea - s * (bbox[1][1] + bbox[0][1])) / 2];

    projectionGermany
        .scale(s)
        .translate(t); 

    svgBoundaries.selectAll("null")
                    .data(data.features)
                    .enter()
                    .append("path")
                    .attr("d", pathGermany)
                    .attr("id","germany-area")
                    .attr("fill", "#BEBADA")
                    .attr("stroke","grey")
                    .attr("stroke-width","1.5px")
                    .attr("opacity","1")

    //set value of range slider for opacity
    d3.select("#gerRange").attr("value",function(){return d3.select("#germany-area").style("opacity")*100})

    //get fill for next unit list
    d3.selectAll("#slist-germany li").style("background",function(){
      return d3.select("#germany-area").attr("fill")
    });
}
//Drag n Drop trigger
d3.selectAll(".sortlist").on("mousedown", function(){
    slistArea(this.id);
});

//reset classes correct wrong on mousedown
d3.selectAll("#area li").on("mousedown", function(){
  let items = d3.selectAll("#area li").nodes()
  for (let i of items){
    i.classList.remove("slist-wrong")
    i.classList.remove("slist-correct")
  }
});

d3.selectAll("#population li").on("mousedown", function(){
  let items = d3.selectAll("#population li").nodes()
  for (let i of items){
    i.classList.remove("slist-wrong")
    i.classList.remove("slist-correct")
  }
});

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
        if (it != current) { it.classList.add("hint");}
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
    let j = 0;
    let k = 0;
    for(let i of areas){
      i.outerText == areas_right[j] ? i.classList.add("slist-correct") : i.classList.add("slist-wrong");
      j++;
    }
    for(let i of populations){
      i.outerText == populations_right[k] ? i.classList.add("slist-correct") : i.classList.add("slist-wrong");
      k++;
    }
});

d3.select("#restart-area").on("click",function(){
    let items = d3.selectAll(".slist li").nodes()
    for (let i of items){
      i.classList.remove("slist-wrong")
      i.classList.remove("slist-correct")
    }
});


//Range slider functions
d3.select("#zafRange").on("input",function(){
  let opacity = this.valueAsNumber/100
  d3.select("#zaf-area").style("opacity",function(){return opacity})
});

d3.select("#gerRange").on("input",function(){
  let opacity = this.valueAsNumber/100
  d3.select("#germany-area").style("opacity",function(){return opacity})
});

d3.select("#kenRange").on("input",function(){
  let opacity = this.valueAsNumber/100
  d3.select("#kenya-area").style("opacity",function(){return opacity})
});