var orig = 67;            // the inflated size in a slideshow
var small = 32;           // the regular size in a slideshow
var sigma = 30.0;         // the amount of decrease with distance
var slideshows = Array(); // a hashtable of all slideshows on a page
var captions = Array();   // a hashtable of all captions in slideshows

var skip = small+3;
var imageY = parseInt(orig*0.5+1);
var mouseX, mouseY;

// get the position [x, y] of an element
function getElementPosition(elt)
{
  var x = 0;
  var y = 0;
  var currentElt = elt;
  while(currentElt)
  {
    x += currentElt.offsetLeft;
    y += currentElt.offsetTop;
    currentElt = currentElt.offsetParent;
  }
  return [x, y]; 
}

// place an image in a "zoom" slideshow
function placeImage(id, left, size)
{
  image = document.getElementById(id+'_image')
  image.style.width = parseInt(size)+'px';
  image.style.height = parseInt(size)+'px';
  var elt = document.getElementById(id);
  elt.style.display = 'block';
  elt.style.left = parseInt(left-1)+'px';
  elt.style.top = parseInt((orig-size)*0.5+1)+'px';
}

// return the size based on the distance from the center of the image
function getSize(dSquared)
{
  normal = Math.exp(-dSquared/(2*sigma*sigma));
  if(normal<0.05) normal=0;
  alpha = 1.0*small/orig;
  size = normal*(1-alpha)+alpha;
  return size;
}

// enable the zoom effect
function enableEffect()
{
  if(window.captureEvents) window.captureEvents(Event.MOUSEMOVE);
  window.onmousemove = refreshZoomState;
}

// draw the images' initial state
function placeInitialImages()
{
  for(var key in slideshows)
  {
    var s = slideshows[key];
    for(i=0; i<s[0]; ++i)
    {
      placeImage(s[1]+'_'+i, i*skip+10, small);
    }
  }
}

function refreshZoomState(e)
{
  if(!e) return;
  mouseX = parseInt(e.pageX);
  mouseY = parseInt(e.pageY);
  for(var key in slideshows)
  {
    var s = slideshows[key];
    var pos = getElementPosition(document.getElementById(s[1]));
    var x = mouseX - pos[0];
    var y = mouseY - pos[1]; 
    left = 10;
    minDistance = -1;
    for(i=0; i<s[0]; ++i)
    {
      imageX = (i+0.5)*skip;
      distance = (imageX-x)*(imageX-x)+(imageY-y)*(imageY-y);
      if(minDistance==-1 || distance<minDistance)
      {
        minDistance = distance;
        leftAtMinDistance = left;
        sizeAtMinDistance = orig*getSize(distance);
        iAtMinDistance = i;
      }
      size = orig*getSize(distance);
      left += parseInt(size)+3;
    }
    offset = (left-s[0]*skip-10)*x/(s[0]*skip);
    left = 10;
    for(i=0; i<s[0]; ++i)
    {
      imageX = (i+0.5)*skip;
      distance = (imageX-x)*(imageX-x)+(imageY-y)*(imageY-y);
      size = orig*getSize(distance);
      placeImage(s[1]+'_'+i, left-offset, size);
      left += parseInt(size)+3;
    }
    var caption = document.getElementById(s[1]+"_caption");
    if(minDistance<sizeAtMinDistance*sizeAtMinDistance)
    {
      caption.style.left = (leftAtMinDistance-offset-30)+'px';
      caption.style.width = (sizeAtMinDistance+60)+'px';
      caption.style.top = (orig+5)+'px';
      caption.innerHTML = captions[s[1]+"_"+iAtMinDistance];
    }
    else
    {
      caption.innerHTML = "";
    }
  }
}