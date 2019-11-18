var token = "randomtoken"; // User token
function checkToken()
{
    if(localStorage.getItem('token')!=undefined && localStorage.getItem('token')!='undefined')
    {
        token = localStorage.getItem('token');
    }
    var request = new XMLHttpRequest();
    request.open("POST","checkToken/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            var resp = JSON.parse(request.responseText);
            console.log(resp);
            if(!resp.valid)
            {
                token = resp.ntk;
                localStorage.setItem('token', token);
                localStorage.setItem('rects', undefined);
            }
            //localStorage.setItem('color', undefined);
        }
    }
}
$('#game').click(function()
{
    var x = this.id;
    $('#'+x).addClass('selected');
    $("body").fadeOut("medium", function()
    {
        window.open(x+'.html','_self');
    });
});
var username;
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
            if(callback != undefined) callback(JSON.parse(request.responseText).points);
        }
    }
}

function getLeaderbord()
{
    var request = new XMLHttpRequest();
    request.open("POST","getLeaderbord/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            console.log(request.responseText);
            var p = JSON.parse(request.responseText);
            if(p == undefined || p[0] == undefined) return;
            if(p[10] != undefined) $('#11').append("<div id='nameleader'>"+p[10].pos+". "+p[10].name+"</div><div id='pointleader'><b>"+p[10].points+"</b></div>");
            for(var i = 0; i < 10; i ++)
            {
                if(p[i] == undefined) break;
                $('#top10').append("<div id='nameleader'>"+(i+1)+". "+p[i].name+"</div><div id='pointleader'><b>"+p[i].points+"</b></div>");
            }
        }
    }
}
function changeLang(nlang)
{
    var request = new XMLHttpRequest();
    request.open("POST","changeLang/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("lang="+encodeURIComponent(nlang)+"&token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            $('#saved').fadeIn();
        }
    }
}
function checkLogin(callback, callback2)
{
    var request = new XMLHttpRequest();
    request.open("POST","checkLogin/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            var r = JSON.parse(request.responseText);
            if(r.logged) callback(r);
            else callback2(r);
        }
    }
}
var currpg=1;
function showHelp(which)
{
    if(currpg<1) currpg = 1;
    if(currpg>3)
    {
        currpg = 1;
        $("#block").fadeOut();
        $("#popup").fadeOut();
        return;
    }
    which = currpg;
    $('.helppage').css('display','none');
    $('#page'+which).fadeIn('fast');
}
$("#loginform").submit(function(e) {
    e.preventDefault();
});
$("#signupform").submit(function(e) {
    e.preventDefault();
});
$('.option').click(function()
{
    console.log(ii);
    var ii = this.id;
    if(ii == "game"|| ii == "index") return;
    $("#popup").fadeIn("medium", function()
    {
        $('body').click(function()
        {
            if($("#popup").css('opacity') == 1)
            {
                $("#block").fadeOut();
                $("#popup").fadeOut();
            }
        });
    });
    $("#popup").load(ii+'.html', function()
    {
        if(ii == "user")
        {
            checkLogin(function(res)
            {
                $('#userinfo').css('display','block');
                $('#username-popup').append(res.username);
                $('#points-popup').append("<h3><b>Score: "+res.points+"</b></h3>");
            }, function(res)
            {
                $('#signin').css('display','block');
            });
        }  
        if(ii == "leaderbord") getLeaderbord();
        if(ii == "help") showHelp(1);
    });
    $('#block').fadeIn();
});
$('#popup').click(function(event)
{
    event.stopPropagation();
});
function login(user, pass)
{
    var request = new XMLHttpRequest();
    request.open("POST","login/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("user="+encodeURIComponent(user)+"&pass="+encodeURIComponent(pass)+"&token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            console.log(request.responseText.valid);
            if(JSON.parse(request.responseText).valid)
            {
                localStorage.setItem('rects', undefined);
                
                $('#popup').fadeOut();
                $('#block').fadeOut();
                console.log(user);
                username = user;
            }
            else
            {
                $('#wrong').fadeIn();
            }
        }
    }
    return 0;
}
function register(user, pass)
{
    var request = new XMLHttpRequest();
    request.open("POST","register/",true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send("user="+encodeURIComponent(user)+"&pass="+encodeURIComponent(pass)+"&token="+encodeURIComponent(token));
    request.onreadystatechange = function()
    {
        if(request.readyState == 4)
        {
            console.log(request.responseText);
            if(JSON.parse(request.responseText).valid)
            {
                $('#popup').fadeOut();
                $('#block').fadeOut();
                username = user;
            }
            else
            {
                $("#wrong3").fadeIn();
            }
        }
    }
}
function reset()
{
    localStorage.setItem('token',undefined);
}
function validate(u, p, p1)
{
    if(p != p1) $('#wrong2').fadeIn();
    else
    {
        register(u, p);
    }
    return 0;

}
checkToken();