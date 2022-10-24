var fetchData = [] //used to convert the json in to an array 

let left //used to get the absolute position of an element's bounding box
let len //used to get the hovered object (last Object of the node)
let w = 700, h = 300; //desired width and height of the pyramid
var margin = { //margins between the axes 
  top: 20,
  right: 20,
  bottom: 24,
  left: 20,
  middle: 28
};
var regionWidth = w / 2 - margin.middle; //width of each side of the chart
var pointA = regionWidth, pointB = w - regionWidth; // x-coordinates of the y-axes
let bar_height; //used to position the tooltip, height of a bar
var bar_width; //used to position the tooltip, width of a bar
var bounding_height; // used to position the tooltip, height of the bounding box
var twidth = 80; // Desired minimum width of tooltip
let val //used to get the value of a population group

postData('../json/southafrica2019.json', '#pyr_southafrica');
postData('../json/europe2019.json', '#pyr_europe');
postData('../json/africa2019.json', '#pyr_africa');  //uses a json-file to create a population pyramid
postData('../json/germany2019.json', '#pyr_germany'); 
postData('../json/kenya2019.json', '#pyr_kenya'); 

async function postData(file, target) {
  //parses the file and converts it into an array
  const response = await fetch(file).then((response) => response.json()).then(data => data.forEach(function (d) {
    var i = 0;
    fetchData.push({
      group: d.group,
      male: +d.male,
      female: +d.female
    })
    i = i + 1;

  })).then(function () { //creates a responsive population pyramid with tooltips 

    //calculates the total population and creates a function to return an age group's share of the total
    var totalPopulation = d3.sum(fetchData, function (d) { return d.male + d.female; }),
      percentage = function (d) { return d / totalPopulation; };


    // creates the svg
    var svg = d3.select(target)
      .append('svg')
      .attr('viewBox', '0 0 ' + (margin.left + w + margin.right) + ' ' + (margin.top + h + margin.bottom)) //margins are important so that the ratio of the axes are kept intact
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr('id', target.replace('#',''))
      .append('g')
      .attr('transform', translation(margin.left, margin.top))
      .style('cursor', 'pointer')
      .on('mouseover', drawTooltip)
      .on('mouseout', eraseTooltip)

      ;

    // finds the maximum data value on either side since this is shared by both of the x-axes
    var maxValue = Math.max(
      d3.max(fetchData, function (d) { return percentage(d.male); }),
      d3.max(fetchData, function (d) { return percentage(d.female); })
    );

    // the xScale goes from 0 to the width of a region, this is reversed for the left x-axis
    var xScale = d3.scaleLinear() //Linear relationship between input and output y= mx +c 
      .domain([0, maxValue]) //complete set of values from 0 to maxValue
      .range([0, regionWidth]) //resulting values of scaling from 0 to regionWidth
      .nice(); //rounds the values for the ticks

    var xScaleLeft = d3.scaleLinear()
      .domain([0, maxValue])
      .range([regionWidth, 0]);

    var xScaleRight = d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, regionWidth]);

    var yScale = d3.scaleBand() //scale with an ordered, fixed set of values 
      .domain(fetchData.map(function (d) { return d.group; }))
      .rangeRound([h, 0], 0.1)
      .padding(0.1); //sets output range from specified continuous interval with 0.1 padding inbetween


    //sets up axes
    var yAxisLeft = d3.axisRight()
      .scale(yScale)
      .tickSize(4, 0) //sets the length of the tick marks
      .tickPadding(margin.middle - 4); //sets how far away from the end oft he tick mark the text-anchor of the label text is placed

    var yAxisRight = d3.axisLeft()
      .scale(yScale)
      .tickSize(4, 0)
      .tickFormat(''); //specifies the format of the tick labels

    var xAxisRight = d3.axisBottom()
      .scale(xScale)
      .tickFormat(d3.format('.1%'));

    var xAxisLeft = d3.axisBottom()
      .scale(xScale.copy().range([pointA, 0])) //reverses the x-axis scale on the left side by reversing the range
      .tickFormat(d3.format('.1%'));

    //groups the respective elements together
    var leftBarGroup = svg.append('g')
      .attr('transform', translation(pointA, 0) + 'scale(-1,1)'); //scale(-1,1) is used to reverse the left side so the bars grow left instead of right
    var rightBarGroup = svg.append('g')
      .attr('transform', translation(pointB, 0));

    //draws the axes
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

    //draws the bars
    leftBarGroup.selectAll('.bar.left')
      .data(fetchData)
      .enter().append('rect')
      .attr('class', 'bar left')
      .attr('x', 0)
      .attr('y', function (d) { return yScale(d.group); })
      .attr('width', function (d) { return xScale(percentage(d.male)); })
      .attr('height', yScale.bandwidth())
      .attr('male', function (d) { return d.male });;

    rightBarGroup.selectAll('.bar.right')
      .data(fetchData)
      .enter().append('rect')
      .attr('class', 'bar right')
      .attr('x', 0)
      .attr('y', function (d) { return yScale(d.group); })
      .attr('width', function (d) { return xScale(percentage(d.female)); })
      .attr('height', yScale.bandwidth())
      .attr('female', function (d) { return d.female });
  }

  );

  var tooltip;
 fetchData = [];
}
//creates tooltip for mouseover on body for absolute positions




// functions

//used to translate during transformation, similar to the d3.translate attribute
function translation(x, y) {
  return 'translate(' + x + ',' + y + ')';
}

//builds tooltip
function drawTooltip() {
  tooltip = d3.selectAll('.chart')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', 'tt')
    .attr('opacity', 0)
    ;
  val = getValue();
  getPosition();
  if (document.querySelectorAll(':hover')[len].getAttribute('class') == 'bar right' || document.querySelectorAll(':hover')[len].getAttribute('class') == 'bar left') {
    window.addEventListener('resize', getPosition()); //so that tooltips stay at the same position no matter the window size
    tooltip
      .style('opacity', .7)
      .style('top', (bounding_height) + 'px')
      .style('left', left + 'px')
      .text(val)
      ;

  }
};

//erases tooltips after leaving the element
function eraseTooltip() {
  d3.selectAll('#tt').remove();
  /*tooltip.transition()
    .duration(200)
    .style('opacity', 0);*/
};

//returns the value of either the male or the female population of a bar
function getValue() {
  if (document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1].getElementsByTagName('rect')) { //selects all bars
    len = document.querySelectorAll(':hover').length - 1;

    if (document.querySelectorAll(':hover')[len].getAttribute('class') == 'bar right') { //in case of the right bars there is no attribute for the male population
      return document.querySelectorAll(':hover')[len].getAttribute('female')
    } else if (document.querySelectorAll(':hover')[len].getAttribute('class') == 'bar left') { //in case of the left bars there is no attribute for the female population
      return document.querySelectorAll(':hover')[len].getAttribute('male')
    }
  }

};

//gets the dimensions of the svg element to make positioning of the tooltip consistent and easier
function getPosition() {
  
  boundingClientRect = document.querySelectorAll(':hover')[len].getBoundingClientRect();
  bar_width = boundingClientRect.width;
  bounding_height = boundingClientRect.y;
  document.querySelectorAll(':hover')[len].getAttribute('class') == 'bar right' ? (left = boundingClientRect.left + bar_width) : (left = boundingClientRect.left - twidth) //in case of a right bar, boundingClientRect.left is the point at which the axes meet 

}
