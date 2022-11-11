console.log("charts let's go")
//get size of first chart div --> size for all; height=width for good look
let svgBox = d3.select("#chart1").nodes()
svgBox = svgBox[0]

let width = svgBox.clientWidth,
    height = width;

//We need that to randomize the order each time
let chartIds = ["chart1","chart2","chart3","chart4","chart5"]

//Load in Json data //Promise resolve
d3.json("../json/germany2019.json")
    .then(drawVerticalBar)
    .catch(error => { console.log(error) });

d3.json("../json/total_pop_KEN_2011to2021.json")
    .then(drawLine)
    .catch(error => { console.log(error) });

function drawVerticalBar(data){
  //create svg
  let svg = d3.select("#chart1").
               append("svg")
              .attr("viewBox", [0, 0, width, height]);

  let g = svg.append("g")

  //Draw Axis
  let xScale = d3.scaleBand().range ([0, width*.8]).padding(0.4),
      yScale = d3.scaleLinear().range ([height*.8, 0]);

  //Get scale for data
  xScale.domain(data.map(function(d) { 
    return d.group; 
  }));

  yScale.domain([0, d3.max(data, function(d) { 
    return d.male*1.1; 
  })]);

  g.append("g")
    .attr("transform", "translate("+width*.15+","+ height*0.95 + ")")
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("y", height*.05)
    .attr("x", width*.45)
    .attr("text-anchor", "end")
    .attr("stroke", "black")
    .text("Year");

  g.append("g")
      .attr("transform", "translate("+width*.15+"," + height*.15 + ")")
      .call(d3.axisLeft(yScale).tickFormat(function(d){
        return "" + d/1000;
      }))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -height*.1)
      .attr("x", -width*.35)
      .attr("text-anchor", "middle")
      .attr("stroke", "black")
      .text("Stock Price");
        
  g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("transform", "translate("+width*.15+"," + height*.15 + ")")
      .attr("class", "bar")
      .attr("x", function(d) { return xScale(d.group); })
      .attr("y", function(d) { return yScale(d.male); })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) { return height*.8 - yScale(d.male); })
      .attr("fill","lightblue");
      
};


function drawLine(data){
  let svg = d3.select("#chart2").
          append("svg")
        .attr("viewBox", [0, 0, width, height]);

  let g = svg.append("g")

  let line = d3.line()
      .x(d => xScale(d.Time))
      .y(d => yScale(d.Value))
    
  //Draw Axis
  let xScale = d3.scaleBand().range ([0, width*.8]).padding(0.4),
      yScale = d3.scaleLinear().range ([height*.8, 0]);

  //Get scale for data
  xScale.domain(data.map(function(d) { 
    return d.Time; 
  }));

  yScale.domain([40000000, d3.max(data, function(d) { 
    return d.Value*1.05; 
  })]);

  g.append("g")
  .attr("transform", "translate("+width*.15+","+ height*0.95 + ")")
  .call(d3.axisBottom(xScale))
  .append("text")
  .attr("y", height*.05)
  .attr("x", width*.45)
  .attr("text-anchor", "end")
  .attr("stroke", "black")
  .text("Year");

g.append("g")
    .attr("transform", "translate("+width*.15+"," + height*.15 + ")")
    .call(d3.axisLeft(yScale).tickFormat(function(d){
      return "" + d;
    }))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -height*.1)
    .attr("x", -width*.35)
    .attr("text-anchor", "middle")
    .attr("stroke", "black")
    .text("Stock Price");

  console.log(data)
  g.selectAll(".line")
      .data(data)
      .enter()
      .append("path")
      .attr("transform", "translate("+width*.15+","+ height*0.15 + ")")
      .attr("class","line")
      .attr("d", line(data))
      .attr("fill","none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", "1.5")
}
