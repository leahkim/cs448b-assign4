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
    }]
};

function predict(x) {
    return 1/(1 + Math.exp(-2.9854 * (x + 0.2892)));
}

var selected_x = 0.1;
var selected_y = predict(selected_x);

/** update call for element
(function () {
    x_text = 'x = ' + selected_x.toFixed(3);
    y_text = 'y = ' + selected_y.toFixed(3);
    options.annotations = [{x: selected_x.toFixed(3), text: x_text},
                            {y: selected_y.toFixed(3), text: y_text}];
    functionPlot(options)
})
**/

x_text = selected_x < 0.1 ? '' : '% paid = ' + selected_x.toFixed(2);
y_text = 'rate = ' + selected_y.toFixed(2);
options.annotations = [{x: selected_x.toFixed(2), text: x_text},
    {y: selected_y.toFixed(2), text: y_text}];

// Initial plot
functionPlot(options);