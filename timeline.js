/** GLOBAL CONSTANTS**/

var REGION_ARRAY = ["North America", "Central & South America", "Western Europe", "Eastern Europe & Central Asia",
    "Middle East & North Africa", "Sub-Saharan Africa", "South Asia", "Southeast Asia",
    "East Asia", "Oceania"];

var TYPE_ARRAY = ["Government", "Civilians & Properties", "Business", "Military / Police", "Journalists & Media",
    "Educational Institution", "NGO", "Religious Figures", "Transit & Infra", "Other"];

var REGION_COLOR = {"North America": "#5254a3", "Central & South America": "#6b6ecf",
    "Western Europe": "#637939", "Eastern Europe & Central Asia": "#8ca252",
    "Middle East & North Africa": "#bd9e39", "Sub-Saharan Africa": "#e7ba52",
    "South Asia": "#ad494a", "Southeast Asia": "#d6616b",
    "East Asia": "#e7969c", "Oceania": "#3182bd"};

var TYPE_COLOR = {"Government": "#1f77b4", "Civilians & Properties":"#ff7f0e", "Business": "#2ca02c",
    "Military / Police": "#ff9896", "Journalists & Media": "#9467bd",
    "Educational Institution": "#8c564b", "NGO": "#e377c2",
    "Religious Figures": "#bcbd22", "Transit & Infra": "#17becf", "Other": "#bcbddc"};
var HEAT_COLORS = ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#b00026', '#87001D'];

var DEAD_COLOR = "#bfbfbf";

var FIG_WL = 10, FIG_HL = 20;
var FIG_WM = 15, FIG_HM = 30;
var FIG_WH = 40, FIG_HH = 80;

var MEDIUM_CUTOFF = 100;
var HIGH_CUTOFF = 1000;

// Configuration for drawings of timeline
var NUMCOL = 20, NUMROW = 5;
var NUMFIGS = 100;
var CANVAS_W = 1000, CANVAS_H = 450;
var SLIDER_W = CANVAS_W + 60, SLIDER_H = 60;

/** GLOBAL VARIABLES **/
var mode = "region";
var year_selected = 1970;
var selected_data = [];
var fig_w = FIG_WL, fig_h = FIG_HL; // default values

var legend_tip = d3.tip()
    .attr('class', 'legend-tip')
    .offset([-10, 0])
    .html(function(d) {
            return (d.name + "<br/> <strong>Total incidents:</strong> <span style='color:red'>" + d.incident_count + "</span>" + '<br/>'
            + "<strong>Total kidnapped:</strong> <span style='color:red'>" + d.total_kid + "</span>" + '<br/>'
            + "<strong>Total killed:</strong> <span style='color:red'>" + d.total_kill + "</span>");
        }
    );

/** TOY DATA for basic build step **/
var raw_data = [{"year": 1970, "data": {
                            "incident_count": {"total": 16, "region": {"North America": 6, "Western Europe": 5, "Eastern Europe & Central Asia":5},
                                "type": {"Government": 12, "Civilians & Properties": 4}},
                            "kidnapped": {"total": 200, "region": {"North America": 100, "Western Europe": 60, "Eastern Europe & Central Asia":40},
                                "type": {"Government": 180, "Civilians & Properties": 20}},
                            "killed": {"total": 20, "region": {"North America": 10, "Western Europe": 10, "Eastern Europe & Central Asia":0},
                                "type": {"Government": 15, "Civilians & Properties": 5}}
            }}, {"year": 1971, "data":
    {"incident_count": {"total": 120, "region": {}, "type": {}},
    "kidnapped": {"total": 300, "region": {"North America": 100, "Western Europe": 160, "Eastern Europe & Central Asia":40},
        "type": {"Government": 180, "Civilians & Properties": 120}},
    "killed": {"total": 90, "region": {"North America": 20, "Western Europe": 60, "Eastern Europe & Central Asia":10},
        "type": {"Government": 10, "Civilians & Properties": 80}}
    }}];


function set_width_height(num_incidents) {
    if (num_incidents < MEDIUM_CUTOFF) {
        fig_w = FIG_WL, fig_h = FIG_HL;
    } else if (num_incidents < HIGH_CUTOFF) {
        fig_w = Math.round(FIG_WM + (FIG_WH - FIG_WM) * (num_incidents - MEDIUM_CUTOFF) / (HIGH_CUTOFF - MEDIUM_CUTOFF));
        fig_h = Math.round(FIG_HM + (FIG_HH - FIG_HM) * (num_incidents - MEDIUM_CUTOFF) / (HIGH_CUTOFF - MEDIUM_CUTOFF));
    } else {
        fig_w = FIG_WH, fig_h = FIG_HH;
    }
}

function set_year_data() {
    for (var i in raw_data) {
        if (raw_data[i].year == year_selected) {
            selected_data = raw_data[i].data;
            return;
        }
    }

    console.log("Error! No data found for year: " + year_selected);
}


function draw_rectangle(group) {
    var data = selected_data;
    d3.select("#display_info").html("Year: " + year_selected + "<br/> From "
        + data.incident_count.total + " incidents: "
        + data.kidnapped.total + " kidnapped, "
        + data.killed.total + " killed.");
    set_width_height(data.incident_count.total);
    data = transform_data(data);

    var margin = 3;
    var figures = group.selectAll(".fig").data(data);

    figures.attr("class", function(d) { return d.legend; })
        .attr("class", "fig")
        .transition().duration(750)
        .attr("x", function(d) { return d.i * (fig_w + margin); })
        .attr("y", function(d) { return d.j * (fig_h + margin); })
        .attr("width", fig_w)
        .attr("height", fig_h)
        .style("stroke", function(d) { return d.bordercolor; })
        .attr("fill", function(d) { return d.color; })
        .style("stroke-width", "2px");

    figures.enter().append("rect")
        .attr("class", function(d) { return d.legend; })
        .attr("class", "fig")
        .attr("x", function(d) { return d.i * (fig_w + margin); })
        .attr("y", function(d) { return d.j * (fig_h + margin); })
        .attr("width", fig_w)
        .attr("height", fig_h)
        .style("stroke", function(d) { return d.bordercolor; })
        .attr("fill", function(d) { return d.color; })
        .style("stroke-width", "2px");

    figures.exit()
        .transition()
        .duration(750)
        .style("fill-opacity", 1e-6)
        .remove();
}


function transform_data(data) {
    // 1. Compute the total number of dead folks
    // 2. Compute each type's live folks --> sort in order
    // should return [{i, j, color, legend}] for each point
    var result = [];
    var global_kidnap_total = data.kidnapped.total;

    var class_kill = (mode == "region") ? data.killed.region : data.killed.type;
    var class_total = (mode == "region") ? data.kidnapped.region : data.kidnapped.type;
    var class_color = (mode == "region") ? REGION_COLOR : TYPE_COLOR;
    var total_dead = Math.round(NUMFIGS * data.killed.total / global_kidnap_total);
    var live_per_class = [];
    var death_per_class = [];

    for (var key in class_kill) {
        var key_alive = Math.round(NUMFIGS * (class_total[key] - class_kill[key]) / global_kidnap_total);
        var key_dead = Math.round(NUMFIGS * class_kill[key] / global_kidnap_total);
        live_per_class.push([ key , key_alive]);
        death_per_class.push([ key, key_dead]);
    }

    live_per_class.sort(function(a, b) { return b[1] - a[1]; });
    death_per_class.sort(function(a, b) { return b[1] - a[1]; });
    var i = 0, j = 0, n = 0, k = 0;
    while (i < NUMCOL) {
        while (j < NUMROW) {
            if (total_dead > 0) {
                if (n < death_per_class.length && death_per_class[n][1] > 0) {
                    result.push({"i": i, "j": j, "color": DEAD_COLOR, "legend": "killed", "bordercolor": class_color[death_per_class[n][0]]});
                    death_per_class[n][1] -= 1;
                    if (death_per_class[n][1] < 1) {
                        n++;
                    }
                    total_dead -= 1;
                }
            } else {
                if (k < live_per_class.length && live_per_class[k][1] > 0) {
                    live_per_class[k][1] -= 1;
                    result.push({"i": i, "j": j, "color": class_color[live_per_class[k][0]], "legend": live_per_class[k][0], "bordercolor": "none"});
                    if (live_per_class[k][1] < 1) {
                        k++;
                    }
                }
            }
            j++;
        }
        i++;
        j = 0;
    }

    return result;
}


function get_heatmap_data() {
    raw_data.sort(function (a, b) {
        return a.year - b.year;
    });

    var result = []
    for (var i in raw_data) {
        var entry = raw_data[i];
        var death_rate = entry.data.killed.total / entry.data.kidnapped.total;
        result.push({"year": entry.year, "rate": death_rate});
    }

    return result;
}

function draw_heatmap() {
    var data = get_heatmap_data();
    var svg = d3.select("#heatmap_canvas").attr("width", SLIDER_W).attr("height", SLIDER_H);
    var labelGroup = svg.append("g").attr("id", "labelGroup");

    // TODO: finish implementing heatmap drawing and labeling / legending.

    var rect_w = Math.floor(SLIDER_W / 44) - 2, rect_h = rect_w;
    var legend_w = SLIDER_W / HEAT_COLORS.length;

    for (var i = 0 ; i < data.length; i++) {

    }
}

/*
 updated_legend.enter()
 .append("g")
 .each(function(d, i) {
 var g = d3.select(this);
 g.append("rect")
 .attr("x", (Math.floor(i / 2)) * 210)
 .attr("y", (i % 2) * 25)
 .attr("width", 15)
 .attr("height", 15)
 .style("fill", d.color);
 })*/


function draw_timeline() {
    set_year_data();
    draw_heatmap();

    var svg = d3.select("#timeline_canvas").attr("width", CANVAS_W).attr("height", CANVAS_H);
    var fig_group = svg.append("g").attr("id", "figGroup");

    create_legend();
    draw_rectangle(fig_group);
}


function get_legend_data() {
    var name_array = (mode == "region") ? REGION_ARRAY : TYPE_ARRAY;
    var color_map = (mode == "region") ? REGION_COLOR : TYPE_COLOR;
    var type_count = (mode == "region") ? selected_data.incident_count.region : selected_data.incident_count.type;
    var type_kidnap = (mode == "region") ? selected_data.kidnapped.region : selected_data.kidnapped.type;
    var type_kill = (mode == "region") ? selected_data.killed.region : selected_data.killed.type;
    var result = []

    for (var i = 0; i < name_array.length; i++) {
        var name = (name_array[i] == "Eastern Europe & Central Asia") ? "Eastern Eur. & Centr. Asia" : name_array[i];
        if (name_array[i] in type_count) {
            result.push({"order": i, "name": name, "color": color_map[name_array[i]],
                "incident_count": type_count[name_array[i]], "total_kid": type_kidnap[name_array[i]], "total_kill": type_kill[name_array[i]]});
        } else {
            result.push({"order": i, "name": name, "color": color_map[name_array[i]],
                "incident_count": 0, "total_kid": 0, "total_kill": 0});
        }
    }

    return result;
}


function create_legend() {
    var legend_data = get_legend_data();
    legend_data.sort(function(a, b) { return a.order - b.order; });

    var legend = d3.select("#legend")
        .attr("x", 65)
        .attr("y", 0)
        .attr("height", 50)
        .attr("width", CANVAS_W + 100);

    legend.call(legend_tip);

    var updated_legend = legend.selectAll("g").data(legend_data);

    updated_legend.each(function(d, i) {
            var g = d3.select(this);
            g.append("rect")
                .attr("x", (Math.floor(i / 2)) * 170)
                .attr("y", (i % 2) * 25)
                .attr("width", 15)
                .attr("height", 15)
                .style("fill", d.color);

            g.append("text")
                .attr("x", (Math.floor(i / 2)) * 170 + 20)
                .attr("y", (i % 2) * 25 + 12)
                .attr("width", 90)
                .attr("height", 30)
                .text(d.name)
                .attr("font-size", "11pt")
                .attr("font-family", "sans-serif")
                .style("fill", d.color);
        });

    updated_legend.enter()
        .append("g")
        .each(function(d, i) {
            var g = d3.select(this);
            g.append("rect")
                .attr("x", (Math.floor(i / 2)) * 210)
                .attr("y", (i % 2) * 25)
                .attr("width", 15)
                .attr("height", 15)
                .style("fill", d.color);

            g.append("text")
                .attr("x", (Math.floor(i / 2)) * 210 + 20)
                .attr("y", (i % 2) * 25 + 12)
                .attr("width", 90)
                .attr("height", 30)
                .text(d.name)
                .attr("font-size", "11pt")
                .attr("font-family", "sans-serif")
                .style("fill", d.color);
        })
        .on('mouseover', legend_tip.show)
        .on('mouseout', legend_tip.hide);

    updated_legend.exit().remove();
}



draw_timeline();