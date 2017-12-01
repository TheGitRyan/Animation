var gridHeight = 4;
var gridWidth = 4;
var rectHeight = 50;
var rectWidth = 50;

//colors
var start = '#86dc71';
var goal = '#ED4337';
var empty = '#fff';
var wall = '#8c8c8c';
var explored = '#94b6c0';
var visited = '#BAE4F0';
var onPath = '#baebae';

function gridData(numRows, numCols) {
	var data = new Array();
	var xpos = 1;
	var ypos = 1;
	var width = rectWidth;
	var height = rectHeight;
	var click = 0;

	for (var row = 0; row < numRows; row++) {
		data.push( new Array() );

		for (var column = 0; column < numCols; column++) {
			data[row].push({
				x: xpos,
				y: ypos,
				width: width,
				height: height,
				click: click,
				x_center: xpos + (width/2),
				y_center: ypos + (height/2)
			})
			xpos += width;
		}
		xpos = 1;
		ypos += height;
	}
	return data;
}

var gridData = gridData(gridHeight, gridWidth);

var grid = d3.select("#grid")
	.append("svg")
	.attr("width", rectWidth * gridWidth + 10 + "px")
	.attr("height", rectHeight * gridHeight + 10 + "px");

var row = grid.selectAll(".row")
	.data(gridData)
	.enter().append("g")
	.attr("class", "row");

//append this g after the rows, so that paths will be
//drawn on top of squares in the future
grid.append('g').attr('id', 'paths');

var column = row.selectAll(".square")
	.data(function(d) { return d; })
	.enter().append("rect")
	.attr("class","square")
	.attr("x", function(d) { return d.x; })
	.attr("y", function(d) { return d.y; })
	.attr("width", function(d) { return d.width; })
	.attr("height", function(d) { return d.height; })
	.attr("x_center", function(d) { return d.x_center;})
	.attr("y_center", function(d) { return d.y_center;})
	.attr('id', function(d) { return 'idx_' + ((d.y - 1) / rectHeight)+ '_' + ((d.x - 1) / rectWidth); })
	.style("fill", "#fff")
	.style("stroke", "#222")

 //helper function to get the rectangle in our grid at a specific index
function getRect(i,j){
	return d3.select('#idx_' + i + '_' + j);
}

//accessor methods for square center coordinates
function getXCenter(rect) { return rect.data()[0].x_center; }
function getYCenter(rect) { return rect.data()[0].y_center; }

/********************** STACK IMPLEMENTATION *************************/

function Stack() {
	this.array = new Array();
	this.push = function(val) {
		this.array.push(val);
	}
	this.pop = function() {
		if(this.array.length > 0) {
			return this.array.pop();
		}
	}
	this.getLength = function() {
		return this.array.length;
	}
}

function Queue() {
	  this.array = new Array();
	  this.push = function(val) {
	      this.array.push(val);
	  }
	  this.pop = function() {
	      if(this.array.length > 0) {
	          return this.array.shift();
	      }
	  }
	  this.getLength = function() {
	      return this.array.length;
	  }
}


/*************************** ANIMATION ************************/
//timing controls
var loop_time = 1500;
var line_time = 500;
var line_remove = 2*line_time;
var buffer = 10;


function animate(){
	getRect(0,0).style('fill', visited);

	var s = new stackAnimator();
	var seen = [[0,0]]

	var loopID = setInterval(dfsLoop, loop_time)
	s.animatePush([0,0]);
	function dfsLoop(row, col){
		if(!s.getLength() == 0){
			var node = s.animatePop();

			seen.push(node);
			var i = node[0];
			var j = node[1];
			var cur = getRect(i,j);

			var successors = connectAdjacent(i,j,seen);
			successors.forEach(function(x){
				s.animatePush(x);
			});

			setTimeout(function() {
				d3.selectAll('path').remove();
			}, line_remove);


			cur.style('fill', explored);
			j++;
		}
	}

	function connectAdjacent(i,j,seen){
		var cur = getRect(i,j);
		var successors = [];
		var deltas = [[i-1,j], [i,j-1], [i+1,j], [i,j+1]]

		function inbounds(i,j) { return 0 <= i && i < gridHeight && 0 <= j && j < gridWidth; }

		deltas.forEach(function(delta) {
			if(inbounds(delta[0], delta[1]) && !contains(seen,delta)){
				var sq = getRect(delta[0],delta[1]);
				drawLine(cur,sq);
				setTimeout(function() {
					sq.style('fill', visited);
				}, line_time + buffer);
				successors.push(delta);
				seen.push(delta);
			}
		});
		return successors;
	}

}
animate();



function contains(arr, coord){
	for(var i = 0; i < arr.length; i++){
		var x = arr[i];
		if(x[0] == coord[0] && x[1] == coord[1]){
			return true;
		}
	};
	return false;
}

//drawing lines from rectangle to rectangle
function drawLine(rect1, rect2) {

	var line = d3.line();
	var nullData = [
		[getXCenter(rect1), getYCenter(rect1)],
		[getXCenter(rect1), getYCenter(rect1)]
	]

	var data = [
				[getXCenter(rect1), getYCenter(rect1)],
				[getXCenter(rect2), getYCenter(rect2)]
			   ]
	d3.select('#paths')
	  .append('path')
	  .attr('d', line(nullData))
	  .attr('stroke-width', '2px')
	  .attr('stroke',  'black')
	  .transition()
	  .duration(line_time)
	  .attr('d', line(data));
}

/***************** STACK ANIMATION ************************/

d3.select('#stack')
  .append('svg')
	.attr("width", rectWidth * gridWidth * gridHeight + 10 + "px")
  .append('g')
  .attr('padding', '50px');



function stackAnimator() {
	this.stack  = new Queue();

	this.itemWidth = 50;
	this.itemHeight = 50;


	//takes in a tuple [row,col] which get
	this.animatePush = function(t) {
		var offSet = this.stack.getLength() * this.itemWidth;
		var x = offSet + 1;
		var y = 1;

		//append new a g element which we will add a rect and text too
		d3.select('#stack').select('g')
		  .append('g')
		  .attr('id', 's_' + this.stack.getLength());

	  //append the rectangle into the g DOM wrapper
		d3.select('#s_' + this.stack.getLength())
		  .append('rect')
		  .attr('x', x)
		  .attr('y', y)
		  .attr('width', this.itemWidth)
		  .attr('height', this.itemHeight)
		  .style("fill", visited)
		  .style("stroke", "#222");

		//append the text on top of the rectangle into the g DOM element
		d3.select('#s_' + this.stack.getLength())
		  .append('text')
			.attr('x',  x + 7)
			.attr('y', this.itemHeight / 2)
			.attr('dy', '.35em')
			.text('(' + t[0] + ', ' + t[1] + ')');



		//update the internal stack
		this.stack.push(t);
	}

	this.animatePop = function() {
		//add in the animations for popping an item off of the stack
		var x = this.stack.pop();
		d3.select('#s_' + this.stack.getLength()).remove();
		return x;
	}

	this.getLength = function() {
		return this.stack.getLength();
	}

	this.get =  function(i) {
		return d3.select('#s_' + i);
	}
}
