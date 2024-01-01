// 应用初始化
// 初始化全局变量
let $,
  layer,
  form,
  loading,
  upload,
  toast,
  colorpicker,
  rliconPicker,
  rltheme,
  rlcard,
  rlnotify,
  rlrange,
  rltag,
  rlcreatehtml,
  rldad = null;
// 初始化设置，标签数据
let setting,
  tagData = null;
// 初始化保存按钮状态
let canSave = true;
// 初始化面板ID
const tableId = "cardTable";
// 图标类型（iconfont.json的font_family）
const iconClass = "iconfont";
// 初始化卡片配置
let cfg = {};
let cfgData = [];
let cfgLinenum = 4;
// 初始化卡片标签下拉框对象
let cardTagsSelect = null;
// 初始化搜索类型
let searchType = "local";

// 工具方法
// 通用方法
const commonUtil = {
  /**
   * 根据KEY获取对应的JSON格式化后的item
   * @param {string} key
   * @returns
   */
  getItemByKey: function (key = "") {
    if (key) {
      return JSON.parse(localStorage.getItem(key));
    }

    return null;
  },
  /**
   * 根据ID获取对应的JSON OBJ
   * @param {object} array
   * @param {string} id
   * @returns
   */
  getObjById: function (array = [], id = "") {
    let obj = null;
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      if (item.id == id) {
        obj = array[i];
        break;
      }
    }

    return obj;
  },
};

// 渲染初始化
const initRendererUtil = {
  /**
   * 初始化设置数据
   */
  setSetting: function () {
    window.electronAPI.setSetting((event, value) => {
      localStorage.setItem("setting", value);
      const settingData = JSON.parse(value);
      this.setTitle(settingData.sysTitle);
      this.setConfigData(settingData);
    });
  },
  /**
   * 设置数据
   */
  setCardData: function () {
    window.electronAPI.setCardData((event, value) => {
      localStorage.setItem("card-data", value);
    });
  },
  /**
   * 设置主窗口标题
   * @param {string} sysTitle
   */
  setTitle: function (sysTitle = "") {
    if (sysTitle) {
      document.getElementById("title").innerText = sysTitle;
    }
  },
  /**
   * 设置配置文件数据
   * @param {object} setting
   */
  setConfigData: function (setting = null) {
    window.electronAPI.setConfig((event, value) => {
      const configData = JSON.parse(value);
      localStorage.setItem("config-data", value);
      this.setColorStyle(setting, configData);
      this.setCardStyle(setting, configData);
      this.setBgStyle(setting);
    });
  },
  /**
   * 初始化标签数据
   */
  setTag: function () {
    window.electronAPI.setTag((event, value) => {
      this.setTagData(value, "init");
    });
  },
  /**
   * 设置标签数据
   * @param {string} tag
   * @param {string} type
   */
  setTagData: function (tag = "", type = "") {
    localStorage.setItem("tag-data", tag);
    if (type !== "init") {
      ipcSendUtil.operateTagJson();
    }
  },
  /**
   * 设置iconfont数据
   */
  setIconfont: function () {
    window.electronAPI.setIconfont((event, value) => {
      let iconfontList = [];
      const valueObj = eval("(" + value + ")");
      const iconfontData = JSON.parse(valueObj);
      const prefix = iconfontData.css_prefix_text;
      const glyphs = iconfontData.glyphs;
      if (prefix && glyphs) {
        glyphs.forEach(function (item, index, array) {
          iconfontList.push(prefix + item.font_class);
        });

        localStorage.setItem("iconfont-data", iconfontList);
      }
    });
  },
  /**
   * 设置主题样式
   * @param {object} setting
   * @param {object} configData
   */
  setColorStyle: function (setting = null, configData = null) {
    const color = commonUtil.getObjById(configData.colors, setting.defaultColor);
    localStorage.setItem("theme-color", color.id);
    localStorage.setItem("theme-color-color", color.color);
    localStorage.setItem("theme-color-light", color.light);
    localStorage.setItem("theme-color-deep", color.deep);
  },
  /**
   * 设置卡片样式
   * @param {object} setting
   * @param {object} configData
   */
  setCardStyle: function (setting = null, configData = null) {
    const cardSize = commonUtil.getObjById(configData.cardSizes, setting.defaultCardSize);
    localStorage.setItem("card-size-id", cardSize.id);
    localStorage.setItem("card-size-size", cardSize.size);
    localStorage.setItem("card-size-num", cardSize.num);
    localStorage.setItem("card-linear-gradient", setting.cardLinearGradient);
  },
  /**
   * 设置背景样式
   * @param {object} setting
   */
  setBgStyle: function (setting = null) {
    const bgConfig = {
      defaultBgimg: setting.defaultBgimg,
      defaultBgOpacity: setting.defaultBgOpacity,
    };
    localStorage.setItem("theme-bg", JSON.stringify(bgConfig));
  },
  /**
   * 获取卡片配置
   * @returns
   */
  getCardCfg: function () {
    let cardCfg = { linenum: cfgLinenum };
    const carCfgNum = localStorage.getItem("card-size-num");
    if (carCfgNum) {
      cardCfg.linenum = parseInt(carCfgNum);
    }

    return cardCfg;
  },
  /**
   * 设置mode
   * @returns
   */
  setMode: function () {
    const mode = localStorage.getItem("mode-type");
    if (!mode) {
      localStorage.setItem("mode-type", "light");
      return;
    }

    let layuiTheme = document.getElementById("layui-theme");
    if (mode === "dark") {
      layuiTheme.href = "../plugins/extends/css/extend-dark.css";
      $("#modeIcon").removeClass("layui-icon-moon");
      $("#modeIcon").addClass("layui-icon-light");
      $("#modeBtn").attr("title", "明亮");
      return;
    }

    if (mode === "light") {
      layuiTheme.href = "../plugins/extends/css/extend.css";
      $("#modeIcon").removeClass("layui-icon-light");
      $("#modeIcon").addClass("layui-icon-moon");
      $("#modeBtn").attr("title", "深色");
      return;
    }
  },
};

// 拖拽工具方法
const dragDropUtil = {
  /**
   * 拖拽结束
   */
  dadDragEnd: function () {
    // 卡片拖拽结束事件监听
    $("#daddyContainer").on("dadDragEnd", function (e) {
      const afterDrag = dragDropUtil.getDragItem();
      if (!afterDrag) {
        return;
      }

      // 删除在末尾生成的被拖拽元素（保证数组不重复）
      afterDrag.splice(-1, 1);
      // 遍历新的元素，根据index更新sort
      for (let [index, item] of afterDrag.entries()) {
        afterDrag[index] = item.split("-")[0] + "-" + (index + 1);
      }

      if (!afterDrag) {
        return;
      }

      // 更新卡片排序数据
      dragDropUtil.changeSort(afterDrag);
    });
  },
  /**
   * 获取拖拽元素
   */
  getDragItem: function () {
    let dragItems = [];
    $("#daddyContainer")
      .find(".ew-datagrid-item .project-list-item .project-list-item-body")
      .each(function (index, node) {
        const id = $(node).attr("id");
        const sort = $(node).attr("data-sort");
        dragItems.push(id + "-" + sort);
      });

    return dragItems;
  },
  /**
   * 变更排序
   * @param {any[]} dragArr
   */
  changeSort: function (dragArr = []) {
    if (!dragArr || dragArr.length == 0) {
      return;
    }

    // 获取卡片数据
    const storageCardData = commonUtil.getItemByKey("card-data");
    // 遍历卡片数据
    for (let cardItem of storageCardData.values()) {
      const itemId = parseInt(cardItem.id);
      // id相同的数据，对sort进行更新
      for (let dragItem of dragArr.values()) {
        const dragItemId = parseInt(dragItem.split("-")[0]);
        const dragItemSort = parseInt(dragItem.split("-")[1]);
        if (itemId === dragItemId) {
          cardItem.sort = dragItemSort;
        }
      }
    }

    storageCardData.sort(this.sortBySort);
    // 更新缓存数据
    localStorage.setItem("card-data", JSON.stringify(storageCardData));
    cardEvent.cardReload(storageCardData);
    cardEvent.binClickToDel();
    // 更新json文件数据
    ipcSendUtil.operateCardJson();
  },
  /**
   * 根据sort字段排序
   * @param {*} a
   * @param {*} b
   * @returns
   */
  sortBySort: function (a, b) {
    return parseInt(a.sort) - parseInt(b.sort);
  },
};

// 渲染进程调用主进程
const ipcSendUtil = {
  /**
   * 展示指定web页面嵌入窗口
   * @param {string} title
   * @param {string} url
   */
  showWebWindow: function (title = "", url = "") {
    window.electronAPI.showWebWindow({ title: title, url: url });
  },
  /**
   * 展示指定本地页面嵌入窗口
   * @param {string} title
   * @param {string} id
   * @param {string} index
   */
  showLocalWindow: function (title = "", id = "", index = "") {
    window.electronAPI.showLocalWindow({ title: title, id: id, index: index });
  },
  /**
   * 展示指定本地页面嵌入窗口（本地服务）
   * @param {string} title
   * @param {string} id
   * @param {string} index
   */
  showLocalServerWindow: function (title = "", id = "", index = "") {
    window.electronAPI.showLocalServerWindow({ title: title, id: id, index: index });
  },
  /**
   * 打开本地exe应用
   * @param {string} exeUrl
   */
  openLocalExeApp: function (exeUrl = "") {
    window.electronAPI.openLocalExeApp({ exeUrl: exeUrl });
  },
  /**
   * 操作datajson文件
   * @param {object} formData
   */
  operateDataJson: function (formData = null) {
    cardEvent.disableSubmit();
    window.electronAPI.operateDataJson(formData);
  },
  /**
   * 操作settingjson文件
   * @param {object} settingData
   */
  operateSettingJson: function (settingData = null) {
    window.electronAPI.operateSettingJson(settingData);
  },
  /**
   * 操作主窗口背景图
   * @param {object} bgImgParam
   */
  operateBgImg: function (bgImgParam = null) {
    window.electronAPI.operateBgImg(JSON.stringify(bgImgParam));
  },
  /**
   * 操作tagjson文件
   */
  operateTagJson: function () {
    if (tagData === null || tagData === "" || !tagData) {
      tagData = commonUtil.getItemByKey("tag-data");
    }

    window.electronAPI.operateTagJson(tagData);
  },
  /**
   * 操作cardjson文件
   */
  operateCardJson: function () {
    let updateCardData = commonUtil.getItemByKey("card-data");
    window.electronAPI.operateCardJson(updateCardData);
  },
  /**
   * 重启应用
   */
  restartApp: function () {
    window.electronAPI.restartApp();
  },
};

// 主进程调用渲染进程
const ipcOnUtil = {
  /**
   * 关闭加载信息
   */
  closeLoading: function () {
    window.electronAPI.closeLoading((event, value) => {
      if (loading) {
        loading.loadRemove(value);
      }
    });
  },
  /**
   * 设置警告信息
   */
  setWaring: function () {
    window.electronAPI.setWaring((event, value) => {
      if (toast) {
        toast.warning({ title: "警告", message: value });
      }

      cardEvent.ableSubmit();
    });
  },
  /**
   * 重新设置背景图片后的回调方法
   */
  resetBgimg: function () {
    window.electronAPI.resetBgimg((event, value) => {
      location.reload();
    });
  },
  /**
   * 重新设置数据
   */
  resetCardData: function () {
    window.electronAPI.resetCardData((event, value) => {
      if (toast) {
        toast.success({ title: "成功", message: "操作成功" });
      }

      layer.closeAll("page");
      if (rlcard) {
        localStorage.setItem("card-data", JSON.stringify(value));
        cardEvent.cardReload(value);
      }

      cardEvent.binClickToDel();
      cardEvent.ableSubmit();
    });
  },
};

// 事件方法
// 卡片事件
const cardEvent = {
  /**
   * 卡片数据重载
   * @param {object} data
   */
  cardReload: function (data = []) {
    cfg.data = data;
    cfg.alldata = data;
    rlcard.render(cfg);
  },
  /**
   * 卡片新增事件
   */
  bindClickToAdd: function () {
    $("#formTitle").html("新增");
    initUtil.resetIconPicker();
    // 表单赋值
    form.val("jsonForm", {
      id: "",
      sort: "",
      acttype: "add",
      name: "",
      url: "",
      exeUrl: "",
      localurl: "",
      index: "index.html",
      icon: "",
      cardtype: "web",
      tags: "",
      remark: "",
    });

    initUtil.initCardTypeRadio("web");
    initUtil.initIconPicker();
    initUtil.initSelect("");
    initUtil.initDraw("cardFormDrawer", "cardForm");
    return;
  },
  /**
   * 卡片编辑事件
   */
  bindClickToEdit: function () {
    // 获取选中的数据
    const data = rlcard.getChecked(tableId);
    $("#formTitle").html("编辑" + data.name + "");
    initUtil.resetIconPicker();
    // 表单赋值
    form.val("jsonForm", {
      id: data.id,
      sort: data.sort,
      acttype: "update",
      name: data.name,
      url: data.url,
      exeUrl: data.exeUrl,
      localurl: data.localurl,
      index: data.index,
      cardtype: data.cardtype,
      tags: data.tags,
      icon: data.icon,
      remark: data.remark,
    });

    initUtil.initCardTypeRadio(data.cardtype);
    initUtil.initIconPicker();
    initUtil.initSelect(data.tags);
    initUtil.initDraw("cardFormDrawer", "cardForm");
    return;
  },
  /**
   * 卡片删除事件
   */
  binClickToDel: function () {
    const type = $("#edidBtn").attr("data-type");
    // 不是编辑状态
    if (type == "1") {
      $(".delteItem").css("display", "none");
      $(".delteItem").removeClass("jackInTheBox");
      $(".delteItem").unbind();
    }

    // 编辑状态
    if (type == "2") {
      // 绑定允许拖拽以及拖拽完成事件
      $("#daddyContainer").dad();
      dragDropUtil.dadDragEnd();
      // 绑定删除按钮点击事件
      $(".delteItem").css("display", "block");
      $(".delteItem").addClass("jackInTheBox");
      $(".delteItem").bind("click", function (evt) {
        const name = $(evt.currentTarget).data("name");
        const id = $(evt.currentTarget).data("id");
        const cardtype = $(evt.currentTarget).data("cardtype");
        rlnotify.confirm("确定删除[" + name + "]?", "vcenter", "shadow", function () {
          layer.msg("正在执行，请稍等...", { icon: 6 });
          setTimeout(function () {
            ipcSendUtil.operateDataJson({ id: id, cardtype: cardtype, acttype: "del" });
          }, 1000);
        });
      });
    }
  },
  /**
   * 卡片跳转web页面点击事件
   */
  bindClickToShowWebWindow: function () {
    loading.Load(4, "正在前往，请稍后...");
    const data = rlcard.getChecked(tableId);
    const cardtype = data.cardtype;
    if (cardtype == "web") {
      ipcSendUtil.showWebWindow(data.name, data.url);
    }

    if (cardtype == "exeApp") {
      ipcSendUtil.openLocalExeApp(data.exeUrl);
    }

    if (cardtype == "local") {
      ipcSendUtil.showLocalWindow(data.name, data.id, data.index);
    }

    if (cardtype == "localServe") {
      ipcSendUtil.showLocalServerWindow(data.name, data.id, data.index);
    }
  },
  /**
   * 卡片编辑表单禁止提交
   */
  disableSubmit: function () {
    canSave = false;
    $("#saveJson").addClass("layui-btn-disabled");
  },
  /**
   * 卡片编辑表单允许提交
   */
  ableSubmit: function () {
    canSave = true;
    $("#saveJson").removeClass("layui-btn-disabled");
  },
};

// 设置面板事件
const setFormEvent = {
  /**
   * 设置按钮点击事件
   */
  bindClickToSetForm: function () {
    const configCardSizes = commonUtil.getItemByKey("config-data").cardSizes;
    const configColors = commonUtil.getItemByKey("config-data").colors;
    // 设置面板-卡片大小点击事件
    $("#setFormDrawer").on("click", ".select-cardsize-item", function () {
      $(".select-cardsize-item").removeAttr("checked");
      $(".select-cardsize-item").removeClass("layui-icon").removeClass("layui-icon-ok");
      $(this).attr("checked");
      $(this).addClass("layui-icon").addClass("layui-icon-ok");
      const cardSizeId = $(this).val();
      const currentCardSize = commonUtil.getObjById(configCardSizes, cardSizeId);
      localStorage.setItem("card-size-id", currentCardSize.id);
      localStorage.setItem("card-size-size", currentCardSize.size);
      localStorage.setItem("card-size-num", currentCardSize.num);
      setFormEvent.resizeCardSize();
    });

    /**
     * 设置面板-主题颜色点击事件
     */
    $("#setFormDrawer").on("click", ".select-color-item", function () {
      $(".select-color-item").removeClass("layui-icon").removeClass("layui-icon-ok");
      $(this).addClass("layui-icon").addClass("layui-icon-ok");
      const colorId = $(this).attr("color-id");
      const currentColor = commonUtil.getObjById(configColors, colorId);
      localStorage.setItem("theme-color", currentColor.id);
      localStorage.setItem("theme-color-color", currentColor.color);
      localStorage.setItem("theme-color-light", currentColor.light);
      localStorage.setItem("theme-color-deep", currentColor.deep);
      rltheme.changeTheme(window, false);
    });

    /**
     * 设置面板-清除背景图片点击事件
     */
    $("#setFormDrawer").on("click", "#clearBgImg", function () {
      $("#bgimg-upload-preview").addClass("layui-hide").find("img").attr("src", "");
      $("#newBgImgUrl").val("");
      $("#newBgImgName").val("");
      let setting = commonUtil.getItemByKey("setting");
      setting.defaultBgimg = "";
      setFormEvent.chengeBgSetting(setting);
    });

    /**
     * 设置面板-清除缓存数据并重启点击事件
     */
    // $("#setFormDrawer").on("click", "#clearStorageAndRestart", function () {
    //   rlnotify.confirm("确定清除缓存数据并重启应用吗?", "vcenter", "shadow", function () {
    //     localStorage.removeItem("setting");
    //     localStorage.removeItem("card-data");
    //     localStorage.removeItem("tag-data");
    //     localStorage.removeItem("config-data");
    //     localStorage.removeItem("mode-type");
    //     localStorage.removeItem("card-size-num");
    //     localStorage.removeItem("card-size-id");
    //     localStorage.removeItem("card-size-size");
    //     localStorage.removeItem("card-linear-gradient");
    //     localStorage.removeItem("theme-bg");
    //     localStorage.removeItem("theme-color");
    //     localStorage.removeItem("theme-color-color");
    //     localStorage.removeItem("theme-color-deep");
    //     localStorage.removeItem("theme-color-light");
    //     localStorage.removeItem("iconfont-data");
    //     ipcSendUtil.restartApp();
    //   });
    // });
  },
  /**
   * 设置面板渲染成功绑定的方法
   */
  bindSuccessToSetForm: function () {
    // 卡片大小单选样式调整
    const cardSizeId = localStorage.getItem("card-size-id");
    if (cardSizeId !== "null") {
      $(".select-cardsize-item").removeAttr("checked");
      $(".select-cardsize-item").removeClass("layui-icon").removeClass("layui-icon-ok");
      $("*[cardsize-id='" + cardSizeId + "']").attr("checked");
      $("*[cardsize-id='" + cardSizeId + "']")
        .addClass("layui-icon")
        .addClass("layui-icon-ok");
    }

    // 主题颜色单选样式调整
    const color = localStorage.getItem("theme-color");
    if (color !== "null") {
      $(".select-color-item").removeClass("layui-icon").removeClass("layui-icon-ok");
      $("*[color-id='" + color + "']")
        .addClass("layui-icon")
        .addClass("layui-icon-ok");
    }

    // 背景图片调整
    const defaultBgimg = commonUtil.getItemByKey("theme-bg").defaultBgimg;
    if (defaultBgimg) {
      const setting = commonUtil.getItemByKey("setting");
      const imgPath = setting.configPath + setting.imgPath + "\\bgImage\\" + defaultBgimg;
      $("#bgimg-upload-preview").removeClass("layui-hide").find("img").attr("src", imgPath);
    }
  },
  /**
   * 设置面板关闭且销毁后绑定的方法
   */
  bindEndToSetForm: function () {
    let setting = commonUtil.getItemByKey("setting");
    // 只赋值需要的参数，一些不需要的参数不设置
    let settingData = {
      mode: setting.mode,
      sysTitle: setting.sysTitle,
      defaultCardSize: setting.defaultCardSize,
      defaultColor: setting.defaultColor,
      defaultBgimg: setting.defaultBgimg,
      defaultBgOpacity: setting.defaultBgOpacity,
      cardLinearGradient: setting.cardLinearGradient,
    };
    // 获取新的窗口标题，搜索引擎，卡片大小，卡片背景，主题颜色，背景样式
    const sysTitle = $("#updateSystitle").val();
    const engineUrl = $("#updatEengineUrl").val();
    const cardSizeId = localStorage.getItem("card-size-id");
    const cardBg = localStorage.getItem("card-linear-gradient");
    const color = localStorage.getItem("theme-color");
    const bgConfigOpacity = $("#rangeValue").html();
    const bgConfigImg = $("#newBgImgName").val();
    // 重新赋值，并执行对应操作
    if (sysTitle) {
      initRendererUtil.setTitle(sysTitle);
      setting.sysTitle = sysTitle;
      settingData.sysTitle = sysTitle;
    }

    if (engineUrl) {
      setting.engineUrl = engineUrl;
      settingData.engineUrl = engineUrl;
    }

    if (bgConfigOpacity) {
      setting.defaultBgOpacity = bgConfigOpacity;
      settingData.defaultBgOpacity = bgConfigOpacity;
    }

    if (bgConfigImg) {
      setting.defaultBgimg = bgConfigImg;
      settingData.defaultBgimg = bgConfigImg;
    }

    if (cardSizeId) {
      setting.defaultCardSize = cardSizeId;
      settingData.defaultCardSize = cardSizeId;
    }

    if (cardBg) {
      setting.cardLinearGradient = cardBg;
      settingData.cardLinearGradient = cardBg;
    }

    if (color) {
      setting.defaultColor = color;
      settingData.defaultColor = color;
    }

    // 1.更新localstorage中的数据
    localStorage.setItem("setting", JSON.stringify(setting));
    // 2.执行背景样式更新
    this.chengeBgSetting(setting);
    // 3.调用进程通信去更新setting.json中的配置
    ipcSendUtil.operateSettingJson(settingData);
  },
  /**
   * 重设卡片size
   */
  resizeCardSize: function () {
    cfgLinenum = initRendererUtil.getCardCfg().linenum;
    cfg.linenum = cfgLinenum;
    rlcard.render(cfg);
  },
  /**
   * 重设卡片背景
   * @param {string} cardLinearGradientKey
   * @param {string} color
   */
  resizeCardBg: function (cardLinearGradientKey = "", color = "") {
    if (cardLinearGradientKey && color) {
      let cardLinearGradient = localStorage.getItem("card-linear-gradient").split(",");
      cardLinearGradient[cardLinearGradientKey] = color;
      localStorage.setItem("card-linear-gradient", cardLinearGradient.join(","));
      rltheme.changeTheme(window, false);
    }
  },
  /**
   * 背景样式更新，透明度 背景图片
   * @param {object} setting
   */
  chengeBgSetting: function (setting = null) {
    // 更新bg图片
    const newBgImgUrl = $("#newBgImgUrl").val();
    const newBgImgName = $("#newBgImgName").val();
    if (newBgImgUrl && newBgImgName) {
      const bgImgParam = {
        bgImgUrl: newBgImgUrl,
        bgImgName: newBgImgName,
      };

      ipcSendUtil.operateBgImg(bgImgParam);
    }

    // 重设样式
    localStorage.setItem("setting", JSON.stringify(setting));
    initRendererUtil.setBgStyle(setting);
    rltheme.changeBgTheme(window);
  },
};

// 按钮相关事件
const btnEvent = {
  /**
   * 设置按钮点击事件
   */
  binClickToSetBtn: function () {
    // 生成设置html
    $("#setFormDrawer").html("");
    const setFormDrawerHtml =
      rlcreatehtml.buildWinTitleHtml() +
      rlcreatehtml.buildWinEngineHtml() +
      rlcreatehtml.buildCardSizeHtml() +
      rlcreatehtml.buildCardBgHtml() +
      rlcreatehtml.buildColorHtml() +
      rlcreatehtml.buildBgHtml();
    // rlcreatehtml.buildOtherHtml();
    $("#setFormDrawer").html(setFormDrawerHtml);
    // 绑定点击事件
    setFormEvent.bindClickToSetForm();
    // 初始化卡片背景设置
    initUtil.initCardBgSetting();
    // 初始化背景设置
    initUtil.initBgSetting();
    // 渲染抽屉
    initUtil.initDraw("setFormDrawer", "setForm");
  },
  /**
   * 深色、明亮模式切换
   */
  switchMode: function () {
    if ($("#modeIcon").hasClass("layui-icon-moon")) {
      localStorage.setItem("mode-type", "dark");
    } else {
      localStorage.setItem("mode-type", "light");
    }

    initRendererUtil.setMode();
  },
};

// 工具条事件
const toolBarEvent = {
  /**
   * 搜索点击事件
   * @param {object} searchParam
   * @returns
   */
  doSearch: function (searchParam = null) {
    if (searchType === "local") {
      this.actSearch(searchParam);
      return;
    }

    if (searchType === "engine") {
      const setting = commonUtil.getItemByKey("setting");
      const url = setting.engineUrl ? setting.engineUrl : "";
      if (url) {
        const searchContent = $("#searchName").val() ? $("#searchName").val().trim() : "";
        ipcSendUtil.showWebWindow("搜索引擎", url + searchContent);
      } else {
        this.actSearch(searchParam);
      }

      return;
    }
  },
  /**
   * 执行搜索事件
   * @param {object} searchParam
   */
  actSearch: function (searchParam = null) {
    // 避免回车进行搜索的时候报错，进行一次数据初始化
    if (searchParam === null) {
      searchParam = { name: "", tagName: "" };
    }

    const searchData = rlcard.search(tableId, {
      where: {
        name: searchParam.name ? searchParam.name : $("#searchName").val() ? $("#searchName").val().trim() : null,
        tagName: searchParam.tagName ? searchParam.tagName : null,
      },
    });

    cfg.data = searchData;
    rlcard.render(cfg);
    cardEvent.binClickToDel();
  },
  /**
   * 编辑按钮点击切换事件
   */
  doEdit: function () {
    const type = $("#edidBtn").attr("data-type");
    if (type == "1") {
      $("#edidBtn").attr("title", "退出编辑");
      $("#edidBtn").attr("data-type", "2");
      $("#edidBtn").addClass("btn-click-onfouce");
      layer.msg("进入编辑状态");
      cfg.clickItem = cardEvent.bindClickToEdit;
      rlcard.render(cfg);
    }

    if (type == "2") {
      $("#edidBtn").attr("title", "编辑");
      $("#edidBtn").attr("data-type", "1");
      $("#edidBtn").removeClass("btn-click-onfouce");
      layer.msg("退出编辑状态");
      cfg.clickItem = cardEvent.bindClickToShowWebWindow;
      rlcard.render(cfg);
    }

    cardEvent.binClickToDel();
  },
};

// 标签事件
const tagEvent = {
  /**
   * 标签点击事件
   * @param {object} data
   */
  clickTag: function (data = {}) {
    const obj = $("#cardTagDiv").find("button")[data.index];
    const tagName = obj.innerText.replace("ဆ", "");
    // let tagId = obj.getAttribute('lay-id');
    const searchParam = { tagName: tagName };
    toolBarEvent.actSearch(searchParam);
  },
  /**
   * 添加标签事件
   * @param {object} data
   */
  addTag: function (data = {}) {
    initRendererUtil.setTagData(JSON.stringify(data.newData), "add");
  },
  /**
   * 删除标签事件
   * @param {object} data
   */
  delTag: function (data = {}) {
    initRendererUtil.setTagData(JSON.stringify(data.newData), "del");
  },
};

// 初始化方法
const initUtil = {
  /**
   * 应用前端初始化
   */
  init: function () {
    if (!setting) {
      setting = commonUtil.getItemByKey("setting");
    }

    if (!tagData) {
      tagData = commonUtil.getItemByKey("tag-data");
    }

    if (!cfgData) {
      cfgData = commonUtil.getItemByKey("card-data");
    }

    cfgLinenum = parseInt(localStorage.getItem("card-size-num"));
    cfg = {
      elem: "#" + tableId, // 操作表ID
      type: "data", // 数据类型，url为接口地址，data为json静态数据
      url: "", // 接口数据
      data: cfgData, // 静态数据
      alldata: [], // 全部数据，用户搜索等功能
      page: false, // 是否分页
      limit: 100, // 每页数量
      linenum: cfgLinenum, // 每行数量
      iconClass: iconClass, // 图标
      clickItem: null, // 点击事件
    };

    // 初始化主题样式
    rltheme.changeTheme(window, false);
    // 初始化背景样式
    rltheme.changeBgTheme(window);
    // 初始化深色模式或者明亮模式
    initRendererUtil.setMode();
    // 初始化卡片列表数据，以及绑定事件
    cfg.alldata = cfgData;
    cfg.clickItem = cardEvent.bindClickToShowWebWindow;
    rlcard.render(cfg);
    // 初始化tag标签
    this.initTag();
  },
  /**
   * 动态抽屉初始化
   * @param {string} drawerId
   * @param {string} type
   */
  initDraw: function (drawerId = "", type = "") {
    layer.closeAll("page");
    let areaSizeW = "40%";
    if (type == "cardForm") {
      areaSizeW = "45%";
    }

    if (type == "setForm") {
      areaSizeW = "23%";
    }

    layer.open({
      type: 1,
      title: false,
      closeBtn: 0,
      offset: "r",
      anim: "slideLeft",
      area: [areaSizeW, "100%"],
      shade: 0.3,
      shadeClose: true,
      id: drawerId,
      content: $("#" + drawerId),
      // 打开弹层成功后的回调函数
      success: function (layero, index, that) {
        if (type == "setForm") {
          setFormEvent.bindSuccessToSetForm();
        }
      },
      // 弹层被关闭且销毁后的回调函数
      end: function () {
        if (type == "setForm") {
          setFormEvent.bindEndToSetForm();
        }

        if (type === "cardForm") {
          $("#cardTagsSelect").html("");
        }
      },
    });
  },
  /**
   * 根据类型来初始化form表单面板
   * @param {string} value
   */
  initCardTypeRadio: function (value = "") {
    if (value == "web") {
      $("#localUploadDiv").hide();
      $("#cardExeUrlDiv").hide();
      $("#cardUrlDiv").show();
      $("#weburl").attr("required", "true");
      $("#weburl").attr("lay-verify", "required|url");
      $("#localurl").removeAttr("required");
      $("#localurl").removeAttr("lay-verify");
      $("#index").removeAttr("required");
      $("#index").removeAttr("lay-verify");
      $("#exeUrl").removeAttr("required");
      $("#exeUrl").removeAttr("lay-verify");
    }

    if (value == "exeApp") {
      $("#localUploadDiv").hide();
      $("#cardExeUrlDiv").show();
      $("#cardUrlDiv").hide();
      $("#exeUrl").attr("required", "true");
      $("#exeUrl").attr("lay-verify", "required|exeApp");
      $("#weburl").removeAttr("required");
      $("#weburl").removeAttr("lay-verify");
      $("#localurl").removeAttr("required");
      $("#localurl").removeAttr("lay-verify");
      $("#index").removeAttr("required");
      $("#index").removeAttr("lay-verify");
    }

    if (value == "local" || value == "localServe") {
      $("#localUploadDiv").show();
      $("#cardUrlDiv").hide();
      $("#cardExeUrlDiv").hide();
      $("#localurl").attr("required", "true");
      $("#localurl").attr("lay-verify", "required");
      $("#index").attr("required", "true");
      $("#index").attr("lay-verify", "required");
      $("#weburl").removeAttr("required");
      $("#weburl").removeAttr("lay-verify");
      $("#exeUrl").removeAttr("required");
      $("#exeUrl").removeAttr("lay-verify");
    }
  },
  /**
   * 图标选择器初始化
   */
  initIconPicker: function () {
    rliconPicker.render({
      elem: "#iconPicker",
      type: "fontClass",
      iconClass: iconClass,
      search: true,
      page: true,
      limit: 16,
      // 点击回调
      click: function (data) {
        form.val("jsonForm", {
          icon: data.icon,
        });
      },
      // 渲染成功后的回调
      success: function (d) {},
    });
  },
  /**
   * 重置图标选择器
   */
  resetIconPicker: function () {
    // 清空图标选择器
    $("#iconPickerDiv").html("");
    // 设置选中的值
    $("#iconPickerDiv").html('<input type="text" name="icon" id="iconPicker" lay-filter="iconPicker">');
  },
  /**
   * 动态标签初始化
   */
  initTag: function () {
    $("#cardTagDiv").html("");
    let cardTagHtml = rlcreatehtml.buildCardTagHtml();
    $("#cardTagDiv").html(cardTagHtml);
    rltag.init("cardTag", {
      skin: "layui-btn layui-btn-primary layui-btn-sm layui-border-color",
      tagText: '<i class="layui-icon layui-icon-add-1"></i>添加标签',
      tagData: tagData,
    });
  },
  /**
   * 标签下拉框初始化
   * @param {string} tags
   */
  initSelect: function (tags = "") {
    $("#cardTagsSelect").html("");
    let tagsData = [];
    const tagArr = JSON.parse(localStorage.getItem("tag-data"));
    $.each(tagArr, function (i, value) {
      tagsData.push({ name: value, value: value });
    });

    let initValue = [];
    if (tags !== "" && tags.trim().length > 0) {
      initValue = tags.split(",");
    }

    cardTagsSelect = xmSelect.render({
      el: "#cardTagsSelect",
      name: "tags",
      size: "medium", // large medium small mini
      max: 5,
      theme: {
        color: "var(--color)",
        maxColor: "red",
      },
      filterable: true, // 搜索
      delay: 100, // 搜索延迟
      autoRow: true, // 换行
      toolbar: {
        show: true, // 工具条
        showIcon: false, // 工具条图标
        list: ["ALL", "CLEAR", "REVERSE"], // 工具条类型
      },
      direction: "auto", // 方向
      tips: "请选择标签", // 提示
      searchTips: "请输入标签名称", // 搜索提示
      empty: "暂无标签", // 空数据提示
      initValue: initValue, // 默认选择数据
      data: tagsData, // 全部数据
      paging: true, // 分页
      pageSize: 10, // 每页数量
      pageEmptyShow: false, // 无数据，不展示分页
    });
  },
  /**
   * 初始化卡片背景设置
   */
  initCardBgSetting: function () {
    colorpicker.render({
      elem: ".card-linear-gradient",
      done: function (color) {
        let cardLinearGradientKey = this.elem[0].getAttribute("card-linear-gradient");
        setFormEvent.resizeCardBg(cardLinearGradientKey, color);
      },
    });
  },
  /**
   * 初始化背景设置
   */
  initBgSetting: function () {
    // 渲染滑块
    rlrange.render();
    // 渲染上传组件
    upload.render({
      elem: "#bgimg-upload-drag",
      url: "",
      accept: "images",
      auto: false,
      bindAction: "#bgimg-upload-action",
      choose: function (obj) {
        obj.preview(function (index, file, result) {
          $("#bgimg-upload-preview").removeClass("layui-hide").find("img").attr("src", file.path);
          $("#newBgImgUrl").val(file.path);
          $("#newBgImgName").val(file.name);
        });
      },
      done: function (res) {},
    });
  },
};

// 要在render中就要先执行的逻辑
// 初始化设置数据
initRendererUtil.setSetting();
initRendererUtil.setTag();
initRendererUtil.setCardData();
initRendererUtil.setIconfont();
// 注册主进程调用渲染进程
ipcOnUtil.resetBgimg();
ipcOnUtil.resetCardData();
ipcOnUtil.closeLoading();
ipcOnUtil.setWaring();
// 获取配置数据
setting = commonUtil.getItemByKey("setting");
cfgData = commonUtil.getItemByKey("card-data");
tagData = commonUtil.getItemByKey("tag-data");
