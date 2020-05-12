// 在head 中 加载 必要静态
document.write('<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/mdui@0.4.3/dist/css/mdui.min.css">');
// markdown支持
document.write('<script src="//cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js"></script>');
document.write('<style>body{background-color:#f2f5fa;padding-bottom:60px;background-position:center bottom;background-repeat:no-repeat;background-attachment:fixed}.nexmoe-item{margin:20px -8px 0!important;padding:15px!important;border-radius:5px;background-color:#fff;-webkit-box-shadow:0 .5em 3em rgba(161,177,204,.4);box-shadow:0 .5em 3em rgba(161,177,204,.4);background-color:#fff}.mdui-img-fluid,.mdui-video-fluid{border-radius:5px;border:1px solid #eee}.mdui-list{padding:0}.mdui-list-item{margin:0!important;border-radius:5px;padding:0 10px 0 5px!important;border:1px solid #eee;margin-bottom:10px!important}.mdui-list-item:last-child{margin-bottom:0!important}.mdui-list-item:first-child{border:none}.mdui-toolbar{width:auto;margin-top:60px!important}.mdui-appbar .mdui-toolbar{height:56px;font-size:16px}.mdui-toolbar>*{padding:0 6px;margin:0 2px;opacity:.5}.mdui-toolbar>.mdui-typo-headline{padding:0 16px 0 0}.mdui-toolbar>i{padding:0}.mdui-toolbar>a:hover,a.mdui-typo-headline,a.active{opacity:1}.mdui-container{max-width:980px}.mdui-list>.th{background-color:initial}.mdui-list-item>a{width:100%;line-height:48px}.mdui-toolbar>a{padding:0 16px;line-height:30px;border-radius:30px;border:1px solid #eee}.mdui-toolbar>a:last-child{opacity:1;background-color:#1e89f2;color:#ffff}@media screen and (max-width:980px){.mdui-list-item .mdui-text-right{display:none}.mdui-container{width:100%!important;margin:0}.mdui-toolbar>*{display:none}.mdui-toolbar>a:last-child,.mdui-toolbar>.mdui-typo-headline,.mdui-toolbar>i:first-child{display:block}}</style>');

// 初始化页面，并载入必要资源
function init(){
    document.siteName = $('title').html();
    $('body').addClass("mdui-theme-primary-blue-grey mdui-theme-accent-blue");
    var html = `
<div class="mdui-container-fluid">
    <div id="nav" class="mdui-toolbar nexmoe-item">
    </div>
</div>
<div class="mdui-container-fluid"> 
    <style>.thumb .th {display:none;}.thumb .mdui-text-right {display:none;}.thumb .mdui-list-item a,.thumb .mdui-list-item {width:217px;height:230px;float:left;margin:10px 10px !important;}.thumb .mdui-col-xs-12,.thumb .mdui-col-sm-7 {width:100% !important;height:230px;}.thumb .mdui-list-item .mdui-icon {font-size:100px;display:block;margin-top:40px;color:#7ab5ef;}.thumb .mdui-list-item span {float:left;display:block;text-align:center;width:100%;position:absolute;top:180px;}</style>
    <div id="content" class="nexmoe-item"></div>
</div>
	`;
    $('body').html(html);
}

function render(path){
	if(path.indexOf("?") > 0){
		path = path.substr(0,path.indexOf("?"));
	}
    title(path);
    nav(path);
    if(path.substr(-1) == '/'){
    	list(path);
    }else{
	    file(path);
    }
}


// 渲染 title
function title(path){
    path = decodeURI(path);
    $('title').html(document.siteName+' - '+path);
}

// 渲染导航栏
function nav(path){
    var html = "";
    html += `<a href="/">${document.siteName}</a>`;
    var arr = path.trim('/').split('/');
    var p = '/';
    if(arr.length > 0){
        for(i in arr){
            var n = arr[i];
            n = decodeURI(n);
            p += n+'/';
            if(n == ''){
                break;
            }
            html += `<i class="mdui-icon material-icons mdui-icon-dark" style="margin:0;">chevron_right</i><a href="${p}">${n}</a>`;
        }
    }
    $('#nav').html(html);
}

// 渲染文件列表
function list(path){
	var content = `
	<div id="head_md" class="mdui-typo" style="display:none;padding: 20px 0;"></div>

    <div class="mdui-row">
      <ul class="mdui-list">
        <li class="mdui-list-item th">
          <div class="mdui-col-xs-12 mdui-col-sm-7"> 文件 <i class="mdui-icon material-icons icon-sort" data-sort="name" data-order="downward">expand_more</i></div>
          <div class="mdui-col-sm-3 mdui-text-right">修改时间 <i class="mdui-icon material-icons icon-sort" data-sort="date" data-order="downward">expand_more</i></div>
          <div class="mdui-col-sm-2 mdui-text-right">大小 <i class="mdui-icon material-icons icon-sort" data-sort="size" data-order="downward">expand_more</i></div>
        </li>
	  </ul> 
	</div> 
	<div class="mdui-row"> 
	  <ul id="list" class="mdui-list"> 
	  </ul> 
	</div>
    <div id="readme_md" class="mdui-typo" style="display:none; padding: 20px 0;"></div>
    <a href="javascript:thumb();" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">format_list_bulleted</i></a>
	`;
	$('#content').html(content);
	
    var password = localStorage.getItem('password'+path);
    $('#list').html(`<div class="mdui-progress"><div class="mdui-progress-indeterminate"></div></div>`);
    $('#readme_md').hide().html('');
    $('#head_md').hide().html('');
    $.post(path,'{"password":"'+password+'"}', function(data,status){
        var obj = jQuery.parseJSON(data);
        if(typeof obj != 'null' && obj.hasOwnProperty('error') && obj.error.code == '401'){
            var pass = prompt("目录加密, 请输入密码","");
            localStorage.setItem('password'+path, pass);
            if(pass != null && pass != ""){
                list(path);
            }else{
                history.go(-1);
            }
        }else if(typeof obj != 'null'){
            list_files(path,obj.files);
        }
    });
}

function list_files(path,files){
    html = "";
    for(i in files){
        var item = files[i];
        var p = path+item.name+'/';
        if(item['size']==undefined){
            item['size'] = "";
        }

        item['modifiedTime'] = utc2beijing(item['modifiedTime']);
        item['size'] = formatFileSize(item['size']);
        if(item['mimeType'] == 'application/vnd.google-apps.folder'){
            html +=`<li class="mdui-list-item mdui-ripple"><a href="${p}" class="folder">
	            <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	            <i class="mdui-icon material-icons">folder_open</i>
	              ${item.name}
	            </div>
	            <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	            <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	            </a>
	        </li>`;
        }else{
            var p = path+item.name;
            var c = "file";
            if(item.name == "README.md"){
                 get_file(p, item, function(data){
                    markdown("#readme_md",data);
                });
            }
            if(item.name == "HEAD.md"){
	            get_file(p, item, function(data){
                    markdown("#head_md",data);
                });
            }
            var ext = p.split('.').pop();
            if("|html|php|css|go|java|js|json|txt|sh|md|mp4|webm|avi|bmp|jpg|jpeg|png|gif|m4a|mp3|wav|ogg|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|".indexOf(`|${ext.toLowerCase()}|`) >= 0){
	            p += "?a=view";
	            c += " view";
            }
            html += `<li class="mdui-list-item file mdui-ripple" target="_blank"><a gd-type="${item.mimeType}" href="${p}" class="${c}">
	          <div class="mdui-col-xs-12 mdui-col-sm-7 mdui-text-truncate">
	          <i class="mdui-icon material-icons">insert_drive_file</i>
	            ${item.name}
	          </div>
	          <div class="mdui-col-sm-3 mdui-text-right">${item['modifiedTime']}</div>
	          <div class="mdui-col-sm-2 mdui-text-right">${item['size']}</div>
	          </a>
	      </li>`;
        }
    }
    $('#list').html(html);
}


function get_file(path, file, callback){
	var key = "file_path_"+path+file['modifiedTime'];
	var data = localStorage.getItem(key);
	if(data != undefined){
		return callback(data);
	}else{
		$.get(path, function(d){
			localStorage.setItem(key, d);
            callback(d);
        });
	}
}



// 文件展示 ?a=view
function file(path){
	var name = path.split('/').pop();
	var ext = name.split('.').pop().toLowerCase().replace(`?a=view`,"");
	if("|html|php|css|go|java|js|json|txt|sh|md|".indexOf(`|${ext}|`) >= 0){
		return file_code(path);
	}

	if("|mp4|webm|avi|".indexOf(`|${ext}|`) >= 0){
		return file_video(path);
	}

	if("|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|".indexOf(`|${ext}|`) >= 0){
		return file_video(path);
	}
	
	if("|mp3|wav|ogg|m4a|".indexOf(`|${ext}|`) >= 0){
		return file_audio(path);
	}

	if("|bmp|jpg|jpeg|png|gif|".indexOf(`|${ext}|`) >= 0){
		return file_image(path);
	}
}

// 文件展示 |html|php|css|go|java|js|json|txt|sh|md|
function file_code(path){
	var type = {
		"html":"html",
		"php":"php",
		"css":"css",
		"go":"golang",
		"java":"java",
		"js":"javascript",
		"json":"json",
		"txt":"Text",
		"sh":"sh",
		"md":"Markdown",	
	};
	var name = path.split('/').pop();
	var ext = name.split('.').pop();
	var href = window.location.origin + path;
	var content = `
<div class="mdui-container">
<pre id="editor" ></pre>
</div>
<div class="mdui-textfield">
	<label class="mdui-textfield-label">下载地址</label>
	<input class="mdui-textfield-input" type="text" value="${href}"/>
</div>
<a href="${href}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>

<script src="https://cdn.staticfile.org/ace/1.4.7/ace.js"></script>
<script src="https://cdn.staticfile.org/ace/1.4.7/ext-language_tools.js"></script>
	`;
	$('#content').html(content);
	
	$.get(path, function(data){
		$('#editor').html($('<div/>').text(data).html());
		var code_type = "Text";
		if(type[ext] != undefined ){
			code_type = type[ext];
		}
		var editor = ace.edit("editor");
	    editor.setTheme("ace/theme/ambiance");
	    editor.setFontSize(18);
	    editor.session.setMode("ace/mode/"+code_type);
	    
	    //Autocompletion
	    editor.setOptions({
	        enableBasicAutocompletion: true,
	        enableSnippets: true,
	        enableLiveAutocompletion: true,
	        maxLines: Infinity
	    });
	});
}

// 文件展示 视频 |mp4|webm|avi|
function file_video(path){
	var url = window.location.origin + path;
	var playBtn = `<a class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" href="potplayer://${url}"><i class="mdui-icon material-icons">&#xe038;</i>在 potplayer 中播放</a>`;
	if (/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) { //移动端
	    playBtn = `	<a class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" href="intent:${url}#Intent;package=com.mxtech.videoplayer.ad;S.title=${path};end"><i class="mdui-icon material-icons">&#xe039;</i>在mxplayer中播放</a>`;
	}
	var content = `
<div class="mdui-container-fluid">
	<br>
	<video class="mdui-video-fluid mdui-center" preload controls>
	  <source src="${url}" type="video/mp4">
	</video>
	<br>${playBtn}
	<!-- 固定标签 -->
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">下载地址</label>
	  <input class="mdui-textfield-input" type="text" value="${url}"/>
	</div>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">HTML 引用地址</label>
	  <textarea class="mdui-textfield-input"><video><source src="${url}" type="video/mp4"></video></textarea>
	</div>
</div>
<a href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
	`;
	$('#content').html(content);
}

// 文件展示 音频 |mp3|m4a|wav|ogg|
function file_audio(path){
	var url = window.location.origin + path;
	var content = `
<div class="mdui-container-fluid">
	<br>
	<audio class="mdui-center" preload controls>
	  <source src="${url}"">
	</audio>
	<br>
	<!-- 固定标签 -->
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">下载地址</label>
	  <input class="mdui-textfield-input" type="text" value="${url}"/>
	</div>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">HTML 引用地址</label>
	  <textarea class="mdui-textfield-input"><audio><source src="${url}"></audio></textarea>
	</div>
</div>
<a href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
	`;
	$('#content').html(content);
}


// 图片展示
function file_image(path){
	var url = window.location.origin + path;
	var content = `
<div class="mdui-container-fluid">
	<br>
	<img class="mdui-img-fluid" src="${url}"/>
	<br>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">下载地址</label>
	  <input class="mdui-textfield-input" type="text" value="${url}"/>
	</div>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">HTML 引用</label>
	  <input class="mdui-textfield-input" type="text" value="<img src='${url}' />"/>
	</div>
        <div class="mdui-textfield">
	  <label class="mdui-textfield-label">Markdown 引用地址</label>
	  <input class="mdui-textfield-input" type="text" value="![](${url})"/>
	</div>
        <br>
</div>
<a href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
	`;
	$('#content').html(content);
}


//时间转换
function utc2beijing(utc_datetime) {
    // 转为正常的时间格式 年-月-日 时:分:秒
    var T_pos = utc_datetime.indexOf('T');
    var Z_pos = utc_datetime.indexOf('Z');
    var year_month_day = utc_datetime.substr(0,T_pos);
    var hour_minute_second = utc_datetime.substr(T_pos+1,Z_pos-T_pos-1);
    var new_datetime = year_month_day+" "+hour_minute_second; // 2017-03-31 08:02:06

    // 处理成为时间戳
    timestamp = new Date(Date.parse(new_datetime));
    timestamp = timestamp.getTime();
    timestamp = timestamp/1000;

    // 增加8个小时，北京时间比utc时间多八个时区
    var unixtimestamp = timestamp+8*60*60;

    // 时间戳转为时间
    var unixtimestamp = new Date(unixtimestamp*1000);
    var year = 1900 + unixtimestamp.getYear();
    var month = "0" + (unixtimestamp.getMonth() + 1);
    var date = "0" + unixtimestamp.getDate();
    var hour = "0" + unixtimestamp.getHours();
    var minute = "0" + unixtimestamp.getMinutes();
    var second = "0" + unixtimestamp.getSeconds();
    return year + "-" + month.substring(month.length-2, month.length)  + "-" + date.substring(date.length-2, date.length)
        + " " + hour.substring(hour.length-2, hour.length) + ":"
        + minute.substring(minute.length-2, minute.length) + ":"
        + second.substring(second.length-2, second.length);
}

// bytes自适应转换到KB,MB,GB
function formatFileSize(bytes) {
    if (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(2)+' GB';}
    else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(2)+' MB';}
    else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(2)+' KB';}
    else if (bytes>1)           {bytes=bytes+' bytes';}
    else if (bytes==1)          {bytes=bytes+' byte';}
    else                        {bytes='';}
    return bytes;
}

String.prototype.trim = function (char) {
    if (char) {
        return this.replace(new RegExp('^\\'+char+'+|\\'+char+'+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
};


// README.md HEAD.md 支持
function markdown(el, data){
    if(window.md == undefined){
        //$.getScript('https://cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js',function(){
        window.md = window.markdownit();
        markdown(el, data);
        //});
    }else{
        var html = md.render(data);
        $(el).show().html(html);
    }
}

// 监听回退事件
window.onpopstate = function(){
    var path = window.location.pathname;
    render(path);
}


$(function(){
    init();
    var path = window.location.pathname;
    $("body").on("click",'.folder',function(){
        var url = $(this).attr('href');
        history.pushState(null, null, url);
        render(url);
        return false;
    });

    $("body").on("click",'.view',function(){
        var url = $(this).attr('href');
        history.pushState(null, null, url);
        render(url);
        return false;
    });
    
    render(path);
});
