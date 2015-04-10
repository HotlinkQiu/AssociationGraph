$(document).ready(initPage);

var width = $(window).width(), height = $(window).height();

var nodes, links, node, link, node_list;

var select_node, focus_node, filter_nodes = [];

var mode = "VMode";

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
		.style("stroke", "#9ecae1");
	
	node = svg.selectAll("g.node")
		.data(nodes);
	
	nodeEnter = node.enter().append("svg:g")
		.attr("class", "node")
		.call(force.drag);
	
	nodeEnter.append("svg:circle")
		.attr("class", "node")
		.attr("r", 9)
		.style("stroke", "#f5f5f5")
		.style("stroke-width", 2.5)
		.style("fill", "#9999ff")
		.on("click", click)
		.on("dblclick", dblclick)
    	.on("mouseover", mouseover())
    	.on("mouseout", mouseout());
	
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

function click(d,index) {
	xPos = d.x;
	yPos = d.y;
	
	if(mode == "VMode") {
		d3.selectAll("circle")
			.style("fill", "#9999ff")
			.style("stroke", "#f5f5f5");
		
		d3.selectAll("text")
			.attr("font-size", 10)
			.attr("font-weight", "normal");
		
		d3.selectAll("line")
			.style("stroke", "#9ecae1");
		
		d3.select(this)
			.style("fill", "#5cb85c")
			.style("stroke", "#f0ad4e");
	
		d3.selectAll("text")
			.filter(function(g, i) { return g.x == d.x; })
			.attr("font-size", 15)
			.attr("font-weight", "bold");
		
		d3.selectAll("line")
			.filter(function(d, i) { return (d.source.x==xPos && d.source.y==yPos || d.target.x==xPos && d.target.y==yPos); })
			.style("stroke", "#d9534f");
	
		select_node = d;
		
	} else if(mode == "SMode") {
		if($.inArray(d.name, filter_nodes) > -1) {
			d3.select(this)
				.style("fill", "#9999ff")
				.style("stroke", "#f5f5f5");
	
			d3.selectAll("text")
				.filter(function(g, i) { return g.x == d.x; })
				.attr("font-size", 10)
				.attr("font-weight", "normal");
			
			var index = $.inArray(d.name, filter_nodes);
			filter_nodes.splice(index, 1);
		} else {
			d3.select(this)
				.style("fill", "#5cb85c")
				.style("stroke", "#f0ad4e");
		
			d3.selectAll("text")
				.filter(function(g, i) { return g.x == d.x; })
				.attr("font-size", 15)
				.attr("font-weight", "bold");

			filter_nodes.push(d.name);
		}
	}
}

function dblclick(d, index) {
	xPos = d.x;
	yPos = d.y;
	
	if(mode == "VMode") {
		if(focus_node != null) {
			d3.selectAll("circle")
				.filter(function(g, i) { return g.name == focus_node.name; })
				.attr("r", 9);
			focus_node.fixed = false;
			tick();
		}
		
		d3.selectAll("line")
			.style("stroke", "#9ecae1");
		
		d3.selectAll("line")
			.filter(function(d, i) { return (d.source.x==xPos && d.source.y==yPos || d.target.x==xPos && d.target.y==yPos); })
			.style("stroke", "#d9534f");
		
		d3.select(this)
			.attr("r", 12);
		
		force.stop();
		d.px = $(window).width() / 2;
		d.py = $(window).height() / 2;
		d.x = $(window).width() / 2;
		d.y = $(window).height() / 2;
		d.fixed = true;
		tick();
		force.resume();
		focus_node = d;
	} else if(mode == "SMode") {
		d3.select(this)
			.style("fill", "#5cb85c")
			.style("stroke", "#f0ad4e");

		d3.selectAll("text")
			.filter(function(g, i) { return g.x == d.x; })
			.attr("font-size", 15)
			.attr("font-weight", "bold");
		
		if($.inArray(d.name, filter_nodes) < 0)
			filter_nodes.push(d.name);
		
		d3.selectAll("line")
		.filter(function(d, i) { return (d.source.x==xPos && d.source.y==yPos || d.target.x==xPos && d.target.y==yPos); })
		.each(function(d) {
			d3.selectAll("circle")
				.filter(function(g, i) { return (d.source.x==g.x && d.source.y==g.y || d.target.x==g.x && d.target.y==g.y); })
				.style("fill", "#5cb85c")
				.style("stroke", "#f0ad4e")
				.each(function(g) {
					d3.selectAll("text")
						.filter(function(t, i) { return t.x == g.x; })
						.attr("font-size", 15)
						.attr("font-weight", "bold");
					if($.inArray(g.name, filter_nodes) < 0)
						filter_nodes.push(g.name);
				});
		});
	}
}

function mouseover() {
	return function(d, i) {
		xPos = d.x;
		yPos = d.y;
		
		var node = d3.select(this)
					.style("fill", "#5cb85c")
					.style("stroke", "#f0ad4e");
		
		var text = d3.selectAll("text")
					.filter(function(g, i) { return g.x == d.x; })
					.attr("font-size", 15)
					.attr("font-weight", "bold");
		
		if(mode == "VMode") {
			var line = d3.selectAll("line")
					.filter(function(d, i) { return (d.source.x==xPos && d.source.y==yPos || d.target.x==xPos && d.target.y==yPos); })
					.style("stroke", "#d9534f");
		}
	};
}

function mouseout() {
	return function(d, i) {
		xPos = d.x;
		yPos = d.y;
		
		if(d == select_node || ($.inArray(d.name, filter_nodes) > -1)) return;
		
		var node = d3.select(this)
					.style("fill", "#9999ff")
					.style("stroke", "#f5f5f5");
		
		var text = d3.selectAll("text")
					.filter(function(g, i) { return g.x == d.x; })
					.attr("font-size", 10)
					.attr("font-weight", "normal");
		
		if(mode == "VMode") {
			var line = d3.selectAll("line")
					.filter(function(d, i) { return (d.source.x==xPos && d.source.y==yPos || d.target.x==xPos && d.target.y==yPos); })
					.style("stroke", "#9ecae1");
		}
	};
}

function changeMode() {
	var btn = document.getElementById("changeMode");
	var value = btn.value;
	if(mode == "VMode") {
		btn.value = "Select Mode";
		mode = "SMode";
		update();
	} else if(mode == "SMode") {
		btn.value = "View Mode";
		mode = "VMode";
		filter_nodes = [];
		update();
	}
}

function update() {
	d3.selectAll("circle")
		.attr("r", 9)
		.style("fill", "#9999ff")
		.style("stroke", "#f5f5f5");
	
	d3.selectAll("text")
		.attr("font-size", 10)
		.attr("font-weight", "normal");
	
	d3.selectAll("line")
		.style("stroke", "#9ecae1");
	
	focus_node.fixed = false;
	select_node = null;
	focus_node = null;
}