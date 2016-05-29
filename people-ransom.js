function asked(source, value) {
	console.log("ransom asked: " + value);
}

function paid(source, value) {
	console.log("ransom paid: " + value);
}

function init() {
	d3.select("#money_asked").on("input", function() {
        console.log("money asked");
    });

	d3.select("#money_paid").on("input", function() {
		console.log("money paid");
  		paid(this, this.value);
	});
	console.log("initialized");
}

init();