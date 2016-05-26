var REGION_ARRAY = ["North America", "Central & South America", "Western Europe", "Eastern Europe & Central Asia",
    "Middle East & North Africa", "Sub-Saharan Africa", "South Asia", "Southeast Asia",
    "East Asia", "Australasia & Oceania"];

var TYPE_ARRAY = ["Government", "Private Citizens & Property", "Business", "Military / Police", "Journalists & Media",
    "Educational Institution", "NGO", "Religious Figures/Institutions", "Transit & Infra", "Other"];

var REGION_COLOR = {"North America": "#5254a3", "Central & South America": "#6b6ecf",
    "Western Europe": "#637939", "Eastern Europe & Central Asia": "#8ca252",
    "Middle East & North Africa": "#bd9e39", "Sub-Saharan Africa": "#e7ba52",
    "South Asia": "#ad494a", "Southeast Asia": "#d6616b",
    "East Asia": "#e7969c", "Australasia & Oceania": "#3182bd"};

var TYPE_COLOR = {"Government": "#1f77b4", "Civilians & Properties":"#ff7f0e", "Business": "#2ca02c",
    "Military / Police": "#ff9896", "Journalists & Media": "#9467bd",
    "Educational Institution": "#8c564b", "NGO": "#e377c2",
    "Religious Figures": "#bcbd22", "Transit & Infra": "#17becf", "Other": "#bcbddc"};

var DEAD_COLOR = "#bdbdbd";

/* Configuration for initial drawing of timeline */
var NUMCOL = 20, NUMROW = 5;
var fig_w = 10, fig_h = 20;
var canvas_w = 700, canvas_h = 400;

var raw_data = [{"year": 1970, "data": {
                            "kidnapped": {"total": 200, "region": {"North America": 100, "Western Europe": 60, "Eastern Europe & Central Asia":40},
                                "type": {"Government": 180, "Civilians & Properties": 20}},
                            "killed": {"total": 20, "region": {"North America": 10, "Western Europe": 10, "Eastern Europe & Central Asia":0},
                                "type": {"Government": 15, "Civilians & Properties": 5}}
            }}, {"year": 1990, "data": {
    "kidnapped": {"total": 300, "region": {"North America": 100, "Western Europe": 160, "Eastern Europe & Central Asia":40},
        "type": {"Government": 180, "Civilians & Properties": 120}},
    "killed": {"total": 90, "region": {"North America": 20, "Western Europe": 60, "Eastern Europe & Central Asia":10},
        "type": {"Government": 10, "Civilians & Properties": 80}}
    }}];

var year_selected = 1970;
var mode = "region";

function get_year_data() {
    for (var i in raw_data) {
        if (raw_data[i].year == year_selected) {
            return raw_data[i].data;
        }
    }
    console.log("Error! No data found for year: " + year_selected);
}


function draw_rectangle(group, data) {
    var margin = 3;
    var figures = group.selectAll(".fig").data(data);

    figures.attr("class", function(d) { return d.class; })
        .transition().duration(750)
        .attr("x", function(d) { return d.i * (fig_w + margin); })
        .attr("y", function(d) { return d.j * (fig_h + margin); })
        .attr("fill", function(d) { return d.fill; });

    figures.enter().append("rect")
        .attr("class", function(d) { return d.class; })
        .attr("x", function(d) { return d.i * (fig_w + margin); })
        .attr("y", function(d) { return d.j * (fig_h + margin); })
        .attr("width", fig_w)
        .attr("height", fig_h)
        .attr("fill", function(d) { return d.fill; });

    figures.exit()
        .transition()
        .duration(750)
        .style("fill-opacity", 1e-6)
        .remove()
}


function transform_data(data) {
    //should return [{i, j, color, legend}] for each point
    for (var i = 0; i < NUMCOL; i++) {
        for (var j = 0; j < NUMROW; j++) {

        }
    }
}


function draw_timeline() {
    var data = get_year_data();
    data = transform_data(data);

    var svg = d3.select("#timeline_canvas").attr("width", canvas_w).attr("height", canvas_h);
    var fig_group = svg.append("g").attr("id", "figGroup");

    draw_rectangle(fig_group, data);
}

function recolor_timeline() {

}

draw_timeline();

