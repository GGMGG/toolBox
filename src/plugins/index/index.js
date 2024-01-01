// 组件初始化引入
layui.use(["layer", "jquery", "form", "loading", "upload", "toast", "colorpicker", "rliconPicker", "rltheme", "rlcard", "rlnotify", "rlrange", "rltag", "rlcreatehtml", "rldad"], function () {
  $ = layui.jquery;
  layer = layui.layer;
  form = layui.form;
  loading = layui.loading;
  upload = layui.upload;
  toast = layui.toast;
  colorpicker = layui.colorpicker;
  rliconPicker = layui.rliconPicker;
  rltheme = layui.rltheme;
  rlcard = layui.rlcard;
  rlnotify = layui.rlnotify;
  rlrange = layui.rlrange;
  rltag = layui.rltag;
  rlcreatehtml = layui.rlcreatehtml;
  rldad = layui.rldad;
  // 初始化
  initUtil.init();
  // 工具条按钮监听
  // 搜索工具监听
  form.on("radio(searchtype-radio-filter)", function (data) {
    const searchTypeValues = ["1", "2"];
    const searchTypes = ["local", "engine"];
    const searchTypePlaceholdes = ["请输入名称进行搜索", "请输入搜索内容"];
    if (data.elem.value) {
      const index = searchTypeValues.map((item) => item).indexOf(data.elem.value);
      if (index > -1) {
        searchType = searchTypes[index];
        $("#searchName").attr("placeholder", searchTypePlaceholdes[index]);
      }
    }
  });

  // 搜索监听
  form.on("input-affix(search)", function (data) {
    toolBarEvent.doSearch({ name: data.elem.value });
    return false;
  });

  // 新增按钮监听
  form.on("submit(data-add-btn)", function () {
    cardEvent.bindClickToAdd();
    return false;
  });

  // 编辑按钮监听
  form.on("submit(data-edit-btn)", function () {
    toolBarEvent.doEdit();
    return false;
  });

  // 刷新按钮监听
  form.on("submit(data-reload-btn)", function () {
    rlcard.reload(tableId, cfg);
    initRendererUtil.setMode();
  });

  // 标签按钮监听
  form.on("submit(tag-btn)", function (data) {
    $("#cardTagDiv").toggle();
    if ($("#tagBtn").is(".btn-click-onfouce")) {
      $("#tagBtn").removeClass("btn-click-onfouce");
    } else {
      $("#tagBtn").addClass("btn-click-onfouce");
    }

    return false;
  });

  // 设置按钮监听
  form.on("submit(setting-btn)", function (data) {
    btnEvent.binClickToSetBtn();
    return false;
  });

  // 模式按钮监听
  form.on("submit(mode-btn)", function (data) {
    btnEvent.switchMode();
  });

  // tag标签点击监听
  rltag.on("click(cardTag)", function (data) {
    tagEvent.clickTag(data);
  });

  // tag标签添加监听
  rltag.on("add(cardTag)", function (data) {
    tagEvent.addTag(data);
  });

  // tag标签删除监听
  rltag.on("delete(cardTag)", function (data) {
    tagEvent.delTag(data);
  });

  // 编辑表单-类型单选
  form.on("radio(cardtype-radio-filter)", function (data) {
    initUtil.initCardTypeRadio(data.elem.value);
  });

  // 编辑表单-保存按钮
  form.on("submit(form-save)", function (data) {
    if (canSave) {
      ipcSendUtil.operateDataJson(data.field);
    }

    return false;
  });

  // 编辑表单-文件夹选择
  document.querySelector("#filePathChoose").addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      let filePath = file.path;
      let webkitRelativePath = file.webkitRelativePath.replaceAll("/", "\\");
      webkitRelativePath = webkitRelativePath.substr(webkitRelativePath.indexOf("\\"));
      filePath = filePath.replace(webkitRelativePath, "");
      $("#localurl").val(filePath);
    }
  });

  // 编辑表单-文件选择
  document.querySelector("#fileChoose").addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      $("#exeUrl").val(file.path);
    }
  });

  // form自定义校验
  form.verify({
    // exeApp
    exeApp: function (value) {
      if (!value) {
        return "EXE路径不能为空";
      }

      const type = value.slice(-4).toLowerCase();
      if (type !== ".exe") {
        return "exe应用路径不正确";
      }
    },
  });
});
