var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

var canvas = document.getElementById("canvas-id");
canvas.width = 128;
canvas.height = 128;
var context = canvas.getContext("2d");
var hexs = [];
var pS = canvas.width/128;
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
var str = [];
function genTree(x,y,w,curr)
{
	x = Math.floor(x);
	y = Math.floor(y);
	if(w < 2)
	{
		str[curr] = (("0"+((data[((y*canvas.width)+x)*4]).toString(16))).slice(-2))+ (("0"+((data[((y*canvas.width)+x)*4+1]).toString(16))).slice(-2))+ (("0"+((data[((y*canvas.width)+x)*4+2]).toString(16))).slice(-2))+ (("0"+((data[((y*canvas.width)+x)*4+3]).toString(16))).slice(-2));
		//console.log(str[curr]);
		return {r:data[((y*canvas.width)+x)*4],g:data[((y*canvas.width)+x)*4+1],b:data[((y*canvas.width)+x)*4+2],a:data[((y*canvas.width)+x)*4+3]};
	}
	var tl = genTree(x,y,w/2,curr*4+1);
	var tr = genTree(x+w/2,y,w/2,curr*4+2);
	var bl = genTree(x,y+w/2,w/2,curr*4+3);
	var br = genTree(x+w/2,y+w/2,w/2,curr*4+4);
	var r = Math.floor((tl.r+tr.r+bl.r+br.r)/4);
	var g = Math.floor((tl.g+tr.g+bl.g+br.g)/4);
	var b = Math.floor((tl.b+tr.b+bl.b+br.b)/4);
	var a = Math.floor((tl.a+tr.a+bl.a+br.a)/4);
	str[curr] = ("0"+((r).toString(16))).slice(-2)+("0"+((g).toString(16))).slice(-2)+("0"+((b).toString(16))).slice(-2)+("0"+((a).toString(16))).slice(-2);
	return {r:r,g:g,b:b,a:a};
}
function convert(sr)
{
	var img = new Image();
	
	img.onload = function()
	{
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        /*console.log(data);
        for(var i = 0; i < canvas.height; i += Math.floor(pS))
        {
        	hexs[Math.floor(i/pS)] = [];
        	for(var j = 0; j < canvas.width; j += Math.floor(pS))
        	{
        		var r = 0, g = 0, b = 0, a = 0;
        		for(var p = i; p < i+pS; p ++)
        		{
        			for(var q = j; q < j+pS; q ++)
        			{
        				r += data[((canvas.width * p) + q) * 4];
        				g += data[((canvas.width * p) + q) * 4 +1];
        				b += data[((canvas.width * p) + q) * 4 +2];
        				a += data[((canvas.width * p) + q) * 4 +3];
        				//console.log(data[((canvas.width * p) + q) * 4]);
        			}
        		}
        		r /= pS*pS;
        		g /= pS*pS;
        		b /= pS*pS;
        		a /= pS*pS;
        		//console.log(r, g, b, a);
    			hexs[Math.floor(i/pS)][Math.floor(j/pS)] = {c:rgbToHex(Math.floor(r),Math.floor(g),Math.floor(b)),al:a};
        	}
        }
        context.clearRect(0,0,canvas.width, canvas.height);
        for(var i = 0; i < 128; i ++)
        {
        	for(var j = 0; j < 128; j ++)
        	{
        		//context.globalAlpha = hexs[i][j].al;
        		context.fillStyle = hexs[i][j].c;
        		context.fillRect(i*pS, j*pS, pS, pS);
        		context.fillRect(i*pS, j*pS, pS, pS);
        		context.fillRect(i*pS, j*pS, pS, pS);
        		context.fillRect(i*pS, j*pS, pS, pS);
        		context.fillRect(i*pS, j*pS, pS, pS);
        		context.fillRect(i*pS, j*pS, pS, pS);
        	}
        }*/
        genTree(0,0,128,0);
        for(var i = 1; i < str.length; i ++)
        {
        	str[0] += str[i];
        	//console.log(str[0], str[i]);
        }
        str = str[0];

        console.log(str);
    	var request = new XMLHttpRequest();
	    request.open("POST","saveImage/",true);
	    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	    request.send("data="+encodeURIComponent(str));
	    request.onreadystatechange = function()
    	{
        	if(request.readyState == 4)
        	{
            	console.log("Image sent with id->"+JSON.parse(request.responseText).id);
        	}
    	}
    };
	img.src = sr;
}
function addKeyword(word, bg, image, times)
{
	var request = new XMLHttpRequest();
	request.open("POST","addKeyword/",true);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.send("word="+encodeURIComponent(word)+"&image="+encodeURIComponent(image)+"&bulgarian="+encodeURIComponent(bg)+"&times="+encodeURIComponent(times));
}