/*
	CreativeJavaScriptSuite, 2005, Lukasz Strozek, strozek@gmail.com
	This file contains handlers for expanding objects
 */

// Main animation loop which transitions the element (given to the function by the ID)
function animateExpandingObject(objectId)
{
	var objectHandle = document.getElementById(objectId);
	objectHandle.animationFrame += objectHandle.direction;
	var curve = getCurve(objectHandle.animationFrame);
	var x = Math.round(curve*objectHandle.offsetWidth);
	var y = Math.round(curve*objectHandle.maxHeight);
	var maxOpacity = (objectHandle.expandMode == P_ALPHA ? 80 : 100);
	var z = Math.round(objectHandle.animationFrame*maxOpacity/FRAMES_SET);
	objectHandle.expandingObject.style.width = x;
	objectHandle.expandingObject.style.height = y;
	objectHandle.expandingObject.style.filter = 'alpha(opacity:'+z+')';
	objectHandle.expandingObject.style.opacity = z/100;
    if(y>objectHandle.thresholdHeight && objectHandle.expandMode == P_SPACEOUT)
	{
		if(objectHandle.lastPosition != 'relative')
		{
			objectHandle.expandingObject.style.position = 'relative';
			objectHandle.lastPosition = 'relative';
		}
	}
	else
	{
		if(objectHandle.lastPosition != 'absolute')
		{
			objectHandle.expandingObject.style.position = 'absolute';
			objectHandle.lastPosition = 'absolute';
		}
	}
	if(objectHandle.animationFrame==FRAMES_SET || objectHandle.animationFrame==0) 
	{
		clearInterval(objectHandle.animation);
		objectHandle.animation = null;
		if(objectHandle.expanded == P_COLLAPSING)
		{
			objectHandle.expanded = P_COLLAPSED;
			objectHandle.direction = -1;
		}
		else
		{
			objectHandle.expanded = P_EXPANDED;
			objectHandle.direction = 1;
		}
	}
}

// Perform a smooth expansion (or do nothing if the object is already expanding)
function smoothExpand()
{
	if(this.expanded==P_EXPANDING || this.expanded==P_EXPANDED)
	{
		return;
	}
	this.expanded = P_EXPANDING;
	this.direction = 1;
	if(this.animation==null)
	{
		this.animation = setInterval("animateExpandingObject('"+this.id+"')", 10);
	}
}

// Perform a smooth collapse (or do nothing if the object is already collapsing)
function smoothCollapse()
{
	if(this.expanded==P_COLLAPSING || this.expanded==P_COLLAPSED)
	{
		return;
	}
	this.expanded = P_COLLAPSING;
	this.direction = -1;
	if(this.animation==null)
	{
		this.animation = setInterval("animateExpandingObject('"+this.id+"')", 10);
	}
}

// Perform a smooth expand/collapse, reversing current direction of motion
function smoothExpandToggle()
{
	this.direction = -this.direction;
	this.expanded = (this.direction==1 ? P_EXPANDING : P_COLLAPSING);
	if(this.animation==null)
	{
		this.animation = setInterval("animateExpandingObject('"+this.id+"')", 10);
	}
}

// Make an object able to expand/collapse.
//
// which -- the header (the object which toggles expansion/collapsing).
// expanding -- the expanding element
// properties -- an array of properties passed to specify the behavior of this expanding element
//
// the header element is given additional properties:
// .maxHeight -- the height to expand to 
// .thresholdHeight -- the height beyond which to expand space
// .expandingObject -- the object that will be transitioning
// .expandMode -- what the item should do with space it replaces
// .expanded -- current state (expanding, collapsing, expanded, collapsed)
// .direction -- -1 or +1
// .animationFrame -- current animation frame
// .animation -- interval performing the transition
// .lastPosition -- last value of the 'position' property
//
// properties are as follows:
// .maxHeight -- the maximum height to which the item will expand
// .thresholdHeight -- the height beyond which the item will start expanding the space beyond it (ignored if expandMode!=P_SPACEOUT)
// .expandEvent -- expand/contract on which event either P_ONCLICK (mouse click toggles) or P_ONMOUSEOVER (mouse over/out toggles)
// .expandMode -- P_SPACEOUT (expand space to fit), P_ONTOP (on top of existing items), P_ALPHA (like P_ONTOP, but with 80% opacity)
function addExpandingObject(which, expanding, properties)
{
	which.maxHeight = properties.maxHeight;
	which.thresholdHeight = properties.thresholdHeight;
	if(properties.expandEvent == P_ONCLICK)
	{
		which.onclick = smoothExpandToggle;
	}
	else
	{
		which.onmouseover = smoothExpand;
		which.onmouseout = smoothCollapse;
	}
	which.expandingObject = expanding;
	which.expandMode = properties.expandMode;
	which.expanded = P_COLLAPSED;
	which.direction = -1;
	which.animationFrame = 0;
	which.animation = null;
	which.lastPosition = 'relative';
	which.style.cursor = 'pointer';
	expanding.style.width = 1;
	expanding.style.height = 1;
	expanding.style.visibility = 'visible';
	expanding.style.position = (properties.expandMode==P_SPACEOUT ? 'relative' : 'absolute');
	expanding.style.overflow = 'hidden';
}
