data4=new String();
vars=new Array();
values=new Array();
bracket=new Array();

// evaluate if user pressed enter
function seeEvaluate()
{
    if(event.which==13 || event.keyCode==13)
    {
      evaluateMe();
    }
}

// error detected in expression
function reportError(expr, msg, i)
{
	if(i!=-1)
	{
	  errline = expr.substring(0,i) + '<em>'+posvar+'</em>' + expr.substring(i+1);
	}
	else
	{
	  errline = '';
	}
	$('#logictable').removeClass().addClass('error').html(msg+'<br><h4>'+errline+'</h4>');
	$('#results').html('');
}

// sort variables alphabetically
function sortVariables()
{
	var i,j,k;
	for(i=0; i<vars.length-1; ++i)
	{
		for(j=i+1; j<vars.length; ++j)
		{
			if(vars[i]>vars[j])
			{
				k = vars[i];
				vars[i] = vars[j];
				vars[j] = k;
			}
		}
	}
}

// return -1 if the letter is not a variable, otherwise variable number
function isVariable(let)
{
	var j;
	for(j=0; j<vars.length; ++j)
	{
	  if(let==vars[j]) return(j);
	}
	return(-1);
}

// compute logic subbed with no brackets and return the logic value
function compute(subbed, startpos, endpos)
{
	var j;
	data4 = subbed.substring(startpos,endpos+1);
	for(j=0; j<=data4.length; ++j)
	{
		if(data4.charAt(j+1)=='`' || data4.charAt(j+1)=="'")
		{
			k = (data4.charAt(j)=='1') ? 0 : 1;
			data4 = data4.substring(0,j) + k + data4.substring(j+2);
			--j;
		}
	}
	for(j=0; j<=data4.length; ++j)
	{
		if( (data4.charAt(j)=='0' || data4.charAt(j)=='1') &&
				(data4.charAt(j+1)=='0' || data4.charAt(j+1)=='1') )
		{
			k = (data4.charAt(j)=='1' && data4.charAt(j+1)=='1') ? 1 : 0;
			data4 = data4.substring(0,j) + k + data4.substring(j+2);
			--j;
		}
		else if ((data4.charAt(j)=='0' || data4.charAt(j)=='1') &&
				     data4.charAt(j+1)=='^')
		{
			k = (data4.charAt(j)==data4.charAt(j+2)) ? 0 : 1;
			data4 = data4.substring(0,j) + k + data4.substring(j+3);
			--j;
		}
	}
	var k=0;
	for(j=0; j<=data4.length; ++j)
	{
		if(data4.charAt(j)=='1')
		{
		  k=1;
		  break;
		}
	}
	return(k);
}

// main evaluation data
//
function evaluateMe()
{
  vars.length = 0;
	values.length = 0;
	bracket.length = 0;
	
	var expr = document.getElementById('expr').value.trim();

	// find all variables
	for(i=0; i<expr.length; ++i)
	{
		posvar = expr.charAt(i);
		if(posvar!='`' && posvar!="'" && posvar!='+' && posvar!='^' && posvar!='(' && posvar!=')')
		{
			// found an invalid character
			if(posvar<'a' || posvar>'z')
			{
				reportError(expr, 'Parse error: invalid character', i);
				return;
			}

			// found a variable
			for(j=0; j<vars.length; ++j)
			{
				if(posvar==vars[j]) break;
			}
			if(j==vars.length) vars[j]=posvar;
		}
	}

	// find parentheses and operands validity
	parlevel = 0;
	prev = 0;
	for(i=0; i<expr.length; ++i)
	{
		next = expr.charAt(i+1);
		posvar = expr.charAt(i);
		if (posvar=='+' && ( (prev!=')' && prev!='`' && prev!="'" && isVariable(prev)<0)
						             || (next!='(' && isVariable(next)<0) ))
		{
			// misplaced +
			reportError(expr, 'Parse error: misplaced "+"', i);
			return;
		}
		if (posvar=='^' && ( (prev!=')' && prev!='`' && prev!="'" && isVariable(prev)<0)
						             || (next!='(' && isVariable(next)<0) ))
		{
			// misplaced ^
			reportError(expr, 'Parse error: misplaced "^"', i);
			return;
		}
		if((posvar=='`' || posvar=="'") && prev!=')' && prev!="'" && prev!='`' && isVariable(prev)<0)
		{
			// misplaced `
			reportError(expr, 'Parse error: misplaced "'+"'"+'"', i);
			return;
		}
		if(posvar=='(')
		{
		  ++parlevel;
		}
		if(posvar==')') 
		{
			if(!parlevel)
			{
				// too many ')' brackets
				reportError(expr, 'Parse error: parentheses mismatch', i);
				return;
			}
			--parlevel;
		}
		prev = posvar;
	}
	if(parlevel)
	{
		// to few ')' brackets
		reportError(expr, 'Parse error: parentheses missing', -1);
		return;
	}
	if(posvar=='+')
	{
		// + at the end of input
		reportError(expr, 'Parse error: misplaced "+"', i-1);
		return;
	}

	sortVariables();
	$('#logictable').removeClass().html('Expression parsed successfully.. found '+vars.length+' variable'+(vars.length==1?'':'s')+'.');

	// evaluating the expression; swap 1's and 0's for letters
	nosteps = (1<<vars.length);
	for(i=0; i<vars.length; ++i)
	{
	  values[i]=0;
	}

	k = 0;
	var rows = [];
	for(i=0; i<vars.length; ++i)
	{
	  rows[i] = '<tr><td><b>' + vars[i] + '</b></td>';
	}
	rows[vars.length] = '<tr><td class="output"><b>out</b></td>';

	for(i=0; i<nosteps; ++i)
	{
		// format output
		for(j=0; j<vars.length; ++j)
		{
		  rows[j] += '<td>' + values[j] + '</td>';
		}
		rows[vars.length] += '<td class="output">';

		// replace letters by numbers
		var subbed = expr;
		for(j=0; j<subbed.length; ++j)
		{
		  if( (k=isVariable(subbed.charAt(j)))!=-1 )
		  {
		    subbed = subbed.substring(0,j) + values[k] + subbed.substring(j+1);
		  }
		}

		// evaluate.. sweep along parentheses to find which values to evaluate first
		bracketno = 0;
		for(j=0; j<subbed.length; ++j)
		{
			if(subbed.charAt(j)=='(')
			{
			  bracket[bracketno++] = j+1;
			}
			if(subbed.charAt(j)==')')
			{
				// found first occurence of closed brackets.. i.e. all data within the brackets
				// has no internal brackets
				k = compute(subbed, bracket[bracketno-1], j-1);
				subbed = subbed.substring(0,bracket[bracketno-1]-1) + k + subbed.substring(j+1);
				j = bracket[bracketno-1]-1;
				--bracketno;
			}
		}
		k = compute(subbed, 0,subbed.length-1);
		rows[vars.length] += k + '</td>';
		j = vars.length-1;
		while(j>=0)
		{
			values[j] = 1-values[j];
			if(values[j]) break;
			--j;
		}
	}
	for(i=0; i<vars.length+1; ++i)
	{
	  rows[i] += '</tr>';
	}
	s = '<table>';
  for(var i in rows)
  {
    s += rows[i];
  }
	s += '</table>';
	$('#results').html(s);
}