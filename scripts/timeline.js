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

var HEAT_COLORS = ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026', '#4d0017'];

var FIGURE_MAP = {"North America": "NA.svg", "Central & South America": "centralAm.svg",
    "Western Europe": "WEur.svg", "Eastern Europe & Central Asia": "EEur.svg",
    "Middle East & North Africa": "MENA.svg", "Sub-Saharan Africa": "SSA.svg",
    "South Asia": "SouthAsia.svg", "Southeast Asia": "SEAsia.svg",
    "East Asia": "EAsia.svg", "Oceania": "Oceania.svg",
    "Government": "govt.svg", "Civilians & Properties":"civil.svg", "Business": "biz.svg",
    "Military / Police": "military.svg", "Journalists & Media": "media.svg",
    "Educational Institution": "edu.svg", "NGO": "ngo.svg", "Religious Figures": "religion.svg",
    "Transit & Infra": "infra.svg", "Other": "other.svg"};

var FIG_MINW = 20, FIG_MINH = 40;
var FIG_MAXW = 45, FIG_MAXH = 90;

// Configuration for drawings of timeline
var NUMCOL = 20, NUMROW = 5;
var NUMFIGS = 100;
var CANVAS_W = 1000, CANVAS_H = 500;
var SLIDER_W = CANVAS_W, SLIDER_H = 80;

/** GLOBAL VARIABLES **/
var mode = "region";
var year_selected = 1970;
var selected_data = [];
var fig_w = FIG_MINW, fig_h = FIG_MINH; // default values

var legend_tip = d3.tip()
    .attr('class', 'legend-tip')
    .offset([-10, 0])
    .html(function(d) {
            return (d.name + "<br/> <strong>Total incidents:</strong> <span stylesheets='color:red'>" + d.incident_count + "</span>" + '<br/>'
            + "<strong>Total kidnapped:</strong> <span stylesheets='color:red'>" + d.total_kid + "</span>" + '<br/>'
            + "<strong>Total killed:</strong> <span stylesheets='color:red'>" + d.total_kill + "</span>");
        }
    );

var widthScale = null;
var heightScale = null;

function set_scales() {
    var kidnap_vals = [];
    if (raw_data == null) {
        console.log("You're trying to access empty data set.");
    } else {
        for (var i in raw_data) {
            kidnap_vals.push(raw_data[i].data.kidnapped.total);
        }
        var min = d3.min(kidnap_vals);
        var max = d3.max(kidnap_vals);

        widthScale = d3.scale.pow().exponent(.5)
            .domain([min, max])
            .range([FIG_MINW, FIG_MAXW]);

        heightScale = d3.scale.pow().exponent(.5)
            .domain([min, max])
            .range([FIG_MINH,FIG_MAXH]);
    }
}

function load_data(data_fn, _callback) {
    d3.json(data_fn, function(error, json_data) {
        if (error) return console.warn(error);
        raw_data = json_data;
        _callback();
    });
}

function set_width_height(num_kidnapped) {
    fig_w = widthScale(num_kidnapped), fig_h = heightScale(num_kidnapped);
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

function toggle_type(is_region) {
    mode = is_region ? "region" : "type";
}


function update_figure_legend(data) {
    labelGroup = d3.select("#figLabel");
    textGroup = d3.select("#infoText");

    var fig = labelGroup.selectAll(".fig_legend_image").data(data);
    var textLabel = textGroup.selectAll(".fig_legend_text").data(data);

    fig
        .transition().duration(500)
        .attr("width", fig_w)
        .attr("height", fig_h)
        .attr("class", "fig_legend_image");

    textLabel
        .transition().duration(500)
        .text(function(d) {
        return "= " + d.numPerFig + " people";
    })
        .attr("class", "fig_legend_text")
        .attr("x", 0)
        .attr("y", fig_h + 15);

    fig.enter().append("image")
        .attr("xlink:href", "svg/alive/human.svg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", fig_w)
        .attr("height", fig_h)
        .attr("class", "fig_legend_image");

    textLabel.enter().append("text")
        .text(function(d) {
        return "= " + d.numPerFig + " people";
    })
        .attr("x", 0)
        .attr("y", fig_h + 15)
        .attr("font-size", "10px")
        .style("fill", "#808080")
        .attr("class", "fig_legend_text");

    fig.exit().remove();
    textLabel.exit().remove();
}


function draw_rectangle() {
    var group = d3.select("#figGroup");
    var data = selected_data;
    d3.select("#display_info").html("In " + year_selected + ", there were "
        + data.incident_count.total + " incidents. "
        + data.kidnapped.total + " were kidnapped, "
        + data.killed.total + " were killed.");
    set_width_height(data.kidnapped.total);

    var figlegdata = [{"numPerFig": (data.kidnapped.total / NUMFIGS).toFixed(2)}];
    update_figure_legend(figlegdata);

    data = transform_data(data);

    var margin = 3;
    var figures = group.selectAll(".fig").data(data);

    figures
        .attr("xlink:href",function(d) { return d.source; })
        .attr("class", function(d) { return d.legend; })
        .attr("class", "fig")
        .transition().duration(500)
        .attr("x", function(d) { return d.i * (fig_w + margin); })
        .attr("y", function(d) { return d.j * (fig_h + margin); })
        .attr("transform", "translate (1, 1)")
        .attr("width", fig_w)
        .attr("height", fig_h);

    figures.enter().append("image")
        .attr("xlink:href",function(d) { return d.source; })
        .attr("class", function(d) { return d.legend; })
        .attr("class", "fig")
        .attr("x", function(d) { return d.i * (fig_w + margin); })
        .attr("y", function(d) { return d.j * (fig_h + margin); })
        .attr("transform", "translate (1, 1)")
        .attr("width", fig_w)
        .attr("height", fig_h);

    figures.exit()
        .style("fill-opacity", 1e-6)
        .remove();
}

function sum_values(tdarray) {
    var total = 0;
    for (var i = 0; i < tdarray.length; i++) {
        total += tdarray[i][1];
    }
    return total;
}

function fill_gaps(estimate, standard) {
    var sum = sum_values(estimate);
    var diff = standard - sum;
    var index = 0;
    while (diff > 0) {
        estimate[index % estimate.length][1] += 1;
        diff -= 1;
        index += 1;
    }
    return estimate;
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
    var total_live = NUMFIGS - total_dead;
    var live_per_class = [];
    var death_per_class = [];


    for (var key in class_kill) {
        var key_dead = Math.round(NUMFIGS * class_kill[key] / global_kidnap_total);
        var key_alive = Math.round(NUMFIGS * class_total[key] / global_kidnap_total) - key_dead;

        live_per_class.push([ key , key_alive]);
        death_per_class.push([ key, key_dead]);
    }

    live_per_class.sort(function(a, b) { return b[1] - a[1]; });
    death_per_class.sort(function(a, b) { return b[1] - a[1]; });

    live_per_class = fill_gaps(live_per_class, total_live);
    death_per_class = fill_gaps(death_per_class, total_dead);

    var i = 0, j = 0, n = 0, k = 0;
    while (i < NUMCOL) {
        while (j < NUMROW) {
            if (total_dead > 0) {
                if (n < death_per_class.length && death_per_class[n][1] > 0) {
                    var source = "svg/dead/" + FIGURE_MAP[death_per_class[n][0]];
                    result.push({"i": i, "j": j, "source": source, "legend": "killed"});
                    death_per_class[n][1] -= 1;
                    if (death_per_class[n][1] < 1) {
                        n++;
                    }
                }
                total_dead -= 1;
            } else {
                if (k < live_per_class.length && live_per_class[k][1] > 0) {
                    live_per_class[k][1] -= 1;
                    var source = "svg/alive/" +  FIGURE_MAP[death_per_class[k][0]];
                    result.push({"i": i, "j": j, "source": source, "legend": live_per_class[k][0]});
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
    var barGroup = svg.append("g").attr("id", "barGroup");

    var rect_w = Math.floor(SLIDER_W / data.length), rect_h = rect_w;
    var legend_w = SLIDER_W / HEAT_COLORS.length;

    labelGroup.selectAll().data(data)
        .enter()
        .append("text")
        .text(function(d) { return (d.year % 100); })
        .attr("x", function(d, i) { return i * rect_w; })
        .attr("y", 0)
        .attr("dx", "1.3em")
        .attr("dy", "1em")
        .attr("font-size", "8px")
        .attr("class", "heatmap_label")
        .style("text-anchor", "middle")
        .style("fill", "#808080");

    var colorScale = d3.scale.quantile()
        .domain([0, d3.max(data, function (d) { return d.rate; })])
        .range(HEAT_COLORS);

    var cards = barGroup.selectAll("rect").data(data);

    cards.enter()
        .append("rect")
        .attr("class", "heatmap")
        .attr("x", function(d, i) { return i * rect_w; })
        .attr("y", 10)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("width", rect_w)
        .attr("height", rect_h)
        .style("fill", function(d) { return colorScale(d.rate); })
        .on('mouseover', function(d) {
            d3.select(this)
                .attr("height", rect_h * 1.4);
            year_selected = d.year;
            set_year_data();
            update_legtip();
            var throttled_function = _.throttle(draw_rectangle, 100)
            throttled_function();
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("width", rect_w)
                .attr("height", rect_h);
        });

    cards.exit().remove();

    var blGroup = svg.append("g").attr("id", "blGroup");


    var legend = blGroup.selectAll(".bar_legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    legend.enter()
        .append("g")
        .attr("class", "bar_legend")
        .each(function (d, i) {
            var g = d3.select(this);
            g.append("rect")
                .attr("x", legend_w * i)
                .attr("y", rect_h + 25)
                .attr("width", legend_w)
                .attr("height", rect_h / 2)
                .style("fill", HEAT_COLORS[i]);

            g.append("text")
                .attr("class", "mono")
                .text(function(d) {
                    if (d == 0) {
                        return "death rate ≥ " + d.toFixed(0);
                    } else {
                        return "≥ " + d.toFixed(2);
                    }
                })
                .attr("x", legend_w * i)
                .attr("y", rect_h + 45);
        });

    legend.exit().remove();
}



function draw_size_scale() {
    var legend_height = "20px";
    var svgContainer = d3.select("#count_legend").attr("width", CANVAS_W).attr("height", legend_height);
    var tickGroup = [10, 50, 100, 500, 1000, 5000, 10000];
    var startPt = 8;
    var yTop = 4, yBottom = yTop + 8, yMid = yTop + (yBottom - yTop) / 2;

    var horizontal = svgContainer.append("line")
        .attr("x1", startPt).attr("y1", yMid)
        .attr("x2", CANVAS_W).attr("y2", yMid)
        .attr("stroke-width", 1)
        .attr("stroke", "#808080");

    svgContainer.append("text")
        .text("Number of people kidnapped: ")
        .attr("x", startPt)
        .attr("y", yBottom + 7)
        .attr("font-size", "7pt")
        .attr("fill", "#808080");

    for (var i in tickGroup) {
        var width = (widthScale(tickGroup[i]) + 2.5) * 20;
        svgContainer.append("line")
            .attr("x1", startPt + width).attr("y1", yTop)
            .attr("x2", startPt + width).attr("y2", yBottom)
            .attr("stroke-width", 1)
            .attr("stroke", "#808080");

        svgContainer.append("text")
            .text(tickGroup[i])
            .attr("x", startPt + width - 6)
            .attr("y", yBottom + 8)
            .attr("font-size", "7pt")
            .attr("fill", "#808080");
    }
}

function draw_timeline() {
    set_scales();
    set_year_data();

    draw_size_scale();
    draw_heatmap();

    var svg = d3.select("#timeline_canvas").attr("width", CANVAS_W).attr("height", CANVAS_H);
    svg.append("g").attr("id", "figGroup");
    var svg2 = d3.select("#figLegend_canvas");
    svg2.append("g").attr("id", "figLabel");
    svg2.append("g").attr("id", "infoText");

    create_legend();
    draw_rectangle();
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


function update_legtip() {
    var legend_data = get_legend_data();
    legend_data.sort(function (a, b) {
        return a.order - b.order;
    });

    var legend = d3.select("#legend")
        .attr("x", 65)
        .attr("y", 0)
        .attr("height", 50)
        .attr("width", CANVAS_W + 100);

    var legend_item = legend.selectAll(".legend_item").data(legend_data);

    legend.call(legend_tip);

    return legend_item;
}

function create_legend() {
    var legend_item = update_legtip();

    legend_item.each(function(d, i) {
        var g = d3.select(this);
        g.select("rect")
            .attr("x", (Math.floor(i / 2)) * 215)
            .attr("y", (i % 2) * 25)
            .attr("width", 15)
            .attr("height", 15)
            .style("fill", d.color);

        g.select("text")
            .attr("x", (Math.floor(i / 2)) * 215 + 20)
            .attr("y", (i % 2) * 25 + 12)
            .attr("width", 90)
            .attr("height", 30)
            .text(d.name)
            .attr("font-size", "11pt")
            .attr("font-family", "sans-serif")
            .style("fill", d.color);
    });

    legend_item.enter()
        .append("g")
        .attr("class", "legend_item")
        .each(function (d, i) {
            var g = d3.select(this);
            g.append("rect")
                .attr("x", (Math.floor(i / 2)) * 215)
                .attr("y", (i % 2) * 25)
                .attr("width", 15)
                .attr("height", 15)
                .style("fill", d.color);

            g.append("text")
                .attr("x", (Math.floor(i / 2)) * 215 + 20)
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

    legend_item.exit().remove();
}



load_data("Data/kidnap_year_summary.json", draw_timeline);
