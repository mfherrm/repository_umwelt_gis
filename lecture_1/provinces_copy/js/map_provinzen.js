let box = document.querySelector(".map1")
var width = box.offsetWidth;
var height = 800;
	
var svg = d3.select("body").select(".map1").append("div")
	.attr("class","umKarte")
	.append("svg")
	.attr("width", width)
	.attr("height", height);
	
var projection = d3.geoMercator()
	.translate([0,0])
	.scale(1);
	


/* var projection = d3.geoAlbers()
	.rotate([0,0])
    .translate([0,0])
	.scale(1)
    .center([0,0])
    .parallels([20,30]); */



var path = d3.geoPath()
	.projection(projection);
	

d3.queue()
	.defer(d3.json,"geojson/Provinzen.geojson")
	.await(makeMyMap);
	
		
		
function makeMyMap(error, laender){
	
	var b = path.bounds(laender),
	p = ([20,30]),
	c = ([0,0]),
	r = ([0,0]),
	s = .95/Math.max((b[1][0] - b[0][0])/width, (b[1][1] - b[0][1])/height),
	t = [(width - s * (b[1][0] + b[0][0]))/2, (height - s*(b[1][1] + b[0][1]))/2];
	
	projection
		.scale(s)
		.translate(t);
		/* .center(c)
		.parallels(p)
		.rotate(r); */
		
	
		var laender = svg.selectAll(".laender")
			.data(laender.features)
			.enter().append("path")
				.attr("d", path)
				.attr("class", "laender")
				
		
}	
	



