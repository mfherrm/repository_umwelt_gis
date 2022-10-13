var width = window.innerWidth-50,
	height = window.innerHeight-50;
	
var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);
	
var projection = d3.geo()
	.translate([0, 0])
	.scale(1);
	
var path = d3.geoPath()
	.projection(projection);



const scaleBar = d3.geoScaleBar()
    .projection(projection)
    .size([width, height]);
	
d3.queue()
	.defer(d3.json, "geojson/Bundeslaender.geojson")
	.defer(d3.json, "geojson/BundeslaenderPunkte.geojson")
	.await(makeMyMap);		
	
		
function makeMyMap(error, laender, armut) {
	
	var b = path.bounds(laender),
	s = 0.95 / Math.max((b[1][0] - b[0][0]) /
	width, (b[1][1] - b[0][1]) / height),
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
		
/* 	var armut = svg.selectAll(".armut")
		.data(airport.features)
		.append("path")
			.attr("d", path)
			.attr("class", "arm")
			.attr("d", path.pointRadius(function(d) {
				var radius = Math.sqrt((100 * d.properties.Bev_Arm_ab)/
							 (3316230 * Math.PI));
				return radius;
			}))
			.on("click", function(d){
				div.html(d.properties.Name)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY) + "px");
			});

} */
	
//Zoom				
//Projektion
//Legende
//Zahlen -> absolute Bevölkerung gesamt
//Kreise - größenskalierende Kreise -> absolute von Armut betroffene Bevölkerung
//farblich unterschiedliche Kreise -> relative Werte
//Farbe zuweisbar bei Kreisen -> relative Werte
		
		