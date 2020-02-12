/*
	CreativeJavaScriptSuite, 2005, Lukasz Strozek, strozek@gmail.com
	This file contains routines to handle grid objects (grid, slider, link)
 */

// Create a new TABLE element of a given width and height and a given number of columns and rows.
// The grid color can also be specified.  The element is returned.  Extra properties are set:
// .numRows -- the number of rows
// .numCells -- the number of cells
// .cellWidth -- the width of one cell
// .cellHeight -- the height of one cell
function addGrid(where, cellWidth, cellHeight, numCols, numRows, color)
{
	// TODO: make sure cellHeight can take arbitrarily small values.  Right now it doesn't
	var table = document.createElement('table');
	table.border = 1;
	table.style.borderWidth = 0;
	table.style.borderRightWidth = 1;
	table.style.borderBottomWidth = 1;
	table.style.overflow = 'hidden';
	table.cellPadding = 0;
	table.cellSpacing = 0;
	table.borderColor = color;
	where.appendChild(table);
	for(var y=0; y<numRows; ++y)
	{
		var row = table.insertRow(y);
		row.style.height = cellHeight;
		row.style.overflow = 'hidden';
		for(var x=0; x<numCols; ++x)
		{
			var cell = row.insertCell(x);
			cell.style.width = cellWidth-1;
			cell.style.height = cellHeight;
			cell.style.borderWidth = 1;
			cell.style.borderBottomWidth = 0;
			cell.style.borderRightWidth = 0;
			cell.style.overflow = 'hidden';
			cell.innerHTML = '&nbsp;'
		}
	}
	table.numRows = numRows;
	table.numCols = numCols;
	table.cellWidth = cellWidth;
	table.cellHeight = cellHeight;
	return table;
}

// Create a new SPAN element of a given width and height, attached to a specific grid.
// left and top are the offset values from the top left corner of the grid.  The slider can have arbitrary
// style (given in sliderStyle).  The element is returned
function addSlider(grid, sliderStyle, left, top)
{
	var slider = document.createElement('span');
	document.body.appendChild(slider);
	slider.style.position = 'absolute';
	slider.style.left = getOffsetLeft(grid) + left - Math.floor(parseInt(sliderStyle.width)/2);
	slider.style.top = getOffsetTop(grid) + top - Math.floor(parseInt(sliderStyle.height)/2);
	slider.innerHTML = '&nbsp;';
	slider.style.overflow = 'hidden';
	slider.id = uniqueId++;
	for(property in sliderStyle)
	{
		slider.style[property] = sliderStyle[property];
	}
	return slider;
}

// Create a new set of sliders on a grid and links between them.  sliderPosition is a function
// taking two arguments: the grid, and the index, and returning the position (.x, .y) of the i-th
// slider.  The sliders are also limited at this time.  This function returns a sliderSet structure, with:
// .numSliders -- the number of sliders in the set
// .numLinks -- the number of pixels per link
// .grid -- the attached grid
// .pixel[] -- the array of links
// .slider[] -- the array of sliders
//    .id -- set to 'node'+i
//    .ofsX -- set to the x coordinate of the center
//    .ofsY -- set to the y coordinate of the center
// .sliderLimit[] -- the array of limits
//    .x1, .y1, .x2, .y2
function addSliderSet(grid, numSliders, numLinks, sliderStyle, pixelStyle, sliderPosition, sliderProperties)
{
	sliderSet = new Array();
	sliderSet.numSliders = numSliders;
	sliderSet.numLinks = numLinks;
	sliderSet.grid = grid;

	sliderSet.pixel = new Array();
	for(var i=0; i<numLinks*(numSliders-1); ++i)
	{
		sliderSet.pixel[i] = addSlider(grid, pixelStyle, 0, 0);
	}
	
	sliderSet.slider = new Array();
	for(var i=0; i<numSliders; ++i)
	{
		var retval = sliderPosition(grid, i);
		sliderSet.slider[i] = addSlider(grid, sliderStyle, retval.x, retval.y);
		sliderSet.slider[i].id = 'node'+i;
		sliderSet.slider[i].ofsX = getOffsetLeft(sliderSet.slider[i])+Math.floor(parseInt(sliderSet.slider[i].style.width)/2);
		sliderSet.slider[i].ofsY = getOffsetTop(sliderSet.slider[i])+Math.floor(parseInt(sliderSet.slider[i].style.height)/2);
	}
	interpolateLinks(sliderSet, 0, sliderSet.numSliders-1);
	sliderProperties.onMoveHandler = function(animDragged) {realtimeInterpolate(sliderSet, animDragged);}
	sliderProperties.onDropHandler = function() {updateSliderLimits(sliderSet);}
	limitSliderSet(sliderSet, sliderProperties);
	return sliderSet;
}

// Add limits to the sliderSet.  The property updated is
// .sliderLimit[] -- the array of limits
//    .x1, .y1, .x2, .y2 -- the limit coordinates
function limitSliderSet(sliderSet, sliderProperties)
{
	sliderSet.sliderLimit = new Array();
	for(var i=0; i<sliderSet.numSliders; ++i)
	{
		sliderSet.sliderLimit[i] = new Array();
		sliderSet.sliderLimit[i].y1 = getOffsetTop(sliderSet.grid);
		sliderSet.sliderLimit[i].y2 = getOffsetTop(sliderSet.grid) + sliderSet.grid.cellHeight*sliderSet.grid.numRows;
		if(i==0)
		{
			sliderSet.sliderLimit[i].x1 = getOffsetLeft(sliderSet.grid);
			sliderSet.sliderLimit[i].x2 = getOffsetLeft(sliderSet.grid);
		}
		else if(i==sliderSet.numSliders-1)
		{
			sliderSet.sliderLimit[i].x1 = getOffsetLeft(sliderSet.grid) + sliderSet.grid.cellWidth*sliderSet.grid.numCols;
			sliderSet.sliderLimit[i].x2 = getOffsetLeft(sliderSet.grid) + sliderSet.grid.cellWidth*sliderSet.grid.numCols;
		}
		else
		{
			sliderSet.sliderLimit[i].x1 = sliderSet.slider[i-1].ofsX;
			sliderSet.sliderLimit[i].x2 = sliderSet.slider[i+1].ofsX;
		}
		addDraggableObject(sliderSet.slider[i], sliderProperties, sliderSet.sliderLimit[i]);
	}
}

// Redraw the links between node start and finish in a given sliderSet
function interpolateLinks(sliderSet, start, finish)
{
	for(var i=start; i<=finish; ++i)
	{
		document.getElementById('legend'+i+'quantity').innerHTML = sliderSet.slider[i].ofsX - getOffsetLeft(sliderSet.grid);
		document.getElementById('legend'+i+'price').innerHTML = sliderSet.grid.cellHeight*sliderSet.grid.numRows - (sliderSet.slider[i].ofsY - getOffsetTop(sliderSet.grid));
		if(i==finish)
		{
			break;
		}
		var xA = parseInt(sliderSet.slider[i].ofsX);
		var yA = parseInt(sliderSet.slider[i].ofsY);
		var xB = parseInt(sliderSet.slider[i+1].ofsX);
		var yB = parseInt(sliderSet.slider[i+1].ofsY);
		for(var j=0; j<sliderSet.numLinks; ++j)
		{
			var scale = j/sliderSet.numLinks;
			var x = xA*(1-scale)+xB*scale;
			var y = yA*(1-scale)+yB*scale;
			var element = sliderSet.pixel[i*sliderSet.numLinks+j];
			element.style.top = Math.round(y);
			element.style.left = Math.round(x);
		}
	}
}

// This is the onMove handlers that continuously updates links between sliders in a clever way
// (only the links that really have to be updated are updated)
function realtimeInterpolate(sliderSet, animDragged)
{
	var nodename = animDragged.id;
	var nodenum = parseInt(nodename.substr(4));
	sliderSet.slider[nodenum].ofsX = getOffsetLeft(animDragged)+Math.floor(parseInt(animDragged.style.width)/2);
	sliderSet.slider[nodenum].ofsY = getOffsetTop(animDragged)+Math.floor(parseInt(animDragged.style.height)/2);
	var nodemin = (nodenum==0 ? 0 : nodenum-1);
	var nodemax = (nodenum==sliderSet.numSliders-1 ? sliderSet.numSliders-1 : nodenum+1);
	interpolateLinks(sliderSet, nodemin, nodemax);
}

// Limit the neighboring sliders after a slider has been released
function updateSliderLimits(sliderSet)
{
	var nodename = currentlyDragged.id;
	var nodenum = parseInt(nodename.substr(4));
	var nodemin = (nodenum==0 ? 0 : nodenum-1);
	var nodemax = (nodenum==sliderSet.numSliders-1 ? sliderSet.numSliders-1 : nodenum+1);
	if(nodemin!=nodenum && nodemin!=0)
	{
		sliderSet.sliderLimit[nodemin].x2 = sliderSet.slider[nodenum].ofsX;
	}
	if(nodemax!=nodenum && nodemax!=sliderSet.numSliders-1)
	{
		sliderSet.sliderLimit[nodemax].x1 = sliderSet.slider[nodenum].ofsX;
	}
}
