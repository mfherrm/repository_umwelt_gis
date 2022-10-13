/* var width = window.innerWidth-50,
	height = window.innerHeight-50; */
	
let box = document.querySelector(".map")
var width = box.offsetWidth;
var height = 900;
	
var svg = d3.select("body").append("div")
	.attr("class","umKarte")
	.append("svg")
	.attr("width", width)
	.attr("height", height);
	
var projection = d3.geoMercator()
	.translate([0,0])
	.scale(1);
	
var path = d3.geoPath()
	.projection(projection);
	
	
var y = d3.scaleLinear()
	.domain([1,8])
	.rangeRound([40,215]);


var textLegende = [
"3000 -   3948",
"2000 - < 3000",
"1000 - < 2000",
" 450  - < 1000",
" 350  - <  450",
" 250  - <  350",
" 150  - <  250",
"  69   - <  150"
];

var colors=[
	"rgb(85,0,0)",
	"rgb(170,0,0)",
	"rgb(212,0,0)",
	"rgb(255,42,42)",
	"rgb(255,85,85)",
	"rgb(255,128,128)",
	"rgb(255,170,170)",
	"rgb(255,213,213)"
];

var color = d3.scaleThreshold()
	.domain(d3.range(2,9))
	.range(colors);
	
var g = d3.select("body").select("div").select(".scale").selectAll("g");
	
	

function getColor(b){
	return 	b >=3000 ? colors[0]:
			b >=2000 ? colors[1]:
			b >=1000 ? colors[2]:
			b >=450 ? colors[3]:
			b >=350 ? colors[4]:
			b >=250 ? colors[5]:
			b >=150 ? colors[6]:
					colors[7];
	
}

const scaleBar = d3.geoScaleBar()
    .projection(projection)
    .size([width, height]);
	

	
d3.queue()
	.defer(d3.json, "geojson/bundeslaender.geojson")
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
		
		
function makeMyMap(error, laender){
		if (error) throw error;
	
	var b = path.bounds(laender),
	s = .95/Math.max((b[1][0] - b[0][0])/width, (b[1][1] - b[0][1])/height),
	t = [(width - s * (b[1][0] + b[0][0]))/2, (height - s*(b[1][1] + b[0][1]))/2];
	
	projection
		.scale(s)
		.translate(t);
		
	
	var laender = svg.selectAll(".laender")
		.data(laender.features)
		.enter().append("path")
			.attr("d", path)
			.attr("class", "laender")
			.attr("id",function(d){
				var name=d.properties.GEN
				return name.toString();
			})
			.attr("fill", function(d){
				return getColor(d.properties.Bev_km2);
			
	});
		
}
	
function getDistance(lat1,lon1,lat2,lon2) {
	var R = 6371; 
	var φ1 = lat1*Math.PI / 180;
	var φ2 = lat2*Math.PI / 180;
	var Δφ = (lat2-lat1)*Math.PI /180;
	var Δλ = (lon2-lon1)*Math.PI /180;
	var a = Math.sin(Δφ/2)*Math.sin(Δφ/2)+ Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var distance = R * c;
	return distance;
}

function getScaleEnd(){
	var startCoord = projection.invert([40, 560]);
	var proScaleEndX =posScaleStart[0];
	var ready = false;
	
	while(ready == false){
		
	var posScaleEnd =[posScaleEndX, posScaleStart[1]],
		endCoord    = projection.invert(posScaleEnd);
		
		var distKm = getDistance(startCoord[0], startCoord[1],
								endCoord[0], endeCoord[1]);
							
		var scale = 100;
		
		if (distKm >= scale){
			ready = true;
			var textKm = String(Math.round(scale)),
				textScale = ( textKm + "km"),
				scaleWidth = posScaleEnd[0]-posScaleStart[0];
			return [posScaleEnd, textScale, scaleWidth];
		}
		
		posScaleEndX++;
	}



g.data([posScaleStart[0], posScaleEnd[0]])
	.enter().append("rect")
		.attr("class", "scaleStop")
		.attr("x", function(d, i){
			if(i==0){return d;}
			if(i==1){return d-2;}
		})
		.attr("height", 8)
		.attr("width", 2)
		.attr("fill", "#555");

}

/* d3.select(".scale")
    .attr("width", width+50)
    .attr("height", height+50)
	.attr("class", "massstab")
	.attr("transform", "translate(2,15)")
	.append("g")
    .call(scaleBar); */


