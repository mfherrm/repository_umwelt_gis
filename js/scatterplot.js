// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 60},
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
d3.json("../json/kenya_counties.json").then(function(data) {
console.log(data.features)
  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 1])
    .range([ 0, width ]);
  svgSc.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 1500])
    .range([ height, 0]);
  svgSc.append("g")
    .call(d3.axisLeft(y));

  // Add dots
  svgSc.append('g')
    .selectAll(null)
    .data(data.features)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.properties.gini_t); } )
      .attr("cy", function (d) { return y(d.properties.population_density); } )
      .attr("r", 1.5)
      .style("fill", "#69b3a2")

});