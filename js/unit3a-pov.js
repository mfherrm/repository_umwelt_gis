var tooltipG;
//Create colors scheme, different colors based on selection
let gerC = [(d3.scaleThreshold().domain([12.3, 15.6, 17.2, 18.5, 19.4]).range(colorScaleBlues5)), (d3.scaleThreshold().domain([21.7, 37.1, 42.3, 48.9, 53.21]).range(colorScaleBlues5)), (d3.scaleThreshold().domain([18.45, 23.4, 25.8, 27.75, 29.2]).range(colorScaleBlues5))];
let kenC = [(d3.scaleThreshold().domain([24, 30, 36.7, 51.2, 69.7]).range(colorScaleBlues5)), (d3.scaleThreshold().domain([10.8, 14.5, 22.1, 37.7, 64.8]).range(colorScaleBlues5)), (d3.scaleThreshold().domain([42.1, 45.7, 48.2, 51.8, 54]).range(colorScaleBlues5))];
let zafC = [(d3.scaleThreshold().domain([21.7, 36.7, 41.4, 43.2, 52.3]).range(colorScaleBlues5)), (d3.scaleThreshold().domain([4.8, 13.5, 18.6, 27.3, 32.83]).range(colorScaleBlues5)), (d3.scaleThreshold().domain([14.7, 27.9, 31.7, 34.8, 38.2]).range(colorScaleBlues5))];
//Starting value for the button value (starts with ZAf), starting values for Germany, Kenya, South Africa, these will be used later on to change the classification, dataset and legend
let b = 1, z = 1, g = 2, k = 2;
let gin = 0;
//Load in GeoJSON data //Promise resolve

Promise.all([d3.json("../geojson/zaf_provinces.geojson"), d3.json("../geojson/germany_bundeslaender.geojson"), d3.json("../geojson/kenya_counties.geojson")])
    .then(draw).catch(error => { console.log(error) })

//Create tooltip for mouseover on body for absolute position -- https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/ -- https://bl.ocks.org/d3noob/a22c42db65eb00d4e369

//Parameter function
function draw(data) {
    drawMapG(data[0], '#zaf', 'pzaf', d3.geoAzimuthalEqualArea().scale(1).translate([0, 0]).rotate([-24, -28]), zafC[b], "ginizaf")
    //Change b according to which button starts on those pages
    b = 2;
    drawMapG(data[1], '#ger', 'pger', d3.geoAzimuthalEqualArea().scale(1).translate([0, 0]).rotate([-10, -52]), gerC[b], "giniger")
    drawMapG(data[2], '#ken', 'pken', d3.geoAzimuthalEqualArea().scale(1).translate([0, -.01]).rotate([-38, 0]), kenC[b], "giniken")
}
//Draws map
function drawMapG(data, drawTarget, mapID, mapProjection, colorG, pID) {

    var pathG = d3.geoPath().projection(mapProjection);
    var bboxG = pathG.bounds(data),
        s = .92 / Math.max((bboxG[1][0] - bboxG[0][0]) / width, (bboxG[1][1] - bboxG[0][1]) / height),
        t = [(width - s * (bboxG[1][0] + bboxG[0][0])) / 2, (height - s * (bboxG[1][1] + bboxG[0][1])) / 2];

    // Update the projection    
    mapProjection
        .scale(s)
        .translate(t);

    //Create SVG element // viewBox for responsive Map // creates multiple svgs
    var svgG = d3.select(drawTarget)
        .append("svg")
        //responsive size
        .attr("viewBox", [0, 0, width, height])
        .attr("preserveAspectRatio", "xMinYMin")
        .append("g")
        .attr("class", "mapboxG")
        .attr('id', mapID);
    //Bind data and create one path per GeoJSON feature
    svgG.selectAll(null)
        .data(data.features)
        .enter()
        .append("path")
        //We're handling different countries
        .attr("d", pathG)
        //So that the svgs can be selected later on
        .attr('id', pID)
        .attr("class", "adminarea")
        .attr("poverty_rel", function (d) {
            return d.properties.poverty_rel;
        })
        .attr("poverty_rel_f1", function (d) {
            return d.properties.poverty_rel_f1;
        })
        .attr("poverty_rel_f2", function (d) {
            return d.properties.poverty_rel_f2;
        })
        //get province name  
        .attr("name", function (d) {
            return d.properties.name_1
        })
        //Changes color based on the value at the moment
        .style("fill", function (d) {
            return b == 2 ? colorG(d.properties.poverty_rel_f2) : b == 1 ? colorG(d.properties.poverty_rel_f1) : colorG(d.properties.poverty_rel)
        })
        //Cursor on mouseover
        .style("cursor", "pointer")
        .on("mouseover", drawTooltipG)
        .on("mouseout", eraseTooltipG)

    drawScalebar(mapProjection, mapID);
    drawLegendG(mapID, colorG);


    //Build Tooltip /7 Always adds new ones -> Erase function
    function drawTooltipG() {
        let tttar
        window.onresize = this.getBoundingClientRect();
        let bboxG = this.getBoundingClientRect();
        //Used to tell the tooltip which layer is selected at the moment
        if (this.id.includes('ger')) {
            tttar = g;
        } else if (this.id.includes('ken')) {
            tttar = k;
        } else if (this.id.includes('zaf')) {
            tttar = z;
        }
        tooltipG = d3.select(drawTarget)
            .append("div")
            .attr("class", "tooltip")
            .attr('id', 'tt')
            .attr("opacity", 0);
        tooltipG
            .style("opacity", .7)
            .style("left", bboxG.x + bboxG.width / 2 + 10 + "px")
            .attr('id', 'tt')
            .style("top", bboxG.y + bboxG.height / 2 + "px")
            ;
        tooltipG.join(
            enter =>
                enter.html("<p>" + d3.select(this).attr("name") + "</p>"),
            update =>
                //Uses the function above to change text depending on which layer is shown
                update.html("<p><strong>" + d3.select(this).attr("name") + "</strong></p><p>" + (tttar == 0 ? d3.format(".1f")(d3.select(this).attr("poverty_rel")) : tttar == 1 ? d3.format(".1f")(d3.select(this).attr("poverty_rel_f1")) : d3.format(".1f")(d3.select(this).attr("poverty_rel_f2"))) + "% </p>")
        )

    };

};

function eraseTooltipG() {
    d3.selectAll('#tt').remove();
};

//Build Vertical-Legend -- https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e
function drawLegendG(mapID, colorG) {
    console.log(mapID)
    //set Title
    //create svg for Legend
    var legendSvgG = d3.selectAll('#' + mapID)
        .append("g")
        .attr("class", "legend")
        //.attr("viewBox", [0, 0, width, height])
        .attr("width", "100%")
        //good height --> no. of class*spacing
        .attr("height", function (d, i) {
            return 6 * 45
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(5," + 30 + ")";
        });

    legendSvgG.append("g")
        .append("text")
        .text(function () {
            return "Population in Poverty [%]";
        })
        .attr("transform", function (d, i) {
            //set spacing
            return "translate(0," + -8 + ")";
        });

    var legendG = legendSvgG.selectAll(null)
        .data(colorG.domain())
        .enter()
        .append("g")
        .attr("class", "entry")
        .attr("transform", function (d, i) {
            return "translate(5," + i * 33 + ")";
        });
    //get and set of color by domain (d) & range (i)
    legendG.append("text")
        //play around for nice positonioning
        //General tip for x--> Rect.X(5)+Rect.Width(20)+buffer(6)
        //Genral tip for y--> anchor of text is at the bottom
        .attr("x", 46)
        .attr("y", 31)
        .attr("color", "white")
        .attr('id', mapID + '_leg')
        .text(function (d, i) {
            console.log(d)
            //Hardcoded because lack of time for real solution
            //Sets lowest and highest values as legend boundaries
            if (i == 0) {
                if (mapID == "pger") {
                    return "17.85 to " + (d)
                } else if (mapID == "pzaf") {
                    return "3.73 to " + d3.format(".2f")(d)
                } else {
                    return "37 to " + d3.format(".2f")(d)
                }
            } else if (i == colorG.domain().length - 1) {
                if (mapID == "pger") {
                    return colorG.domain()[i] + " to " + "37.35";
                } else if (mapID == "pzaf") {
                    return colorG.domain()[i] + " to " + "34.93";
                } else {
                    return colorG.domain()[i] + " to " + "56.97";
                }

            } else {
                return d3.format(".2f")(colorG.domain()[i - 1] + 0.01) + " to " + d3.format(".2f")(d);
            };
        })

    //fill rects by color domain (d) & range (i)                  
    legendG.append("rect")
        //rect on position (5,5) in SVG with the width and height 20            
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 30)
        .attr("height", 30)
        .attr("fill", function (d, i) {
            //For some reason the legend returns the second to last value twice, this fixes it
            if (i == 4) {
                return colorScaleBlues5[i]
            } else {
                //return color corresponding to no. of domain // (d-1) for right color, dunno why it's that way
                return colorG(d - 1);
            }
        })
};

d3.selectAll(".colbut").on("click", function () { changeColor(this.id) });
d3.selectAll(".check").on("click", function () { getResult(this.id) });

function changeColor(id) {
    console.log(id)
    //Clicked button
    let tar;
    //Which legend shall be changed
    let tarleg;
    //Which values shall be inserted into the legend
    let arrleg;
    //For changing legend text
    let txt;
    //Gets the element this was triggered from and returns it / its legend 
    id.includes('ger') ? tar = '#giniger' : id.includes('ken') ? tar = '#giniken' : id.includes('zaf') ? tar = '#ginizaf' : 'not found'
    id.includes('ger') ? tarleg = '#pger_leg' : id.includes('ken') ? tarleg = '#pken_leg' : id.includes('zaf') ? tarleg = '#pzaf_leg' : 'not found'
    //Gets which button is the one clicked, sets b (button variable) to that value
    id.includes('gini_t') ? b = 0 : id.includes('gini_f1') ? b = 1 : b = 2

    for (let a = 0; a < d3.selectAll(tar)._groups[0].length; a++) {
        //Sets color ramp based on country, does not care what button is pressed, this information is given through b
        //Updates country variable as well
        if (tar == '#giniger') {
            colorG = gerC[b];
            g = b;
        } else if (tar == '#giniken') {
            colorG = kenC[b];
            k = b;
        } else if (tar == '#ginizaf') {
            colorG = zafC[b]
            z = b;
        } else {
            console.log()
        }
        //returns color value based on button variable
        b == 0 ? (colorl = colorG(d3.selectAll(tar)._groups[0][a].__data__.properties.poverty_rel)) : b == 1 ? (colorl = colorG(d3.selectAll(tar)._groups[0][a].__data__.properties.poverty_rel_f1)) : (colorl = colorG(d3.selectAll(tar)._groups[0][a].__data__.properties.poverty_rel_f2));
        //fills the selected path with the new color
        d3.selectAll(tar)._groups[0][a].style.fill = colorl
    }
    //Updates legend
    for (let e = 0; e < d3.selectAll(tarleg)._groups[0].length; e++) {
        tarleg == '#pger_leg' ? arrleg = gerC[g] : tarleg == '#pken_leg' ? arrleg = kenC[k] : tarleg == '#pzaf_leg' ? arrleg = zafC[z] : console.log('Not found')
        //if lowest value
        if (e == 0) {
            //Hardcoded lower boundary based on country code to save time
            if (tarleg == '#pger_leg') {
                g == 0 ? txt = "11.9 to " + d3.format(".2f")(arrleg.domain()[0]) : g == 1 ? txt = "20.23 to " + d3.format(".2f")(arrleg.domain()[0]) : g == 2 ? txt = "17.85 to " + d3.format(".2f")(arrleg.domain()[0]) : ''
            } else if (tarleg == '#pken_leg') {
                k == 0 ? txt = "17.1 to " + d3.format(".2f")(arrleg.domain()[0]) : k == 1 ? txt = "3.25 to " + d3.format(".2f")(arrleg.domain()[0]) : k == 2 ? txt = "37 to " + d3.format(".2f")(arrleg.domain()[0]) : ''
            } else if (tarleg == '#pzaf_leg') {
                z == 0 ? txt = "19.3 to " + d3.format(".2f")(arrleg.domain()[0]) : z == 1 ? txt = "3.73 to " + d3.format(".2f")(arrleg.domain()[0]) : z == 2 ? txt = "12.87 to " + d3.format(".2f")(arrleg.domain()[0]) : ''
            }
            
            //if highest value
        } else if (e == arrleg.domain().length - 1) {
            //Hardcoded higher boundary based on country code to save time
            if (tarleg == '#pger_leg') {
                g == 0 ? txt = arrleg.domain()[arrleg.domain().length - 1] + " to 24.9" : g == 1 ? txt = arrleg.domain()[arrleg.domain().length - 1] + " to 55.2" : g == 2 ? txt = arrleg.domain()[arrleg.domain().length - 1] + " to 37.35" : ''
            } else if (tarleg == '#pken_leg') {
                k == 0 ? txt = arrleg.domain()[arrleg.domain().length - 1] + " to 79.3" : k == 1 ? txt = arrleg.domain()[arrleg.domain().length - 1] + " to 69.87" : k == 2 ? txt = arrleg.domain()[arrleg.domain().length - 1] + " to 56.97" : ''
            } else if (tarleg == '#pzaf_leg') {
                z == 0 ? txt = arrleg.domain()[arrleg.domain().length - 1] + " to 59.1" : z == 1 ? txt = arrleg.domain()[arrleg.domain().length - 1] + " to 34.93" : z == 2 ? txt = arrleg.domain()[arrleg.domain().length - 1] + " to 39.4" : ''
            }
        } else {
            //All values inbetween in 0.01 increments
            txt = d3.format(".2f")(arrleg.domain()[e - 1] + 0.01) + " to " + d3.format(".2f")(arrleg.domain()[e])
        };
        //update text
        d3.selectAll(tarleg)._groups[0][e].textContent = txt
    }
}
//Compares country variables with selected button, if they're matched right, returns correct
function getResult(id) {
    let tar;
    id.includes('ger') ? tar = '#resger' : id.includes('ken') ? tar = '#resken' : id.includes('zaf') ? tar = '#reszaf' : console.log('not found')
    if (tar == '#resger') {
        g == 0 ? d3.select('#resger').text('Your answer is correct!') : d3.select('#resger').text('Your answer is incorrect!')
    } else if (tar == '#resken') {
        k == 0 ? d3.select('#resken').text('Your answer is correct!') : d3.select('#resken').text('Your answer is incorrect!')
    } else if (tar == '#reszaf') {
        z == 0 ? d3.select('#reszaf').text('Your answer is correct!') : d3.select('#reszaf').text('Your answer is incorrect!')
    } else {
    }
}