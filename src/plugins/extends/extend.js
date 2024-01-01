window.rootPath = (function (src) {
	src = document.currentScript
		? document.currentScript.src
		: document.scripts[document.scripts.length - 1].src;
	return src.substring(0, src.lastIndexOf("/") + 1);
})();

layui.config({
	base: rootPath + "module/"
}).extend({
	loading: "loading",		     // 加载组件
	toast: "toast",              // 消息通知
	rliconPicker: "rliconPicker",    // 图标选择
	rlcard: "rlcard",   // 自定义card组件
	rltheme: "rltheme", // 自定义theme组件
	rlnotify: "rlnotify", // 消息组件
	rlrange: "rlrange",    // 滑块组件
	rltag: "rltag",    // 标签组件
	rlcreatehtml: "rlcreateHtml",    // html创建组件
	rldad: "rldad"    // html创建组件
}).use(['layer', 'rltheme'], function () {
	layui.rltheme.changeTheme(window, false);
});