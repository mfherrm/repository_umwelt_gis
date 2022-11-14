
//create table with questions in array "questions" --> its numberrrrd and i am too lazy to hardcode
let header = ["Statement","Absolute","Relative"]

let questions = [
                {question:"Approximately 83 million people live in Germany.",answer:"absolute"},
                {question:"9.2% of Kenya's total population live in the county Nairobi.",answer:"relative"},
                {question:"South Africa is approximately 3.4 times bigger than Germany.",answer:"relative"},
                {question:"South Africa's province Gauteng has a population density of approximately 870/km².",answer:"relative"},
                {question:"Kenya has an area of 580,367 sq km.",answer:"absolute"},
                {question:"Germany's total male population aged 50 to 54 is approximately 3.4 million.",answer:"absolute"},
                {question:"Kenya's first level of administrative boundaries is comprised of 47 counties.",answer:"absolute"},
                {question:"South Africa has a GINI index of roughly 55%.",answer:"relative"},
                ]

createTable()

function createTable(){
    let table = d3.select(".table .col-6").append("table");
    
    let tbody = table.append("tbody")
    
    //randomize order of questions. Teachers love this trick
    d3.shuffle(questions)

    //create head
    table.append("thead")     
            .selectAll(null)
            .data(header)
            .enter()
            .append("th")
            .text(function(d){return d})

    //creates one row with question radio radio
    //create question
    tbody.selectAll(null)
        .data(questions)
        .enter()
        .append("tr")
        .attr("class","table-question")
        .append("td")
        .text(function(d,i){return i+1 + ". " + d.question})

    //create first radio
    d3.selectAll(".table-question")
        .append("td")
        .append("input")
        .attr("class","form-check-input")
        .attr("type","radio")
        .attr("value","absolute")
        .attr("name",function(d,i){
            i++;
            return "question"+i;
        })

    //create second radio
    d3.selectAll(".table-question")
        .append("td")
        .append("input")
        .attr("class","form-check-input")
        .attr("type","radio")
        .attr("value","relative")
        .attr("name",function(d,i){
            i++;
            return "question"+i;
        })

    d3.selectAll("#page0 .table tr").on("change", function(){
        console.log(this)
        let correction = this;
        if(correction.childNodes.length == 4){
            correction.lastChild.classList.remove("slist-wrong");
            correction.lastChild.classList.remove("slist-correct")
        }    
    });
}
//remove Error-Msg on click
d3.select("#page0 .table").on("click",function(){
    d3.select("#page0 .unit-check p").remove();
});

d3.select("#check-tabletest").on("click",function(){
    let answers_given = d3.selectAll(".table .col-6 tr");
    let answer = d3.selectAll(".table .col-6 tr input:checked").nodes();

    d3.select("#page0 .error").remove();

    if (answer.length !== questions.length ){
        d3.select("#page0 .unit-check").append("p").attr("class","error").text("Please select an answer for every question").style("color","red")
        return
    } else {
        for(let i of answers_given.nodes()){
            if(i.childElementCount >= 4){
                d3.selectAll(".table .col-6 .result").remove();
            }
        }
        answers_given.append("td").attr("class",function(d,i){
            if(d.answer == answer[i].value){
                return "slist-correct result"
            } else {
                return "slist-wrong result"
            }
        });
    }
});

d3.select("#restart-tabletest").on("click",function(){
    let answers_given = d3.selectAll(".table .col-6 tr");
    d3.selectAll(".table .col-6 tr input").property("checked",false)
    for(let i of answers_given.nodes()){
        if(i.childElementCount >= 4){
            d3.selectAll(".table .col-6 .result").remove();
        }
    }
});