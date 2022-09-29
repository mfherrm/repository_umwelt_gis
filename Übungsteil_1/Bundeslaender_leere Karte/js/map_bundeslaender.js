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
	.defer(d3.json,"geojson/Bundeslaender.geojson")
	.await(makeMyMap);
	
var y = d3.scaleLinear()
	.domain([1,8])
	.rangeRound([40,215]);

var textLegende = [
	"95,0 ≤ 95,7",
	"93,0 < 95,0",
	"90,0 < 93,0",
	"85,3 < 90,0"
	];

var colors=[
	"rgb(0,74,74)",
	"rgb(40,105,104)",
	"rgb(79,137,133)",
	"rgb(99,165,161)"
];


	
			
function getColor(b){
	return 	b >=95 ? colors[0]:
			b >=93 ? colors[1]:
			b >=90 ? colors[2]:
					colors[3];
	
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
			
				
}

