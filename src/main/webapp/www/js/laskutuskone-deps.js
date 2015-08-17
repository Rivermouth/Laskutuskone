function CODE128(a,b){function c(){return-1==a.search(n)?!1:!0}function d(a,b,c,d){var e="";return e+=i(c),e+=b(a),e+=i(d(a,c)),e+=m}function e(a){for(var b="",c=0;c<a.length;c++)b+=k(a[c]);return b}function f(a){for(var b="",c=0;c<a.length;c+=2)b+=i(parseInt(a.substr(c,2)));return b}function g(a,b){for(var c=0,d=0;d<a.length;d++)c+=j(a[d])*(d+1);return(c+b)%103}function h(a,b){for(var c=0,d=1,e=0;e<a.length;e+=2)c+=parseInt(a.substr(e,2))*d,d++;return(c+b)%103}function i(a){for(var b=0;b<l.length;b++)if(l[b][2]==a)return l[b][1];return""}function j(a){for(var b=0;b<l.length;b++)if(l[b][0]==a)return l[b][2];return 0}function k(a){for(var b=0;b<l.length;b++)if(l[b][0]==a)return l[b][1];return""}b=b||"B",this.string128=a+"",this.valid=c,this.encoded=function(){return c(a)?o["code128"+b](a):""};var l=[[" ","11011001100",0],["!","11001101100",1],['"',"11001100110",2],["#","10010011000",3],["$","10010001100",4],["%","10001001100",5],["&","10011001000",6],["'","10011000100",7],["(","10001100100",8],[")","11001001000",9],["*","11001000100",10],["+","11000100100",11],[",","10110011100",12],["-","10011011100",13],[".","10011001110",14],["/","10111001100",15],["0","10011101100",16],["1","10011100110",17],["2","11001110010",18],["3","11001011100",19],["4","11001001110",20],["5","11011100100",21],["6","11001110100",22],["7","11101101110",23],["8","11101001100",24],["9","11100101100",25],[":","11100100110",26],[";","11101100100",27],["<","11100110100",28],["=","11100110010",29],[">","11011011000",30],["?","11011000110",31],["@","11000110110",32],["A","10100011000",33],["B","10001011000",34],["C","10001000110",35],["D","10110001000",36],["E","10001101000",37],["F","10001100010",38],["G","11010001000",39],["H","11000101000",40],["I","11000100010",41],["J","10110111000",42],["K","10110001110",43],["L","10001101110",44],["M","10111011000",45],["N","10111000110",46],["O","10001110110",47],["P","11101110110",48],["Q","11010001110",49],["R","11000101110",50],["S","11011101000",51],["T","11011100010",52],["U","11011101110",53],["V","11101011000",54],["W","11101000110",55],["X","11100010110",56],["Y","11101101000",57],["Z","11101100010",58],["[","11100011010",59],["\\","11101111010",60],["]","11001000010",61],["^","11110001010",62],["_","10100110000",63],["`","10100001100",64],["a","10010110000",65],["b","10010000110",66],["c","10000101100",67],["d","10000100110",68],["e","10110010000",69],["f","10110000100",70],["g","10011010000",71],["h","10011000010",72],["i","10000110100",73],["j","10000110010",74],["k","11000010010",75],["l","11001010000",76],["m","11110111010",77],["n","11000010100",78],["o","10001111010",79],["p","10100111100",80],["q","10010111100",81],["r","10010011110",82],["s","10111100100",83],["t","10011110100",84],["u","10011110010",85],["v","11110100100",86],["w","11110010100",87],["x","11110010010",88],["y","11011011110",89],["z","11011110110",90],["{","11110110110",91],["|","10101111000",92],["}","10100011110",93],["~","10001011110",94],[String.fromCharCode(127),"10111101000",95],[String.fromCharCode(128),"10111100010",96],[String.fromCharCode(129),"11110101000",97],[String.fromCharCode(130),"11110100010",98],[String.fromCharCode(131),"10111011110",99],[String.fromCharCode(132),"10111101110",100],[String.fromCharCode(133),"11101011110",101],[String.fromCharCode(134),"11110101110",102],[String.fromCharCode(135),"11010000100",103],[String.fromCharCode(136),"11010010000",104],[String.fromCharCode(137),"11010011100",105]],m="1100011101011",n=/^[!-~ ]+$/,o={code128B:function(a){return d(a,e,104,g)},code128C:function(a){return a=a.replace(/ /g,""),d(a,f,105,h)}}}function CODE128B(a){return new CODE128(a,"B")}function CODE128C(a){return new CODE128(a,"C")}!function(){JsBarcode=function(a,b,c){var d=function(a,b){for(var c in b)a[c]=b[c];return a};c=d(JsBarcode.defaults,c);var e=document.createElement("canvas");if(!e.getContext)return a;var f=new window[c.format](b);if(!f.valid())return this;var g=f.encoded(),h=e.getContext("2d");e.width=g.length*c.width+2*c.quite,e.height=c.height,h.clearRect(0,0,e.width,e.height),c.backgroundColor&&(h.fillStyle=c.backgroundColor,h.fillRect(0,0,e.width,e.height)),h.fillStyle=c.lineColor;for(var i=0;i<g.length;i++){var j=i*c.width+c.quite;"1"==g[i]&&h.fillRect(j,0,c.width,c.height)}return uri=e.toDataURL("image/png"),a.attr?a.attr("src",uri):void a.setAttribute("src",uri)},JsBarcode.defaults={width:2,height:100,quite:10,format:"CODE128",backgroundColor:"#fff",lineColor:"#000"},window.jQuery&&(jQuery.fn.JsBarcode=function(a,b){JsBarcode(this,a,b)}),window.JsBarcode=JsBarcode}(),function(a,b){var c={backgroundColor:"#fff",lineColor:"#000",strict:!1},d=function(a,b){var c=a.length;return(a.substring(0,c-(""+b).length)+b).substring(0,c)},e=function(a,d){var e=b.createElement("canvas"),f=e.getContext("2d");e.width=a.offsetWidth,e.height=a.offsetHeight,f.clearRect(0,0,e.width,e.height),f.fillStyle=c.backgroundColor,f.fillRect(0,0,e.width,e.height),f.fillStyle=c.lineColor,f.textAlign="center",f.textBaseline="middle",f.fillText(d,e.width/2,e.height/2);var g=e.toDataURL("image/png");a.setAttribute("src",g)},f=function(a){e(a,"Virheellinen pankkiviivakoodi")},g=function(a,b,c,d,e,g,h,i){if(e.length>20)throw f(a),"Viitenumero liian pitkä (max. 20).";if(e.length<4)throw f(a),"Viitenumero liian lyhyt (min. 4).";if(16!=b.length)throw f(a),"IBAN tilinumero virheellinen."},h=function(a,b,d,e,g,h,i,j){var k=function(b,d){if(c.strict)throw f(a),b;console.warn(b+" "+d)};(""+d).length>6?(d=0,e=0,k("Laskun summa on liian suuri tulostettavaksi viivakoodille.","Tulostetaan summa 00000000.")):(""+e).length>2&&(k("Annetut sentit ovat enemmän kuin 99.","Tulostetaan summa 00000000."),d=0,e=0)};c.luo=function(a,b,e,i,j,k,l,m){if(a.style.height="10mm",a.style.width="105mm",b=(""+b).replace("FI","").replace(/ /g,""),arguments.length<8)throw f(a),"Unohdit antaa kaikki function vaativat parametrit.";g(a,b,e,i,j,k,l,m),h(a,b,e,i,j,k,l,m),e=d("000000",e),i=d("00",i),j=d("00000000000000000000",j),m=(""+m).substr(-2),l=d("00",l),k=d("00",k);var n="4"+b+e+i+"000"+j+m+l+k;JsBarcode(a,n,{width:4,height:a.offsetHeight,quite:20,format:"CODE128C",backgroundColor:c.backgroundColor,lineColor:c.lineColor})},a.Pankkiviivakoodi=c}(window,document),function(a,b){var c={};c.O=function(){this.link=void 0,this.value=void 0},c.O.prototype.linkTo=function(a){this.link=a},c.O.prototype.onChange=void 0,c.O.prototype.commitChange=function(a){this.value=a,this.link&&this.link.onChange(a)},c.O.prototype.notify=function(){this.commitChange(this.value)},c.O.prototype.getValue=function(){return this.value},c.O.prototype.remove=function(){this.link&&this.link.remove(this)},c.Link=function(){this.nextId=0,this.items=[],this.addAll=function(a){for(var b=0,c=a.length;c>b;++b)this.add(a[b])},this.addAll(arguments)},c.Link.prototype=Object.create(c.O.prototype),c.Link.prototype.add=function(a){if(a instanceof c.O)a._id=this.nextId,a.linkTo(this),this.items.push(a),this.nextId++;else if("string"==typeof a)for(var d=b.querySelectorAll(a),e=0,f=d.length;f>e;++e)this.add(new c.E(d[e]));else this.add(new c.E(a))},c.Link.prototype.remove=function(a){this.items[a._id]=void 0,this.notify()},c.Link.prototype.setValue=function(a){return this.onChange(a),this},c.Link.prototype.onChange=function(a){this.value!==a&&(this.value=a,this.notify())},c.Link.prototype.notify=function(){for(var a=0,b=this.items.length;b>a;++a)void 0!==this.items[a]&&this.items[a].onChange&&this.items[a].onChange(this.value);this.commitChange(this.value)},c.oneway=function(){c.Link.apply(this,arguments)},c.oneway.prototype=Object.create(c.Link.prototype),c.oneway.prototype.onChange=function(a){this.value=a},c.E=function(a){if(void 0!==a&&void 0!==a.tagName){if("input"==a.tagName.toLowerCase())return"checkbox"==a.type?new c.ECheckbox(a):new c.EInput(a);this.el=a;var b=this;this.el.addEventListener("keyup",function(){b.notify()},!1)}},c.E.prototype=Object.create(c.O.prototype),c.E.prototype.notify=function(){this.commitChange(this.el.textContent)},c.E.prototype.onChange=function(a){this.el.textContent=a},c.EInput=function(a){if(void 0!==a){this.el=a;var b=this;this.el.addEventListener("keyup",function(){b.notify()},!1)}},c.EInput.prototype=Object.create(c.O.prototype),c.EInput.prototype.notify=function(){this.commitChange(this.el.value)},c.EInput.prototype.onChange=function(a){this.el.value=a},c.ECheckbox=function(a){if(void 0!==a){this.el=a;var b=this;this.el.addEventListener("change",function(){b.notify()},!1)}},c.ECheckbox.prototype=Object.create(c.O.prototype),c.ECheckbox.prototype.notify=function(){this.commitChange(this.el.checked)},c.ECheckbox.prototype.onChange=function(a){this.el.checked=a&&a!==!1&&"false"!==a},a.bn=c.Link,a.bn.O=c.O,a.bn.E=c.E,a.bn.oneway=c.oneway}(window,document),function(a){a.text=function(a,b){return void 0==b?a.textContent:void(a.textContent=b)},a.html=function(a,b){return b?void(a.innerHTML=b):a.innerHTML},a.val=function(a){var b=parseFloat(a);return b||(b=0),b},a.elVal=function(b){return a.val(b.textContent)},a.des2str=function(a){return a.toFixed(2)},a.dateToString=function(a){var b=a.getDate(),c=a.getMonth()+1,d=a.getFullYear();return b+"."+c+"."+d},a.stringToDate=function(a){if(a){var b=new Date,c=a.split(".");return b.setDate(c[0]),b.setMonth(c[1]-1),b.setFullYear(c[2]),b}},a.hasClass=function(a,b){return a.className&&new RegExp("(^|\\s)"+b+"(\\s|$)").test(a.className)},a.addClass=function(b,c){return a.hasClass(b,c)?!1:(b.className+=" "+c,!0)},a.removeClass=function(b,c){return a.hasClass(b,c)?(b.className=b.className.replace(c,""),!0):!1},a.toggleClass=function(b,c){return a.addClass(b,c)?!0:(a.removeClass(b,c),!1)},a.parseQueryString=function(a){var b,c,d,e,f={};for(b=a.split("&"),d=0,e=b.length;e>d;d++)c=b[d].split("="),f[c[0]]=c[1];return f},a.urlParams=a.parseQueryString(location.search.substring(1)),a.ajax=function(a,b,c,d){var e;e=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),e.onreadystatechange=function(){4==e.readyState&&200==e.status&&c&&c(e.responseText)},e.open(a,b,!0),e.setRequestHeader("Content-type","application/x-www-form-urlencoded"),e.send(d||"")},a.getAjax=function(b,c){a.ajax("get",b,c)},a.postAjax=function(b,c){var d=b.split("?");a.ajax("post",d[0],c,d[1])},a.openFileFromDisk=function(a,b){if(!b)return!1;var c=document.createElement("input");c.type="file",c.setAttribute("accept",a),c.onchange=function(a){var d=a.target.files[0];if(d){var e=new FileReader;e.onload=function(a){b(d.name.replace(".rlk",""),a.target.result)},e.readAsText(d),c.remove()}},document.body.appendChild(c),c.click()},a.saveFileToDisk=function(a,b,c){var d=document.createElement("a");d.href="data:"+b+","+c,d.target="_blank",d.download=a,document.body.appendChild(d),d.click(),d.remove()}}(bn),Blob=function(){var a=Blob;return Blob.prototype.webkitSlice?Blob.prototype.slice=Blob.prototype.webkitSlice:Blob.prototype.mozSlice&&(Blob.prototype.slice=Blob.prototype.mozSlice),function(b,c){try{return Blob=a,new Blob(b||[],c||{})}catch(d){Blob=function(a,b){var c,d=new(WebKitBlobBuilder||MozBlobBuilder);for(c in a)d.append(a[c]);return d.getBlob(b&&b.type?b.type:void 0)}}}}();var Drive={};Drive.iconLink=null,Drive.byte64toWebSafe=function(a){return a.replace(/\+/g,"-").replace(/\//g,"_")},Drive.insertFile=function(a,b,c,d,e){var f="-------314159265358979323846",g="\r\n--"+f+"\r\n",h="\r\n--"+f+"--",i=new FileReader;i.readAsBinaryString(a),i.onload=function(j){var k=a.type||"application/octet-stream",l={title:a.fileName,mimeType:k};b&&(l.parents=[{kind:"drive#fileLink",id:b}]),d&&(l.thumbnail={image:Drive.byte64toWebSafe(d.substring(d.indexOf("base64,")+7)),mimeType:d.substring(5,d.indexOf(";"))}),Drive.iconLink&&(l.iconLink=Drive.iconLink);var m=btoa(i.result),n=g+"Content-Type: application/json\r\n\r\n"+JSON.stringify(l)+g+"Content-Type: "+k+"\r\nContent-Transfer-Encoding: base64\r\n\r\n"+m+h,o=gapi.client.request({path:"/upload/drive/v2/files/"+(c?c:""),method:c?"PUT":"POST",params:{uploadType:"multipart"},headers:{"Content-Type":'multipart/mixed; boundary="'+f+'"'},body:n});e||(e=function(a){console.log(a)}),o.execute(e)}},Drive.downloadFile=function(a,b){if(a.downloadUrl){var c=gapi.auth.getToken().access_token,d=new XMLHttpRequest;d.open("GET",a.downloadUrl),d.setRequestHeader("Authorization","Bearer "+c),d.onload=function(){b(d.responseText)},d.onerror=function(){b(null)},d.send()}else b(null)},Drive.openFolderPicker=function(a){var b={ViewId:"FOLDERS"};Drive.openPicker(null,a,b)},Drive.openPicker=function(a,b,c){function d(){gapi.load("picker",{callback:e})}function e(){var b,d=c.ViewId||"DOCS";"FOLDERS"==d?(b=new google.picker.DocsView,b.setIncludeFolders(!0),b.setMimeTypes("application/vnd.google-apps.folder"),b.setSelectFolderEnabled(!0)):(b=new google.picker.View(google.picker.ViewId[d]),a&&b.setMimeTypes(a));var e=(new google.picker.PickerBuilder).enableFeature(google.picker.Feature.NAV_HIDDEN).setOAuthToken(gapi.auth.getToken().access_token).addView(b).addView(new google.picker.DocsUploadView).setCallback(f).build();e.setVisible(!0)}function f(a){if(a.action==google.picker.Action.CANCEL)b&&b(!1);else if(a.action==google.picker.Action.PICKED){console.log(a);a.docs[0].id;b&&b(a.docs[0])}}d()};