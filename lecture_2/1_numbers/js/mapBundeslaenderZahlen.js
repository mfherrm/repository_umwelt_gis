let box = document.querySelector(".map1")
var width = box.offsetWidth;
var height = 800;

var svg = d3.select("body").select(".map1").append("svg")
	.attr("width", width)
	.attr("height", height);
	
var projection = d3.geoMercator()
	.translate([0, 0])
	.scale(1);
	
var path = d3.geoPath()
	.projection(projection);
	
var g = svg.append("g")
  .append("g")
    .attr("id", "Bev");	

d3.queue()
	.defer(d3.json, "geojson/Bundeslaender.geojson")
	.defer(d3.json, "geojson/BundeslaenderPunkte.geojson")
	.await(makeMyMap);	

/* function makeMyMap(error, laender, airport) {
	if (error) throw error;
			
	var b = path.bounds (laender),
	s = .95 / Math.max((b[1][0] - b[0][0]) /
		width, (b[1][1] - b[0][1])/height),
	t = [(width - s * (b[1][0] + b[0][0])) /
		2, (height - s * (b[1][1] + b[0][1])) / 2];

	projection
		.scale(s)
		.translate(t);
				
		var laender = svg.selectAll(".laender")
			.data(laender.features)
			.enter().append("path")
				.attr("d", path)
				.attr("class", "laender");
			
		var bev = svg.selectAll(".bev")
			.data(bev.features)
			.enter().append("image")
					.attr("xlink:href", "data/airport.svg")
					.attr("width", 30)
					.attr("height", 30)
					.attr("transform",function(d){
						return "translate(" + projection(d.geometry.coordinates) + ")";
					})	
						
	} */
	
	
function makeMyMap(error, laender) {
			
	var b = path.bounds (laender),
	s = .95 / Math.max((b[1][0] - b[0][0]) /
		width, (b[1][1] - b[0][1])/height),
	t = [(width - s * (b[1][0] + b[0][0])) /
		2, (height - s * (b[1][1] + b[0][1])) / 2];

	projection
		.scale(s)
		.translate(t);
				
		var laender = svg.selectAll(".laender")
			.data(laender.features)
			.enter().append("path")
				.attr("d", path)
				.attr("class", "laender")	
			
				.text(function(d){return d.properties.Bev;})
				
}


g.append("text")
      .text(name)
      .attr("x", x)
      .attr("y", y)
      .style("text-anchor","middle")
      .style("font-size","8px")
      .style("stroke-width","0px")
      .style("fill","black")
      .style("font-family","Times New Roman")
  } else {
    focused = null;
	
//Zoom				
//Projektion
//Legende
//Zahlen -> absolute Bevölkerung gesamt
//Kreise - größenskalierende Kreise -> absolute von Armut betroffene Bevölkerung
//farblich unterschiedliche Kreise -> relative Werte
//Farbe zuweisbar bei Kreisen -> relative Werte
		
		