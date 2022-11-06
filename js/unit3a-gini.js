var tooltipG;
//Create colors scheme    
let gerC = [(d3.scaleThreshold().domain([11, 15, 17, 19, 24]).range(d3.schemeReds[6])), (d3.scaleThreshold().domain([20, 29, 38, 47, 55]).range(d3.schemeReds[6])), (d3.scaleThreshold().domain([17, 22, 25, 27, 29]).range(d3.schemeReds[6]))];
let kenC = [(d3.scaleThreshold().domain([80, 85, 90, 95, 100]).range(d3.schemeReds[6])), (d3.scaleThreshold().domain([80, 85, 90, 95, 100]).range(d3.schemeReds[6])), (d3.scaleThreshold().domain([80, 85, 90, 95, 100]).range(d3.schemeReds[6]))];
let zafC = [(d3.scaleThreshold().domain([80, 85, 90, 95, 100]).range(d3.schemeReds[6])), (d3.scaleThreshold().domain([80, 85, 90, 95, 100]).range(d3.schemeReds[6])), (d3.scaleThreshold().domain([80, 85, 90, 95, 100]).range(d3.schemeReds[6]))];
let b = 1, z = 1;
let g, k;
let colorG = zafC[b]
let gin = 0;
//Load in GeoJSON data //Promise resolve

Promise.all([d3.json("../geojson/zaf_provinces.geojson"), d3.json("../geojson/germany_bundeslaender.geojson"), d3.json("../geojson/kenya_counties.geojson")])
    .then(draw).catch(error => { console.log(error) })

//Create tooltip for mouseover on body for absolute position -- https://www.freecodecamp.org/news/how-to-work-with-d3-jss-general-update-pattern-8adce8d55418/ -- https://bl.ocks.org/d3noob/a22c42db65eb00d4e369

//Build Map
function draw(data) {
    let drawTarget = '#zaf';
    let pID = "ginizaf"
    let mapID = 'pzaf'
    let mapProjection = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, 0])
    drawMapG(data[0], drawTarget, mapID, mapProjection, colorG, pID)
    drawTarget = '#ger';
    mapID = 'pger'
    pID = "giniger"
    mapProjection = projection = d3.geoAzimuthalEqualArea().scale(1).translate([0.005, 0.0]).rotate([-10, -52])
    b = 1, g = 1;
    colorG = gerC[b]
    drawMapG(data[1], drawTarget, mapID, mapProjection, colorG, pID)
    drawTarget = '#ken';
    pID = "giniken"
    mapID = 'pken'
    mapProjection = d3.geoAzimuthalEqualArea().scale(1).translate([.03, -.01]).rotate([-38, 0]);
    b = 2, k = 2;
    colorG = kenC[b]
    drawMapG(data[2], drawTarget, mapID, mapProjection, colorG, pID)

}

function drawMapG(data, drawTarget, mapID, mapProjection, colorG, pID) {

    var pathG = d3.geoPath().projection(mapProjection);

    var bboxG = pathG.bounds(data),
        s = .92 / Math.max((bboxG[1][0] - bboxG[0][0]) / width, (bboxG[1][1] - bboxG[0][1]) / height),
        t = [(width - s * (bboxG[1][0] + bboxG[0][0])) / 2, (height - s * (bboxG[1][1] + bboxG[0][1])) / 2];

    // Update the projection    
    mapProjection
        .scale(s)
        .translate(t);

    //Create SVG element // viewBox for responsive Map
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
        .attr("d", pathG)
        .attr('id', pID)
        .attr("class", function (d) {
            return d.properties.LEVL_CODE == 0 ? "countryU3" : "adminarea";
        })
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
            return d.properties.name_1 ? d.properties.name_1 : d.properties.ADM2_NAME;
        })
        //get color for Value of education from "var color"
        .style("fill", function (d) {
            return b == 2 ? colorG(d.properties.poverty_rel_f2) : b == 1 ? colorG(d.properties.poverty_rel_f1) : colorG(d.properties.poverty_rel)
        })
        //Cursor on mouseover
        .style("cursor", function (d) {
            return d.properties.poverty_rel ? "pointer" : '';
        })
        .on("mouseover", drawTooltipG)//Hier überprüfen woher tooltip kommt und g,z,k nehmen
        .on("mouseout", eraseTooltipG)

    drawScalebar(mapProjection, mapID);
    drawLegendG(mapID);

};

//Build Tooltip
function drawTooltipG() {
    let tttar
    window.onresize = this.getBoundingClientRect();
    let bboxG = this.getBoundingClientRect();
    if (this.id.includes('ger')){
        tttar=g;
    } else if (this.id.includes('ken')){
        tttar=k;
    } else if (this.id.includes('zaf')){
        tttar=z;
    }
    tooltipG = d3.select('.mapboxG')
        .append("div")
        .attr("class", "tooltip")
        .attr('id', 'tt')
        .attr("opacity", 0);
    if (document.querySelectorAll(':hover')[document.querySelectorAll(':hover').length - 1].getAttribute('class') == 'adminarea') {
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
                update.html("<p>" + d3.select(this).attr("name") + "</p><p>" + (tttar==0? d3.format(".1f")(d3.select(this).attr("poverty_rel")): tttar==1? d3.format(".1f")(d3.select(this).attr("poverty_rel_f1")): d3.format(".1f")(d3.select(this).attr("poverty_rel_f2"))) + "% </p>")
        )
    }
};

function eraseTooltipG() {
    d3.selectAll('#tt').remove();
};

//Build Vertical-Legend -- https://bl.ocks.org/jkeohan/b8a3a9510036e40d3a4e
function drawLegendG(mapID) {
    //set Title
    //create svg for Legend
    console.log('#' + mapID)
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
            return "Population in poverty [%]";
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
            if (i == 0) {
                return "≤ " + d
            } else if (i == colorG.domain().length - 1) {
                return "≥ " + + d
            } else {
                return colorG.domain()[i - 1] + 1 + " to " + d
            };
        })

    //fill rects by color domain (d) & range (i)                  
    legendG.append("rect")
        //rect on position (5,5) in SVG with the width and height 20            
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 25)
        .attr("height", 25)
        .attr("fill", function (d, i) {
            //return color corresponding to no. of domain // (d-1) for right color, dunno why it's that way
            return colorG(d - 1);
        })

};
d3.selectAll(".colbut").on("click", function () { changeColor(this.id) });
d3.selectAll(".check").on("click", function () { getResult(this.id) });

function changeColor(id) {
    let tar;
    let tarleg;
    let arrleg;
    let txt;
    id.includes('ger') ? tar = '#giniger' : id.includes('ken') ? tar = '#giniken' : id.includes('zaf') ? tar = '#ginizaf' : 'not found'
    id.includes('ger') ? tarleg = '#pger_leg' : id.includes('ken') ? tar = '#pken_leg' : id.includes('zaf') ? tar = '#pzaf_leg' : 'not found'
    id.includes('gini_t') ? b = 0 : id.includes('gini_f1') ? b = 1 : b = 2
    for (let a = 0; a < d3.selectAll(tar)._groups[0].length; a++) {
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
            console.log(tar)
        }
        console.log(b, tar)
        b == 0 ? (colorl = colorG(d3.selectAll(tar)._groups[0][a].__data__.properties.poverty_rel)) : b == 1 ? (colorl = colorG(d3.selectAll(tar)._groups[0][a].__data__.properties.poverty_rel_f1)) : (colorl = colorG(d3.selectAll(tar)._groups[0][a].__data__.properties.poverty_rel_f2));
        d3.selectAll(tar)._groups[0][a].style.fill = colorl
    }
    for (let e = 0; e < d3.selectAll(tarleg)._groups[0].length; e++) {
       tarleg == '#pger_leg'? arrleg=gerC[g] : tarleg == '#pken_leg' ? arrleg=kenC[k] : tarleg == '#pzaf_leg' ? arrleg=zafC[z] : console.log('Not found')
            if (e == 0) {
                txt= "≤ " + arrleg.domain()[0]
            } else if (e == arrleg.domain().length - 1) {
                txt =  "≥ " + + arrleg.domain()[arrleg.domain().length - 1]
            } else {
                txt= arrleg.domain()[e - 1] + 1 + " to " + arrleg.domain()[e]
            };
        d3.selectAll(tarleg)._groups[0][e].textContent = txt
    }
}
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