// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svgSc = d3.select("#scatterplot")
  .append("svg")
  .attr('viewBox', '0 0 ' + (margin.left + width + margin.right) + ' ' + (margin.top + height + margin.bottom))
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.json("../json/germany_bundeslaender.json").then(function (data) {
  console.log(data.features)
  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width]);
  svgSc.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);
  svgSc.append("g")
    .call(d3.axisLeft(y));

  // Add dots
  svgSc.append('g')
    .selectAll(null)
    .data(data.features)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.properties.poverty_rel); })
    .attr("cy", function (d) { return y(d.properties.education_rel); })
    .attr("r", 1.5)
    .attr('name', function (d) { return d.properties.name_1 })
    .attr('poverty', function (d) { return d.properties.poverty_rel })
    .attr('education', function (d) { return d.properties.education_rel })
    .attr('class', 'dots')
    //Cursor on mouseover
    .style("cursor", "pointer")
    .on("mouseover", drawTooltip)
    .on("mouseout", eraseTooltip)
    .style("fill", "#69b3a2")

});

function drawTooltip() {
  window.onresize = this.getBoundingClientRect();
  let bbox = this.getBoundingClientRect();
  tooltip = d3.select('#scatterplot')
      .append("div")
      .attr("class", "tooltip")
      .attr("opacity", 0)
      .attr('id', 'tt');
  if (document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1].getAttribute('class') == 'dots') {
      tooltip
          .style("opacity", .7)
          .style("left", bbox.x + bbox.width / 2 + 10 + "px")
          .attr('id', 'tt')
          .style("top", bbox.y + bbox.height / 2 + "px")
          ;

      tooltip.join(
          enter =>
              enter.html("<p>" + d3.select(this).attr("name") + "</p>"),
          update =>
              update.html("<p>" + d3.select(this).attr("name") + "</p><p> Poverty: " + d3.select(this).attr("poverty") + "</p>"+"<p> Education:" + d3.select(this).attr("education") + "</p>")
      )
  }
};


function eraseTooltip() {
  d3.selectAll('#tt').remove();
};

