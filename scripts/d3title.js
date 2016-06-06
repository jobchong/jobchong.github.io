var alphabet = ["fun", "powerful", "verifiable", "formal", "groundbreaking", "compiled", "new"]
var start = ["new"]

var width = 400,
    height = 100;

var svg = d3.select("#d3items").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(32," + (height / 2) + ")");

function update(data) {

  // DATA JOIN
  // Join new data with old elements, if any.
  var text = svg.selectAll("text")
      .data(data, function(d) { return d; });

  // UPDATE
  // Update old elements as needed.
  text.attr("class", "update")
    .transition()
      .duration(750)
	.attr("x", function(d, i) { return i; });

  // ENTER
  // Create new elements as needed.
  text.enter().append("text")
      .attr("class", "enter")
      .attr("dy", ".35em")
      .attr("x", +60)
	.attr("y", -5)
      .style("fill-opacity", 1e-6)
      .text(function(d) { return d; })
    .transition()
      .duration(750)
	.attr("x", -32)
	.style("fill-opacity", 1);

  // EXIT
  // Remove old elements as needed.
  text.exit()
      .attr("class", "exit")
    .transition()
      .duration(750)
      .attr("y", -20)
      .style("fill-opacity", 1e-6)
      .remove();
}

// The initial display.
update(start);

// Grab a random sample of letters from the alphabet, in alphabetical order.
setInterval(function() {
    update(d3.shuffle(alphabet).slice(0,1))
}, 1500);
