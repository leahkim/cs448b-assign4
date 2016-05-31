var INIT_DEMAND = 1000000;
var INIT_PAID = 40000;
var selected_x = INIT_PAID / INIT_DEMAND;
var selected_y = predict(selected_x);
var x_text = selected_x < 0.1 ? '' : '% paid = ' + selected_x.toFixed(2);
var y_text = 'rate = ' + selected_y.toFixed(2);

var options = {
    title: 'Ransom Paid - Survival Rate',
    target: '#survival_graph',
    width: 580,
    height: 400,
    disableZoom: true,
    xAxis: {
        label: 'Paid Ransom as % of Demanded',
        domain: [0, 3]
    },
    yAxis: {
        label: 'Survival Rate',
        domain: [0, 1.5]
    },
    data: [{
        fn: '1/(1+exp(-2.9854*(x+0.2892)))',
        derivative: {
            fn: '2x',
        }
    }],
    annotations:
        [{x: selected_x.toFixed(2), text: x_text},
            {y: selected_y.toFixed(2), text: y_text}]
};

function predict(x) {
    return 1/(1 + Math.exp(-2.9854 * (x + 0.2892)));
}


function update_Plot(value) {
    selected_x = value;
    selected_y = predict(selected_x);

    x_text = '% paid = ' + selected_x.toFixed(2);
    y_text = 'rate = ' + selected_y.toFixed(2);

    options.annotations = [{x: selected_x.toFixed(2), text: x_text},
        {y: selected_y.toFixed(2), text: y_text}];

    functionPlot(options);
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

// Initial plot
functionPlot(options);