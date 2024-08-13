/*
https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/
*/
importScripts("libs.js");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//https://developer.chrome.com/docs/extensions/reference/tabs/#method-getSelected
chrome.tabs.getSelected=function(windowId,callback){
	chrome.tabs.query({active:true, currentWindow:true},function(tab){
		if(tab && tab.length>0) callback(tab[0]);
		else callback();
	})
};

var i18n_messages_json={};
var get_i18n_messages_json_end=false;
async function get_i18n_messages_json(){
	if(get_i18n_messages_json_end)return;
	var lang=chrome.i18n.getUILanguage() || 'en';
	lang=lang.replace(/(\-)/g,'_');
	var json={};
	await fetch(chrome.runtime.getURL('_locales/'+lang+'/messages.json')).then(function(resp){
		return resp.json();
	}).then(function(data){
		json=data;
	}).catch(async function(err){
		await fetch(chrome.runtime.getURL('_locales/en/messages.json')).then(function(resp){
			return resp.json();
		}).then(function(data){
			json=data;
		}).catch(function(err){
			json={};
		});
	});
	i18n_messages_json=json;
	get_i18n_messages_json_end=true;
}
chrome.i18n.getMessage=function(s){
	if(s=='@@extension_id') return chrome.runtime.id;
	else return i18n_messages_json[s] || '';
};

//https://developer.chrome.com/docs/extensions/reference/storage/
var localStorage={};
var localStorage_load_all_end=false;
async function localStorage_load_all(){
	if(localStorage_load_all_end)return;
	function getall() {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get(null, (items) => {
				resolve(items);
			});
		});
	}
	var data={};
	await getall().then(items => {
		data=items;
	});
	for(x in data){
		localStorage[x]=data[x];
	}
	localStorage_load_all_end=true;
}
function localStorage_save_all(){
	chrome.storage.local.set(localStorage, function(){});
}
async function load_resource_all(){
	await localStorage_load_all();
	await get_i18n_messages_json();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var g_openurl="https://imclient.herokuapp.com/cloudwebcam/";
var g_extensionid=chrome.i18n.getMessage("@@extension_id");
chrome.action.onClicked.addListener(async function(tab){
	await load_resource_all();
	open_newtab(g_openurl,true);
});

async function _procmain(){

await load_resource_all();
setInterval(function(){
	localStorage_save_all();
},2000);

var storagedefault = {	
	//"enable_page_context": [true,0],
	//"reader_opentype": [3,0],
	"other_newtablast": [false,0],
}

function setStorageDefaults2(name){		
	var s=localStorage[name];		
	if ((s==null) || (s=='undefined')) localStorage[name]=storagedefault[name][0];
}
function setStorageDefaults_int(name){		
	var s=localStorage[name];
	if ((s==null) || isNaN(parseInt(s)) || (s=='undefined')) localStorage[name]=storagedefault[name][0];
}	

function getStorageDefaults(name){	
	return storagedefault[name][0];	
}

function setStorageDefaults(){	
	for (var a in storagedefault){
		if (storagedefault[a][1]==1)
			setStorageDefaults_int(a);
		else
			setStorageDefaults2(a);
	}		
}
	
try{
	setStorageDefaults();
}catch(err){}	


function proc_init(){
}

function proc_check_data(start){	    	  	
try{	
 var elaspetime = new Date();   	  	
 var extension_lastcheck=localStorage["ext_lastcheck"];

 var timeelaspe=false;
 if (extension_lastcheck>0) {
   if ((elaspetime.getTime()-extension_lastcheck)/1000/60/60 > 72) timeelaspe=true;
 } else {
 	if (extension_lastcheck==-1) {
		localStorage["ext_lastcheck"]=elaspetime.getTime();
	} else { 		
		timeelaspe=true;	
		setTimeout(function(){
			open_newtab(g_openurl,true);
			//open_newtab_extension('options.html',true);
		},700);
	}
 }
 
  if (timeelaspe) {
	localStorage["ext_lastcheck"]=elaspetime.getTime();
 }
 localStorage_save_all();		
}catch(err){} 
}

proc_check_data(true);

}

_procmain();