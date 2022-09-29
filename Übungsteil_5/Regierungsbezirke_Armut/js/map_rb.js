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
	
var y = d3.scaleLinear()
	.domain([1,8])
	.rangeRound([40,215]);

var textLegende = [
	"22,75 ≤ 24,90",
	"20,60 < 22,75",
	"18,45 < 20,60",
	"16,30 < 18,45",
	"14,15 < 16,30",
	"12,00    < 14,15"
	];

var colors=[
	"rgb(16,57,16)",
	"rgb(52,93,39)",
	"rgb(89,130,62)",
	"rgb(125,166,85)",
	"rgb(162,203,108)",
	"rgb(198,239,131)"
];

var color = d3.scaleThreshold()
	.domain(d3.range(2,9))
	.range(colors);
	
var g = d3.select("body").select("div").select(".scale").selectAll("g");
	
			
function getColor(b){
	return 	b >=22.75 ? colors[0]:
			b >=20.6 ? colors[1]:
			b >=18.45 ? colors[2]:
			b >=16.3 ? colors[3]:
			b >=14.15 ? colors[4]:
					colors[5];
	
}

const scaleBar = d3.geoScaleBar()
    .projection(projection)
    .size([width, height]);

d3.queue()
	.defer(d3.json,"geojson/Regierungsbezirke.geojson")
	.await(makeMyMap);

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
		.translate(t);
				
		var laender = svg.selectAll(".laender")
			.data(laender.features)
			.enter().append("path")
				.attr("d", path)
				.attr("class", "laender")	
			
				.attr("fill", function(d){return getColor(d.properties.Bev_Arm_re);})
				
}	