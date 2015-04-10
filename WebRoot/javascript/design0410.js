$(document).ready(initPage);

var DBLUE = "#0099cc", PBLUE = "#99cccc";
var GRAY = "#cccccc", YELLOW = "#ffff00", RED = "#ffcccc", WHITE = "#f5f5f5";

var width = $(window).width(), height = $(window).height();

var nodes, links, node, link, node_list;

var select_node, focus_node;

var force = d3.layout.force()
	.charge(-1200)
	.linkDistance(80)
	.on("tick", tick)
	.size([width, height]);

var svg = d3.select("body").append("svg:svg")
	.attr("width", width)
	.attr("height", height);

function initPage() {
	var file = "../json/demo.json";
	readJson(file);
}

function readJson(file) {
	d3.json(file, function(json) {
		nodes = json.nodes;
		links = json.links;
		
		draw();
	});
}

function draw() {
	force
		.nodes(nodes)
		.links(links)
		.start();

	link = svg.selectAll("line.link")
		.data(links)
		.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", function(d) { return Math.sqrt(d.value); })
		.style("stroke", GRAY);
	
	node = svg.selectAll("g.node")
		.data(nodes);
	
	nodeEnter = node.enter().append("svg:g")
		.attr("class", "node")
		.call(force.drag);
	
	nodeEnter.append("svg:circle")
		.attr("class", "node")
		.attr("r", 9)
		.style("stroke", WHITE)
		.style("stroke-width", 2.5)
		.style("fill", PBLUE)
		.on("click", click);
	
	nodeEnter.append("svg:text")
		.attr("class", "nodetext")
		.attr("x", 10)
		.attr("y", 1)
		.attr("font-size", 10)
		.text(function(d) { return d.name; });
}

function tick() {
	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
	link.attr("x1", function(d) { return d.source.x; })
		.attr("y1", function(d) { return d.source.y; })
		.attr("x2", function(d) { return d.target.x; })
		.attr("y2", function(d) { return d.target.y; });     
}

function click(d, index) {
	if(select_node != d) {
		d3.selectAll("circle")
			.style("fill", PBLUE)
			.style("stroke", WHITE);
		
		d3.selectAll("text")
			.attr("font-size", 10)
			.attr("font-weight", "normal");
		
		if(focus_node != null) {
			d3.selectAll("circle")
				.filter(function(g, i) { return g.name == focus_node.name; })
				.style("fill", YELLOW)
				.style("stroke", DBLUE);
		}
		
		d3.select(this)
			.style("fill", YELLOW)
			.style("stroke", DBLUE);
		
		d3.selectAll("text")
			.filter(function(g, i) { return g.x == d.x; })
			.attr("font-size", 15)
			.attr("font-weight", "bold");
		
		select_node = d;
	} else {
		if(focus_node != null) {
			d3.selectAll("circle")
				.filter(function(g, i) { return g.name == focus_node.name; })
				.attr("r", 9);
			focus_node.fixed = false;
			tick();
		}
		
		d3.select(this)
			.attr("r", 10);
		
		force.stop();
		d.px = $(window).width() / 2;
		d.py = $(window).height() / 2;
		d.x = $(window).width() / 2;
		d.y = $(window).height() / 2;
		d.fixed = true;
		tick();
		force.resume();
		
		focus_node = d;
	}
}