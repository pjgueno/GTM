var map;
var tiles;
var heat;
var marker;
var peri;

var rayon = 500000;
var delay = 500; 


var hexagonheatmap;
var options;

var BufferList = [];

var position = L.latLng(48.778594, 9.179740);
var bounds = L.latLngBounds([[-65, -180], [82, 180]]);

var attacksData = [];
var dates =[];

var hmHexaData ={
        ass:[],
        aa:[],
        bomb:[],
        hija:[],
        host1:[],
        host2:[],
        atta:[],
        ua:[],
        unkn:[]
        };

var selector = 'all';

var started = false;
var looper;

var i;

var headlines;

var parseTime = d3.timeParse("%Y-%m-%d");

var play_ww;
var play_r;
var play_k;
var play_w;

var AudioContext =  window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

//var masterGainNode = audioCtx.createGain();
//masterGainNode.gain.value = 1;
//masterGainNode.connect(audioCtx.destination);

var gtmIcon = L.icon({
        iconUrl: 'images/gtm.png',
        iconSize: [40, 17],
        iconAnchor: [20, 8]        
        });

window.onload = function () {   
            
    d3.queue()
    .defer(d3.json,"js/buffertoload.js")
    .defer(d3.json,"data/headlines.js")
    .awaitAll(ready);  
     
     document.getElementById("all").style.background = "rgba(0, 0, 0, 0.5)";
            
    document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% ,blue 20%,cyan 40%,lime 60%,yellow 80%, red 100%);background: linear-gradient(to top,transparent 0% ,blue 20%,cyan 40%,lime 60%,yellow 80%, red 100%);");  
        
    hexagonheatmap = L.hexbinLayer(options).addTo(map);

    marker =  L.marker(position, {icon: gtmIcon,draggable: true}).addTo(map);
    peri = L.circle(position,rayon, {
                fillColor: "rgba(0, 0, 0, 1.0)",
                color: "rgba(0, 0, 0, 1.0)",
                weight: 0,
                opacity: 0,
                fillOpacity: 0,
                interactive: false
                }).addTo(map);
    
    marker.on('mouseover', function (ev) {peri.setStyle({fillOpacity:0.5});});
    
    marker.on('mouseout', function (ev) {peri.setStyle({fillOpacity:0.0});});

    marker.on('drag', function (ev) {
        peri.setStyle({fillOpacity:0.0});
        var changePos = ev.target.getLatLng();
        if(bounds.contains(changePos) == false){                          
         marker.setLatLng(position);    
        }else{position = changePos;
             }});

    marker.on('dragend', function (ev) {
        peri.setLatLng(position);
        peri.setStyle({fillOpacity:0.5});
        });   
        
    map.on('moveend', function() { 

        if (started != undefined){

             var allAttacks = hmHexaData.ass.concat(hmHexaData.aa, hmHexaData.bomb,hmHexaData.hija,hmHexaData.host1,hmHexaData.host2,hmHexaData.atta,hmHexaData.ua,hmHexaData.unkn);

                switch (selector){

                       case 'cas':
                        hexagonheatmap.data(allAttacks);
                        break;

                        case 'all':
                        hexagonheatmap.data(allAttacks);
                        break;

                        case 'ass':
                        hexagonheatmap.data(hmHexaData.ass);
                        break;

                        case 'aa':
                        hexagonheatmap.data(hmHexaData.aa);
                        break;

                        case 'bomb':
                        hexagonheatmap.data(hmHexaData.bomb);
                        break;

                        case 'hija':
                        hexagonheatmap.data(hmHexaData.hija);
                        break;

                        case 'host1':
                        hexagonheatmap.data(hmHexaData.host1);
                        break;

                        case 'host2':
                        hexagonheatmap.data(hmHexaData.host2);
                        break;

                        case 'atta':
                        hexagonheatmap.data(hmHexaData.atta);
                        break;

                        case 'ua':
                        hexagonheatmap.data(hmHexaData.ua);
                        break;

                        case 'unkn':
                        hexagonheatmap.data(hmHexaData.unkn);
                        break;
                };
   
};
});
        
};
         
map = L.map('map').setView([-35 , 0 ], 2).setMaxBounds(bounds);
map.options.minZoom = 2;
     
tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{
				attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
				maxZoom: 18}).addTo(map);
    
map.on('click', onMapClick); 

function dataload(year){
    
    
   var file1 = "data/dates/dates"+year+".js";
    var file2 = "data/attentats/gtd"+year+".js";
    
    if(started == true){
        started = false;
        looper.stop()};
    
    
    d3.selectAll('path.hexbin-hexagon').remove()
    
    document.getElementById('limitmax').innerHTML= "";
    document.getElementById('limit4').innerHTML= "";
    document.getElementById('limit3').innerHTML= "";
    document.getElementById('limit2').innerHTML= "";
    document.getElementById('limit1').innerHTML= "";
    document.getElementById('limit0').innerHTML= 0 ; 

    document.getElementById('legendhexa').style.visibility = 'hidden';
    
     hmHexaData ={
        ass:[],
        aa:[],
        bomb:[],
        hija:[],
        host1:[],
        host2:[],
        atta:[],
        ua:[],
        unkn:[]
        };

//    COMPTEUR
    
    i = 0;

    
    d3.queue()
    .defer(d3.json,file1)
    .defer(d3.json,file2)
    .awaitAll(hexaready);   
    
    document.getElementById('date').innerHTML = "";
    document.getElementById('total_a').innerHTML = 0;            
    document.getElementById('total_k').innerHTML = 0;   
    document.getElementById('total_w').innerHTML = 0;
    
};

function hexaready(error,data){
     dates = data[0].map(function(d){
                    d = parseTime(d);
                    return d});  
     attacksData = data[1].map(function(d){
                    d.d = parseTime(d.d);
                    return d});   
    
    document.getElementById("value1").innerHTML = dates[0].toLocaleString("en-US",{ weekday: "short", day:"numeric",month: "short", year:"numeric"});
    document.getElementById("year").max = dates.length-1;
    
    
        i = 0;
        
        hmHexaData ={
        ass:[],
        aa:[],
        bomb:[],
        hija:[],
        host1:[],
        host2:[],
        atta:[],
        ua:[],
        unkn:[]
        };
        
        
        var date = dates[i];
        
//        console.log(date.toLocaleString("en-US",{ weekday: "short", day:"numeric",month: "short", year:"numeric"}));
        
        breaking_news(date);
        var attacksAtDate =  attacksData.filter(function(d){if(d.d.getTime() == date.getTime()){return d}});
        
        if (attacksAtDate.length != 0){
            var displayDate = attacksAtDate[0].d;
            attacksAtDate.forEach(function(d){
                                  
            switch (d.a){
       
               case 1:
                hmHexaData.ass.push(d);
                break;
        
                case 2:
                hmHexaData.aa.push(d);
                break;
        
                case 3:
                hmHexaData.bomb.push(d);
                break;
                
                case 4:
                hmHexaData.hija.push(d);
                break;
                
                case 5:
                hmHexaData.host1.push(d);
                break;
                
                case 6:
                hmHexaData.host2.push(d);
                break;
                
                case 7:
                hmHexaData.atta.push(d);
                break;
                
                case 8:
                hmHexaData.ua.push(d);
                break;
                
                case 9:
                hmHexaData.unkn.push(d);
                break;
        }; 
    });
        
            var allAttacks = hmHexaData.ass.concat(hmHexaData.aa, hmHexaData.bomb,hmHexaData.hija,hmHexaData.host1,hmHexaData.host2,hmHexaData.atta,hmHexaData.ua,hmHexaData.unkn);
        
        switch (selector){
       
               case 'cas':
                hexagonheatmap.data(allAttacks);
                break;
        
                case 'all':
                hexagonheatmap.data(allAttacks);
                break;
        
                case 'ass':
                hexagonheatmap.data(hmHexaData.ass);
                break;
                
                case 'aa':
                hexagonheatmap.data(hmHexaData.aa);
                break;
                
                case 'bomb':
                hexagonheatmap.data(hmHexaData.bomb);
                break;
                
                case 'hija':
                hexagonheatmap.data(hmHexaData.hija);
                break;
                
                case 'host1':
                hexagonheatmap.data(hmHexaData.host1);
                break;
                
                case 'host2':
                hexagonheatmap.data(hmHexaData.host2);
                break;
                
                case 'atta':
                hexagonheatmap.data(hmHexaData.atta);
                break;
                
                case 'ua':
                hexagonheatmap.data(hmHexaData.ua);
                break;
                
                case 'unkn':
                hexagonheatmap.data(hmHexaData.unkn);
                break;
        };  
        
        document.getElementById('date').innerHTML = displayDate.toLocaleString("en-US",{ weekday: "short", day:"numeric",month: "short", year:"numeric"});
        document.getElementById('total_a').innerHTML = allAttacks.length;            
        document.getElementById('total_k').innerHTML = d3.sum(allAttacks, (o) => o.k);   
        document.getElementById('total_w').innerHTML = d3.sum(allAttacks, (o) => o.w);
        }; 
    
        document.getElementById('legendhexa').style.visibility = 'visible';
    
        document.getElementById("year").value = i ;  

    
};

function starthexa(){
 console.log('play');
    
    
    if(dates.length != 0 && started == false){
    
    started = true;
  
           
    looper = d3.interval(function(elapsed) {  
        i +=1;
        var date = dates[i];
        breaking_news(date);
        var attacksAtDate =  attacksData.filter(function(d){if(d.d.getTime() == date.getTime()){return d}});
        
        var buffersToPlay ={
                ass:[],
                aa:[],
                bomb:[],
                hija:[],
                host1:[],
                host2:[],
                atta:[],
                ua:[],
                unkn:[]
                };
        
        if (attacksAtDate.length != 0){
            var displayDate = attacksAtDate[0].d;
            attacksAtDate.forEach(function(d){
                                  
            switch (d.a){
       
               case 1:
                hmHexaData.ass.push(d);
                buffersToPlay.ass.push(d);
                break;
        
                case 2:
                hmHexaData.aa.push(d);
                buffersToPlay.aa.push(d);
                break;
        
                case 3:
                hmHexaData.bomb.push(d);
                buffersToPlay.bomb.push(d);
                break;
                
                case 4:
                hmHexaData.hija.push(d);
                buffersToPlay.hija.push(d);
                break;
                
                case 5:
                hmHexaData.host1.push(d);
                buffersToPlay.host1.push(d);
                break;
                
                case 6:
                hmHexaData.host2.push(d);
                buffersToPlay.host2.push(d);
                break;
                
                case 7:
                hmHexaData.atta.push(d);
                buffersToPlay.atta.push(d);
                break;
                
                case 8:
                hmHexaData.ua.push(d);
                buffersToPlay.ua.push(d);
                break;
                
                case 9:
                hmHexaData.unkn.push(d);
                buffersToPlay.unkn.push(d);
                break;
        }; 
    });
        
            var allAttacks = hmHexaData.ass.concat(hmHexaData.aa, hmHexaData.bomb,hmHexaData.hija,hmHexaData.host1,hmHexaData.host2,hmHexaData.atta,hmHexaData.ua,hmHexaData.unkn);
        
        switch (selector){
       
               case 'cas':
                hexagonheatmap.data(allAttacks);
                webAudioPlayer(attacksAtDate);
                break;
        
                case 'all':
                hexagonheatmap.data(allAttacks);
                webAudioPlayer(attacksAtDate);
                break;
        
                case 'ass':
                hexagonheatmap.data(hmHexaData.ass);
                webAudioPlayer(buffersToPlay.ass);
                break;
                
                case 'aa':
                hexagonheatmap.data(hmHexaData.aa);
                webAudioPlayer(buffersToPlay.aa);
                break;
                
                case 'bomb':
                hexagonheatmap.data(hmHexaData.bomb);
                webAudioPlayer(buffersToPlay.bomb);
                break;
                
                case 'hija':
                hexagonheatmap.data(hmHexaData.hija);
                webAudioPlayer(buffersToPlay.hija);
                break;
                
                case 'host1':
                hexagonheatmap.data(hmHexaData.host1);
                webAudioPlayer(buffersToPlay.host1);
                break;
                
                case 'host2':
                hexagonheatmap.data(hmHexaData.host2);
                webAudioPlayer(buffersToPlay.host2);
                break;
                
                case 'atta':
                hexagonheatmap.data(hmHexaData.atta);
                webAudioPlayer(buffersToPlay.atta);
                break;
                
                case 'ua':
                hexagonheatmap.data(hmHexaData.ua);
                webAudioPlayer(buffersToPlay.ua);
                break;
                
                case 'unkn':
                hexagonheatmap.data(hmHexaData.unkn);
                webAudioPlayer(buffersToPlay.unkn);
                break;
        };  
        
        document.getElementById("value1").innerHTML = displayDate.toLocaleString("en-US",{ weekday: "short", day:"numeric",month: "short", year:"numeric"});   
            
        document.getElementById("year").value = i ;   
            
        document.getElementById('date').innerHTML = displayDate.toLocaleString("en-US",{ weekday: "short", day:"numeric",month: "short", year:"numeric"});
        document.getElementById('total_a').innerHTML = allAttacks.length;            
        document.getElementById('total_k').innerHTML = d3.sum(allAttacks, (o) => o.k);   
        document.getElementById('total_w').innerHTML = d3.sum(allAttacks, (o) => o.w);
  
        };
                
             if (i == dates.length-1 ){looper.stop()}; 

        
    },delay);
        };
};

function selection(val){
    selector = val;
    console.log(selector);
    
    document.getElementById("cas").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("all").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("ass").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("aa").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("bomb").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("hija").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("host1").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("host2").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("atta").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("ua").style.background = "rgba(255, 255, 255, 0.5)";
    document.getElementById("unkn").style.background = "rgba(255, 255, 255, 0.5)";

    
     var allAttacks = hmHexaData.ass.concat(hmHexaData.aa, hmHexaData.bomb,hmHexaData.hija,hmHexaData.host1,hmHexaData.host2,hmHexaData.atta,hmHexaData.ua,hmHexaData.unkn);

    
   switch (selector){
       
               case 'cas':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% ,blue 20%,cyan 40%,lime 60%,yellow 80%, red 100%);background: linear-gradient(to top,transparent 0% ,blue 20%,cyan 40%,lime 60%,yellow 80%, red 100%);");
                hexagonheatmap.data(allAttacks);
                document.getElementById("cas").style.background = "rgba(0, 0, 0, 0.5)";
                break;
        
                case 'all':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% ,blue 20%,cyan 40%,lime 60%,yellow 80%, red 100%);background: linear-gradient(to top,transparent 0% ,blue 20%,cyan 40%,lime 60%,yellow 80%, red 100%);");
                hexagonheatmap.data(allAttacks);
                document.getElementById("all").style.background = "rgba(0, 0, 0, 0.5)";
                break;
        
                case 'ass':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% , #FE0000 100%);background: linear-gradient(to top,transparent 0% , #FE0000 100%);");
                hexagonheatmap.data(hmHexaData.ass);
                document.getElementById("ass").style.background = "rgba(0, 0, 0, 0.5)";
                break;
                
                case 'aa':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% , #1A08DD 100%);background: linear-gradient(to top,transparent 0% , #1A08DD 100%);");
                hexagonheatmap.data(hmHexaData.aa);
                document.getElementById("aa").style.background = "rgba(0, 0, 0, 0.5)";
                break;
                
                case 'bomb':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% , #44FE61 100%);background: linear-gradient(to top,transparent 0% , #44FE61 100%);");
                hexagonheatmap.data(hmHexaData.bomb);
                document.getElementById("bomb").style.background = "rgba(0, 0, 0, 0.5)";
                break;
                
                case 'hija':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% , #FAFE44 100%);background: linear-gradient(to top,transparent 0% , #FAFE44 100%);");
                hexagonheatmap.data(hmHexaData.hija);
                document.getElementById("hija").style.background = "rgba(0, 0, 0, 0.5)";
                break;
                
                case 'host1':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% , #FE44E7 100%);background: linear-gradient(to top,transparent 0% , #FE44E7 100%);");
                hexagonheatmap.data(hmHexaData.host1);
                document.getElementById("host1").style.background = "rgba(0, 0, 0, 0.5)";
                break;
                
                case 'host2':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% , #DA5501 100%);background: linear-gradient(to top,transparent 0% , #DA5501 100%);");
                hexagonheatmap.data(hmHexaData.host2);
                document.getElementById("host2").style.background = "rgba(0, 0, 0, 0.5)";
                break;
                
                case 'atta':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% , #828282 100%);background: linear-gradient(to top,transparent 0% , #828282 100%);");
                hexagonheatmap.data(hmHexaData.atta);
                document.getElementById("atta").style.background = "rgba(0, 0, 0, 0.5)";
                break;
                
                case 'ua':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% , #461900 100%);background: linear-gradient(to top,transparent 0% , #461900 100%);");
                hexagonheatmap.data(hmHexaData.ua);
                document.getElementById("ua").style.background = "rgba(0, 0, 0, 0.5)";
                break;
                
                case 'unkn':
                document.getElementsByClassName("gradient")[0].setAttribute("style", "background: -webkit-linear-gradient(bottom, transparent 0% , #7F68B0 100%);background: linear-gradient(to top,transparent 0% , #7F68B0 100%);");
                hexagonheatmap.data(hmHexaData.unkn);
                document.getElementById("unkn").style.background = "rgba(0, 0, 0, 0.5)";
                break;
        };   
};
   
function onMapClick(e) {if(bounds.contains(e.latlng)== true){
            marker.setLatLng(e.latlng);
            peri.setLatLng(e.latlng);
            position = e.latlng;
            peri.setStyle({fillOpacity:0.5});
            }};

function requestSound (url,id, name){    

    var request = new XMLHttpRequest();
    var Buffer = {"content":null,"name":"","id":""};
    request.open( 'GET', url, true );
    request.responseType = 'arraybuffer';

    request.onload = function() {
    audioCtx.decodeAudioData(request.response,function(decodedData) {
//    console.log(id);       
        Buffer.content = decodedData;
        Buffer.name = name;
        Buffer.id =  id;
        BufferList.push(Buffer);
        BufferList.sort(function(a, b){return a.id-b.id});
//        console.log(BufferList);
    });         
    }
    request.send();

    };    

function ready (error,data){
     var buffers = data[0];        
   
    buffers.forEach(function(item){
               requestSound("../GTM_OK_220917/audio/" + item.file, item.id, item.file.split(".")[0]);
           });
    
    var inter = data[1]; 
    
    headlines= data[1].map(function(d){
                    d.date = parseTime(d.date);
                    return d}); 

//    console.log(headlines);
    
};

function show(){
    document.getElementById('erklaerung').style.visibility="visible"; 
    document.getElementById('expli').style.visibility="hidden";  

};

function hide(){
    document.getElementById('erklaerung').style.visibility="hidden";  
        document.getElementById('expli').style.visibility="visible";  
};

function pausehexa(){
    if(started == true){
        started = false;
        looper.stop()}
};

function erasehexa(){
    d3.selectAll('path.hexbin-hexagon').remove();
    
    hmHexaData ={
        ass:[],
        aa:[],
        bomb:[],
        hija:[],
        host1:[],
        host2:[],
        atta:[],
        ua:[],
        unkn:[]
        };
    
    document.getElementById('total_a').innerHTML = 0;            
    document.getElementById('total_k').innerHTML = 0;   
    document.getElementById('total_w').innerHTML = 0;
    
};

function reset() {
        location.reload();
        };   

function resetMarker() {
    var stuttgart = L.latLng(48.778594, 9.179740);
    position = stuttgart;
    marker.setLatLng(stuttgart);
    peri.setLatLng(stuttgart);
}; 

function breaking_news(date){  
        
    if(started == true){
        
    var filtered = headlines.filter(function(d){if(d.date.getTime() == date.getTime()){return d}});
        
    if (filtered.length == 1){
        
        document.getElementById('white').innerHTML = filtered[0].title.toUpperCase();
        document.getElementById('bn').style.visibility='visible';
        setTimeout(function(){
        document.getElementById('white').innerHTML = '';
        document.getElementById('bn').style.visibility='hidden';
        }, 5000);  
    };
    };
};

function webAudioPlayer(data){
    
//    KILL ONLY
        data.forEach(function(d){
        
        if(document.getElementById("c_ww").checked == true){playaudio_ww(d.coo,d.w1,d.w2)};
        if(document.getElementById("c_r").checked == true){playaudio_r(d.coo,d.r)};
        if(document.getElementById("c_k").checked == true){playaudio_k(d.coo,d.k)};
        if(document.getElementById("c_w").checked == true){playaudio_w(d.coo,d.w)};       
    });    
};

function playaudio_r(coord,val) {
    
    if(val == 279){
    
    var posAttack = L.latLng(coord);
    var distance = posAttack.distanceTo(position);
        
        
        if(distance <= rayon ){
    
    var direction = posAttack.lng - position.lng;
    
    if(direction > 0) {var pan = 1.0};
    if(direction == 0) {var pan = 0.0};
    if(direction <0) {var pan = -1.0;};
    
    
   var source =	audioCtx.createBufferSource();
   var sourceGainNode = audioCtx.createGain();
    var sourcePanNode = audioCtx.createStereoPanner();
    
    source.connect(sourceGainNode);
    sourceGainNode.connect(sourcePanNode);
    sourcePanNode.connect(audioCtx.destination);
        
    
    var attenuation = dBAttenuator(distance);
    var gain = Math.pow(10,attenuation/20);
        
    
    source.buffer = BufferList[0].content;
    sourceGainNode.gain.value = gain;
    sourcePanNode.pan.value = pan;
    
    source.start(0);  
            };
    
    };
    };
      
function playaudio_k(coord,val) {
    
    var posAttack = L.latLng(coord);
    var distance = posAttack.distanceTo(position);
    
    
            if(distance <= rayon ){

    
    var direction = posAttack.lng - position.lng;
    
    if(direction > 0) {var pan = 1.0};
    if(direction == 0) {var pan = 0.0};
    if(direction <0) {var pan = -1.0;};
    
    var attenuation = dBAttenuator(distance);
    var multiplication = dBMultiply (attenuation,val);
    var gain = Math.pow(10,multiplication/20);
    
   var source =	audioCtx.createBufferSource();
   var sourceGainNode = audioCtx.createGain();
    var sourcePanNode = audioCtx.createStereoPanner();
    
    source.connect(sourceGainNode);
    sourceGainNode.connect(sourcePanNode);
    sourcePanNode.connect(audioCtx.destination);
    
    source.buffer = BufferList[13].content;
    sourceGainNode.gain.value = gain;
    sourcePanNode.pan.value = pan;
    
    source.start(0);  
    
            };
    
    };
      
function playaudio_w(coord,val) {
    
    var posAttack = L.latLng(coord);
    var distance = posAttack.distanceTo(position);
    
            if(distance <= rayon ){

    
    var direction = posAttack.lng - position.lng;
    
    if(direction > 0) {var pan = 1.0};
    if(direction == 0) {var pan = 0.0};
    if(direction <0) {var pan = -1.0;};    
    
   var source =	audioCtx.createBufferSource();
   var sourceGainNode = audioCtx.createGain();
    var sourcePanNode = audioCtx.createStereoPanner();
    
    
    var attenuation = dBAttenuator(distance);
    var multiplication = dBMultiply (attenuation,val);
    var gain = Math.pow(10,multiplication/20);
    
    source.connect(sourceGainNode);
    sourceGainNode.connect(sourcePanNode);
    sourcePanNode.connect(audioCtx.destination);
    
    source.buffer = BufferList[1].content;
    sourceGainNode.gain.value = gain;
    sourcePanNode.pan.value = pan;
    
    source.start(0); 
        
            };
                
     };

function playaudio_ww(coord,val1,val2){
    
    var posAttack = L.latLng(coord);
    var distance = posAttack.distanceTo(position);
    
            if(distance <= rayon ){

    
    var direction = posAttack.lng - position.lng;
    
    if(direction > 0) {var pan = 1.0};
    if(direction == 0) {var pan = 0.0};
    if(direction <0) {var pan = -1.0;};
    
    
   var source =	audioCtx.createBufferSource();
   var sourceGainNode = audioCtx.createGain();
    var sourcePanNode = audioCtx.createStereoPanner();
    
    source.connect(sourceGainNode);
    sourceGainNode.connect(sourcePanNode);
    sourcePanNode.connect(audioCtx.destination);
    
    var attenuation = dBAttenuator(distance);
    var gain = Math.pow(10,attenuation/20);
    
    var type =parseInt((val1+'0'+val2),10);
              
        switch (type){

            case 607:
            case 6013:
            case 600:
            case 6010:
            case 6014:
            case 6015:
            case 6016:
            case 6017:
            case 6028:
            case 6029:
            case 609:

            source.buffer = BufferList[2].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 
                
            break;

            case 6011:
                
            source.buffer = BufferList[12].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;

            case 608:
                
            source.buffer = BufferList[9].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;

            case 503:
                
            source.buffer = BufferList[5].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;

            case 502:
                
            source.buffer = BufferList[8].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;  

            case 504:
                
            source.buffer = BufferList[11].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;    
                
            case 505:
            case 506:
            case 500:
                
            source.buffer = BufferList[4].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;   

            case 8018:
            case 8019:
            case 8020:
            case 800:
                
            source.buffer = BufferList[3].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;   

            case 9022:
                
            source.buffer = BufferList[10].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;

            case 9023:
                
            source.buffer = BufferList[7].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;   
                
            case 9024:
                
            source.buffer = BufferList[6].content;
            sourceGainNode.gain.value = gain;
            sourcePanNode.pan.value = pan;
            source.start(0); 

            break;     
        }; 
            };
 };
      
function dBMultiply(value,multi){
    var sum = 10*Math.log10(multi*Math.pow(10,value/10));
    return sum;  
};
    
function dBAttenuator(dist){
//    ON REDUIT L'ECHELLE AU KM ou au 100 metres
//    var level = 0-Math.abs(20*Math.log10(1/(dist/1000)));
//        var level = 0-Math.abs(20*Math.log10(1/(dist/(rayon/100))));
    
            var level = 0-Math.abs(20*Math.log10(1/((dist/rayon)*500)));
    
    
    return level;
};

function showVal (value,div){
    
    if (div == 'value1'){
        document.getElementById(div).innerHTML = dates[value].toLocaleString("en-US",{ weekday: "short", day:"numeric",month: "short", year:"numeric"}); 
        
//       pausehexa()
       
        i = parseInt(value,10);
        
        pausehexa();
        
        hmHexaData ={
        ass:[],
        aa:[],
        bomb:[],
        hija:[],
        host1:[],
        host2:[],
        atta:[],
        ua:[],
        unkn:[]
        };
        
        
        var date = dates[value];
                
        breaking_news(date);
        var attacksAtDate =  attacksData.filter(function(d){if(d.d.getTime() <= date.getTime()){return d}});
        
        if (attacksAtDate.length != 0){
            var displayDate = attacksAtDate[attacksAtDate.length-1].d;
            attacksAtDate.forEach(function(d){
                                  
            switch (d.a){
       
               case 1:
                hmHexaData.ass.push(d);
                break;
        
                case 2:
                hmHexaData.aa.push(d);
                break;
        
                case 3:
                hmHexaData.bomb.push(d);
                break;
                
                case 4:
                hmHexaData.hija.push(d);
                break;
                
                case 5:
                hmHexaData.host1.push(d);
                break;
                
                case 6:
                hmHexaData.host2.push(d);
                break;
                
                case 7:
                hmHexaData.atta.push(d);
                break;
                
                case 8:
                hmHexaData.ua.push(d);
                break;
                
                case 9:
                hmHexaData.unkn.push(d);
                break;
        }; 
    });
        
            var allAttacks = hmHexaData.ass.concat(hmHexaData.aa, hmHexaData.bomb,hmHexaData.hija,hmHexaData.host1,hmHexaData.host2,hmHexaData.atta,hmHexaData.ua,hmHexaData.unkn);
        
        switch (selector){
       
               case 'cas':
                hexagonheatmap.data(allAttacks);
                break;
        
                case 'all':
                hexagonheatmap.data(allAttacks);
                break;
        
                case 'ass':
                hexagonheatmap.data(hmHexaData.ass);
                break;
                
                case 'aa':
                hexagonheatmap.data(hmHexaData.aa);
                break;
                
                case 'bomb':
                hexagonheatmap.data(hmHexaData.bomb);
                break;
                
                case 'hija':
                hexagonheatmap.data(hmHexaData.hija);
                break;
                
                case 'host1':
                hexagonheatmap.data(hmHexaData.host1);
                break;
                
                case 'host2':
                hexagonheatmap.data(hmHexaData.host2);
                break;
                
                case 'atta':
                hexagonheatmap.data(hmHexaData.atta);
                break;
                
                case 'ua':
                hexagonheatmap.data(hmHexaData.ua);
                break;
                
                case 'unkn':
                hexagonheatmap.data(hmHexaData.unkn);
                break;
        };  
        
        document.getElementById('date').innerHTML = displayDate.toLocaleString("en-US",{ weekday: "short", day:"numeric",month: "short", year:"numeric"});
        document.getElementById('total_a').innerHTML = allAttacks.length;            
        document.getElementById('total_k').innerHTML = d3.sum(allAttacks, (o) => o.k);   
        document.getElementById('total_w').innerHTML = d3.sum(allAttacks, (o) => o.w);
        };      
    };
    
    
    if (div == 'value2'){
        document.getElementById(div).innerHTML = value + " km"; 
        rayon = value * 1000;
        peri.setRadius(rayon);
    };    
    
    if (div == 'value3'){
        document.getElementById(div).innerHTML = value + " ms"; 
        pausehexa();
        delay = parseInt(value);
    };    
};


