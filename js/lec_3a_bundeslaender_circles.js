console.log("hi lec_3a_bundeslaender_circles.js")

var width = window.innerWidth-50,
	height = window.innerHeight-50;
	
var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);
	
var projection = d3.geoMercator()
	.translate([0, 0])
	.scale(1);
	
var path = d3.geoPath()
	.projection(projection);



const scaleBar = d3.geoScaleBar()
    .projection(projection)
    .size([width, height]);
	
d3.queue()
	.defer(d3.json,"../geojson/ger_bundeslaender.geojson")
	.await(makeMyMap)		
	
		
function makeMyMap(error, laenderkreise ) {
	if (error) throw error;
			
	var b = path.bounds (laenderkreise),
	s = .95 / Math.max((b[1][0] - b[0][0]) /
		width, (b[1][1] - b[0][1])/height),
	t = [(width - s * (b[1][0] + b[0][0])) /
		2, (height - s * (b[1][1] + b[0][1])) / 2];

	projection
		.scale(s)
		.translate(t);
				
		var laenderkreise = svg.selectAll(".laenderkreise")
			.data(laenderkreise.features)
			.enter().append("path")
				.attr("d", path)
				.attr("class", "laenderkreise");			
	}


	
//Zoom				
//Projektion
//Legende
//Zahlen -> absolute Bevölkerung gesamt
//Kreise - größenskalierende Kreise -> absolute von Armut betroffene Bevölkerung
//farblich unterschiedliche Kreise -> relative Werte
//Farbe zuweisbar bei Kreisen -> relative Werte
		
		