let width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
let height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

let svgAdm = d3.select(".map")
    .append("svg")
    //responsive size
    .attr("viewBox", [0, 0, width, height])
    //dunno seems nice
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("class", "mapbox");

