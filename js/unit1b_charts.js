//build game
//paths to data
let dataLine =  "../json/TotalPopulation_Ger_Ken_Zaf_2011to2021.json";

//get your lets; texts and charts is for radnomizing order
let data = [
                {text:"Line chart",value:"line",chart: "../icons/lineChart.svg"},
                {text:"Bar chart",value:"bar",chart: "../icons/barChart.svg"},
                {text:"Scatter plot",value:"scatter",chart: "../icons/scatterPlot.svg"},
                {text:"Pie chart",value:"pie",chart: "../icons/pieChart.svg"},
                {text:"Stacked bar",value:"stacked",chart:"../icons/stackedChart.svg"},
                {text:"Area chart",value:"area",chart:"../icons/areaChart.svg"} //raushauen 
            ]

drawChartGallery()

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
    
    //push text --> randomize order. Teachers love this trick
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


//function to draw page2 chart game 
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
    d3.selectAll("#page2 .card")
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

//Drag and drop for page 2 chart game
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

function drawChartGallery(){
 let galleryContainer = d3.select("#page3 #chartGallery")
 console.log(data)

 //<i class="bi bi-chevron-right"></i>
  galleryContainer.selectAll("#page3 #chart-container")
    .data(data)
    .enter()
    .append("div")
    .attr("class","card hide")
    .attr("id",function(d,i){return "card"+i})
    .append("img")
    .attr("src",function(d,i){return data[i].chart});


  d3.selectAll("#page3 .card")
    .append("div")
    .attr("class","card-body")
    .append("p")
    .append("strong")
    .text(function(d){ 
      return d.text
    });

  d3.selectAll("#page3 .card-body")
    .append("ul")
    .attr("class","factbook-list")
    .style("text-align","left")
    .style("padding-left","7.5%")
    .append("li")
    .text(function(d,i){
      console.log(d.text)
      if(d.text == "Line chart"){
        return "Line chart tips"
      } else if (d.text =="Bar chart"){
        return "Bar chart tips"
      } else if (d.text =="Scatter plot"){
        return "Scatter plot tips";
      } else if (d.text == "Pie chart"){
        return "Pie chart tips"
      } else if (d.text =="Area chart"){
        return "Area chart tips"
      } else if (d.text == "Stacked bar"){
        return "Stacked bar tips"
      } else {
        return
      }
  
    });
}

//Chart gallery control
let btnPrevChart = $('#page3 #prev-chart');
let btnNextChart = $('#page3 #next-chart');

let chartGalleryIndex = 0;

let chartGalleryCount = $('#page3 .card').length-1
showGallery()

console.log(chartGalleryCount)
function showGallery(){
  $("#page3 #card"+chartGalleryIndex).removeClass("hide").addClass("show");
}

function hideGallery(){
  $("#page3 #card"+chartGalleryIndex).removeClass("show").addClass("hide");
}

btnNextChart.on("click",function(){
  console.log(chartGalleryCount);
  console.log(chartGalleryIndex);
  hideGallery();
  chartGalleryIndex == chartGalleryCount ? chartGalleryIndex = 0: chartGalleryIndex++;
  showGallery();
})

btnPrevChart.on("click", function() {
  console.log(chartGalleryCount);
  console.log(chartGalleryIndex);
  hideGallery();
  chartGalleryIndex == 0 ? chartGalleryIndex = chartGalleryCount : chartGalleryIndex--;
  showGallery();
})


/*


btnNext.on("click",function(){
    hidePage();
    pageIndex < pages? pageIndex++ : pageIndex; 
    showPage();
    buttonShowHide();
})

btnPrev.on("click", function(){
    hidePage();
    pageIndex > 0 ? pageIndex-- : 0;
    showPage();
    buttonShowHide();
})

function buttonShowHide(){
    pageIndex == pages ? btnNext.css({"visibility":"hidden"}) : btnNext.css({"visibility":"visible"});
    pageIndex == 0 ? btnPrev.css({"visibility":"hidden"}) : btnPrev.css({"visibility":"visible"});
}


*/