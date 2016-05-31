var INIT_DEMAND = 1000000;
var INIT_PAID = 40000;
var selected_x = INIT_PAID / INIT_DEMAND;
var selected_y = predict(selected_x);
var NUM_FIG = 100;
var NUMCOL = 20;
var NUMROW = 5;
var CANVAS_W = 1000, CANVAS_H = 500;

var fig_w = 40, fig_h = fig_w * 2;

function predict(x) {
    return 1/(1 + Math.exp(-2.9854 * (x + 0.2892)));
}


function create_data_array(num_survival) {
    // 1. Compute the total number of dead folks
    // 2. Compute each type's live folks --> sort in order
    // should return [{i, j, type}] for each point
    var result = [];
    var total_dead = NUM_FIG - num_survival;
    var total_live = num_survival;
    var i = 0, j = 0;
    while (i < NUMCOL) {
        while (j < NUMROW) {
            if (total_dead > 0) {
                result.push({"i": i, "j": j, "type": "killed"});
                total_dead -= 1;
            } else if (total_live > 0) {
                result.push({"i": i, "j": j, "type": "live"});
                total_live -= 1;
            }
            j++;
        }
        i++;
        j = 0;
    }

    return result;
}

function update_Plot(value) {
    selected_x = value;
    selected_y = predict(selected_x);
    var num_survived = Math.round(selected_y * NUM_FIG);
    console.log("num_sur")

    var group = d3.select("#figGroup");
    var data = create_data_array(num_survived);

    var margin = 3;
    var figures = group.selectAll(".fig").data(data);

     figures
     .attr("xlink:href",function(d) {
     if(d.type == "killed") {
         return "svg/dead/dead_human_red.svg";
         } else {
         return "svg/alive/human.svg";
     }})
     .attr("class", "fig")
     .transition().duration(500)
     .attr("x", function(d) { return d.i * (fig_w + margin); })
     .attr("y", function(d) { return d.j * (fig_h + margin); })
     .attr("transform", "translate (1, 1)")
     .attr("width", fig_w)
     .attr("height", fig_h);

    figures.enter().append("image")
        .attr("xlink:href",function(d) {
            if(d.type == "killed") {
                return "svg/dead/dead_human_red.svg";
            } else {
                return "svg/alive/human.svg";
            }})
        .attr("class", "fig")
        .transition().duration(500)
        .attr("x", function(d) { return d.i * (fig_w + margin); })
        .attr("y", function(d) { return d.j * (fig_h + margin); })
        .attr("transform", "translate (1, 1)")
        .attr("width", fig_w)
        .attr("height", fig_h);

    figures.exit()
        .style("fill-opacity", 1e-6)
        .remove();
}


$(document).ready(function() {
    $("#slider").slider({
        min: 0,
        max: 1500000,
        step: 1000,
        values: [INIT_DEMAND, INIT_PAID],
        slide: function(event, ui) {
            for (var i = 0; i < ui.values.length; ++i) {
                $("input.sliderValue[data-index=" + i + "]").val(ui.values[i]);
            }
            var portion = ui.values[1] / ui.values[0];
            update_Plot(portion);
        }
    });

    var handles = document.getElementsByClassName("ui-slider-handle");
    var i = 0;
    Array.prototype.forEach.call(handles, function(el) {
        // Do stuff here
        if (i == 0) {
            el.id = "demand_handle";
            el.style.background = "red";
            i++;
        }
        else {
            el.id = "pay_handle"
            el.style.background = "blue";
        }
    });
});

/** Pretty formatting the input numbers **/
webshims.setOptions('forms-ext', {
    replaceUI: 'auto',
    types: 'number'
});


webshims.polyfill('forms forms-ext');

var svg = d3.select("#timeline_canvas").attr("width", CANVAS_W).attr("height", CANVAS_H);
svg.append("g").attr("id", "figGroup");

update_Plot(selected_x);