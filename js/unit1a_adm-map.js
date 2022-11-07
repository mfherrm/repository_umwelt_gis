
//Width and height
var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
var width = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//Create SVG element // viewBox for responsive Map
let svgAdm = d3.select("#adm-map")
    .append("svg")
    //responsive size
    .attr("viewBox", [0, 0, width, height])
    //dunno seems nice
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("class", "mapbox");
    

let color = d3.scaleOrdinal(d3.schemeSet3);

//Trigger Map Functions on radio
d3.select(".adm-radio").on("change", drawMapTrigger);

function drawMapTrigger(){
  let selected = d3.select("input[type=radio]:checked").property("value");
  if(selected =="germany"){
    //Load in GeoJSON data //Promise resolve
      d3.selectAll(".germany").transition().duration(500).style("opacity","1");
      d3.selectAll(".zaf").transition().duration(500).style("opacity","0");
      d3.selectAll(".kenya").transition().duration(500).style("opacity","0");
  } else if (selected == "zaf"){
      d3.selectAll(".germany").transition().duration(500).style("opacity","0");
      d3.selectAll(".zaf").transition().duration(500).style("opacity","1");
      d3.selectAll(".kenya").transition().duration(500).style("opacity","0");
  } else {
      d3.selectAll(".germany").transition().duration(500).style("opacity","0");
      d3.selectAll(".zaf").transition().duration(500).style("opacity","0");
      d3.selectAll(".kenya").transition().duration(500).style("opacity","1");
  };
};


Promise.all([d3.json("../geojson/germany_bundeslaender.geojson"),d3.json("../geojson/germany_regierungsbezirke.geojson"),d3.json("../geojson/germany_kreise.geojson")])
      .then(drawGermanyAdm)
      .catch(error => {console.log("Ooops, Error: " + error)});

function drawGermanyAdm(data){
    let projectionGermany = d3.geoAzimuthalEqualArea()
                          .translate([0,0])
                          .scale(1)
                          .rotate([-10,-52]);

    //Define path generator
    let pathGermany = d3.geoPath()
                    .projection(projectionGermany);

    

    // Calculate bounding box transforms for entire collection // bbox = [[x0,y0],[x1,y1]]
    let bbox = pathGermany.bounds(data[0]),
    s = .92 / Math.max((bbox[1][0]-bbox[0][0])/ width, (bbox[1][1] - bbox[0][1]) / height),
    t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    // Update the projection    
    projectionGermany
        .scale(s)
        .translate(t); 

    //Bind data and create one path per GeoJSON feature
    //level 1 Bundeslaender
    svgAdm.selectAll(null)
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", pathGermany)
        .attr("class","germany")
        .attr("fill", function(d,i){
            if(d.properties.NUTS_NAME == "Deutschland"){
                return "none"
            }else {
                return d.properties.LEVL_CODE == 0 ? "lightgrey" : color(i);
            }
        })
        .attr("stroke","grey");

    //level 2 Regierungsbezrike
    svgAdm.selectAll(null)
        .data(data[1].features)
        .enter()
        .append("path")
        .attr("d", pathGermany)
        .attr("class","germany")
        .attr("fill","none")
        .attr("stroke","black");

    //level 3 kreise
      svgAdm.selectAll(null)
        .data(data[2].features)
        .enter()
        .append("path")
        .attr("d", pathGermany)
        .attr("class","germany")
        .attr("fill","none")
        .attr("stroke","lightgrey");
};

Promise.all([d3.json("../geojson/zaf_provinces.geojson"),d3.json("../geojson/zaf_district_metropolitan_municipalities.geojson"),d3.json("../geojson/zaf_local_municipalities.geojson")])
      .then(drawZafAdm)
      .catch(error => {console.log("Ooops, Error: " + error)});

function drawZafAdm(data){
    let projectionZaf = d3.geoAzimuthalEqualArea()
              .scale(1)
              .translate([0,0])  //1.left/right (lon) 2.up/down (lat)
              .rotate([-24,-28]);

    let pathZaf = d3.geoPath().projection(projectionZaf);

    let bbox = pathZaf.bounds(data[0]),
    s = .92 / Math.max((bbox[1][0]-bbox[0][0])/ width, (bbox[1][1] - bbox[0][1]) / height),
    t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    projectionZaf
      .scale(s)
      .translate(t); 

    //level 1 provinces
    svgAdm.selectAll(null)
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", pathZaf)
        .attr("class","zaf")
        .attr("stroke","grey");

    //level 2 district metro municipal
    svgAdm.selectAll(null)
        .data(data[1].features)
        .enter()
        .append("path")
        .attr("d", pathZaf)
        .attr("fill","none")
        .attr("class","zaf")
        .attr("stroke","black");

    //level 3 local municipal
    svgAdm.selectAll(null)
      .data(data[2].features)
      .enter()
      .append("path")
      .attr("d", pathZaf)
      .attr("fill","none")
      .attr("class","zaf")
      .attr("stroke","lightgrey");

    d3.selectAll(".zaf").attr("opacity","0")
};

Promise.all([d3.json("../geojson/kenya_counties.geojson"),d3.json("../geojson/kenya_sub-counties.geojson")])
      .then(drawKenyaAdm)
      .catch(error => {console.log("Ooops, Error: " + error)});

function drawKenyaAdm(data){
    let projectionKenya = d3.geoAzimuthalEqualArea()
        .scale(1)
        .translate([0,0])  //1.left/right (lon) 2.up/down (lat)
        .rotate([-39,0]);

    let pathKenya = d3.geoPath().projection(projectionKenya);

    let bbox = pathKenya.bounds(data[0]),
    s = .92 / Math.max((bbox[1][0]-bbox[0][0])/ width, (bbox[1][1] - bbox[0][1]) / height),
    t = [(width - s * (bbox[1][0] + bbox[0][0])) / 2, (height - s * (bbox[1][1] + bbox[0][1])) / 2];

    projectionKenya
        .scale(s)
        .translate(t); 

    //level 1 provinces
    svgAdm.selectAll(null)
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", pathKenya)
        .attr("class","kenya")
        .attr("stroke","grey");

    //level 2 district metro municipal
    svgAdm.selectAll(null)
        .data(data[1].features)
        .enter()
        .append("path")
        .attr("d", pathKenya)
        .attr("fill","none")
        .attr("class","kenya")
        .attr("stroke","black");

    d3.selectAll(".kenya").attr("opacity","0")
};


/* drag and drop */
d3.selectAll('#slist-germany li').style("background-color",function(){
  console.log(d3.select('#Germany'))
  return d3.select('#Germany').style("background-color");
})

//Drag n Drop trigger
d3.selectAll("#page3 .sortlist").on("mousedown", function(){
    slistAdm();
})

//Drag n Drop
function slistAdm() {
  let current = null;
  
  //All List Items in page
  let allItems = d3.selectAll("#page3 .sortlist li").nodes();

  //All list items left (target of assignment)
  let assign = d3.selectAll(".slist-assign li").nodes()

  //(B) MAKE ITEMS DRAGGABLE + SORTABLE
  for (let i of allItems){
    // (B2) DRAG START - YELLOW HIGHLIGHT DROPZONES (left)
    i.ondragstart = (ev) => {
      current = i;
      for (let it of assign) {
        it.classList.add("listitem")
        if (it != current) { it.classList.add("hint"); }
      } 
    };

    // (B3) DRAG ENTER - RED HIGHLIGHT DROPZONE
    for (let it of assign){
      it.ondragenter = (ev) => {
        if (it != current) { it.classList.add("active"); }
      }
    };

    i.ondragleave = () => {  
      i.classList.remove("active"); 
    };

    // (B5) DRAG END - REMOVE ALL HIGHLIGHTS
    i.ondragend = () => { 
      for (let it of allItems) {
        it.classList.remove("hint");
        it.classList.remove("active");
      }
    };
    
    // (B6) DRAG OVER - PREVENT THE DEFAULT "DROP", SO WE CAN DO OUR OWN
    i.ondragover = (evt) => { evt.preventDefault(); };

    i.ondrop = (evt) => {
      evt.preventDefault();
       //All List Items in page
      assign = d3.selectAll("#page3 .sortlist li").nodes();
      if (current != i) {
        let currentpos = 0, droppedpos = 0;
        for (let it=0; it<assign.length; it++) {
            if (current == assign[it]) {
                currentpos = it;
            }
          if (i == assign[it]) { droppedpos = it; }
        }
        if (currentpos < droppedpos) {
          if (i.classList[0] == "listitem"){
            i.parentNode.insertBefore(current, i.nextSibling);
          }
        } else {
          if (i.classList[0] == "listitem"){
            i.parentNode.insertBefore(current, i);
          }
        }
      }
    }
  }
};

/* checker */
d3.select("#check-adm").on("click",function(){
  console.log("hi")
});

d3.select("#restart-adm").on("click",function(){
  console.log("hi2")
});