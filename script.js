var gridHeight = 3;
var gridWidth = 3;
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

	
/*************************** ANIMATION ************************/

function animate(){
	getRect(0,0).style('fill', visited);
	
	var s = new Stack();
	var seen = []
	
	//var loopID = setInterval(dfsLoop, '1500')
	s.push([0,0]);
	function dfsLoop(row, col){
		if(!s.getLength() == 0){
			var node = s.pop();
			seen.push(node);
			var i = node[0];
			var j = node[1];
			var cur = getRect(i,j);

			var successors = connectAdjacent(i,j,seen);
			successors.forEach(function(x){
				if(!contains(seen, x)){
					s.push(x); 
				}
			})
			
			//add animation of stack update
			setTimeout(function() {
				d3.selectAll('path').remove();
			}, '1000')


			cur.style('fill', explored);
			j++;
		}
	}
		
	function connectAdjacent(i,j,seen){
		var cur = getRect(i,j);
		var successors = [];
		
		//look up
		if(i-1 >= 0) {
			var sq = getRect(i-1,j);
			drawLine(cur,sq);
			if(!contains(seen, [i-1,j])){
				sq.style('fill', visited);
			}
			successors.push([i-1,j]);
		}
		//look left
		if(j-1 >= 0) {
			var sq = getRect(i,j-1);
			drawLine(cur,sq);
			if(!contains(seen, [i,j-1])){
				sq.style('fill', visited);
			}
			successors.push([i,j-1]);
		}
		//look down
		if (i + 1 < gridHeight) {
			var sq = getRect(i+1,j);
			drawLine(cur,sq);
			if(!contains(seen, [i+1,j])){
				sq.style('fill', visited);
			}
			successors.push([i+1,j]);
			
		}
		//look right
		if(j+1 < gridWidth) {
			var sq = getRect(i,j+1);
			drawLine(cur, sq);
			if(!contains(seen, [i,j+1])){
				sq.style('fill', visited);
			}
			successors.push([i,j+1]);
		}
		return successors;
	}
	
}
animate();



function contains(arr, coord){
	console.log('coord')
	console.log(coord);
	console.log('x');
	arr.forEach(function(x){
		console.log(x)
		if(x[0] == coord[0] && x[1] == coord[1]){
			return true;
		}
	});
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
	  .duration(500)
	  .attr('d', line(data));
}

/***************** STACK ANIMATION ************************/

function stackItem(x,y,width,height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height= height;
}


d3.select('#stack')
  .append('g');




