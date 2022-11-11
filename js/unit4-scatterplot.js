// TO-DO: R-Squared

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 360 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

let sel = [];
let dat = []
var x
var y
// append the svg object to the body of the page
var svgSc = d3.select("#scatterplot")
    .append("svg")
    .attr('viewBox', '0 0 ' + (margin.left + width + margin.right) + ' ' + (margin.top + height + margin.bottom))
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
Promise.all([d3.json("../json/zaf_provinces.json"), d3.json("../json/germany_bundeslaender.json"), d3.json("../json/kenya_counties.json")])
    .then(drawAxis).catch(error => { console.log(error) })

function drawAxis(data) {
    for (d in data) {
        dat[d] = data[d]
    }

    

    // Add X axis
    x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);
    x.ticks(50)
    svgSc.append("g")
        .attr('id', 'bottom')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(20));

    // Add Y axis
    y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);
    svgSc.append("g")
        .attr('id', 'left')
        .call(d3.axisLeft(y).ticks(20));

};

function drawDots(data, selection, color) {
    let a = selection[0];
    let b = selection[1];
    let aval;
    let bval;
    console.log('Drawing')

    const regression = d3.regressionLinear()
        .domain([0, 105])

    svgSc.append('g')
        .attr('id', 'dotlayer')
        .selectAll(null)
        .data(data.features)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            switch (a) {
                case "Poverty":
                    aval = d.properties.poverty_rel
                    regression.x(d => d.properties.poverty_rel)
                    break;
                case "Pre-primary education":
                    aval = d.properties.education_rel
                    regression.x(d => d.properties.education_rel)
                    break;
                case "Population density":
                    aval = d.properties.population_density
                    regression.x(d => d.properties.population_density)
                    break;
                case "Population size":
                    aval = d.properties.population
                    regression.x(d => d.properties.population)
                    break;
                case "Gini coefficient":
                    aval = d.properties.gini_t
                    regression.x(d => d.properties.gini_t)
                    break;
            }
            return x(aval)

        })
        .attr("cy", function (d) {
            switch (b) {
                case "Poverty":
                    bval = d.properties.poverty_rel
                    regression.y(d => d.properties.poverty_rel)
                    break;
                case "Pre-primary education":
                    bval = d.properties.education_rel
                    regression.y(d => d.properties.education_rel)
                    break;
                case "Population density":
                    bval = d.properties.population_density
                    regression.y(d => d.properties.population_density)
                    break;
                case "Population size":
                    bval = d.properties.population
                    regression.y(d => d.properties.population)
                    break;
                case "Gini coefficient":
                    bval = d.properties.gini_t
                    regression.y(d => d.properties.gini_t)
                    break;
            }
            return y(bval)
        })
        .attr("r", 2)
        .attr('name', function (d) { return d.properties.name_1 })
        .attr('Poverty', function (d) { return d.properties.poverty_rel })
        .attr('Pre-primary_education', function (d) { return d.properties.education_rel })
        .attr('Gini_coefficient', function (d) { return d.properties.gini_t })
        .attr('Population_density', function (d) {return d.properties.population_density})
        .attr('Population', function(d){return d.properties.population})
        .attr('class', 'dots')
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("mouseover", drawTooltip)
        .on("mouseout", eraseTooltip)
        .style("fill", color)


    console.log(regression)

    const regressionLine = regression(data.features)
    console.log(regressionLine)
    console.log(regressionLine.rSquared, x(regressionLine[0][1]))

    svgSc
        .append("line")
        .attr("fill", "none")
        .attr("class", "regression")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr('x1', (function (d) { return x(regressionLine[0][0]) }))
        .attr('y1', (function (d) { return y(regressionLine[0][1]) }))
        .attr('x2', (function (d) { return x(regressionLine[1][0]) }))
        .attr('y2', (function (d) { return y(regressionLine[1][1]) }))

}

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
                update.html("<p>" + d3.select(this).attr("name") + "</p><p>" + sel[0] + ': ' + d3.select(this).attr(sel[0].replace(' ','_')) + "</p>" + "<p>" + sel[1] + ': '  + d3.select(this).attr(sel[1].replace(' ','_')) + "</p>")
        )
    }
};


function eraseTooltip() {
    d3.selectAll('#tt').remove();
};

d3.selectAll("#solist .sortlist").on("mousedown", function () {
    slistScp();
})


//Drag n Drop
function slistScp() {
    let current = null;

    //All List Items in page
    let allItems = d3.selectAll("#solist .sortlist li").nodes()
    //All list items left (target of assignment)
    let assign = d3.selectAll(".slist-assign li").nodes()

    //(B) MAKE ITEMS DRAGGABLE + SORTABLE
    for (let i of allItems) {

        // (B2) DRAG START - YELLOW HIGHLIGHT DROPZONES (left)
        i.ondragstart = (ev) => {

            current = i;
            for (let it of assign) {
                it.classList.add("listitem")
                if (it != current && sel.length != 2) { it.classList.add("hint"); }
            }
        };

        // (B3) DRAG ENTER - RED HIGHLIGHT DROPZONE
        for (let it of assign) {
            it.ondragenter = (ev) => {
                if (it != current) { it.classList.add("active"); }
            }
        };

        i.ondragleave = () => {
            i.classList.remove("active");
        };

        // (B5) DRAG END - REMOVE ALL HIGHLIGHTS
        i.ondragend = () => {
            for (let it of allItems) {
                it.classList.remove("hint");
                it.classList.remove("active");
            }
        };

        // (B6) DRAG OVER - PREVENT THE DEFAULT "DROP", SO WE CAN DO OUR OWN
        i.ondragover = (evt) => { evt.preventDefault(); };

        i.ondrop = (evt) => {
            // Idee: Schaut on Drop wie viele Items im Array sind und, ob das current Item bereits drinnen ist. Wenn n==2, dann dragable false für alle items in sliststart
            // Wenn currentitem == sel[0], dann tue nichts
            console.log(current.innerText)
            console.log(evt.target.parentNode)
            evt.preventDefault();
            
            if (evt.target.parentNode == sliststart) {
                svgSc.selectAll('.regression')
                    .remove();
                if (sel.length == 2) {
                    console.log(current.innerText, sel[0], sel[1])
                    current.innerText == sel[0] ? sel = sel.splice(1, 1) : current.innerText == sel[1] ? sel = sel.splice(0, 1) : '';
                } else {
                    sel.pop()
                }

            } else {
                if (sel.length == 2) {
                    evt.preventDrop()
                }
                current.innerText == sel[0] ? '' : current.innerText == sel[1] ? '' : sel.push(current.innerText)
                if (sel.length == 2) {
                    drawDots(dat[0], sel, "yellow");
                    drawDots(dat[1], sel, 'red');
                    drawDots(dat[2], sel, 'green')
                }
            }

            if (sel.length != 2) {
                svgSc.selectAll('#dotlayer')
                    .remove();
            }

            //All List Items in page
            assign = d3.selectAll("#solist .sortlist li").nodes();

            if (current != i) {
                let currentpos = 0, droppedpos = 0;
                for (let it = 0; it < assign.length; it++) {
                    if (current == assign[it]) {
                        currentpos = it;
                    }
                    if (i == assign[it]) { droppedpos = it; }
                }
                if (currentpos < droppedpos) {
                    if (i.classList[0] == "listitem") {
                        i.parentNode.insertBefore(current, i);
                    }
                } else {
                    if (i.classList[0] == "listitem") {
                        i.parentNode.insertBefore(current, i);
                    }
                }
            }
        }
    }
};