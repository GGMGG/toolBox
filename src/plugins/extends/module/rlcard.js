layui.define(["table", "laypage", "jquery", "element"], function (exports) {
  "use strict";

  var MOD_NAME = "rlcard",
    $ = layui.jquery,
    element = layui.element,
    laypage = layui.laypage;

  var _instances = {}; // 记录所有实例

  var defaultOption = {
    elem: "#currentTableId", // 构建的模型
    type: "url", // 数据类型，url为接口地址，data为json数据
    url: "", // 数据 url 连接
    loading: true, //是否加载
    draggable: false, // 是否允许拖拽
    limit: 0, //每页数量默认是每行数量的双倍
    linenum: 4, //每行数量 2,3,4,6
    iconClass: "layui-icon",
    currentPage: 1, //当前页
    data: [], //静态数据
    limits: [], //页码
    page: true, //是否分页
    layout: ["count", "prev", "page", "next", "limit", "skip"], //分页控件
    request: {
      pageName: "page", //页码的参数名称，默认：page
      limitName: "limit", //每页数据量的参数名，默认：limit
      idName: "id", //主键名称，默认：id
      sortName: "sort", //排序
      cardName: "name", //卡片名称，name
      webUrl: "url", //卡片跳转链接，url
      exeAppUrl: "exeUrl", //本地EXEAPP链接，exeUrl
      fileUrl: "localurl", //卡片本地链接，localurl
      fileIndex: "index", //本地链接载入地址
      iconName: "icon", //卡片的icon
      cardtypeName: "cardtype", //卡片的类型
      cardtags: "tags", //卡片标签
      remarkName: "remark", //备注名称，默认：remark
    },
    response: {
      statusName: "code", //规定数据状态的字段名称，默认：code
      statusCode: 0, //规定成功的状态码，默认：0
      msgName: "msg", //规定状态信息的字段名称，默认：msg
      countName: "count", //规定数据总数的字段名称，默认：count
      dataName: "data", //规定数据列表的字段名称，默认：data
    },
    clickItem: function (data) {},
    done: function () {},
  };

  var defaultIconClass = "";
  var defaultIcon = "";

  var card = function (opt) {
    _instances[opt.elem.substring(1)] = this;
    this.reload(opt);
  };

  card.prototype.initOptions = function (opt) {
    this.option = $.extend(true, {}, defaultOption, opt);
    if (!this.option.limit || this.option.limit == 0) {
      this.option.limit = this.option.linenum * 2;
    }
    if (!this.option.limits || this.option.limits.length == 0) {
      this.option.limits = [this.option.limit];
    }
  };

  card.prototype.init = function () {
    var option = this.option;
    // 初始化加载动画
    var html = "";
    html += option.loading == true ? '<div class="ew-table-loading">' : '<div class="ew-table-loading layui-hide">';
    html += '<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i>';
    html += "</div>";
    defaultIconClass = option.iconClass;
    defaultIcon = option.iconClass === "layui-icon" ? "layui-icon-windows" : "layui-extend-television";
    $(option.elem).html(html);
    // 根据type类型，设置不同的数据
    var type = option.type;
    if (type === "url") {
      var url = option.url;
      html = "";
      if (!!url) {
        if (url.indexOf("?") >= 0) {
          url = url + "&v=1.0.0";
        } else {
          url = url + "?v=1.0.0";
        }
        if (!!option.page) {
          url = url + "&" + option.request.limitName + "=" + option.limit;
          url = url + "&" + option.request.pageName + "=" + option.currentPage;
        }
        if (!!option.where) {
          for (let key in option.where) {
            url = url + "&" + key + "=" + option.where[key];
          }
        }
        getData(url).then(function (data) {
          data = initData(data, option);
          if (data.code != option.response.statusCode) {
            option.data = [];
            option.count = 0;
          } else {
            option.data = data.data;
            option.count = data.count;
          }
          if (!!option.data && option.data.length > 0) {
            html = createComponent(option.elem.substring(1), option.linenum, option.data, option.draggable);
            html += "<div id='cardpage'></div>";
          } else {
            if (data.code != option.response.statusCode) {
              html = '<h1 style="text-align:center;padding: 50px 0 50px 0;">' + data.msg + "</h1>";
            } else {
              html = '<h1 style="text-align:center;padding: 50px 0 50px 0;">暂无数据</h1>';
            }
          }
          $(option.elem).html(html);
          if (option.page) {
            laypage.render({
              elem: "cardpage",
              count: option.count,
              limit: option.limit,
              limits: option.limits,
              curr: option.currentPage,
              layout: option.layout,
              jump: function (obj, first) {
                option.limit = obj.limit;
                option.currentPage = obj.curr;
                if (!first) {
                  _instances[option.elem.substring(1)].reload(option);
                }
              },
            });
          }
        });
      }
    }

    if (type === "data") {
      if (!option.alldata) {
        option.alldata = option.data;
      }
      if (option.page) {
        var data = [];
        option.count = option.alldata.length;
        for (var i = (option.currentPage - 1) * option.limit; i < option.currentPage * option.limit && i < option.alldata.length; i++) {
          data.push(option.alldata[i]);
        }
        option.data = data;
      }

      if (!!option.data && option.data.length > 0) {
        html = createComponent(option.elem.substring(1), option.linenum, option.data, option.draggable);
        html += "<div id='cardpage'></div>";
      } else {
        html = '<h1 style="text-align:center;padding: 50px 0 50px 0;">暂无数据</h1>';
      }

      $(option.elem).html(html);
      if (option.page) {
        laypage.render({
          elem: "cardpage",
          count: option.count,
          limit: option.limit,
          limits: option.limits,
          curr: option.currentPage,
          layout: option.layout,
          jump: function (obj, first) {
            option.limit = obj.limit;
            option.currentPage = obj.curr;
            if (!first) {
              _instances[option.elem.substring(1)].reload(option);
            }
          },
        });
      }
    }
  };

  card.prototype.reload = function (opt) {
    this.initOptions(this.option ? $.extend(true, this.option, opt) : opt);
    this.init(); // 初始化表格
  };

  function createComponent(elem, linenum, data, draggable) {
    var html = "<div class='cloud-card-component'>";
    var content = createCards(elem, linenum, data, draggable);
    var page = "";
    content = content + page;
    html += content + "</div>";
    return html;
  }

  function createCards(elem, linenum, data, draggable) {
    var content = "<div class='layui-row layui-col-space30' id='daddyContainer'>";
    data.sort(sortBySort);
    for (var i = 0; i < data.length; i++) {
      content += createCard(elem, linenum, data[i], i, draggable);
    }
    content += "</div>";
    return content;
  }

  function sortBySort(a, b) {
    return parseInt(a.sort) - parseInt(b.sort);
  }

  function createCard(elem, linenum, item, no, draggable) {
    var line = 12 / linenum;
    var card = "";
    var icon = item.icon == "" ? defaultIcon : item.icon;
    var showRemark = item.remark == "" ? "暂无描述" : item.remark;
    if (showRemark.length > 18) {
      showRemark = showRemark.substring(0, 18) + "...";
    }

    card += '<div class="layui-col-md' + line + ' ew-datagrid-item">';
    card += '	<div class="project-list-item"> ';
    card += '		<sup class="delteItem" data-id="' + item.id + '" data-name="' + item.name + '" data-cardtype="' + item.cardtype + '"><span class="icon layui-icon layui-icon-close"></span></sup>';
    card += '		<div class="project-list-item-body" onclick="cardTableCheckedCard(' + elem + ',this)" id="' + item.id + '" data-cardtype="' + item.cardtype + '" data-index="' + no + '" data-sort="' + item.sort + '">';
    card += '			<span id="data-url" style="display:none" data-url="' + item.url + '"></span>';
    card += '			<span id="exe-url" style="display:none" exe-url="' + item.exeUrl + '"></span>';
    card += '			<span id="data-localurl" style="display:none" data-localurl="' + item.localurl + '"></span>';
    card += '			<span id="data-tags" style="display:none" data-tags="' + item.tags + '"></span>';
    card += '			<span id="data-index" style="display:none" data-index="' + item.index + '"></span>';
    card += '			<span id="data-remark" style="display:none" data-remark="' + item.remark + '"></span>';
    card += '			<span class="icon ' + defaultIconClass + " " + icon + '" data-icon="' + icon + '"></span>';
    card += '			<h2 class="layui-elip">' + item.name + "</h2>";
    card += '			<div class="project-list-item-text layui-text">' + showRemark + "</div>";
    card += "		</div>";
    card += "	</div>";
    card += "</div>";
    return card;
  }

  function initData(tempData, option) {
    var data = {};
    data.code = tempData[option.response.statusName];
    data.msg = tempData[option.response.msgName];
    data.count = tempData[option.response.countName];
    var dataList = tempData[option.response.dataName];
    if (!dataList) {
      return data;
    }

    data.data = [];
    for (var i = 0; i < dataList.length; i++) {
      var item = dataList[i];
      item.id = dataList[i][option.request.idName];
      item.sort = dataList[i][option.request.sortName];
      item.icon = dataList[i][option.request.iconName];
      item.name = dataList[i][option.request.cardName];
      item.url = dataList[i][option.request.webUrl];
      item.exeUrl = dataList[i][option.request.exeAppUrl];
      item.localurl = dataList[i][option.request.fileUrl];
      item.index = dataList[i][option.request.fileIndex];
      item.cardtype = dataList[i][option.request.cardtypeName];
      item.tags = dataList[i][option.request.cardtags];
      item.remark = dataList[i][option.request.remarkName];
      data.data.push(item);
    }
    return data;
  }

  function getData(url) {
    var defer = $.Deferred();
    $.get(url + (url.indexOf("?") ? "&" : "?") + "fresh=" + Math.random(), function (result) {
      defer.resolve(result);
    });
    return defer.promise();
  }

  window.cardTableCheckedCard = function (elem, obj) {
    //$(obj).addClass('layui-table-click').siblings().removeClass('layui-table-click');
    var item = {};
    item.id = obj.id;
    item.index = $(obj).attr("data-index");
    item.sort = $(obj).attr("data-sort");
    item.icon = $(obj).find("." + defaultIconClass).attr("data-icon");
    item.name = $(obj).find("h2")[0].innerHTML;
    item.remark = $(obj).find("#data-remark").attr("data-remark");
    item.url = $(obj).find("#data-url").attr("data-url");
    item.exeUrl = $(obj).find("#exe-url").attr("exe-url");
    item.localurl = $(obj).find("#data-localurl").attr("data-localurl");
    item.index = $(obj).find("#data-index").attr("data-index");
    item.cardtype = $(obj).attr("data-cardtype");
    item.tags = $(obj).find("#data-tags").attr("data-tags");
    _instances[elem.id].option.checkedItem = item;
    _instances[elem.id].option.clickItem(item);
  };

  /** 对外提供的方法 */
  var tt = {
    render: function (options) {
      return new card(options);
    },

    reload: function (id, opt) {
      _instances[id].option.checkedItem = null;
      _instances[id].reload(opt);
    },

    search: function (id, opt) {
      var option = _instances[id].option;
      var alldata = option.alldata;
      var name = opt.where.name ? opt.where.name.replace(" ", "").replace(/\s*/g, "") : "";
      var tagName = opt.where.tagName ? opt.where.tagName.replace(" ", "").replace(/\s*/g, "") : "";
      if (!tools.checkStr(name) && !tools.checkStr(tagName)) {
        return alldata;
      }

      var serachResult = [];
      // 卡片名称匹配
      var nameSerachResult = [];
      if (name !== "") {
        alldata.forEach((data) => {
          var dataName = data.name;
          if (dataName.indexOf(name) > -1) {
            nameSerachResult.push(data);
          }
        });

        serachResult = [...serachResult, ...nameSerachResult];
        if (serachResult.length === 0) {
          return serachResult;
        }
      } else {
        serachResult = alldata;
      }

      // 标签名称匹配
      var tagSerachResult = [];
      // 选中的标签不为空，且不为全部
      if (tagName && tagName !== "" && tagName !== "全部") {
        // 先判断卡片名称匹配是否有结果
        if (serachResult.length > 0) {
          // 有结果的情况，要在原有数据中再去匹配标签
          serachResult.forEach((data) => {
            var dataTags = data.tags;
            if (dataTags.indexOf(tagName) > -1) {
              tagSerachResult.push(data);
            }
          });
        } else {
          // 没有结果的情况，在全部数据中匹配标签
          alldata.forEach((data) => {
            var dataTags = data.tags;
            if (dataTags.indexOf(tagName) > -1) {
              tagSerachResult.push(data);
            }
          });
        }

        serachResult = tagSerachResult;
      }

      return serachResult;
    },

    getChecked: function (id) {
      var option = _instances[id].option;
      var data = option.checkedItem;
      var item = {};
      if (!data) {
        return null;
      }
      item[option.request.idName] = data.id;
      item[option.request.sortName] = data.sort;
      item[option.request.iconName] = data.icon;
      item[option.request.cardName] = data.name;
      item[option.request.webUrl] = data.url;
      item[option.request.exeAppUrl] = data.exeUrl;
      item[option.request.fileUrl] = data.localurl;
      item[option.request.fileIndex] = data.index;
      item[option.request.cardtypeName] = data.cardtype;
      item[option.request.cardtags] = data.tags;
      item[option.request.remarkName] = data.remark;
      return item;
    },

    getAllData: function (id) {
      var option = _instances[id].option;
      var data = [];
      for (var i = 0; i < option.data.length; i++) {
        var item = {};
        item[option.request.idName] = option.data[i].id;
        item[option.request.sortName] = option.data[i].sort;
        item[option.request.iconName] = option.data[i].icon;
        item[option.request.cardName] = option.data[i].name;
        item[option.request.webUrl] = option.data[i].url;
        item[option.request.exeAppUrl] = option.data[i].exeUrl;
        item[option.request.fileUrl] = option.data[i].localurl;
        item[option.request.fileIndex] = option.data[i].index;
        item[option.request.cardtypeName] = option.data[i].cardtype;
        item[option.request.cardtags] = option.data[i].tags;
        item[option.request.remarkName] = option.data[i].remark;
        data.push(item);
      }
      return data;
    },
  };

  var tools = {
    checkStr: function (str) {
      if (str === "" || str.trim().length === 0) {
        return false;
      }

      return true;
    },
  };

  exports(MOD_NAME, tt);
});
