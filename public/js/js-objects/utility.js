/*
	CreativeJavaScriptSuite, 2005, Lukasz Strozek, strozek@gmail.com
	This file contains miscellaneous utility functions
 */

// Disable selecting text on page.  This is useful for dragging -- if, for some reason
// (e.g. constrained draggable images), the mouse cursor goes off the dragged element,
// the mouse would otherwise start selecting text on page which looks awful.  This hack
// fixes the problem
function disableSelect()
{
	// TODO: Verify that this works in other browsers (PC.IE)
	document.onselectstart = function() {return false;}
	if(window.sidebar)
	{
		document.onmousedown = function(e) {return false;}
		document.onclick = function() {return true;}
	}
}

// Return the true x-position of the (possibly nested element)
function getOffsetLeft(element)
{
	var offset = 0;
	while(element!=null)
	{
		offset += element.offsetLeft;
		element = element.offsetParent;
	}
	return offset;
}

// Return the true y-position of the (possibly nested element)
function getOffsetTop(element)
{
	var offset = 0;
	while(element!=null)
	{
		offset += element.offsetTop;
		element = element.offsetParent;
	}
	return offset;
}

// Return true if mouse cursor is over a given element.  onmouseover/onmouseout works, too, but
// sometimes it's impossible to use those events (for example, when dragging other elements
// on screen)
function isOverElement(which)
{
	// TODO: Verify that this works in other browsers (PC.IE)
	var x = event.clientX + parseInt(document.body.scrollLeft);
	var y = event.clientY + parseInt(document.body.scrollTop);
	var x1 = getOffsetLeft(which);
	var y1 = getOffsetTop(which);
	if(x>=x1 && y>=y1 && x<x1+which.offsetWidth && y<y1+which.offsetHeight)
	{
		return true;
	}
	return false;
}

// Return an animation curve, given the current frame number.  The curve is modeled after an inflected
// quadratic curve to emulate acceleration until half-way point and the deceleration until the end
// of motion
function getCurve(frame)
{
	var halfSquare = FRAMES_SET*FRAMES_SET*0.5;
	if(frame<=FRAMES_SET/2) return(frame*frame/halfSquare);
	return((halfSquare-(FRAMES_SET-frame)*(FRAMES_SET-frame))/halfSquare);
}

// Trim a string from both sides (remove leading and trailing whitespace)
function trim(str)
{
	str = str.replace( /^\s+/g, '');
	return str.replace( /\s+$/g, '');
}

// Return an array of properties, given a CSS-like style string (every item is evaluated before assigning!)
function getStyle(style)
{
	var retval = new Array();
	var styleArray = style.split(";");
	for(var styleItem in styleArray)
	{
		var styleDetail = styleArray[styleItem].split(":");
		retval[trim(styleDetail[0])] = eval(trim(styleDetail[1]));
	}
	return retval;
}

// If condition is true, the given element changes its properties, otherwise it recovers its old ones
function highlightElement(which, condition, properties)
{
	if(condition)
	{
		which.oldProperties = new Array();
        for(property in properties)
		{
            // TODO: This should really be 'which.style' -- but Safari complains
			which.oldProperties[property] = which.oldstyle[property];
			which.style[property] = properties[property];
		}
	}
	else
	{
		for(property in which.oldProperties)
		{
			which.style[property] = which.oldProperties[property];
		}
	}
}
