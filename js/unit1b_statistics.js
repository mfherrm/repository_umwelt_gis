
//create table with questions in array "questions" --> its numberrrrd and i am too lazy to hardcode
console.log("d3 let's go");

let header = ["Question","Absolute","Relative"]

let questions = [
                {question: "Germany has a total population of ca. 83 million",answer:"absolute"},
                {question:"9.2% of Kenyas total population live in the county 'Nairobi'",answer:"relative"},
                {question:"South Africa is approximately 3.4 times bigger than Germany",answer:"relative"}
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
}

d3.select("#check-tabletest").on("click",function(){
    let answers_given = d3.selectAll(".table .col-6 tr")
    
    answers_given.append("td").attr("class",function(d,i){
        d3.selectAll(".table .col-6 tr input:checked").attr("value") == [questions[i].answer] ? "correct" : "wrong"; 
        i++;
    })
    /*
    for(let i = 0; i < questions.length; i++){
        console.log(answers_given[i])
        console.log(answers_given[i])
        console.log([questions[i].answer])
        d3.select(".table .col-6 tr input:checked").attr("value") == [questions[i].answer] ? answers_given.nodes()[i].append("td").attr("class","correct") : answers_given.nodes()[i].append("td").attr("class","correct"); 
    }
    */
});

d3.select("#restart-tabletest").on("click",function(){

});