let box = document.querySelector(".map2")
var width = box.offsetWidth;
var height = 800;

var svg = d3.select("body").select(".map2").append("svg")
	.attr("width", width)
	.attr("height", height);
		
var projection = d3.geoMercator()
	.translate([0, 0])
	.scale(1);
	
var path = d3.geoPath()
	.projection(projection);

d3.queue()
	.defer(d3.json,"geojson/Bundeslaender.geojson")
	.await(makeMyMap)	

var colors = [
			"rgb(85,0,0)",
			"rgb(170,0,0)",
			"rgb(212,0,0)",
			"rgb(255,42,42)",
			"rgb(255,85,85)",
			"rgb(255,128,128)",
			"rgb(255,170,170)",
			"rgb(255,213,213)"
			];
			
function getColor (d) {
			return	d >= 3000 ? colors[0]:
					d >= 2000 ? colors[1]:
					d >= 1000 ? colors[2]:
					d >= 450 ? colors[3]:
					d >= 350 ? colors[4]:
					d >= 250 ? colors[5]:
					d >= 150 ? colors[6]:
								colors[7];
				

	}
	
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
			
				.attr("fill", function(d){return getColor(d.properties.Bev_km2);})
				
}	