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

d3.queue()
	.defer(d3.json, "geojson/Bundeslaender.geojson")
	.defer(d3.json, "geojson/BundeslaenderPunkte.geojson")
	.await(makeMyMap);	


function makeMyMap(error, laenderzahlen, zahlen) {
	if (error) throw error;
			
	var b = path.bounds (laenderzahlen),
	s = .95 / Math.max((b[1][0] - b[0][0]) /
		width, (b[1][1] - b[0][1])/height),
	t = [(width - s * (b[1][0] + b[0][0])) /
		2, (height - s * (b[1][1] + b[0][1])) / 2];

	projection
		.scale(s)
		.translate(t);
				
		var laenderzahlen = svg.selectAll(".laenderzahlen")
			.data(laenderzahlen.features)
			.enter().append("path")
				.attr("d", path)
				.attr("class", "laenderzahlen")
		/* var zahlen = svg.selevtAll(".zahlen")
			.data(zahlen.features)
			.enter().append("path")
				.attr("e", path)
				.attr("class", "zahlen"); */
}


	
//Zoom				
//Projektion
//Legende
//Zahlen -> absolute Bevölkerung gesamt
//Kreise - größenskalierende Kreise -> absolute von Armut betroffene Bevölkerung
//farblich unterschiedliche Kreise -> relative Werte
//Farbe zuweisbar bei Kreisen -> relative Werte
		
		