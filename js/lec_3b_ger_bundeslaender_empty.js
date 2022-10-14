console.log("hi lec_3b_ger_bundeslaender_empty.js")

let initX;
let mouseClicked = false;

let box = document.querySelector(".map1")
var width = box.offsetWidth;
var height = 800;

var svg = d3.select("body").select(".map1").append("svg")
	.attr("width", width)
	.attr("height", height)
	.on("mousedown", function(){
		console.log(laender.GEN);
		d3.event.preventDefault();
		initX= d3.mouse(this)[0];
		mouseClicked=true;

	});
			
var projection = d3.geoMercator()
	.translate([0, 0])
	.scale(1);

var path = d3.geoPath()
	.projection(projection);
	
var y = d3.scaleLinear()
	.domain([1,8])
	.rangeRound([40,215]);

d3.queue()
	.defer(d3.json,"../geojson/ger_bundeslaender.geojson")
	.await(makeMyMap);
	
var color = d3.scaleThreshold()
	.domain(d3.range(2,9));
		
function getBundesland(b){
	if (b!=null) return "rgb(192,192,192)"		
	
}

function selected(){
	d3.select('.selected').classed('selected', false);
	d3.select(this).classed('selected, true');
}

d3.select("body").select("div").select(".legende").selectAll("g")
	.data(color.range().map(function(d){
		r= color.invertExtent(d);
		if (r[0] == null) r[0] =1;
		if (r[1] == null) r[1] = 9;
		return r;
	}))
	
	.enter().append("g")
		.attr("class" , "legLine")
		.each(function(){
			var legRect = d3.select(this).append("rect");
			legRect.attr("width", "16")
				.attr("height","16")
				.attr("y", function(r) { return y(r[0]);})
				.attr("fill",function(r) {return color(r[0]);});
			var legText = d3.select(this).append("text");
			legText.attr("y", function(r){return y(r[0])+13;})
			.attr("transform","translate(25,0)")
			.text(function(r){
				var i = r[0]-1;
				return (textLegende[i]);
			});
			
		});	
	
function makeMyMap(error, laender) {
			
	var b = path.bounds (laender),
	s = .95 / Math.max((b[1][0] - b[0][0]) /
		width, (b[1][1] - b[0][1])/height),
	t = [(width - s * (b[1][0] + b[0][0])) /
		2, (height - s * (b[1][1] + b[0][1])) / 2];

	projection
		.scale(s)
		.translate(t)
		
				
		var laender = svg.selectAll(".laender")
			.data(laender.features)
			.enter().append("path")
				.attr("d", path)
				.attr("class", "laender")
				.attr("fill", function(d){return getBundesland(d.properties.GEN);})	
			
				
}

