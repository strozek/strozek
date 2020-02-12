/*
	CreativeJavaScriptSuite, 2005, Lukasz Strozek, strozek@gmail.com
	This file contains common definitions -- for now just constants
 */

var P_VISIBLE = 1;		// Specifies that an element is visible
var P_ALPHA = 2;		// Specifies that an element is translucent
var P_HIDDEN = 3;		// Specifies that an element is hidden
var P_SPRINGBACK = 4;	// Specifies that an element springs back to its original position and disappears
var P_SPACEOUT = 5;		// Specifies that an element moves out other objects around it to fit the space
var P_ONTOP = 6;		// Specifies that an element remains on top of other objects
var P_ONCLICK = 7;		// Specifies that an action will be taken on click
var P_ONMOUSEOVER = 8;	// Specifies that an action will be taken when mouse moves over the element (and reversed when mouse goes out)

var P_COLLAPSED = 1;	// The element has finished collapsing
var P_EXPANDED = 2;		// The element has finished expanding
var P_COLLAPSING = 3;	// The element is collapsing
var P_EXPANDING = 4;	// The element is expanding

var FRAMES_SET = 1;	// The number of frames in an animation step


// These are the only global variables used by the library -- the currently dragged object
var currentlyDragged = null;
var previouslyDragged = new Array();
var dragOffset = 0;		
var uniqueId = 0;

