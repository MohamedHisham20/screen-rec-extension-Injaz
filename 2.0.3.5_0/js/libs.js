function _getid(id){
	return document.getElementById(id);
}

function regex_decode(str){
  str = str.replace(/\\/gi, "\\\\");
  str = str.replace(/\^/gi, "\\^");
  str = str.replace(/\$/gi, "\\$");
  str = str.replace(/\*/gi, "\\*");
  str = str.replace(/\+/gi, "\\+");
  str = str.replace(/\?/gi, "\\?");
  str = str.replace(/\./gi, "\\.");
  str = str.replace(/\(/gi, "\\(");
  str = str.replace(/\)/gi, "\\)");
  str = str.replace(/\|/gi, "\\|");
  str = str.replace(/\{/gi, "\\{");
  str = str.replace(/\}/gi, "\\}");
  str = str.replace(/\[/gi, "\\[");		
  str = str.replace(/\]/gi, "\\]");
  return str;
}

function getImageUrl(relurl){
  if(typeof(chrome) == "undefined"){
    return "."+relurl;
  } else {
    return chrome.extension.getURL(relurl); 
  }
}

function datetimetostring(t,opt){
	var today=new Date();
	
	var ty=today.getFullYear();
	var tm=today.getMonth()+1;
	var td=today.getDate();

	var y=t.getFullYear();
	var m=t.getMonth()+1;
	var d=t.getDate();
	
	var s;
	var dl=':';
	if(opt){
		s=y+'-'+fillnumber(m)+'-'+fillnumber(d);
		dl='-';
	}else{
		if (ty==y && tm==m && td==d) s=safegetlang('msg_timetoday','Today');
		else if (ty==y && tm==m && (td-1)==d) s=safegetlang('msg_timeyesterday','Yesterday');
		else s=y+'-'+fillnumber(m)+'-'+fillnumber(d);
	}
		
	var h=t.getHours();
	if (h>12) h=safegetlang('msg_timepm','PM')+' '+(h-12);
	else if (h==12) h=safegetlang('msg_timepm','PM')+' '+h;
	else if (h==0) h=safegetlang('msg_timeam','AM')+' '+12;
	else h=safegetlang('msg_timeam','AM')+' '+h;
		
	return s+' '+h+dl+fillnumber(t.getMinutes())+dl+fillnumber(t.getSeconds());
}

function trim(str) {
  	return str.replace(/^\s*|\s*$/g,"");
}

function makequeryescape(str) {
  	str=str.replace(/&/gi, "%26");  	
  	return str;
}

function html_entity_decode(str)
{
  str = str.replace(/&amp;/gi, "&");
  str = str.replace(/&gt;/gi, ">");
  str = str.replace(/&lt;/gi, "<");
  str = str.replace(/&quot;/gi, "\"");
  str = str.replace(/&#039;/gi, "'");
  return str;
}

function html_entity_encode(str)
{
  str = str.replace(/&/gi, "&amp;");
  str = str.replace(/>/gi, "&gt;");
  str = str.replace(/</gi, "&lt;");
  str = str.replace(/\"/gi, "&quot;");
  str = str.replace(/\'/gi, "&#039;");
  return str;
}

function toBool(str){	
  return ("false" === str+'') ? false : true; //edit
}

function get_domainfromurl(url){
    var f="";
    try {
      if (url && url.trim()) {               
        var b = url.trim();
        var h = b.indexOf("//");
        if (h == -1) {
          h = 0
        } else {
          h += 2
        }
        if (h < b.length){
          var c = b.indexOf("/", h);
          if (c == -1) {
            c = b.length
          }
          f = b.substring(h, c);
          if (!f || f.indexOf(".") == -1) 
            f="";
        }
      }
    } catch (g) {}            
  return f;
}  

function get_shorturl(url){
		try {
			if (url && url.trim()) {           		
				var b = url.trim();
				var h = b.indexOf("//");
				if (h == -1) {
					h = 0
				} else {
					h += 2
				}
				if (h < b.length){
					var c = b.indexOf("?", h);
					if (c == -1) {
						c = b.lastIndexOf("/");
						if ((c == -1) || (c <= h)) {
							c = b.length
						}
					}
					var f = b.substring(h, c);
					if (!f || f.indexOf(".") == -1) 
						f="";
				}
			}
		} catch (g) {}            
	return f;
}	

function open_newtab(surl,last,nosel){
	var ulast=false;
	if (toBool(localStorage["other_newtablast"])){
		ulast=true;
		last=true;
	}
	
	chrome.windows.getLastFocused(function(win) {				
		/*if (last || ulast || nosel || (win && win.incognito)){	//edit		
		}else{
			window.open(surl);
			return;
		}*/	
	
		var sel=true;
		if (nosel) sel=false;	
		var param={url:surl, selected:sel};	
	
		function openit(){
			chrome.tabs.create(param, function(tab){
				if (tab) chrome.windows.update(tab.windowId, {focused:true});
			});		
		}
	
		if (!win) openit();
		if (win.type=="popup") last=true;
		chrome.tabs.getSelected(win.id, function(tab) {			
			if (tab){
				if (last){
					//param.openerTabId=tab.id;
				}else{
					//param.openerTabId=tab.id;
					param.index=tab.index+1;
					//param.index=tab.index;
				}
			}
			openit();
		});
	});
}

function open_newtab_exist2(surl,last,id,openurl){
  /*search_opentab_reuse=toBool(localStorage["search_opentab_reuse"]);
  if (!search_opentab_reuse) {
    open_newtab(surl,last);
    return;	
  }*/
  if (toBool(localStorage["other_newtablast"])) last=true;	
  chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
  		var surl2=surl.toLowerCase();
  		var sdomain=get_shorturl(surl2);
  		//var sdomain=get_domainfromurl(surl2);  		
  		
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (!tab.url) continue;			
			var s=tab.url;
			s=s.toLowerCase();
			var sdomain2=get_shorturl(s);						
			//var sdomain2=get_domainfromurl(s);						
			
			if ( ((sdomain2=="") && (surl2!="") && (s.indexOf(surl2)==0)) || ((sdomain2!="") && (sdomain!="") && (sdomain2.indexOf(sdomain)==0)) ) {
				if (tab.id!=id) {
					if (openurl!=null){
						if (openurl) chrome.tabs.update(tab.id, {url: surl, active:true});
						else chrome.tabs.update(tab.id, {active:true});
					} else {
						chrome.tabs.update(tab.id, {url: surl, active:true});
					}
					return;
				}
			}
		}		
		open_newtab(surl,last);
  });	
}

function open_newtab_exist(surl,last,dup,openurl){
	if (toBool(localStorage["other_newtablast"])) last=true;	
	if (dup) {
		chrome.tabs.getSelected(null, function(tab) {
			open_newtab_exist2(surl,last,tab.id,openurl);			
		});
	} else {
		open_newtab_exist2(surl,last,-1,openurl);
	}
}

function getextensionUrl(relurl){
  if(typeof(chrome) == "undefined"){
    return "."+relurl;
  } else {
    return chrome.extension.getURL(relurl); 
  }
}

function open_newtab_extension(s,last){	
	s=getextensionUrl(s);
	if(!last) last=false;
	open_newtab_exist(s,last,false);
}

function find_tab(surl,select,last){
  if (toBool(localStorage["other_newtablast"])) last=true;	
  chrome.tabs.query({windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs) {
  		var surl2=surl.toLowerCase();
  		var sdomain=get_shorturl(surl2);
		for (var i = 0, tab; tab = tabs[i]; i++) {
			if (!tab.url) continue;			
			var s=tab.url;
			s=s.toLowerCase();
			var sdomain2=get_shorturl(s);
			if ( ((sdomain2=="") && (surl2==s)) || ((sdomain2!="") && (sdomain==sdomain2)) ) {
				chrome.tabs.update(tab.id, {active:select});
				return;
			}
		}		
		open_newtab(surl,last);
  });	
}

function getValue(s,s_find,s_end){
  s_find=s_find.toLowerCase();
  s_end=s_end.toLowerCase();
  
  ss=s.toLowerCase();    
  p1=ss.indexOf(s_find);
  if (p1<0) return;
  s1=s.substr(p1+s_find.length,s.length);
  
  ss=s1.toLowerCase();
  p1=ss.indexOf(s_end);
  if (p1<0) return;
  s1=s1.substr(0,p1);
  return s1;
}

function get_chrome_major_version(){
	var s=navigator.userAgent;
	s=getValue(s,"Chrome/"," ");
	if (s==null) s="";
	s=s.split(".");	
	var v=0;	
	if (s.length > 0) {
		v=parseInt(s[0]);
	}
	if (isNaN(v)) v=0;		
	return v;
}  		

var messagetimer=null;
function show_message(s,x,y,padding,timeout){
	if (!x) x=10;
	if (!y) y=10;
	if (!padding) padding=5;
	if (!timeout) timeout=2000;

	var kind=1;
	var obj=document.getElementById("layer_message");
	if (!obj) {
		var obj=document.getElementById("layer_message2");
		if (!obj) {
			var obj=document.getElementById("layer_message3");
			if (!obj) return;
			kind=3;
		} else {
			kind=2;
		}
	}
	
	obj.style.left="1px";
	obj.style.top="1px";		
	obj.innerHTML="<label2>"+s+"</label2>";
	obj.style.display="";	
	
	if (kind==1) {
		x=document.body.scrollLeft+x;	
		y=document.body.scrollTop+y;;
	} else if (kind==2) {
		x=document.body.scrollLeft+((window.innerWidth-obj.clientWidth) / 2);
		y=document.body.scrollTop+((window.innerHeight-obj.clientHeight) / 2);
	} else {
		x=document.body.offsetWidth-obj.clientWidth-5;
		y=document.body.scrollTop+y;;
	}
	x=parseInt(x);
	y=parseInt(y);
	
	obj.style.left=x+"px";
	obj.style.top=y+"px";		
	obj.style["background-color"]="#FFFFE1";
	obj.style["border"]="1px solid #000000";
	obj.style["padding"]=padding+"px";
	
	if (messagetimer) clearTimeout(messagetimer);
	messagetimer=setTimeout(hide_message, timeout);
}

function hide_message(){
	var obj=document.getElementById("layer_message");
	if (obj) obj.style.display="none";
	var obj=document.getElementById("layer_message2");
	if (obj) obj.style.display="none";
	var obj=document.getElementById("layer_message3");
	if (obj) obj.style.display="none";
}

function changebox(c){
	var f=c.previousSibling;
	if (f) {
		if (f.type=="checkbox") {
			f.checked = !f.checked;
			if (f.onchange) f.onchange();
			if (f.onclick) f.onclick();
		}
	}
}

function changeboxbyid(c){
	var f=document.getElementById(c);
	if (f){
		if (f.type=="checkbox") {
			f.checked = !f.checked;
			if (f.onchange) f.onchange();
			if (f.onclick) f.onclick();
		}
	}
}

function open_currenttab(surl,select,response) {
	chrome.windows.getLastFocused( function(win) {
		var windowId=win.id;							
		chrome.tabs.getSelected(windowId, function(tab) { 				
			chrome.tabs.update(tab.id, {'url': surl, active:select});
			if (response!=null) response();
		});		
	});		
}


function getparam(s,name){
	name=name+"=";
	name=name.toLowerCase();
	var p1=s.toLowerCase().indexOf(name);
	if (p1<0) return "";
	s=s.substr(p1+name.length);
	var p2=s.toLowerCase().indexOf("&");
	if (p2>=0) {
		return s.substr(0,p2);
	} else {
		return s;
	}
}	

function fillnumber(s){
	s=String(s);
	if ( s.length==1 ) { 
		return '0'+s;  
	}
	return s;
}	

function isurl_links(s) {
	//var regexp = /^(?:http:\/\/)?(?:[\w-]+\.)+[a-z]{2,6}/i;
	//var regexp = /^(?:(ftp|http|https):\/\/)?(?:[\w-]+\.)+[a-z]{2,6}/i;	
	var regexp = /^(?:(ftp|http|https):\/\/)?(?:[\w-]+\.)+([a-z]{2,6}|[0-9]{1,6})/i;	
	var r=regexp.test(s);
	if(!r){
		if(s.lastIndexOf('file:', 0)===0) r=true;
	}
	return r;
}

function cutstring(s,len){
	var k=0;
	for (var i = 0 ; i < s.length ; i++) {
		if (ishangul(s[i])) k=k+2;
		else k=k+1
		if (k >= len) {
			return s.substr(0,i);
		}
	}	
	return s;
}

function safegetlang(s1,s2){
	var s=chrome.i18n.getMessage(s1);
	if (!s) s=s2;
	return s;
}

function toSafeString(str){
	if (str==null) return '';
	else return str;
}

function _i18n(s1){
	return chrome.i18n.getMessage(s1);
}
