var requestAnimationFrame;
var canvas;
var token;//Token to identify
var context;
var pixelSize; // Real size of each pixel
var rects; // All loaded color pixels
var color = []; // Color to rect match;
var mouselocation; // Which element is the mouse over
var offsetX;
function create2dArray(length) {
    var array2d = [];
    for (var i = 0; i < length; i++) {
        array2d[i] = [];
        for (var j = 0; j < length; j++) {
            array2d[i][j] = 0;
        }
    }
    return array2d;
}

function getElement(x, callback)
{
    var request = new XMLHttpRequest();
    request.open("POST","getElement/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("which="+encodeURIComponent(x)+"&token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            console.log(request.responseText);
            res = request.responseText;
            if(x >= 0) res = JSON.parse(request.responseText);
            if(callback != undefined) callback(res);
            return res;
        }
    }
}   

function divideRect(x)
{
    getElement(x, function(res)
    {
        if(res == undefined || rects[x] == undefined) return;
        var sx = rects[x].x;
        var sy = rects[x].y;
        var sw = rects[x].w;
        var sh = rects[x].h;
        color[rects[x].c.slice(1,7)] = undefined;
        if(res.tl == undefined) return;
        rects[4*x+1] = {x: sx, y: sy, w: sw/2, h: sh/2, c: '#'+res.tl.substring(0,6), al: res.tl.substring(6,8)};
        rects[4*x+2] = {x: sx+sw/2, y: sy, w: sw/2, h: sh/2, c: '#'+res.tr.substring(0,6), al: res.tr.substring(6,8)};
        rects[4*x+3] = {x: sx, y: sy+sh/2, w: sw/2, h: sh/2, c: '#'+res.bl.substring(0,6), al: res.tr.substring(6,8)};
        rects[4*x+4] = {x: sx+sw/2, y: sy+sh/2, w: sw/2, h: sh/2, c: '#'+res.br.substring(0,6), al: res.tr.substring(6,8)};
        /*if(color[res.tl.substring(0,6)] == undefined) color[res.tl.substring(0,6)] = [4*x+1];
        else color[res.tl.substring(0,6)][color[res.tl.substring(0,6)].length] = 4*x+1;
        if(color[res.tr.substring(0,6)] == undefined) color[res.tr.substring(0,6)] = [4*x+2];
        else color[res.tr.substring(0,6)][color[res.tr.substring(0,6)].length] = 4*x+2;
        if(color[res.bl.substring(0,6)] == undefined) color[res.bl.substring(0,6)] = [4*x+3];
        else color[res.bl.substring(0,6)][color[res.bl.substring(0,6)].length] = 4*x+3;
        if(color[res.br.substring(0,6)] == undefined) color[res.br.substring(0,6)] = [4*x+4];
        else color[res.br.substring(0,6)][color[res.br.substring(0,6)].length] = 4*x+4;*///COLORS BASED ON CANVAS
        //console.log(color);
    });
}
function sendKeyword(word)
{
    var request = new XMLHttpRequest();
    request.open("POST","tryWord/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("word="+encodeURIComponent(word)+"&token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            console.log(request.responseText);
            if(request.responseText.length == 0) return;
            var x = "<div id='preword' ";
            if(JSON.parse(request.responseText).points < 0) x+="style='background-color:#ffb3b3;'";
            document.getElementById("previouswords").innerHTML = x+'>'+word+"</div><div id='prepoints'><b>"+JSON.parse(request.responseText).points+"</b></div>"+document.getElementById("previouswords").innerHTML;
            document.getElementById('word').value = "";
        }
    }
    return 0;
}
// CREATE HOVER ANIMATION + HOLD&DRAG + OPTIMISE
var mouseon = false; // is the mouse held

// END
function rgbToHex(rgb)
{
    return ('0'+parseInt(rgb[0]).toString(16)).slice(1)+
           ('0'+parseInt(rgb[1]).toString(16)).slice(1)+
           ('0'+parseInt(rgb[2]).toString(16)).slice(1);
}
function init()
{
    window.addEventListener("mouseup", function(args) {
        var x = (args.x-offsetX)/pixelSize;
        var y = (args.y)/pixelSize;
        mouseon = false;
        for(var i = rects.length-1; i >= 0; i --)
        {
            if(rects[i] != undefined && x > rects[i].x && x < rects[i].x+rects[i].w && y > rects[i].y && y < rects[i].y+rects[i].h)
            {
                divideRect(i);
                i = -1;
            }
        }
    }, false);
    window.addEventListener("mousedown", function(args)
    {
        mouseon = true;
    }, false);
    window.addEventListener("mousemove", function(args)
    {
        //console.log(color[rgbToHex(context.getImageData(args.x-8, args.y-8, 1, 1).data)]);
        //console.log(args.x,args.y);
        var where = rgbToHex(context.getImageData(args.x-offsetX, args.y, 1, 1).data);
        if(where == undefined) return;
        if(!mouseon)
        {
            document.getElementById('colorbox').style.backgroundColor = '#'+where;
        }
        else
        {
            var x = (args.x-offsetX)/pixelSize;
            var y = (args.y)/pixelSize;
            for(var i = rects.length-1; i >= 0; i --)
            {
                if(rects[i] != undefined && x > rects[i].x && x < rects[i].x+rects[i].w && y > rects[i].y && y < rects[i].y+rects[i].h)
                {
                    divideRect(i);
                    i = -1;
                }
            }
        }
    }, false);
    $("#word-form").submit(function(e) {
        e.preventDefault();
    });
    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    canvas = document.getElementById("canvas-id");
    canvas.width = 700;
    canvas.height = 700;
    context = canvas.getContext("2d");
    pixelSize = canvas.width/128;
    token = localStorage.getItem('token')//retrieve token
    if(localStorage.getItem('rects') != undefined && localStorage.getItem('rects') != "undefined" && localStorage.getItem('rects') != "[]") rects = JSON.parse(localStorage.getItem('rects'));
    else getElement(-1, function(res) {rects = [{x: 0, y :0, w: 128, h: 128, c: '#'+res}]; color[res] = [0]}); // Get first rectangle
    document.body.style.paddingLeft=(window.innerWidth-document.getElementById('left-col').clientWidth-canvas.width-document.getElementById('right-col').clientWidth)/2;
    //console.log(window.outerWidth,document.getElementById('left-col').clientWidth+canvas.width+document.getElementById('right-col').clientWidth);
    document.getElementById('canvas-container').style.left = document.getElementById('canvas-container').getBoundingClientRect().left+(window.innerWidth-document.getElementById('left-col').clientWidth-canvas.width-document.getElementById('right-col').clientWidth)/2;
    document.getElementById('right-col').style.left = document.getElementById('right-col').getBoundingClientRect().left+(window.innerWidth-document.getElementById('left-col').clientWidth-canvas.width-document.getElementById('right-col').clientWidth)/2;
    
    //if(localStorage.getItem('color') != undefined && localStorage.getItem('color') != "undefined" && localStorage.getItem('color') != "[]") color = JSON.parse(localStorage.getItem('color'));
}
function nextImage()
{
    var request = new XMLHttpRequest();
    request.open("POST","nextImage/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            //rects = [];
            //context.clearRect(0,0,canvas.width, canvas.height);
            getElement(-1, function(res) {rects = [{x: 0, y :0, w: 128, h: 128, c: '#'+res}]; color[res] = [0]});
            document.getElementById('previouswords').innerHTML = "";
        }
    }
}
function getPoints(callback)
{
    var request = new XMLHttpRequest();
    request.open("POST","getPoints/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            //console.log(request.responseText);
            callback(JSON.parse(request.responseText).points);
        }
    }
}
function update()
{
    localStorage.setItem('rects',JSON.stringify(rects));
    offsetX = canvas.getBoundingClientRect().left;
    document.getElementById('colorbox').style.height=document.getElementById('heightSample').clientHeight;
    getPoints(function(res)
    {
        document.getElementById('points').innerHTML=res;
    });
    //localStorage.setItem('color',JSON.stringify(color));
    setTimeout(update, 1000);
}
function draw() {
    context.clearRect(0,0,canvas.width, canvas.height);
    context.globalAlpha = 1;
    if(rects != undefined && rects.length != undefined)
    {    
        for(var i = 0; i < rects.length; i ++)
        {
            if(rects[i] != undefined)
            {
                context.globalAlpha = parseInt(rects[i].al,16);
                context.fillStyle = rects[i].c;
                context.fillRect(rects[i].x*pixelSize, rects[i].y*pixelSize, rects[i].w*pixelSize, rects[i].h*pixelSize);
            }
        }
    }
    requestAnimationFrame(draw);
}
init();
update();
draw();