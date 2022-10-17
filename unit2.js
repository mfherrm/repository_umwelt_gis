// SET UP DIMENSIONS
var w = 500,
  h = 300;

// margin.middle is distance from center line to each y-axis
var margin = {
  top: 20,
  right: 20,
  bottom: 24,
  left: 20,
  middle: 28
};

// the width of each side of the chart
var regionWidth = w / 2 - margin.middle;

// these are the x-coordinates of the y-axes
var pointA = regionWidth,
  pointB = w - regionWidth;

// some contrived data



var exampleData = [];
var fetchData = []
async function postData(file = "") {


  const response = await fetch(file).then((response) => response.json()).then(data => data.forEach(function (d) {
    var i = 0;
    fetchData.push({
      group: d.group,
      male: +d.male,
      female: +d.female
    })
    i = i + 1;

  })).then(exampleData = fetchData).then(function () {


    // GET THE TOTAL POPULATION SIZE AND CREATE A FUNCTION FOR RETURNING THE PERCENTAGE
    var totalPopulation = d3.sum(exampleData, function (d) { return d.male + d.female; }),
      percentage = function (d) { return d / totalPopulation; };


    // CREATE SVG
    var svg = d3.select('#pyr').append('svg')
      .attr('width', margin.left + w + margin.right)
      .attr('height', margin.top + h + margin.bottom)
      // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
      .append('g')
      .attr('transform', translation(margin.left, margin.top))
      .style("cursor", "pointer")
      .on("mouseover", drawTooltip)
      .on("mouseout", eraseTooltip)
      .attr("male", function (d) {
        return exampleData.male;})
      .attr("female", function (d) {
        return exampleData.female;
      });

    // find the maximum data value on either side
    //  since this will be shared by both of the x-axes
    var maxValue = Math.max(
      d3.max(exampleData, function (d) { return percentage(d.male); }),
      d3.max(exampleData, function (d) { return percentage(d.female); })
    );

    // SET UP SCALES

    // the xScale goes from 0 to the width of a region
    //  it will be reversed for the left x-axis
    var xScale = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, regionWidth])
      .nice();

    var xScaleLeft = d3.scale.linear()
      .domain([0, maxValue])
      .range([regionWidth, 0]);

    var xScaleRight = d3.scale.linear()
      .domain([0, maxValue])
      .range([0, regionWidth]);

    var yScale = d3.scale.ordinal()
      .domain(exampleData.map(function (d) { return d.group; }))
      .rangeRoundBands([h, 0], 0.1);


    // SET UP AXES
    var yAxisLeft = d3.svg.axis()
      .scale(yScale)
      .orient('right')
      .tickSize(4, 0)
      .tickPadding(margin.middle - 4);

    var yAxisRight = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .tickSize(4, 0)
      .tickFormat('');

    var xAxisRight = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .tickFormat(d3.format('%'));

    var xAxisLeft = d3.svg.axis()
      // REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
      .scale(xScale.copy().range([pointA, 0]))
      .orient('bottom')
      .tickFormat(d3.format('%'));

    // MAKE GROUPS FOR EACH SIDE OF CHART
    // scale(-1,1) is used to reverse the left side so the bars grow left instead of right
    var leftBarGroup = svg.append('g')
      .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
    var rightBarGroup = svg.append('g')
      .attr('transform', translation(pointB, 0));

    // DRAW AXES
    svg.append('g')
      .attr('class', 'axis y left')
      .attr('transform', translation(pointA, 0))
      .call(yAxisLeft)
      .selectAll('text')
      .style('text-anchor', 'middle');

    svg.append('g')
      .attr('class', 'axis y right')
      .attr('transform', translation(pointB, 0))
      .call(yAxisRight);

    svg.append('g')
      .attr('class', 'axis x left')
      .attr('transform', translation(0, h))
      .call(xAxisLeft);

    svg.append('g')
      .attr('class', 'axis x right')
      .attr('transform', translation(pointB, h))
      .attr('amount', fetchData.female)
      .call(xAxisRight);

    // DRAW BARS
    leftBarGroup.selectAll('.bar.left')
      .data(exampleData)
      .enter().append('rect')
      .attr('class', 'bar left')
      .attr('x', 0)
      .attr('y', function (d) { return yScale(d.group); })
      .attr('width', function (d) { return xScale(percentage(d.male)); })
      .attr('height', yScale.rangeBand())
      .attr('male', function (d) {return d.male});;

    rightBarGroup.selectAll('.bar.right')
      .data(exampleData)
      .enter().append('rect')
      .attr('class', 'bar right')
      .attr('x', 0)
      .attr('y', function (d) { return yScale(d.group); })
      .attr('width', function (d) { return xScale(percentage(d.female)); })
      .attr('height', yScale.rangeBand())
      .attr('female', function (d) {return d.female});
  }

  );

}

postData("../json/africa2019.json").then(console.log(fetchData)).then(exampleData = fetchData).then(console.log(exampleData));

function translation(x, y) {
  return 'translate(' + x + ',' + y + ')';
}

//Create tooltip for mouseover on body for absolute position
var tooltip = d3.select(".chart")
  .append("div")
  .attr("class", "tooltip")
  .attr("opacity", 0)
  ;

//Build Tooltip
function drawTooltip() {
  let bbox = this.getBoundingClientRect()
  tooltip.transition()
    .duration(200)
    .style("opacity", .7)
    .style("x", left + document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1].getAttribute('width') )
    .style("top", d3.mouse(this.childNodes[0].children[0])[0] + "px")
    ;
    

    var x= log();
    tooltip.join(
      enter =>
        enter.append("p", x),
      update =>
        update.html(x)
    );
    //tooltip.html("<p>" + x + "</p>");
    //console.log(x);
    getPosition(); 
    //console.log(document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1])
    //document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1].getElementsByTagName('rect')? console.log(document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1].getAttribute('class')) : console.log("nice try gringo")

    /*Array.prototype.forEach.call(this.childNodes[0].children, child => {
      console.log(child);
    });*/
    
    

    
  

};


function eraseTooltip() {
  tooltip.transition()
    .duration(200)
    .style("opacity", 0);
};

function log(){if (document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1].getElementsByTagName('rect')){
  if (document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1].getAttribute('class')=='bar right'){ 
    return document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1].getAttribute('female')
  } else if(document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1].getAttribute('class')=='bar left'){
    return document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1].getAttribute('male')
}}}
 /**
  .class=='bar left' .class=='bar right'
  */
 var left 
function getPosition(){
  boundingClientRect = document.querySelectorAll( ":hover" )[document.querySelectorAll( ":hover" ).length-1].getBoundingClientRect();

  left = boundingClientRect.left;
  var top = boundingClientRect.top;
  var rectHeight = boundingClientRect.height;
  var rectWidth = boundingClientRect.width;

  console.log("left: " + left,", top: " + top, ", width: " + rectWidth +" ,height: "+rectHeight);
}