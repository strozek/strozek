var color = 0;
var art = Array();
var canSet = 0;
var totalPixels = 0;
var tokenAmount = 0;
var splitAmounts = Array();
var mineId = 0;
var mineCounter = 0;
var mineHashToFind = '';
var mineAttempts = 0;
var mineInterval = null;

if(window.captureEvents) window.captureEvents(Event.MOUSEMOVE);
window.onmousemove = mouseMove;
var mouseX, mouseY;

var pickerImage = new Image();
pickerImage.src = '/images/graphics/picker.png';
var pickerCanvas;
pickerImage.onload = function() {
  pickerCanvas = $('<canvas/>')[0];
  pickerCanvas.width = pickerImage.width;
  pickerCanvas.height = pickerImage.height;
  pickerCanvas.getContext('2d').drawImage(pickerImage, 0, 0, pickerImage.width, pickerImage.height);
};

$(document).ready(function() {
  $('#token').prop('disabled', false);
});

function mouseMove(e)
{
  if(!e) return;
  mouseX = parseInt(e.pageX);
  mouseY = parseInt(e.pageY);
}

function dec2hex(d)
{
  var s = "00" + Number(d).toString(16);
  return s.substring(s.length - 2);
}

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

function pick()
{
  var picker = $('#picker')[0];
  var position = getElementPosition(picker);
  var x = mouseX-position[0];
  var y = mouseY-position[1];
  if(x>0 && y>0 && x<=picker.width && y<=picker.height)
  {
    color = (x-1) + (y-1)*125;
    var imageData = pickerCanvas.getContext('2d').getImageData((x-1), (y-1), 1, 1).data;
    var hex = "#" + dec2hex(imageData[0]) + dec2hex(imageData[1]) + dec2hex(imageData[2]);
    $('#currentColor').css('background', hex);
  }
}

function paint()
{
  var image = $('#imageDisplay')[0];
  var container = $('#container')[0];
  var x = mouseX-parseInt(image.offsetLeft)-parseInt(container.offsetLeft);
  var y = mouseY-parseInt(image.offsetTop)-parseInt(container.offsetTop);
  point = parseInt((x-1)/6) + parseInt((y-1)/6)*67;
  alreadyDrawn = false;
  for(var i in art)
  {
    if(art[i].split(':')[0] == point) alreadyDrawn = true;
  }
  if(!alreadyDrawn)
  {
    art.push(point+':'+color);
    updateOverlay();
    updateCost();
    $('#undoButton').prop('disabled', false);
  }
}

function tokenFocus()
{
  $('#validateLabel').html('');
  inspectToken();
}

function inspectToken()
{
  $.ajax({ url:"/crowdsource/inspect/"+$('#token').val(), dataType:"json"})
    .done(function(data) {
      if(data.success)
      {
        canSet = data.pixels;
        tokenAmount = parseInt($('#token').val().substring(0, 3), 16);
        $('#validateLabel').removeClass()
          .addClass('blue')
          .html('Token validated: you have '+canSet+' pixel(s)');
        $('#instructions').css('display', 'block');
        $('#feedback').removeClass().html('');
        $('#splitTokenP').css('display', canSet==1 ? 'none' : 'block');
      }
      else
      {
        canSet = 0;
        if($('#token').val()=='')
        {
          $('#validateLabel').removeClass().html('');
        }
        else
        {
          $('#validateLabel').removeClass()
            .addClass('red')
            .html('This token could not be validated');
        }
        $('#instructions').css('display', 'none');
      }
      updateCost();
    });
}

function updateOverlay()
{
  var context = $("#imageOverlay")[0].getContext("2d");
  context.clearRect(0, 0, 402, 402);
  for(var i in art)
  {
    var pair = art[i].split(':');
    var x = pair[0]%67;
    var y = parseInt(pair[0]/67);
    var x2 = pair[1]%125;
    var y2 = parseInt(pair[1]/125);
    var imageData = pickerCanvas.getContext('2d').getImageData(x2, y2, 1, 1).data;
    var hex = "#" + dec2hex(imageData[0]) + dec2hex(imageData[1]) + dec2hex(imageData[2]);
    context.fillStyle = hex;
    context.fillRect(x*6+1,y*6+1,6,6);
  }
}

function updateCost()
{
  $.ajax({ url:"/crowdsource/overlap/"+art.join(','), dataType:"json"})
    .done(function(data) {
      if(data.success)
      {
        t = data.count;
        if(t>0)
        {
          totalPixels = t+art.length;
          $('#cost').html('(includes '+t+' pixel(s) you drew over)');
        }
        else
        {
          totalPixels = art.length;
          $('#cost').html('&nbsp;');
        }
        $('#submitButton').prop('disabled', (totalPixels==0 || totalPixels>canSet));
        $('#amountDrawn').html(totalPixels+" pixel(s) used");
        $('#submitFeedback').removeClass()
          .addClass(totalPixels>canSet ? 'red' : 'orange')
          .html(
            (totalPixels==0 || totalPixels==canSet) ? '' : 
            (totalPixels>canSet) ? 'You used '+totalPixels+' pixels but you can only submit '+canSet :
            "Use up all the pixels you got; you won't be able to reuse the token."
          );
      }
    });
}

function checkValidate()
{
  $('#validateButton').prop('disabled', ($('#token').val() == ''));
}

function undoPixel()
{
  if(art.length)
  {
    art.pop();
  }
  updateOverlay();
  updateCost();
  if(art.length==0)
  {
    $('#undoButton').prop('disabled', true);
  }
}

function findHashes()
{
  for(var i=0; i<100; ++i)
  {
    if(hex_sha1('mine.' + mineCounter) == mineHashToFind)
    {
      // Found the hash!
      $.ajax({ url:"/crowdsource/solveMineChallenge/"+mineId+"/"+mineCounter, dataType:"json"})
        .done(function(data) {
          if(data.success)
          {
            $('#mineLabel').removeClass()
              .addClass('blue')
              .html("You've successfully mined a token! Write it down or paste above: <b><tt>" + data.token + "</tt></b>");
            $('#mineButton').prop('disabled', false);
            clearInterval(mineInterval);
          }
        });
      break;
    }
    ++mineCounter;
  }
  --mineAttempts;
  $('#mineTimeLeft').html(parseInt((mineAttempts+59)/60));
  if(mineAttempts == 0)
  {
    $('#mineButton').prop('disabled', false);
    $('#mineLabel').removeClass()
      .addClass('red')
      .html("Done mining, couldn't find any tokens. You can try mining again.");
    clearInterval(mineInterval);
  }
}

function mine()
{
  $.ajax({ url:"/crowdsource/requestMineChallenge", dataType:"json"})
    .done(function(data) {
      if(!data.success)
      {
        $('#mineLabel').removeClass()
          .addClass('red')
          .html('Something went wrong, cannot mine right now. Try later');
      }
      else
      {
        $('#mineButton').prop('disabled', true);
        $('#mineLabel').removeClass()
          .html("Mining... for the next <span id='mineTimeLeft'>30</span> minutes, we'll try to find a token for you. The token (if found) will appear here.");
        mineId = data.id;
        mineCounter = 0;
        mineHashToFind = data.hash;
        mineAttempts = 1800;
        mineInterval = setInterval(findHashes, 1000);
      }
    });
}

function generateSplitAmounts()
{
  splitAmounts = [];
  var last = 0;
  for(var value=1; value<canSet; ++value)
  {
    var firstPre = Math.round(Math.pow(value, 0.8));
    var secondPre = tokenAmount - firstPre;
    var firstPost = Math.round(Math.pow(firstPre, 1.25));
    var secondPost = Math.round(Math.pow(secondPre, 1.25));
    if(firstPost>last && secondPost>=firstPost)
    {
      splitAmounts.push([value, firstPost, secondPost]);
      last = firstPost;
    }
  }
}

function showSplitDialog()
{
  $('#mainContainer').css('opacity', '0.2');
  $('#splitOriginalAmount').html(canSet);
  generateSplitAmounts();
  $('#splitSlider').slider({
    min:0,
    value:0,
    max:splitAmounts.length-1,
    slide: function(event, ui) {
      $('#splitAmounts').html('<b>' + splitAmounts[ui.value][1] + '</b> and <b>' + splitAmounts[ui.value][2] + '</b>');
    }});
  $('#splitAmounts').html('<b>' + splitAmounts[0][1] + '</b> and <b>' + splitAmounts[0][2] + '</b>');
  $('#splitDialog').dialog({
    resizable:false,
    close: function(event, ui) {
      $('#mainContainer').css('opacity', '1.0');
    }});
  $('#splitDialog').css('display', 'block');
}

function splitToken()
{
  var sliderStop = $("#splitSlider").slider("value");
  var splitValue = splitAmounts[sliderStop][0];
  $('#splitDialog').dialog("close");

  $.ajax({ url:"/crowdsource/split/"+$('#token').val()+"/"+splitValue, dataType:"json"})
    .done(function(data) {
      if(data.success)
      {
        $('#feedback').removeClass()
          .addClass('blue')
          .html('Token split into <b><tt>'+data.tokenA+'</tt></b> and <b><tt>'+data.tokenB+'</tt></b> - <b>save these somewhere</b>!<br>old token has been invalidated (you can\'t use it anymore)');
        $('#token').val('');
        inspectToken();
      }
      else
      {
        $('#feedback').removeClass()
          .addClass('red')
          .html('The split was unsuccessful');
      }
    });
}

function showMergeDialog()
{
  $('#mainContainer').css('opacity', '0.2');
  $('#mergeOriginalAmount').html(canSet);
  $('#mergeConfirmButton').prop('disabled', true);
  $('#mergeToken').val('');
  $('#mergeAmounts').html('&nbsp;');
  $('#mergeDialog').dialog({
    resizable:false,
    close: function(event, ui) {
      $('#mainContainer').css('opacity', '1.0');
    }});
  $('#mergeDialog').css('display', 'block');
}

function checkMergeValidate()
{
  $('#mergeValidateButton').prop('disabled', ($('#mergeToken').val() == ''));
}

function mergeValidate()
{
  if($('#mergeToken').val() == $('#token').val())
  {
    $('#mergeAmounts').html("You can't merge a token with itself");
    $('#mergeConfirmButton').prop('disabled', true);
  }
  else
  {
    $.ajax({ url:"/crowdsource/inspect/"+$('#mergeToken').val(), dataType:"json"})
      .done(function(data) {
        if(data.success)
        {
          mergeTokenPixels = data.pixels;
          mergeTokenAmount = parseInt($('#mergeToken').val().substring(0, 3), 16);
          sumPixels = Math.round(Math.pow(tokenAmount + mergeTokenAmount, 1.25));
          $('#mergeAmounts').html('(<b>'+mergeTokenPixels+'</b> pixels). Merged token: <b>'+sumPixels+'</b> pixels');
          $('#mergeConfirmButton').prop('disabled', false);
        }
        else
        {
          $('#mergeAmounts').html('Token invalid');
          $('#mergeConfirmButton').prop('disabled', true);
        }
        updateCost();
      });
  }
}

function mergeTokens()
{
  $('#mergeDialog').dialog("close");

  $.ajax({ url:"/crowdsource/merge/"+$('#token').val()+"/"+$('#mergeToken').val(), dataType:"json"})
    .done(function(data) {
      if(data.success)
      {
        $('#feedback').removeClass()
          .addClass('blue')
          .html('Tokens merged into <b><tt>'+data.token+'</tt></b> - <b>save it somewhere</b>!<br>old tokens have been invalidated (you can\'t use them anymore)');
        $('#token').val('');
        inspectToken();
      }
      else
      {
        $('#feedback').removeClass()
          .addClass('red')
          .html('The merge was unsuccessful');
      }
    });
}

function showConfirmDialog()
{
  $('#mainContainer').css('opacity', '0.2');
  extra = (totalPixels != art.length) ? (" which includes "+(totalPixels-art.length)+" pixel(s) you drew over") : "";
  certainty = (totalPixels<canSet) ? ("You can set up to "+canSet+" pixel(s) with your token. Are you sure you want to continue?") : "Do you want to submit your contribution now?";
  message = "You are submitting "+totalPixels+" pixel(s)"+extra+". "+certainty;
  $('#confirmMessage').html(message);
  $('#confirmDialog').dialog({
    resizable:false,
    close: function(event, ui) {
      $('#mainContainer').css('opacity', '1.0');
    }});
  $('#confirmDialog').css('display', 'block');
}

function cancelContribution()
{
  $('#confirmDialog').dialog("close");
}

function submitContribution()
{
  $('#confirmDialog').dialog("close");
  
  $.ajax({ url:"/crowdsource/submit/"+$('#token').val()+"/"+art.join(','), dataType:"json"})
    .done(function(data) {
      if(data.success)
      {
        $('#feedback').removeClass()
          .addClass('blue')
          .html('Contribution processed. Token invalidated (you can\'t use it anymore)');
        $('#token').val('');
        art = Array();
        undoPixel();
      }
      else
      {
        $('#feedback').removeClass()
          .addClass('red')
          .html('Error processing your request');
      }
      inspectToken();
      $('#imageDisplay')[0].src = '/crowdsource/image/'+Math.random();
    });
}
