// set the dimensions and margins of the graph
var margin = { top: 30, right: 30, bottom: 50, left: 40 },
    width = 360 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;
//selected parameter
let sel = [];
//To store data
let dat = [];
//For regression line
var x, y;
//To get max value of first param
let tempa = [];
//To get max value of second param
let tempb = [];
//For tooltip (regression / slope)
let rKen, rGer, rZaf, sKen, sGer, sZaf;
//For iterations of different countries
let ii = 0;
// append the svg object to the body of the page
var svgSc = d3.select("#scatterplot")
    .append("svg")
    .attr('viewBox', '0 0 ' + (margin.left + width + margin.right) + ' ' + (margin.top + height + margin.bottom))
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
Promise.all([d3.json("../json/zaf_provinces.json"), d3.json("../json/germany_bundeslaender.json"), d3.json("../json/kenya_counties.json")])
    .then(drawAxis).catch(error => { console.log(error) });
//draws Axes
function drawAxis(data) {
    for (d in data) {
        dat[d] = data[d]
    }

    // Add X axis
    //No domain means 0 to 1
    x = d3.scaleLinear()
        .range([0, width]);
    x.ticks(50)
    svgSc.append("g")
        .attr('id', 'bottom')
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(20));

    // Add Y axis
    //No domain means 0 to 1
    y = d3.scaleLinear()
        .range([height, 0]);
    svgSc.append("g")
        .attr('id', 'left')
        .call(d3.axisLeft(y).ticks(20))
    createYLabel();
    createXLabel();
};
//Draws the dots
function drawDots(data, selection, color) {
    //First parameter
    let a = selection[0];
    //Second parameter
    let b = selection[1];
    //To swap parameters
    let c;
    //Value of first parameter
    let aval;
    //Value of second parameter
    let bval;
    //Generator for regression line
    const regression = d3.regressionLinear();

    svgSc.append('g')
        .attr('id', 'dotlayer')
        .selectAll(null)
        .data(data.features)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            //Pop size and density shall always be on the y-axis, so swap if first param is one of them
            if (a == 'Population size' || a == 'Population density') {
                c = a
                a = b
                b = c
            }
            //Get value of first parameter
            //Give value as x parameter to regression
            switch (a) {
                case "Poverty":
                    aval = d.properties.poverty_rel
                    tempa.push(aval);
                    regression.x(d => d.properties.poverty_rel)
                    break;
                case "Pre-primary education":
                    aval = d.properties.education_rel
                    tempa.push(aval);
                    regression.x(d => d.properties.education_rel)
                    break;
                case "Gini coefficient":
                    aval = d.properties.gini_t
                    tempa.push(aval);
                    regression.x(d => d.properties.gini_t)
                    break;
            }
            x.domain([0, d3.max(tempa)])// change the xScale, get min value
            d3.select('#bottom') // redraw the xAxis
                .transition().duration(1000)
                .call(d3.axisBottom(x).ticks(20))
            //remove ylabels and redraw
            svgSc.selectAll('#ylabel')
                .remove();
            svgSc.append("g")
                .attr('id', 'ylabel')
                .append("text")
                .text(a)
                .attr('y', '250px')
                .attr('x', '75px')


            return x(aval)

        })
        .attr("cy", function (d) {
            //Get value of second parameter, more cases 'cause pop size, pop density
            //Give value as y parameter to regression
            switch (b) {
                case "Poverty":
                    bval = d.properties.poverty_rel
                    tempb.push(bval);
                    regression.y(d => d.properties.poverty_rel)
                    break;
                case "Pre-primary education":
                    bval = d.properties.education_rel
                    tempb.push(bval);
                    regression.y(d => d.properties.education_rel)
                    break;
                case "Population density":
                    bval = d.properties.population_density
                    tempb.push(bval);
                    regression.y(d => d.properties.population_density)
                    break;
                case "Population size":
                    bval = d.properties.population
                    tempb.push(bval);
                    regression.y(d => d.properties.population)
                    break;
                case "Gini coefficient":
                    bval = d.properties.gini_t
                    tempb.push(bval);
                    regression.y(d => d.properties.gini_t)
                    break;
            }
            y.domain([0, (d3.max(tempb) + 1)])// change the xScale, get max value
            d3.select('#left') // redraw the xAxis
                .transition().duration(1000)
                .call(d3.axisLeft(y).ticks(20).tickFormat(d3.format(".2s")))
            //Remove x-axis labeling
            svgSc.selectAll('#xlabel')
                .remove();
            //Add new x-axis labeling
            svgSc.append("g")
                .attr('id', 'xlabel')
                .append("text")
                .text(b)
                .attr('y', '-30px')
                .attr('x', '-150px')
                .attr('transform', 'rotate(-90)')
            return y(bval)
        })
        .attr("r", 2)
        .attr('cname', function (d) { return d.properties.name_0 })
        .attr('name', function (d) { return d.properties.name_1 })
        .attr('Poverty', function (d) { return d.properties.poverty_rel })
        .attr('Pre-primary_education', function (d) { return d.properties.education_rel })
        .attr('Gini_coefficient', function (d) { return d.properties.gini_t })
        .attr('Population_density', function (d) { return d.properties.population_density })
        .attr('Population_size', function (d) { return d.properties.population })
        .attr('class', 'dots')
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("mouseover", drawTooltip)
        .on("mouseout", eraseTooltip)
        .style("fill", color)




    //calculate regression line for each country
    const regressionLine = regression(data.features)
    ii == 0 ? (rZaf = regressionLine.rSquared) : ii == 1 ? (rGer = regressionLine.rSquared) : ii == 2 ? (rKen = regressionLine.rSquared) : ''
    ii == 0 ? (sZaf = regressionLine.a) : ii == 1 ? (sGer = regressionLine.a) : ii == 2 ? (sKen = regressionLine.a) : ''
    console.log(regressionLine)
    //create line from regression line and add to svg
    svgSc
        .append("line")
        .data(regressionLine)
        .attr("fill", "none")
        .attr("class", "regression")
        .attr("stroke", color)
        .attr("stroke-width", 1.5)
        .attr('x1', (function (d) { return x(regressionLine[0][0]) }))
        .attr('y1', (function (d) { return y(regressionLine[0][1]) }))
        .attr('x2', (function (d) { return x(regressionLine[1][0]) }))
        .attr('y2', (function (d) { return y(regressionLine[1][1]) }))
    ii++;
}
//Create new tooltip -> erase afterwards
function drawTooltip() {
    //Value for rsquared and slope
    let r2, s
    //sets rsquared and slope
    d3.select(this).attr('cname').includes('South') ? r2 = rZaf : d3.select(this).attr('cname').includes('Germany') ? r2 = rGer : d3.select(this).attr('cname').includes('Kenya') ? r2 = rKen : ''
    d3.select(this).attr('cname').includes('South') ? s = sZaf : d3.select(this).attr('cname').includes('Germany') ? s = sGer : d3.select(this).attr('cname').includes('Kenya') ? s = sKen : ''
    window.onresize = this.getBoundingClientRect();
    let bboxSc = this.getBoundingClientRect();

    tooltip = d3.select('#scatterplot')
        .append("div")
        .attr("class", "tooltip")
        .attr("opacity", 0)
        .attr('id', 'tt');
    //Only call when dot is hovered
    if (document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1].getAttribute('class') == 'dots') {
        tooltip
            .style("opacity", .7)
            .style("left", bboxSc.x + bboxSc.width / 2 - 50 + "px")
            .attr('id', 'tt')
            .style("top", bboxSc.y + bboxSc.height + 20 + "px")
            ;
        tooltip.join(
            enter =>
                enter.html("<p>" + d3.select(this).attr("name") + "</p>"),
            update => //Takes the two parameters and shows them depending on which is selected replace(' ', '_') because ' ' is not allowed as an attribute name
                update.html("<p><strong>" + d3.select(this).attr("name") + "</strong></p><p>" + sel[0] + ': ' + d3.select(this).attr(sel[0].replace(' ', '_')) + "</p>" + "<p>" + sel[1] + ': ' + d3.select(this).attr(sel[1].replace(' ', '_')) + "</p>" + "<p> slope: " + (s) + "</p>" + "<p> rsquared: " + d3.format('.5f')(r2) + "</p>")
        )
    }
};

//remove tooltip
function eraseTooltip() {
    d3.selectAll('#tt').remove();
};
//After change check what change occured
d3.selectAll("#solist .sortlist").on("mousedown", function () {
    slistScp();
})

function drawLegendSc(color, mclass, txt, pos) {
    //set Title
    //create svg for Legend
    var legendSvg = d3.selectAll('.mapbox')
        .append("g")
        .attr("class", mclass)
        //.attr("viewBox", [0, 0, width, height])
        .attr("width", "100%")
        //good height --> no. of class*spacing
        .attr("height", function (d, i) {
            return 6 * 45
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(5," + (30 + pos) + ")";
        });
    console.log(legendSvg)
    var legend = legendSvg.selectAll(null)
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "entry")
        .attr("transform", function (d, i) {
            return "translate(5," + i * 33 + ")";
        });

    legendSvg.append("g")
        .append("text")
        .text(txt)
        .attr("font-size", 24)
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + -8 + ")";
        });
    //fill rects by color domain (d) & range (i)                  
    legend.append("rect")
        //rect on position (5,5) in SVG with the width and height 20            
        .attr("x", 10)
        .attr("y", 10) //10
        .attr("width", 25)
        .attr("height", 25)
        .attr("fill", function (d, i) {
            //return color corresponding to no. of domain // (d-1) for right color, dunno why it's that way
            return color(d - 1);
        })

    //get and set of color by domain (d) & range (i)
    legend.append("text")
        //play around for nice positonioning
        //General tip for x--> Rect.X(5)+Rect.Width(20)+buffer(6)
        //Genral tip for y--> anchor of text is at the bottom
        .attr("x", 46)
        .attr("y", 31)
        .attr("color", "white")
        .text(function (d, i) {
            if (i == 0) {
                return "≤ " + d
            } else if (i == color.domain().length - 1) {
                return "≥ " + + d
            } else {
                return color.domain()[i - 1] + 1 + " to " + d
            };
        })
};

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
                //Highlighting on draw
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
        i.ondragover = (evt) => {
            //So that pop size and density are not allowed to be in the same plot
            if ((current.innerText == 'Population size' && sel[0] == 'Population density') || (current.innerText == 'Population density' && sel[0] == 'Population size')) {
                //If array is full but drag is in the first list allow drop 
            } else if (sel.length == 2 && evt.target.parentNode == sliststart) {
                evt.preventDefault();
                //Do not allow drop into full list
            } else if (sel.length == 2) {
                // Allow drop if list is not yet full
            } else {
                evt.preventDefault();
            }
        };

        i.ondrop = (evt) => {

            evt.preventDefault();
            //If drag into left list
            if (evt.target.parentNode == sliststart) {
                //removes all regressions, labels and scalings
                svgSc.selectAll('.regression')
                    .remove();
                svgSc.selectAll('#ylabel')
                    .remove();
                createYLabel();
                svgSc.selectAll('#xlabel')
                    .remove();
                createXLabel();
                //removes parameter from selected if there are two
                if (sel.length == 2) {
                    console.log(current.innerText, sel[0], sel[1])
                    current.innerText == sel[0] ? sel = sel.splice(1, 1) : current.innerText == sel[1] ? sel = sel.splice(0, 1) : '';
                } else {
                    //remove last parameter
                    sel.pop()
                }

            } else {
                //If not already in selection add to selected
                current.innerText == sel[0] ? '' : current.innerText == sel[1] ? '' : sel.push(current.innerText)
                //If two values are selected, draw scatterplot
                if (sel.length == 2) {

                    drawDots(dat[0], sel, "#B2D06C");
                    drawDots(dat[1], sel, '#BEBADA');
                    drawDots(dat[2], sel, '#F8B365')
                    tempa = []
                    tempb = []
                    ii = 0;
                }
            }
            // remove dots when less than two parameters are selected
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
//Creates standard label for y-axis
function createYLabel() {
    svgSc.append("g")
        .attr('id', 'ylabel')
        .append("text")
        .text('Y-Axis')
        .attr('y', '-30px')
        .attr('x', '-125px')
        .attr('transform', 'rotate(-90)')
}
//Creates standard label for a-axis
function createXLabel() {
    svgSc.append("g")
        .attr('id', 'xlabel')
        .append("text")
        .text('X-Axis')
        .attr('y', '250px')
        .attr('x', '125px')
}