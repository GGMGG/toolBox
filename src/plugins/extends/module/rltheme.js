layui.define(["jquery", "layer"], function (exports) {
	var MOD_NAME = 'rltheme',
	$ = layui.jquery;

	var theme = {};
	theme.autoHead = false;

	theme.changeTheme = function (target, autoHead) {
		this.autoHead = autoHead;
		var color = localStorage.getItem("theme-color-color");
		var light = localStorage.getItem("theme-color-light");
		var deep = localStorage.getItem("theme-color-deep");
		let cardLinearGradient = localStorage.getItem("card-linear-gradient");
		this.rootSet(color, light, deep, cardLinearGradient);
		this.colorSet(color, light, deep);
		if (target.frames.length == 0) return;
		for (var i = 0; i < target.frames.length; i++) {
			try {
				if(target.frames[i].layui == undefined) continue;
				target.frames[i].layui.theme.changeTheme(target.frames[i], autoHead);
			} catch (error) {
				console.log(error);
			}
		}
	}

	theme.rootSet = function(color, light, deep, cardLinearGradient) {
		let item1, item2, item3, item4;
		if (cardLinearGradient) {
			cardLinearGradient = cardLinearGradient.split(",");
			item1 = cardLinearGradient[0];
			item2 = cardLinearGradient[1];
			item3 = cardLinearGradient[2];
			item4 = cardLinearGradient[3];
		}

		var style = '';
		style += ':root {';
		style += '	--color: ' + color + ';';
		style += '	--light-color: ' + light + ';';
		style += '	--deep-color: ' + deep + ';';
		style += '	--slider-handle-size: 14px;';
		style += '	--slider-handle-border-radius: 2px;';
		style += '	--slider-handle-margin-top: -4px;';
		style += '	--slider-track-height: 6px;';
		style += '	--slider-track-border-radius: 4px;';
		style += '	--ew-datagrid-item1: ' + (item1 || '#e4eff8') + ';';
		style += '	--ew-datagrid-item2: ' + (item2 || '#e2f4f7') + ';';
		style += '	--ew-datagrid-item3: ' + (item3 || '#e3f7f6') + ';';
		style += '	--ew-datagrid-item4: ' + (item4 || '#e4eff8') + ';';
		style += '	--layui-elip: #333;';
		style += '}';
		var rootPane = $("#layui-admin-root");
		if(rootPane.length > 0){
			rootPane.html(style);
		} else {
			$("head").append("<style id='layui-admin-root'>" + style + "</style>");
		}
	}

	theme.colorSet = function(color, light, deep) {
		var style = '';
		style += '.light-theme .pear-nav-tree .layui-this a:hover,.light-theme .pear-nav-tree .layui-this,.light-theme .pear-nav-tree .layui-this a,.pear-nav-tree .layui-this a,.pear-nav-tree .layui-this{background-color: ' +color + '!important;}';
		style += '.pear-admin .layui-logo .title{color:var(--color)!important;}';
		style += '.pear-frame-title .dot,.pear-tab .layui-this .pear-tab-active{background-color:var(--color)!important;}';
		style += '.bottom-nav li a:hover{background-color:var(--color)!important;}';
		style += '.pear-btn-primary {border: 1px solid var(--color)!important;}';
		style += '.pear-admin .layui-header .layui-nav .layui-nav-bar{background-color: var(--color)!important;}'
		style += '.ball-loader>span,.signal-loader>span {background-color: var(--color)!important;}';
		style += '.layui-header .layui-nav-child .layui-this a{background-color:var(--color)!important;color:white!important;}';
		style += '#preloader{background-color:var(--color)!important;}';
		style += '.pearone-color .color-content li.layui-this:after, .pearone-color .color-content li:hover:after {border: var(--color) 3px solid!important;}';
		style += '.layui-nav .layui-nav-child dd.layui-this a, .layui-nav-child dd.layui-this{background-color: var(--color);color:white;}';
		style += '.pear-social-entrance {background-color:var(--color)!important}';
		style += '.pear-admin .pe-collapse {background-color:var(--color)!important}';
		style += '.layui-fixbar li {background-color:var(--color)!important}';
		style += '.pear-btn-primary {background-color:var(--color)!important}';
		style += '.layui-input:focus,.layui-textarea:focus {border-color: var(--color)!important;box-shadow: 0 0 0 3px var(--light-color) !important;}'
		style += '.layui-form-checkbox[lay-skin=primary]:hover span {background-color: initial;}'
		style += '.layui-form-checked[lay-skin=primary] i {border-color: var(--color)!important;background-color: var(--color);}'
		style += '.layui-form-checked,.layui-form-checked:hover {border-color: var(--color)!important;}'
		style += '.layui-form-checked span,.layui-form-checked:hover span {background-color: var(--color);}'
		style += '.layui-form-checked i,.layui-form-checked:hover i {color: var(--color);}'
		style += '.layui-form-onswitch { border-color: var(--color); background-color: var(--color);}'
		style += '.layui-form-radio>i:hover, .layui-form-radioed>i {color: var(--color);}'
		style += '.layui-laypage .layui-laypage-curr .layui-laypage-em{background-color:var(--color)!important}'
		style += '.layui-tab-brief>.layui-tab-more li.layui-this:after, .layui-tab-brief>.layui-tab-title .layui-this:after{border-bottom: 3px solid var(--color)!important}'
		style += '.layui-tab-brief>.layui-tab-title .layui-this{color:var(--color)!important}'
		style += '.layui-progress-bar{background-color:var(--color)}';
		style += '.layui-elem-quote{border-left: 5px solid var(--color)}';
		style += '.layui-timeline-axis{color:var(--color)}';
		style += '.layui-laydate .layui-this{background-color:var(--color)!important}';
		style += '.pear-this,.pear-text{color:var(--color)!important}';
		style += '.pear-back{background-color:var(--color)!important}';
		style += '.pear-collapsed-pe{background-color:var(--color)!important}'
		style += '.layui-form-select dl dd.layui-this{color:var(--color)!important;}'
		style += '.tag-item-normal{background:var(--color)!important}';
		style += '.step-item-head.step-item-head-active{background-color:var(--color)}'
		style += '.step-item-head{border: 3px solid var(--color);}'
		style += '.step-item-tail i{background-color:var(--color)}'
		style += '.step-item-head{color:var(--color)}'
		style += 'div[xm-select-skin=normal] .xm-select-title div.xm-select-label>span i {background-color:var(--color)!important}'
		style += 'div[xm-select-skin=normal] .xm-select-title div.xm-select-label>span{border: 1px solid var(--color)!important;background-color:var(--color)!important}'
		style += 'div[xm-select-skin=normal] dl dd:not(.xm-dis-disabled) i{border-color:var(--color)!important}'
		style += 'div[xm-select-skin=normal] dl dd.xm-select-this:not(.xm-dis-disabled) i{color:var(--color)!important}'
		style += 'div[xm-select-skin=normal].xm-form-selected .xm-select, div[xm-select-skin=normal].xm-form-selected .xm-select:hover{border-color:var(--color)!important}'
		style += '.layui-layer-btn a:first-child{border-color:var(--color);background-color:var(--color)!important}';
		style += '.layui-form-checkbox[lay-skin=primary]:hover i{border-color:var(--color)!important}'
		style += '.pear-tab-menu .item:hover{background-color:var(--color)!important}'
		style += '.layui-form-danger:focus {border-color:#FF5722 !important}'
		style += '.pear-admin .user .layui-this a:hover{color:white!important}'
		style += '.pear-admin .user  a:hover{color:var(--color)!important}'
		style += '.pear-notice .layui-this{color:var(--color)!important}'
        style += '.layui-form-radio:hover *, .layui-form-radioed, .layui-form-radioed>i{color:var(--color) !important}';
		style += '.pear-btn:hover {color: var(--color);background-color: var(--light-color);}'
		style += '.pear-btn-primary[plain] {color: var(--color)!important;background: var(--light-color) !important;}'
		style += '.pear-btn-primary[plain]:hover {background-color: var(--color)!important}'
		style += '.light-theme .pear-nav-tree .layui-this a:hover,.light-theme .pear-nav-tree .layui-this,.light-theme .pear-nav-tree .layui-this a {background-color: var(--light-color)!important;color:var(--color)!important;}'
		style += '.light-theme .pear-nav-tree .layui-this{ border-right: 3px solid var(--color)!important}'
		style += '.loader:after {background:var(--color)}'
		style += '.layui-laydate .layui-this, .layui-laydate .layui-this>div{background:var(--color)!important}'
		if(this.autoHead === true || this.autoHead === "true"){
			style += '.pear-admin.banner-layout .layui-header .layui-logo,.pear-admin .layui-header{border:none;background-color:var(--color)!important;}.pear-admin.banner-layout .layui-header .layui-logo .title,.pear-admin .layui-header .layui-nav .layui-nav-item>a{color:whitesmoke!important;}';
			style += '.pear-admin.banner-layout .layui-header{ box-shadow: 2px 0 6px rgb(0 21 41 / 35%) }'
			style += '.pear-admin .layui-header .layui-layout-control .layui-this *,.pear-admin.banner-layout .layui-header .layui-layout-control .layui-this *{ background-color: rgba(0,0,0,.1)!important;}'
		}

    	style += '.menu-search-list li:hover,.menu-search-list li.this{background-color:var(--color)}';
		style += '.layui-border-color { border-color: var(--color) !important;color: var(--color) !important}';
		style += '.layui-input-color:focus,.layui-textarea-color:focus { border-color: var(--color) !important;box-shadow: 0 0 0 3px var(--light-color)!important}';
		style += '.layui-input-color[success] { border: var(--color) 1px solid !important;box-shadow: 0 0 0 3px var(--light-color)!important}';
		style += '.layui-form-radio:hover *, .layui-form-radioed, .layui-form-radioed>i { color: var(--color) !important}';
		style += '.layui-icon-color { color: var(--color) !important}';

		var colorPane = $("#layui-admin-color");
		if(colorPane.length > 0){
			colorPane.html(style);
		} else {
			$("head").append("<style id='layui-admin-color'>" + style + "</style>");
		}
	}

	theme.changeBgTheme = function (target) {
		var img = JSON.parse(localStorage.getItem("setting")).defaultBgimg;
		var opacity = JSON.parse(localStorage.getItem("setting")).defaultBgOpacity;
		this.bgSet(img, opacity);
		if (target.frames.length == 0) return;
		for (var i = 0; i < target.frames.length; i++) {
			try {
				if(target.frames[i].layui == undefined) continue;
				target.frames[i].layui.theme.changeBgTheme(target.frames[i], autoHead);
			} catch (error) {
				console.log(error);
			}
		}
	}

	theme.bgSet = function (img, opacity) {
		var imgStyle = "";
		var bgColorStyle = "";
		if (img) {
			imgStyle = ", url('../assets/images/bgImage/" + img + "') no-repeat fixed center;";
		} else {
			bgColorStyle = "background-color: whitesmoke;";
		}

		var style = "";
		style += ".layui-container {";
		style += "	background: -webkit-linear-gradient(rgba(245, 245, 245, " + opacity + "), rgba(245, 245, 245, " + opacity + "))" + imgStyle;
		style += "	background: -o-linear-gradient(rgba(245, 245, 245, " + opacity + "), rgba(245, 245, 245, " + opacity + "))" + imgStyle;
		style += "	background: -moz-linear-gradient(rgba(245, 245, 245, " + opacity + "), rgba(245, 245, 245, " + opacity + "))" + imgStyle;
		style += "	background: linear-gradien(rgba(245, 245, 245, " + opacity + "), rgba(245, 245, 245, " + opacity + "))" + imgStyle;
		style += "	background-size: 100% 100%;";
		style += "	-moz-background-size: 100% 100%;";
		style += bgColorStyle;
		style += "}";
		var bgPane = $("#layui-admin-bg");
		if(bgPane.length > 0){
			bgPane.html(style);
		} else {
			$("head").append("<style id='layui-admin-bg'>" + style + "</style>");
		}
	}

	exports(MOD_NAME, theme);
});