/*
	CreativeJavaScriptSuite, 2005, Lukasz Strozek, strozek@gmail.com
	This file contains the definitions of handlers of draggable objects
 */

// An event handler of pressed mouse key.  This takes care of catching a draggable object.  Properties
// added to currentlyDragged:
// this -- clone of the parent node
// .oldStyle -- the style of the node before changing it
// .XOfs, .YOfs -- the offset to move the item by (because we're changing from relative to absolute positioning)
// .original -- the parent node
// .properties.onMoveParentDelay -- false, true if springing back
// .MouseXOfs, .MouseYOfs -- the mouse hotspot offset
// .Condition -- the onOverCondition gotten last time
//
// .properties and .limit are set by the caller:
// .properties.onMoveParent -- P_HIDDEN, P_ALPHA, P_VISIBLE: what to do with the parent when item is dragged
// .properties.onMove -- P_HIDDEN, P_ALPHA, P_VISIBLE: what to do with the item when it's dragged
// .properties.onMoveHandler -- what function to run while dragging (or null)
// .properties.onOverCondition -- returns true or false if the item is "over" a target; could be null if no such notion
// .properties.onOverHandler -- the function to run with a parameter to handle the target when item goes over/away from the target (or null)
// .properties.onDropHandler -- what to do if item is dropped (must be under a target if such notion exists) (or null)
// .properties.onDrop -- P_HIDDEN, P_ALPHA, P_VISIBLE, P_SPRINGBACK: what to do with item when it's dropped
// .properties.onDropParent -- P_HIDDEN, P_ALPHA, P_VISIBLE: what to do with parent when item is dropped
// .properties.styleOnPressed -- the style to change after pressing
function mousePressed(e)
{
	original = this;
	if(e)
	{
		event = new Array();
		event.clientX = e.pageX;
		event.clientY = e.pageY;
	}
	
	if(currentlyDragged)
	{
		// already dragging an item -- ignore the mouse click.  This should never happen
		return;
	}
	// this one is a little tricky -- we're trying to drag an item that's springing back
	// we should also not be allowed to drag its parent
	var foundPrevious = false;
	for (var i=0; i<dragOffset; ++i)
	{
		if(previouslyDragged[i] && original.uniqueId == previouslyDragged[i].uniqueId)
		{
			currentlyDragged = previouslyDragged[i];
			clearInterval(currentlyDragged.springback);
			previouslyDragged[i] = null;
			original = currentlyDragged.original;
			foundPrevious = true;
			break;
		}
		if(previouslyDragged[i] && original == previouslyDragged[i].original)
		{
			return;
		}
	}
	if(foundPrevious==false)
	{
		currentlyDragged = original.cloneNode(true);
		currentlyDragged.properties = original.properties;
		currentlyDragged.limit = original.limit;
		currentlyDragged.onmousedown = mousePressed;
		currentlyDragged.style.cursor = original.style.cursor;
	}
	currentlyDragged.uniqueId = uniqueId++;
	currentlyDragged.oldStyle = new Array();
	for (var property in currentlyDragged.properties.styleOnPressed)
	{
		currentlyDragged.oldStyle[property] = currentlyDragged.style[property];
		currentlyDragged.style[property] = currentlyDragged.properties.styleOnPressed[property];
	}
	currentlyDragged.style.position = 'absolute';
	if(foundPrevious==true)
	{
		currentlyDragged.XOfs = Math.floor((parseInt(original.style.width) - parseInt(currentlyDragged.style.width))/2);
		currentlyDragged.YOfs = Math.floor((parseInt(original.style.height) - parseInt(currentlyDragged.style.height))/2);
		currentlyDragged.style.left = getOffsetLeft(original) + Math.floor(parseInt(currentlyDragged.style.left) - parseInt(currentlyDragged.style.width)/2);
		currentlyDragged.style.top = getOffsetTop(original) + Math.floor(parseInt(currentlyDragged.style.top) - parseInt(currentlyDragged.style.height)/2);
	}
	else
	{
		currentlyDragged.XOfs = Math.floor((parseInt(original.style.width) - parseInt(currentlyDragged.style.width))/2);
		currentlyDragged.YOfs = Math.floor((parseInt(original.style.height) - parseInt(currentlyDragged.style.height))/2);
		currentlyDragged.style.left = getOffsetLeft(original) + currentlyDragged.XOfs;
		currentlyDragged.style.top = getOffsetTop(original) + currentlyDragged.YOfs;
	}
	currentlyDragged.onmousedown = mousePressed;
	currentlyDragged.original = original;
	currentlyDragged.properties.onMoveParentDelay = false;
	switch(currentlyDragged.properties.onMove)
	{
		case P_VISIBLE:	currentlyDragged.style.visibility = 'visible';
						currentlyDragged.style.filter = 'alpha(opacity=100)';
						currentlyDragged.style.opacity = 1.00;
						break;
		case   P_ALPHA:	currentlyDragged.style.visibility = 'visible';
						currentlyDragged.style.filter = 'alpha(opacity=50)';
						currentlyDragged.style.opacity = 0.50;
						break;
		case  P_HIDDEN:	currentlyDragged.style.visibility = 'hidden';
						break;
	}
	document.body.appendChild(currentlyDragged);
	switch(currentlyDragged.properties.onMoveParent)
	{
		case P_VISIBLE: original.style.visibility = 'visible';
		                original.style.filter = 'alpha(opacity=100)';
		                original.style.opacity = 1.00;
		                break;
		case P_ALPHA:	original.style.visibility = 'visible';
						original.style.filter = 'alpha(opacity=50)';
		                original.style.opacity = 0.50;
					    break;
		case P_HIDDEN:	original.style.visibility = 'hidden';
					    break;
	}
	currentlyDragged.MouseXOfs = event.clientX + parseInt(document.body.scrollLeft) - getOffsetLeft(currentlyDragged);
	currentlyDragged.MouseYOfs = event.clientY + parseInt(document.body.scrollTop) - getOffsetTop(currentlyDragged);
	currentlyDragged.Condition = false;
}

// User released mouse key
function mouseDepressed()
{
	if(currentlyDragged == null || currentlyDragged.properties.onMoveParentDelay == true)
	{
		return;
	}
	for (var property in currentlyDragged.oldStyle)
	{
		currentlyDragged.style[property] = currentlyDragged.oldStyle[property];
	}
	currentlyDragged.style.left = getOffsetLeft(currentlyDragged) - currentlyDragged.XOfs;
	currentlyDragged.style.top = getOffsetTop(currentlyDragged) - currentlyDragged.YOfs;
	if(currentlyDragged.properties.onOverCondition)
	{
		// Has notion of being "over" a target
		var condition = currentlyDragged.properties.onOverCondition();

		// onDrop depends on whether drop was successful or not
		handleObject(currentlyDragged.properties.onDrop(condition));
		if(currentlyDragged.properties.onMoveParentDelay==false)
		{
			handleObjectParent(currentlyDragged, currentlyDragged.properties.onDropParent(condition), condition);
		}
	}
	else
	{
		// Doesn't have notion of being "over" a target
		handleObject(currentlyDragged.properties.onDrop);
		if(currentlyDragged.properties.onMoveParentDelay==false)
		{
			handleObjectParent(currentlyDragged, currentlyDragged.properties.onDropParent, true);
		}
	}
	currentlyDragged = null;
}

// Handle the object after it's been dropped.  Properties added to currentlyDragged if springing back:
// .onMoveParentDelay set to true
// .springback -- interval
// .animation -- current frame
// .xInitial, .yInitial -- the initial position
// .xFinal, .yFinal -- the final position
function handleObject(dropType)
{
	switch(dropType)
	{
		case P_VISIBLE:		currentlyDragged.style.visibility = 'visible';
							currentlyDragged.style.filter = 'alpha(opacity=100)';
							currentlyDragged.style.opacity = 1.00;
							break;
		case P_ALPHA:		currentlyDragged.style.visibility = 'visible';
							currentlyDragged.style.filter = 'alpha(opacity=50)';
							currentlyDragged.style.opacity = 0.50;
							break;
		case P_HIDDEN:		document.body.removeChild(currentlyDragged);
							break;
		case P_SPRINGBACK:	currentlyDragged.properties.onMoveParentDelay = true;
							currentlyDragged.animation = 0;
							currentlyDragged.xInitial = parseInt(currentlyDragged.style.left);
							currentlyDragged.yInitial = parseInt(currentlyDragged.style.top);
							currentlyDragged.xFinal = getOffsetLeft(currentlyDragged.original);
							currentlyDragged.yFinal = getOffsetTop(currentlyDragged.original);
							// Need to keep the handler in an array just in case the user is dragging more items
							previouslyDragged[dragOffset] = currentlyDragged;
							currentlyDragged.springback = setInterval("handleSpringback("+dragOffset+")", 10);
							dragOffset++;
							break;
	}
}	

// Handle the animation of springing back to original place.  At the end the object is removed
function handleSpringback(draggedIndex)
{
	var animDragged = previouslyDragged[draggedIndex];
	++animDragged.animation;
	var curve = getCurve(animDragged.animation);
	var x = Math.round(animDragged.xFinal*curve + animDragged.xInitial*(1-curve));
	var y = Math.round(animDragged.yFinal*curve + animDragged.yInitial*(1-curve));
	animDragged.style.left = x;
	animDragged.style.top = y;
	if(animDragged.properties.onMoveHandler)
	{
		animDragged.properties.onMoveHandler(animDragged);
	}
	if(animDragged.animation==FRAMES_SET)
	{
		clearInterval(animDragged.springback);
		if(animDragged.properties.onOverCondition)
		{
			handleObjectParent(animDragged, animDragged.properties.onDropParent(false), false);
		}
		else
		{
			handleObjectParent(animDragged, animDragged.properties.onDropParent, false);
		}
		document.body.removeChild(animDragged);
		
		// Clear the array and free up some slots if possible
		previouslyDragged[draggedIndex] = null;
		if(draggedIndex==dragOffset-1)
		{
			while(previouslyDragged[draggedIndex]==null)
			{
				if(draggedIndex==0)
				{
					break;
				}
				--dragOffset;
				--draggedIndex;
			}
		}
	}
}

// That function handles the behavior of the parent of the dragged object after it's been released
function handleObjectParent(dragged, dropType, condition)
{
	switch(dropType)
	{
		case P_VISIBLE: dragged.original.style.visibility = 'visible';
	                	dragged.original.style.filter = 'alpha(opacity=100)';
						dragged.original.style.opacity = 1.00;
						break;
		case P_ALPHA:	dragged.original.style.visibility = 'visible';
						dragged.original.style.filter = 'alpha(opacity=50)';
						dragged.original.style.opacity = 0.50;
					    break;
		case P_HIDDEN:	dragged.original.style.visibility = 'hidden';
					    break;
	}
	if(condition && dragged.properties.onDropHandler)
	{
		// Handler exists when object has been successfully dropped
		// (if no target exists, this is always called, i.e. condition=true)
		dragged.properties.onDropHandler();
	}
}

// Handler of the event of moved mouse cursor.  If dragging an item, move it, bearing in mind any limits
function mouseMoved(e)
{
	if(currentlyDragged && currentlyDragged.properties.onMoveParentDelay == false)
	{
		if(e)
		{
			event = new Array();
			event.clientX = e.pageX;
			event.clientY = e.pageY;
		}
		var xOfs = event.clientX + parseInt(document.body.scrollLeft) - currentlyDragged.MouseXOfs;
		var yOfs = event.clientY + parseInt(document.body.scrollTop) - currentlyDragged.MouseYOfs;
		if(currentlyDragged.limit)
		{
			var x = Math.floor(parseInt(currentlyDragged.style.width)/2);
			var y = Math.floor(parseInt(currentlyDragged.style.height)/2);
			if(xOfs+x<currentlyDragged.limit.x1)
			{
				xOfs = currentlyDragged.limit.x1-x;
			}
			if(yOfs+y<currentlyDragged.limit.y1)
			{
				yOfs = currentlyDragged.limit.y1-y;
			}
			if(xOfs+x>currentlyDragged.limit.x2)
			{
				xOfs = currentlyDragged.limit.x2-x;
			}
			if(yOfs+y>currentlyDragged.limit.y2)
			{
				yOfs = currentlyDragged.limit.y2-y;
			}
		}
		currentlyDragged.style.left = xOfs;
		currentlyDragged.style.top = yOfs;
		// The dragged object is held on top of a target
		if(currentlyDragged.properties.onOverCondition)
		{
			var condition = currentlyDragged.properties.onOverCondition();
			if(currentlyDragged.Condition!=condition)
			{
				currentlyDragged.Condition = condition;
				currentlyDragged.properties.onOverHandler(condition);
			}
		}
		// Call this handler (if it's defined) every time a mouse moves
		if(currentlyDragged.properties.onMoveHandler)
		{
			currentlyDragged.properties.onMoveHandler(currentlyDragged);
		}
	}
}

// Make an object draggable.  See mousePressed for more details on properties and limit
function addDraggableObject(which, properties, limit)
{
	which.properties = properties;
	which.limit = limit;
	which.onmousedown = mousePressed;
	which.style.cursor = 'move';
}
