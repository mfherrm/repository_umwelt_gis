console.log("hi lec_2_europe_task.js")

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
	.defer(d3.json, "geojson/Europa.geojson")
	.await(makeMyMap)		
	
		
function makeMyMap(error, laender ) {
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
	}
			
/* let zoom = d3.zoom()
	.on('zoom' , handleZoom);
	
function handleZoom(e) {
	d3.select('svg g')
		.attr('transform', e.transform);
}

function initZoom() {
	d3.select('svg')
		.call(zoom);

initZoom();
} */
	
//Projektion
//Legende
//Zoom