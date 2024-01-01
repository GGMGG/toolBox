layui.define(["laypage", "form"], function (exports) {
  "use strict";

  var IconPicker = function () {
      this.v = "1.1";
    },
    _MOD = "rliconPicker",
    _this = this,
    $ = layui.jquery,
    laypage = layui.laypage,
    form = layui.form,
    BODY = "body",
    TIPS = "请选择图标";

  /**
   * 渲染组件
   */
  IconPicker.prototype.render = function (options) {
    var opts = options,
      // DOM选择器
      elem = opts.elem,
      // 数据类型：fontClass/unicode
      type = opts.type == null ? "fontClass" : opts.type,
      // 是否分页：true/false
      page = opts.page == null ? true : opts.page,
      // 每页显示数量
      limit = opts.limit == null ? 12 : opts.limit,
      // 是否开启搜索：true/false
      search = opts.search == null ? true : opts.search,
      // 每个图标格子的宽度：'43px'或'20%'
      cellWidth = opts.cellWidth,
      // 点击回调
      click = opts.click,
      // 渲染成功后的回调
      success = opts.success,
      // 前缀 默认使用 layui-icon/iconfont
      defaultIconClass = opts.iconClass == null ? "layui-icon" : opts.iconClass,
      searchUnicode =  opts.iconClass === "layui-icon" ? "&#xe615;" : "&#xe9b8;",
      preUnicode =  opts.iconClass === "layui-icon" ? "&#xe603;" : "&#xe81b;",
      nextUnicode =  opts.iconClass === "layui-icon" ? "&#xe602;" : "&#xe81c;",
      ICON_prefix = opts.prefix == null ? opts.iconClass : opts.prefix,
      // 异步获取外部字体图标数据
      ICON_url = opts.url,
      // json数据
      data = {},
      // 唯一标识
      tmp = new Date().getTime(),
      // 是否使用的class数据
      isFontClass = opts.type === "fontClass",
      // 是否使用自定义图标数据
      isCustom = opts.url != null && opts.prefix != null,
      // 初始化时input的值
      ORIGINAL_ELEM_VALUE = $(elem).val(),
      TITLE = "layui-select-title",
      TITLE_ID = "layui-select-title-" + tmp,
      ICON_BODY = "layui-iconpicker-" + tmp,
      PICKER_BODY = "layui-iconpicker-body-" + tmp,
      PAGE_ID = "layui-iconpicker-page-" + tmp,
      LIST_BOX = "layui-iconpicker-list-box",
      selected = "layui-form-selected",
      unselect = "layui-unselect";
    var a = {
      init: function () {
        if (isCustom) {
          data = common.ajaxData(ICON_url, ICON_prefix);
        } else {
          data = common.getData[type]();
        }

        a.hideElem().createSelect().createBody().toggleSelect();
        a.preventEvent().inputListen();
        common.loadCss();
        if (success) {
          success(this.successHandle());
        }

        return a;
      },
      successHandle: function () {
        var d = {
          options: opts,
          data: data,
          id: tmp,
          elem: $("#" + ICON_BODY),
        };
        return d;
      },
      /**
       * 隐藏elem
       */
      hideElem: function () {
        $(elem).hide();
        return a;
      },
      /**
       * 绘制select下拉选择框
       */
      createSelect: function () {
        var oriIcon = '<i class="' + defaultIconClass + '">';
        // 默认图标
        if (ORIGINAL_ELEM_VALUE === "") {
          if (isFontClass) {
            if (defaultIconClass === "layui-icon") {
              ORIGINAL_ELEM_VALUE = "layui-icon-circle-dot";
            }

            if (defaultIconClass === "iconfont") {
              ORIGINAL_ELEM_VALUE = "layui-extend-gongzuotai";
            }
          } else {
            if (defaultIconClass === "layui-icon") {
              ORIGINAL_ELEM_VALUE = "&#xe617;";
            }

            if (defaultIconClass === "iconfont") {
              ORIGINAL_ELEM_VALUE = "&#xe6d3;";
            }
          }
        }

        if (isFontClass || isCustom) {
          oriIcon = '<i class="' + ICON_prefix + " " + ORIGINAL_ELEM_VALUE + '">';
        } else {
          oriIcon += ORIGINAL_ELEM_VALUE;
        }
        oriIcon += "</i>";

        var selectHtml =
          '<div class="layui-iconpicker layui-unselect layui-form-select" id="' +
          ICON_BODY +
          '">' +
          '<div class="' +
          TITLE +
          '" id="' +
          TITLE_ID +
          '">' +
          '<div class="layui-iconpicker-item">' +
          '<span class="layui-iconpicker-icon layui-unselect">' +
          oriIcon +
          "</span>" +
          '<i class="layui-edge"></i>' +
          "</div>" +
          "</div>" +
          '<div class="layui-anim layui-anim-upbit" style="">' +
          "123" +
          "</div>";
        $(elem).after(selectHtml);
        return a;
      },
      /**
       * 展开/折叠下拉框
       */
      toggleSelect: function () {
        var item = "#" + TITLE_ID + " .layui-iconpicker-item,#" + TITLE_ID + " .layui-iconpicker-item .layui-edge";
        a.event("click", item, function (e) {
          var $icon = $("#" + ICON_BODY);
          if ($icon.hasClass(selected)) {
            $icon.removeClass(selected).addClass(unselect);
          } else {
            // 隐藏其他picker
            $(".layui-form-select").removeClass(selected);
            // 显示当前picker
            $icon.addClass(selected).removeClass(unselect);
          }
          e.stopPropagation();
        });
        return a;
      },
      /**
       * 绘制主体部分
       */
      createBody: function () {
        // 获取数据
        var searchHtml = "";
        if (search) {
          searchHtml = '<div class="layui-iconpicker-search">' + '<input class="layui-input">' + '<i class="' + defaultIconClass + '">' + searchUnicode + "</i>" + "</div>";
        }

        // 组合dom
        var bodyHtml = '<div class="layui-iconpicker-body" id="' + PICKER_BODY + '">' + searchHtml + '<div class="' + LIST_BOX + '"></div> ' + "</div>";
        $("#" + ICON_BODY)
          .find(".layui-anim")
          .eq(0)
          .html(bodyHtml);
        a.search().createList().check().page();

        return a;
      },
      /**
       * 绘制图标列表
       * @param text 模糊查询关键字
       * @returns {string}
       */
      createList: function (text) {
        var d = data,
          l = d.length,
          pageHtml = "",
          listHtml = $('<div class="layui-iconpicker-list">'); //'<div class="layui-iconpicker-list">';

        // 计算分页数据
        var _limit = limit, // 每页显示数量
          _pages = l % _limit === 0 ? l / _limit : parseInt(l / _limit + 1), // 总计多少页
          _id = PAGE_ID;

        // 图标列表
        var icons = [];

        for (var i = 0; i < l; i++) {
          var obj = d[i];
          // 判断是否模糊查询
          if (text && obj.indexOf(text) === -1) {
            continue;
          }

          // 是否自定义格子宽度
          var style = "";
          if (cellWidth !== null) {
            style += ' style="width:' + cellWidth + '"';
          }

          // 每个图标dom
          var icon = '<div class="layui-iconpicker-icon-item" title="' + obj + '" ' + style + ">";
          if (isFontClass || isCustom) {
            icon += '<i class="' + ICON_prefix + " " + obj + '"></i>';
          } else {
            icon += '<i class="' + defaultIconClass + '">' + obj.replace("amp;", "") + "</i>";
          }

          icon += "</div>";
          icons.push(icon);
        }

        // 查询出图标后再分页
        l = icons.length;
        _pages = l % _limit === 0 ? l / _limit : parseInt(l / _limit + 1);
        for (var i = 0; i < _pages; i++) {
          // 按limit分块
          var lm = $('<div class="layui-iconpicker-icon-limit" id="layui-iconpicker-icon-limit-' + tmp + (i + 1) + '">');

          for (var j = i * _limit; j < (i + 1) * _limit && j < l; j++) {
            lm.append(icons[j]);
          }

          listHtml.append(lm);
        }

        // 无数据
        if (l === 0) {
          listHtml.append('<p class="layui-iconpicker-tips">无数据</p>');
        }

        // 判断是否分页
        if (page) {
          $("#" + PICKER_BODY).addClass("layui-iconpicker-body-page");
          pageHtml =
            '<div class="layui-iconpicker-page" id="' +
            PAGE_ID +
            '">' +
            '<div class="layui-iconpicker-page-count">' +
            '<span id="' +
            PAGE_ID +
            '-current">1</span>/' +
            '<span id="' +
            PAGE_ID +
            '-pages">' +
            _pages +
            "</span>" +
            ' (<span id="' +
            PAGE_ID +
            '-length">' +
            l +
            "</span>)" +
            "</div>" +
            '<div class="layui-iconpicker-page-operate">' +
            '<i class="' +
            defaultIconClass +
            '" id="' +
            PAGE_ID +
            '-prev" data-index="0" prev>' +
            preUnicode +
            "</i> " +
            '<i class="' +
            defaultIconClass +
            '" id="' +
            PAGE_ID +
            '-next" data-index="2" next>' +
            nextUnicode +
            "</i> " +
            "</div>" +
            "</div>";
        }

        $("#" + ICON_BODY)
          .find(".layui-anim")
          .find("." + LIST_BOX)
          .html("")
          .append(listHtml)
          .append(pageHtml);
        return a;
      },
      // 阻止Layui的一些默认事件
      preventEvent: function () {
        var item = "#" + ICON_BODY + " .layui-anim";
        a.event("click", item, function (e) {
          e.stopPropagation();
        });
        return a;
      },
      // 分页
      page: function () {
        var icon = "#" + PAGE_ID + " .layui-iconpicker-page-operate ." + defaultIconClass;
        $(icon).unbind("click");
        a.event("click", icon, function (e) {
          var elem = e.currentTarget,
            total = parseInt($("#" + PAGE_ID + "-pages").html()),
            isPrev = $(elem).attr("prev") !== undefined,
            // 按钮上标的页码
            index = parseInt($(elem).attr("data-index")),
            $cur = $("#" + PAGE_ID + "-current"),
            // 点击时正在显示的页码
            current = parseInt($cur.html());

          // 分页数据
          if (isPrev && current > 1) {
            current = current - 1;
            $(icon + "[prev]").attr("data-index", current);
          } else if (!isPrev && current < total) {
            current = current + 1;
            $(icon + "[next]").attr("data-index", current);
          }
          $cur.html(current);

          // 图标数据
          $("#" + ICON_BODY + " .layui-iconpicker-icon-limit").hide();
          $("#layui-iconpicker-icon-limit-" + tmp + current).show();
          e.stopPropagation();
        });
        return a;
      },
      /**
       * 搜索
       */
      search: function () {
        var item = "#" + PICKER_BODY + " .layui-iconpicker-search .layui-input";
        a.event("input propertychange", item, function (e) {
          var elem = e.target,
            t = $(elem).val();
          a.createList(t);
        });
        return a;
      },
      /**
       * 点击选中图标
       */
      check: function () {
        var item = "#" + PICKER_BODY + " .layui-iconpicker-icon-item";
        a.event("click", item, function (e) {
          var el = $(e.currentTarget).find("." + ICON_prefix),
            icon = "";
          //console.log( el.attr('class'));
          if (isFontClass || isCustom) {
            var clsArr = el.attr("class").split(/[\s\n]/),
              cls = clsArr[1],
              icon = cls;
            $("#" + TITLE_ID)
              .find(".layui-iconpicker-item ." + ICON_prefix)
              .html("")
              .attr("class", clsArr.join(" "));
          } else {
            var cls = el.html(),
              icon = cls;
            $("#" + TITLE_ID)
              .find(".layui-iconpicker-item ." + defaultIconClass)
              .html(icon);
          }

          $("#" + ICON_BODY)
            .removeClass(selected)
            .addClass(unselect);
          $(elem).val(icon).attr("value", icon);
          // 回调
          if (click) {
            click({
              icon: icon,
            });
          }
        });
        return a;
      },
      // 监听原始input数值改变
      inputListen: function () {
        var el = $(elem);
        a.event("change", elem, function () {
          var value = el.val();
        });
        // el.change(function(){

        // });
        return a;
      },
      event: function (evt, el, fn) {
        $(BODY).on(evt, el, fn);
      },
    };
    var common = {
      /**
       * 加载样式表
       */
      loadCss: function () {
        var css =
          ".layui-iconpicker {max-width: 280px;}.layui-iconpicker .layui-anim{display:none;position:absolute;left:0;top:42px;padding:5px 0;z-index:899;min-width:100%;border:1px solid #d2d2d2;max-height:300px;overflow-y:auto;background-color:#fff;border-radius:2px;box-shadow:0 2px 4px rgba(0,0,0,.12);box-sizing:border-box;}.layui-iconpicker-item{border:1px solid #e6e6e6;width:90px;height:38px;border-radius:4px;cursor:pointer;position:relative;}.layui-iconpicker-icon{border-right:1px solid #e6e6e6;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;width:60px;height:100%;float:left;text-align:center;background:#fff;transition:all .3s;}.layui-iconpicker-icon i{line-height:38px;font-size:18px;}.layui-iconpicker-item > .layui-edge{left:70px;}.layui-iconpicker-item:hover{border-color:#D2D2D2!important;}.layui-iconpicker-item:hover .layui-iconpicker-icon{border-color:#D2D2D2!important;}.layui-iconpicker.layui-form-selected .layui-anim{display:block;}.layui-iconpicker-body{padding:6px;}.layui-iconpicker .layui-iconpicker-list{background-color:#fff;border:1px solid #ccc;border-radius:4px;}.layui-iconpicker .layui-iconpicker-icon-item{display:inline-block;width:21.1%;line-height:36px;text-align:center;cursor:pointer;vertical-align:top;height:36px;margin:4px;border:1px solid #ddd;border-radius:2px;transition:300ms;}.layui-iconpicker .layui-iconpicker-icon-item i.layui-icon{font-size:17px;}.layui-iconpicker .layui-iconpicker-icon-item:hover{background-color:#eee;border-color:#ccc;-webkit-box-shadow:0 0 2px #aaa,0 0 2px #fff inset;-moz-box-shadow:0 0 2px #aaa,0 0 2px #fff inset;box-shadow:0 0 2px #aaa,0 0 2px #fff inset;text-shadow:0 0 1px #fff;}.layui-iconpicker-search{position:relative;margin:0 0 6px 0;border:1px solid #e6e6e6;border-radius:2px;transition:300ms;}.layui-iconpicker-search:hover{border-color:#D2D2D2!important;}.layui-iconpicker-search .layui-input{cursor:text;display:inline-block;width:86%;border:none;padding-right:0;margin-top:1px;}.layui-iconpicker-search .layui-icon{position:absolute;top:11px;right:4%;}.layui-iconpicker-tips{text-align:center;padding:8px 0;cursor:not-allowed;}.layui-iconpicker-page{margin-top:6px;margin-bottom:-6px;font-size:12px;padding:0 2px;}.layui-iconpicker-page-count{display:inline-block;}.layui-iconpicker-page-operate{display:inline-block;float:right;cursor:default;}.layui-iconpicker-page-operate .layui-icon{font-size:12px;cursor:pointer;}.layui-iconpicker-body-page .layui-iconpicker-icon-limit{display:none;}.layui-iconpicker-body-page .layui-iconpicker-icon-limit:first-child{display:block;}";
        var $style = $("head").find("style[iconpicker]");
        if ($style.length === 0) {
          $("head").append('<style rel="stylesheet" iconpicker>' + css + "</style>");
        }
      },
      /**
       * 获取数据
       */
      getData: {
        fontClass: function () {
          let iconlist = [];
          if (defaultIconClass === "layui-icon") {
            iconlist = [
              "layui-icon-rate-half",
              "layui-icon-rate",
              "layui-icon-rate-solid",
              "layui-icon-cellphone",
              "layui-icon-vercode",
              "layui-icon-login-wechat",
              "layui-icon-login-qq",
              "layui-icon-login-weibo",
              "layui-icon-password",
              "layui-icon-username",
              "layui-icon-refresh-3",
              "layui-icon-auz",
              "layui-icon-spread-left",
              "layui-icon-shrink-right",
              "layui-icon-snowflake",
              "layui-icon-tips",
              "layui-icon-note",
              "layui-icon-home",
              "layui-icon-senior",
              "layui-icon-refresh",
              "layui-icon-refresh-1",
              "layui-icon-flag",
              "layui-icon-theme",
              "layui-icon-notice",
              "layui-icon-website",
              "layui-icon-console",
              "layui-icon-face-surprised",
              "layui-icon-set",
              "layui-icon-template-1",
              "layui-icon-app",
              "layui-icon-template",
              "layui-icon-praise",
              "layui-icon-tread",
              "layui-icon-male",
              "layui-icon-female",
              "layui-icon-camera",
              "layui-icon-camera-fill",
              "layui-icon-more",
              "layui-icon-more-vertical",
              "layui-icon-rmb",
              "layui-icon-dollar",
              "layui-icon-diamond",
              "layui-icon-fire",
              "layui-icon-return",
              "layui-icon-location",
              "layui-icon-read",
              "layui-icon-survey",
              "layui-icon-face-smile",
              "layui-icon-face-cry",
              "layui-icon-cart-simple",
              "layui-icon-cart",
              "layui-icon-next",
              "layui-icon-prev",
              "layui-icon-upload-drag",
              "layui-icon-upload",
              "layui-icon-download-circle",
              "layui-icon-component",
              "layui-icon-file-b",
              "layui-icon-user",
              "layui-icon-find-fill",
              "layui-icon-loading",
              "layui-icon-loading-1",
              "layui-icon-add-1",
              "layui-icon-play",
              "layui-icon-pause",
              "layui-icon-headset",
              "layui-icon-video",
              "layui-icon-voice",
              "layui-icon-speaker",
              "layui-icon-fonts-del",
              "layui-icon-fonts-code",
              "layui-icon-fonts-html",
              "layui-icon-fonts-strong",
              "layui-icon-unlink",
              "layui-icon-picture",
              "layui-icon-link",
              "layui-icon-face-smile-b",
              "layui-icon-align-left",
              "layui-icon-align-right",
              "layui-icon-align-center",
              "layui-icon-fonts-u",
              "layui-icon-fonts-i",
              "layui-icon-tabs",
              "layui-icon-radio",
              "layui-icon-circle",
              "layui-icon-edit",
              "layui-icon-share",
              "layui-icon-delete",
              "layui-icon-form",
              "layui-icon-cellphone-fine",
              "layui-icon-dialogue",
              "layui-icon-fonts-clear",
              "layui-icon-layer",
              "layui-icon-date",
              "layui-icon-water",
              "layui-icon-code-circle",
              "layui-icon-carousel",
              "layui-icon-prev-circle",
              "layui-icon-layouts",
              "layui-icon-util",
              "layui-icon-templeate-1",
              "layui-icon-upload-circle",
              "layui-icon-tree",
              "layui-icon-table",
              "layui-icon-chart",
              "layui-icon-chart-screen",
              "layui-icon-engine",
              "layui-icon-triangle-d",
              "layui-icon-triangle-r",
              "layui-icon-file",
              "layui-icon-set-sm",
              "layui-icon-add-circle",
              "layui-icon-404",
              "layui-icon-about",
              "layui-icon-up",
              "layui-icon-down",
              "layui-icon-left",
              "layui-icon-right",
              "layui-icon-circle-dot",
              "layui-icon-search",
              "layui-icon-set-fill",
              "layui-icon-group",
              "layui-icon-friends",
              "layui-icon-reply-fill",
              "layui-icon-menu-fill",
              "layui-icon-log",
              "layui-icon-picture-fine",
              "layui-icon-face-smile-fine",
              "layui-icon-list",
              "layui-icon-release",
              "layui-icon-ok",
              "layui-icon-help",
              "layui-icon-chat",
              "layui-icon-top",
              "layui-icon-star",
              "layui-icon-star-fill",
              "layui-icon-close-fill",
              "layui-icon-close",
              "layui-icon-ok-circle",
              "layui-icon-add-circle-fine",
            ];
          }

          if (defaultIconClass === "iconfont") {
            const iconfontList = localStorage.getItem("iconfont-data");
            if (iconfontList) {
              iconlist = iconfontList.split(",");
            } else {
              iconlist = [
                "layui-extend-pocket1",
                "layui-extend-producthunt",
                "layui-extend-reddit1",
                "layui-extend-rss1",
                "layui-extend-scoopit",
                "layui-extend-sketch",
                "layui-extend-skype1",
                "layui-extend-shopify1",
                "layui-extend-spotify1",
                "layui-extend-tumblr1",
                "layui-extend-slack1",
                "layui-extend-windows1",
                "layui-extend-vimeo1",
                "layui-extend-stackoverflow",
                "layui-extend-soundcloud1",
                "layui-extend-youtube1",
                "layui-extend-twitter1",
                "layui-extend-wordpress1",
                "layui-extend-yelp1",
                "layui-extend-blogger1",
                "layui-extend-whatsapp1",
                "layui-extend-bitly",
                "layui-extend-apple2",
                "layui-extend-viber",
                "layui-extend-buffer1",
                "layui-extend-android1",
                "layui-extend-chrome",
                "layui-extend-drive",
                "layui-extend-airbnb",
                "layui-extend-dropbox1",
                "layui-extend-dribbble1",
                "layui-extend-envato1",
                "layui-extend-amazon",
                "layui-extend-fancy",
                "layui-extend-behance1",
                "layui-extend-flickr1",
                "layui-extend-foursquare",
                "layui-extend-explorer",
                "layui-extend-facebook1",
                "layui-extend-github",
                "layui-extend-google1",
                "layui-extend-magento",
                "layui-extend-linkedin1",
                "layui-extend-periscope",
                "layui-extend-opera",
                "layui-extend-codepen1",
                "layui-extend-hangouts",
                "layui-extend-paypal1",
                "layui-extend-pinterest1",
                "layui-extend-evernote1",
                "layui-extend-medium",
                "layui-extend-messenger",
                "layui-extend-feedly1",
                "layui-extend-facebook",
                "layui-extend-soundcloud",
                "layui-extend-gitlab",
                "layui-extend-discord",
                "layui-extend-creative-market",
                "layui-extend-csdn",
                "layui-extend-microsoft",
                "layui-extend-oschina",
                "layui-extend-evernote",
                "layui-extend-flipboard",
                "layui-extend-feedly",
                "layui-extend-telegram",
                "layui-extend-instagram",
                "layui-extend-gmail",
                "layui-extend-gitee1",
                "layui-extend-dribbble",
                "layui-extend-vimeo",
                "layui-extend-line",
                "layui-extend-wechat1",
                "layui-extend-twitter",
                "layui-extend-wordpress",
                "layui-extend-yuque",
                "layui-extend-trello",
                "layui-extend-tianya",
                "layui-extend-xiaoenai",
                "layui-extend-deviantart",
                "layui-extend-wechat-friend",
                "layui-extend-google-plus",
                "layui-extend-meetup",
                "layui-extend-lastfm",
                "layui-extend-vine",
                "layui-extend-qq1",
                "layui-extend-myspace",
                "layui-extend-zhihu",
                "layui-extend-pixiv",
                "layui-extend-pinterest",
                "layui-extend-juejin",
                "layui-extend-rss",
                "layui-extend-linkedin-simple",
                "layui-extend-slack",
                "layui-extend-tumblr",
                "layui-extend-mixi",
                "layui-extend-renren-simple",
                "layui-extend-jianshu",
                "layui-extend-yelp",
                "layui-extend-paypal",
                "layui-extend-pocket",
                "layui-extend-vk",
                "layui-extend-whatsapp",
                "layui-extend-youtube",
                "layui-extend-logo-500px",
                "layui-extend-reddit",
                "layui-extend-zol",
                "layui-extend-kakaotalk",
                "layui-extend-weibo1",
                "layui-extend-momo",
                "layui-extend-spotify",
                "layui-extend-shopify",
                "layui-extend-tieba",
                "layui-extend-renren",
                "layui-extend-product-hunt",
                "layui-extend-skype",
                "layui-extend-steam",
                "layui-extend-leetcode",
                "layui-extend-gitee",
                "layui-extend-bitbucket",
                "layui-extend-apple1",
                "layui-extend-behance",
                "layui-extend-baidu1",
                "layui-extend-douban",
                "layui-extend-buffer",
                "layui-extend-buysellads",
                "layui-extend-blogger",
                "layui-extend-cnblogs",
                "layui-extend-bilibili",
                "layui-extend-codepen",
                "layui-extend-qzone",
                "layui-extend-dropbox",
                "layui-extend-alipay1",
                "layui-extend-flickr",
                "layui-extend-linkedin",
                "layui-extend-envato",
                "layui-extend-facebook-simple",
                "layui-extend-email",
                "layui-extend-crunchbase",
                "layui-extend-dingtalk",
                "layui-extend-wallpaper_engine",
                "layui-extend-clash",
                "layui-extend-git",
                "layui-extend-adobe_acrobat",
                "layui-extend-adobe_illustrator",
                "layui-extend-adobe_media_encoder",
                "layui-extend-adobe_animate",
                "layui-extend-a-adobe_after_effects",
                "layui-extend-visual_studio",
                "layui-extend-adobe_premiere_pro",
                "layui-extend-apipost",
                "layui-extend-adobe_photoshop",
                "layui-extend-redis",
                "layui-extend-typora",
                "layui-extend-android_sutdio",
                "layui-extend-navicat",
                "layui-extend-perfect_world",
                "layui-extend-watt_toolkit",
                "layui-extend-shijian",
                "layui-extend-a-shanchu2",
                "layui-extend-a-guanbi2",
                "layui-extend-a-dingdan2",
                "layui-extend-zhibo",
                "layui-extend-tongxunlu",
                "layui-extend-a-shijian2",
                "layui-extend-a-wode4",
                "layui-extend-gongzuo",
                "layui-extend-a-wode6",
                "layui-extend-a-kaoshilianxigangbi",
                "layui-extend-a-shoucangguanzhu",
                "layui-extend-zanting",
                "layui-extend-a-shanchu3",
                "layui-extend-wode",
                "layui-extend-shengyin",
                "layui-extend-a-paihangbang2",
                "layui-extend-a-shouye4",
                "layui-extend-a-shouji2",
                "layui-extend-a-gengduo2",
                "layui-extend-a-wenda2",
                "layui-extend-a-dingdan3",
                "layui-extend-a-shuaxin2",
                "layui-extend-dingwei",
                "layui-extend-a-jiesuo2",
                "layui-extend-shujumoxing",
                "layui-extend-shujujicheng",
                "layui-extend-shujujiekou",
                "layui-extend-shujukaifa",
                "layui-extend-shujuzhiliang",
                "layui-extend-shujuyuanmoxing",
                "layui-extend-shitimoxing",
                "layui-extend-zichanmoxing",
                "layui-extend-gongzuotai",
                "layui-extend-yunweizhongxin",
                "layui-extend-mysql",
                "layui-extend-java",
                "layui-extend-python",
                "layui-extend-docker",
                "layui-extend-zhujian",
                "layui-extend-sousuo",
                "layui-extend-ceshilianjie",
                "layui-extend-wenhao",
                "layui-extend-ceshilianjie1",
                "layui-extend-tianjia",
                "layui-extend-bianji",
                "layui-extend-shanchu",
                "layui-extend-baocun",
                "layui-extend-chakan",
                "layui-extend-fabu",
                "layui-extend-yichu",
                "layui-extend-xiazai",
                "layui-extend-tongguo",
                "layui-extend-jujue",
                "layui-extend-zhongxintijiao",
                "layui-extend-jinyong",
                "layui-extend-putongzhihang",
                "layui-extend-zhihangrizhi",
                "layui-extend-canshuzhihang",
                "layui-extend-xiangyou",
                "layui-extend-xiangzuo",
                "layui-extend-zhanghao",
                "layui-extend-mima",
                "layui-extend-yanzhengma",
                "layui-extend-gerenxinxi",
                "layui-extend-shujuyuan",
                "layui-extend-zhiliangrenwu",
                "layui-extend-jiekou",
                "layui-extend-start",
                "layui-extend-zhankai",
                "layui-extend-shouqi",
                "layui-extend-tingzhi",
                "layui-extend-logo",
                "layui-extend-jichengrenwu",
                "layui-extend-kaifarenwu",
                "layui-extend-kaifazujian",
                "layui-extend-dangqianweizhi",
                "layui-extend-putongzhihang1",
                "layui-extend-liebiaoneitianjia",
                "layui-extend-liebiaoneishanchu",
                "layui-extend-icon-test",
                "layui-extend-icon-test1",
                "layui-extend-icon-test2",
                "layui-extend-cd",
                "layui-extend-cal",
                "layui-extend-cfg",
                "layui-extend-cer",
                "layui-extend-cgi",
                "layui-extend-fold",
                "layui-extend-form",
                "layui-extend-forward",
                "layui-extend-good",
                "layui-extend-goode",
                "layui-extend-goodv",
                "layui-extend-h5e",
                "layui-extend-hfavor",
                "layui-extend-hlike",
                "layui-extend-home",
                "layui-extend-medal",
                "layui-extend-home3",
                "layui-extend-html",
                "layui-extend-info",
                "layui-extend-infov",
                "layui-extend-js",
                "layui-extend-keyboard",
                "layui-extend-link",
                "layui-extend-link1",
                "layui-extend-list",
                "layui-extend-list1",
                "layui-extend-list2",
                "layui-extend-list3",
                "layui-extend-location",
                "layui-extend-lock",
                "layui-extend-lock1",
                "layui-extend-mail",
                "layui-extend-male",
                "layui-extend-mark",
                "layui-extend-marketing",
                "layui-extend-orders",
                "layui-extend-mobile",
                "layui-extend-mobilefill",
                "layui-extend-more",
                "layui-extend-moreandroid",
                "layui-extend-news",
                "layui-extend-newshot",
                "layui-extend-notice",
                "layui-extend-optadd",
                "layui-extend-optcheck",
                "layui-extend-optclose",
                "layui-extend-optmove",
                "layui-extend-optroundadd",
                "layui-extend-optroundaddlight",
                "layui-extend-optroundcheck",
                "layui-extend-optroundclose",
                "layui-extend-order",
                "layui-extend-orderc",
                "layui-extend-ordere",
                "layui-extend-orderk",
                "layui-extend-refresh",
                "layui-extend-pay",
                "layui-extend-phone",
                "layui-extend-phonecz",
                "layui-extend-phonero",
                "layui-extend-pic",
                "layui-extend-piclight",
                "layui-extend-piccamera",
                "layui-extend-piccameraadd",
                "layui-extend-piccameralight",
                "layui-extend-piccamerarotate",
                "layui-extend-post",
                "layui-extend-present",
                "layui-extend-pulldown",
                "layui-extend-pullup",
                "layui-extend-punch",
                "layui-extend-qiang",
                "layui-extend-qq",
                "layui-extend-qrcode",
                "layui-extend-recharge",
                "layui-extend-tao",
                "layui-extend-refresharrow",
                "layui-extend-remind",
                "layui-extend-repair",
                "layui-extend-repeal",
                "layui-extend-scan",
                "layui-extend-search",
                "layui-extend-searchlist",
                "layui-extend-send",
                "layui-extend-shake",
                "layui-extend-share",
                "layui-extend-shop",
                "layui-extend-sort",
                "layui-extend-sortnum",
                "layui-extend-sound",
                "layui-extend-sponsor",
                "layui-extend-square",
                "layui-extend-squarecheck",
                "layui-extend-system",
                "layui-extend-tag",
                "layui-extend-userinfo",
                "layui-extend-tel",
                "layui-extend-time",
                "layui-extend-top",
                "layui-extend-tpl",
                "layui-extend-tui1",
                "layui-extend-tui2",
                "layui-extend-tui3",
                "layui-extend-tui4",
                "layui-extend-tuikuan",
                "layui-extend-upblock",
                "layui-extend-upload",
                "layui-extend-upstage",
                "layui-extend-user",
                "layui-extend-useradd",
                "layui-extend-userbehavior",
                "layui-extend-usercheck",
                "layui-extend-userdl",
                "layui-extend-usergroup",
                "layui-extend-userhart",
                "layui-extend-zheng",
                "layui-extend-home2",
                "layui-extend-userinfo1",
                "layui-extend-usermore",
                "layui-extend-userset",
                "layui-extend-velocity",
                "layui-extend-vipcard",
                "layui-extend-voice",
                "layui-extend-voicelight",
                "layui-extend-warrant",
                "layui-extend-we",
                "layui-extend-wechat",
                "layui-extend-weibo",
                "layui-extend-windows",
                "layui-extend-write",
                "layui-extend-arrowsgright",
                "layui-extend-ask",
                "layui-extend-attention",
                "layui-extend-attentionfavor",
                "layui-extend-accessory",
                "layui-extend-ad",
                "layui-extend-alipay",
                "layui-extend-android",
                "layui-extend-apple",
                "layui-extend-appreciate",
                "layui-extend-arrowduleft",
                "layui-extend-arrowduright",
                "layui-extend-arrowfull",
                "layui-extend-arrowleft",
                "layui-extend-arrowright",
                "layui-extend-arrowroleft",
                "layui-extend-arrowroright",
                "layui-extend-arrowroundleft",
                "layui-extend-arrowroundright",
                "layui-extend-arrowsgleft",
                "layui-extend-congzi",
                "layui-extend-attentionforbid",
                "layui-extend-baidu",
                "layui-extend-brand",
                "layui-extend-car",
                "layui-extend-carhc",
                "layui-extend-cart",
                "layui-extend-cartext",
                "layui-extend-cartool",
                "layui-extend-carwei",
                "layui-extend-caryy",
                "layui-extend-city",
                "layui-extend-clothes",
                "layui-extend-cny",
                "layui-extend-codee",
                "layui-extend-codev",
                "layui-extend-codev1",
                "layui-extend-codev2",
                "layui-extend-coin",
                "layui-extend-community",
                "layui-extend-edit2",
                "layui-extend-congzi1",
                "layui-extend-copy",
                "layui-extend-count",
                "layui-extend-count2",
                "layui-extend-count3",
                "layui-extend-count4",
                "layui-extend-count5",
                "layui-extend-countdown",
                "layui-extend-creative",
                "layui-extend-crown",
                "layui-extend-css",
                "layui-extend-cut",
                "layui-extend-data",
                "layui-extend-date",
                "layui-extend-delete",
                "layui-extend-deliver",
                "layui-extend-down",
                "layui-extend-edit",
                "layui-extend-edit1",
                "layui-extend-home1",
                "layui-extend-edit3",
                "layui-extend-emoji",
                "layui-extend-exit",
                "layui-extend-faxian",
                "layui-extend-female",
                "layui-extend-fenxiang",
                "layui-extend-fenxiao",
                "layui-extend-file",
                "layui-extend-focus",
              ];
            }
          }

          return iconlist;
        },
        unicode: function () {
          var iconlist = [];
          if (defaultIconClass === "layui-icon") {
            iconlist = [
              "&amp;#xe6c9;",
              "&amp;#xe67b;",
              "&amp;#xe67a;",
              "&amp;#xe678;",
              "&amp;#xe679;",
              "&amp;#xe677;",
              "&amp;#xe676;",
              "&amp;#xe675;",
              "&amp;#xe673;",
              "&amp;#xe66f;",
              "&amp;#xe9aa;",
              "&amp;#xe672;",
              "&amp;#xe66b;",
              "&amp;#xe668;",
              "&amp;#xe6b1;",
              "&amp;#xe702;",
              "&amp;#xe66e;",
              "&amp;#xe68e;",
              "&amp;#xe674;",
              "&amp;#xe669;",
              "&amp;#xe666;",
              "&amp;#xe66c;",
              "&amp;#xe66a;",
              "&amp;#xe667;",
              "&amp;#xe7ae;",
              "&amp;#xe665;",
              "&amp;#xe664;",
              "&amp;#xe716;",
              "&amp;#xe656;",
              "&amp;#xe653;",
              "&amp;#xe663;",
              "&amp;#xe6c6;",
              "&amp;#xe6c5;",
              "&amp;#xe662;",
              "&amp;#xe661;",
              "&amp;#xe660;",
              "&amp;#xe65d;",
              "&amp;#xe65f;",
              "&amp;#xe671;",
              "&amp;#xe65e;",
              "&amp;#xe659;",
              "&amp;#xe735;",
              "&amp;#xe756;",
              "&amp;#xe65c;",
              "&amp;#xe715;",
              "&amp;#xe705;",
              "&amp;#xe6b2;",
              "&amp;#xe6af;",
              "&amp;#xe69c;",
              "&amp;#xe698;",
              "&amp;#xe657;",
              "&amp;#xe65b;",
              "&amp;#xe65a;",
              "&amp;#xe681;",
              "&amp;#xe67c;",
              "&amp;#xe601;",
              "&amp;#xe857;",
              "&amp;#xe655;",
              "&amp;#xe770;",
              "&amp;#xe670;",
              "&amp;#xe63d;",
              "&amp;#xe63e;",
              "&amp;#xe654;",
              "&amp;#xe652;",
              "&amp;#xe651;",
              "&amp;#xe6fc;",
              "&amp;#xe6ed;",
              "&amp;#xe688;",
              "&amp;#xe645;",
              "&amp;#xe64f;",
              "&amp;#xe64e;",
              "&amp;#xe64b;",
              "&amp;#xe62b;",
              "&amp;#xe64d;",
              "&amp;#xe64a;",
              "&amp;#xe64c;",
              "&amp;#xe650;",
              "&amp;#xe649;",
              "&amp;#xe648;",
              "&amp;#xe647;",
              "&amp;#xe646;",
              "&amp;#xe644;",
              "&amp;#xe62a;",
              "&amp;#xe643;",
              "&amp;#xe63f;",
              "&amp;#xe642;",
              "&amp;#xe641;",
              "&amp;#xe640;",
              "&amp;#xe63c;",
              "&amp;#xe63b;",
              "&amp;#xe63a;",
              "&amp;#xe639;",
              "&amp;#xe638;",
              "&amp;#xe637;",
              "&amp;#xe636;",
              "&amp;#xe635;",
              "&amp;#xe634;",
              "&amp;#xe633;",
              "&amp;#xe632;",
              "&amp;#xe631;",
              "&amp;#xe630;",
              "&amp;#xe62f;",
              "&amp;#xe62e;",
              "&amp;#xe62d;",
              "&amp;#xe62c;",
              "&amp;#xe629;",
              "&amp;#xe628;",
              "&amp;#xe625;",
              "&amp;#xe623;",
              "&amp;#xe621;",
              "&amp;#xe620;",
              "&amp;#xe61f;",
              "&amp;#xe61c;",
              "&amp;#xe60b;",
              "&amp;#xe619;",
              "&amp;#xe61a;",
              "&amp;#xe603;",
              "&amp;#xe602;",
              "&amp;#xe617;",
              "&amp;#xe615;",
              "&amp;#xe614;",
              "&amp;#xe613;",
              "&amp;#xe612;",
              "&amp;#xe611;",
              "&amp;#xe60f;",
              "&amp;#xe60e;",
              "&amp;#xe60d;",
              "&amp;#xe60c;",
              "&amp;#xe60a;",
              "&amp;#xe609;",
              "&amp;#xe605;",
              "&amp;#xe607;",
              "&amp;#xe606;",
              "&amp;#xe604;",
              "&amp;#xe600;",
              "&amp;#xe658;",
              "&amp;#x1007;",
              "&amp;#x1006;",
              "&amp;#x1005;",
              "&amp;#xe608;",
            ];
          }

          if (defaultIconClass === "iconfont") {
            $.ajax({
              url: "../component/extends/font/iconfont.json",
              type: "GET",
              dataType: "json",
              success: function (data) {
                $.each(data.glyphs, function (i, item) {
                  iconlist.push("&#x" + item.unicode + ";");
                });
              },
            });
          }

          return iconlist;
        },
      },
      //通过异步获取自定义图标数据源
      ajaxData: function (url, prefix) {
        var iconlist = [];
        $.ajax({
          url: url,
          type: "get",
          contentType: "application/x-www-form-urlencoded; charset=UTF-8",
          async: false,
          success: function (ret) {
            var exp = eval("/" + prefix + "-(.*):/ig");
            var result;
            while ((result = exp.exec(ret)) != null) {
              iconlist.push(prefix + "-" + result[1]);
            }
          },
          error: function (xhr, textstatus, thrown) {
            layer.msg("自定义图标接口有误");
          },
        });
        return iconlist;
      },
    };

    a.init();
    return new IconPicker();
  };

  /**
   * 选中图标
   * @param filter lay-filter
   * @param iconName 图标名称，自动识别fontClass/unicode
   */
  IconPicker.prototype.checkIcon = function (filter, iconName) {
    var el = $("*[lay-filter=" + filter + "]"),
      p = el.next().find(".layui-iconpicker-item ." + defaultIconClass),
      c = iconName;

    if (c.indexOf("#xe") > 0) {
      p.html(c);
    } else {
      p.html("").attr("class", defaultIconClass + " " + c);
    }
    el.attr("value", c).val(c);
  };

  var iconPicker = new IconPicker();
  exports(_MOD, iconPicker);
});
