//build game
//paths to data
let dataLine =  "../json/TotalPopulation_Ger_Ken_Zaf_2011to2021.json";

//get your lets; texts and charts is for radnomizing order
let data = [
                {text:"Line chart",value:"line",chart: "../icons/lineChart.svg"},
                {text:"Bar chart",value:"bar",chart: "../icons/barChart.svg"},
                {text:"Scatter plot",value:"scatter",chart: "../icons/chart3.svg"},
                {text:"Pie chart",value:"pie",chart: "../icons/pieChart.svg"},
                {text:"Histogram",value:"histogram",chart:""},
                {text:"Stacked bar",value:"stacked",chart:"../icons/stackedChart.svg"},
                {text:"Area chart",value:"area",chart:"../icons/areaChart.svg"}
            ]

let texts = [];
let charts = [];

randomize();

drawChartLayout();

//randomize only once for page load, so restart button just draws the page again
function randomize(){
      //randomize order
    d3.shuffle(data)
    //take only some data
    data.splice(4,)

    //array for text shuffle
    
    //push text randomize order. Teachers love this trick
    for(let i in data){
      texts.push(data[i].text)
    }
    d3.shuffle(texts)

    //same game for charts
    for(let i in data){
      charts.push(data[i].chart)
    }
    d3.shuffle(charts)
}

function drawChartLayout(){
  let container = d3.select(".chart-game-container");

  let chartsContainer = container.append("div").attr("class", "col-9 chart-card-container").append("div").attr("class","row");

  let textsContainer = container.append("div").attr("class","col-3 chart-text-container");
    //add Texts
    textsContainer.selectAll(null)
                  .data(texts)
                  .enter()
                  .append("div")
                  .attr("class","chart-text chart-game")
                  .attr("draggable",true)
                  .append("p")
                  .attr("class","")
                  .text(function(d,i){                  
                    return texts[i]
                  })

    textsContainer.append("hr")
    textsContainer.append("div").append("p").style("font-size","8pt").style("text-align","center").text("Container for switching")
    textsContainer.append("div").attr("class","card-highlight chart-game").attr("id","switch")
                  
    //Build cards
    chartsContainer.selectAll(null)
                    .data(data)
                    .enter()
                    .append("div")
                    .attr("class","col-4")
                    .append("div")
                    .attr("class","card")
                    .append("img")
                    .attr("src",function(d,i){return data[i].chart})
               

    //Build card-body (input section for game)
    d3.selectAll(".card")
            .append("div")
            .attr("class","card-body")
            .append("div")
            .attr("class","card-highlight chart-game")

    //Drag n Drop trigger
    d3.selectAll(".chart-text").on("mousedown", function(){
      let current = this;
      slistCharts(current);
    });
}

//Drag and drop
function slistCharts(current) {
      d3.select("#page2 .error").remove();
      let items = d3.selectAll(".chart-game").nodes();

      let highlights = d3.selectAll(".card-highlight.chart-game").nodes();

      let alternativeTarget = d3.select("#switch").node()

      let inputTarget;

      for(let item of items){
        // (B2) DRAG START - YELLOW HIGHLIGHT DROPZONES
        item.ondragstart = (ev) => {
          for(let highlight of highlights){
            if(highlight.childElementCount == 0 && highlight.id != "switch"){ 
              highlight.classList.add("hint")
            } else if (highlight.id == "switch") {
              highlight.classList.add("hint")
            }
          };
        };
        
         // (B3) DRAG ENTER - RED HIGHLIGHT DROPZONE
        for (let highlight of highlights) {
          highlight.ondragenter = (ev) => {
            if(highlight.childElementCount == 0 && highlight.id != "switch"){ 
              highlight.classList.add("active")
              //get inputTarget last one that was active
              inputTarget = highlight;
            }else if (highlight.id == "switch"){
              highlight.classList.add("active")
              //get inputTarget last one that was active
              inputTarget = highlight;
            }else{
              inputTarget = alternativeTarget;
            }
          };
        };
        
        // (B4) DRAG LEAVE - REMOVE RED HIGHLIGHT
        for (let highlight of highlights) {
          highlight.ondragleave = (ev) => {
            {highlight.classList.remove("active")}
          };
        };

        item.ondragend = (ev) => {
          for(let highlight of highlights){
            highlight.classList.remove("active")
            highlight.classList.remove("hint")
          };
        };

        // (B6) DRAG OVER - PREVENT THE DEFAULT "DROP", SO WE CAN DO OUR OWN
        item.ondragover = (evt) => { evt.preventDefault(); };
        
        // (B7) ON DROP - DO SOMETHING
        item.ondrop = (evt) => {
          evt.preventDefault(); 
          inputTarget.append(current)
        };
      };
};

d3.select("#restart-chartgame").on("click",function() {
  d3.selectAll(".chart-card-container").remove();

  d3.selectAll(".chart-text-container").remove();

  d3.select("#page2 .error").remove();

  drawChartLayout();
});

d3.select("#check-chartgame").on("click",function() {
  let userInput = d3.selectAll(".chart-card-container .chart-text p").nodes();
  let index = 0;

  d3.select("#page2 .error").remove();

  if(userInput.length == data.length){
    for(let item of userInput){
      item.classList.remove("slist-correct");
      item.classList.remove("slist-wrong");
  
      if(item.outerText == data[index].text){
        item.classList.add("slist-correct");
      } else {
        item.classList.add("slist-wrong");
      }
      index++;
    };
  } else {
    d3.select("#page2 .unit-check").append("p").attr("class","error").text("Please select an answer for every question").style("color","red")
    return
  }

  
  d3.selectAll(".chart-card-container .chart-text p").on("mousedown",function(){
    this.classList.remove("slist-correct");
    this.classList.remove("slist-wrong");
  });
});


/*
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
};
*/