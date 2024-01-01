layui.define(['jquery', 'layer'], function (exports) {
  "use strict";

  var $ = layui.$,
    layer = layui.layer,
    MOD_NAME = "rltag";

  // 默认参数
  var defaultOption = {
    TAG_CLASS: ".rltag",
    BUTTON_NEW_TAG: "button-new-tag",
    INPUT_NEW_TAG: "input-new-tag",
    TAG_ITEM: "tag-item",
    CLOSE: "tag-close",
    DEFAULT_SKIN: "layui-btn layui-btn-primary layui-btn-sm ",
  };

  var tagData = [];

  var tag = function () {
    this.config = {
      skin: defaultOption.DEFAULT_SKIN,
      tagText: "+ New Tag",
      tagData: [],
    };

    this.configs = {};
  };

  // 全局设置
  tag.prototype.set = function (options) {
    var that = this;
    $.extend(true, that.config, options);
    tag.render();
    return that;
  };

  // 表单事件监听
  tag.prototype.on = function (events, callback) {
    return layui.onevent.call(this, MOD_NAME, events, callback);
  };

  // 外部Tag新增
  tag.prototype.add = function (filter, options) {
    var tagElem = $(defaultOption.TAG_CLASS + " [lay-filter=" + filter + "]");
    call.add(null, tagElem, options);
    call.tagAuto(filter);
    return this;
  };

  // 外部Tag删除
  tag.prototype.delete = function (filter, layid) {
    var tagElem = $(defaultOption.TAG_CLASS + " [lay-filter=" + filter + "]");
    var tagItemElem = tagElem.find(">." + defaultOption.TAG_ITEM + ' [lay-id="' + layid + '"]');
    call.delete(null, tagItemElem);
    return this;
  };

  // 获取全部tag数组数据
  tag.prototype.getData = function () {
    return tagData;
  }

  // 基础事件体
  var call = {
    // Tag点击
    tagClick: function (e, index, tagItemElem, options) {
      options = options || {};
      var othis = tagItemElem || $(this);
      var index = index || othis.index();
      var parents = othis.parents(defaultOption.TAG_CLASS).eq(0);
      var filter = parents.attr("lay-filter");
      layui.event.call(this, MOD_NAME, "click(" + filter + ")", { elem: parents, index: index });
    },
    // Tag新增事件
    add: function (e, tagElem, options) {
      if (options.text) {
        if (tagData.includes(options.text)) {
            layer.msg("标签[ " + options.text + " ]已存在！");
        } else {
          var filter = tagElem.attr("lay-filter");
          var buttonNewTag = tagElem.children("." + defaultOption.BUTTON_NEW_TAG);
          var index = buttonNewTag.index();
          var lastElem = $(defaultOption.TAG_CLASS + " button").last();
          var lastLayId = parseInt(lastElem.attr("lay-id")) + 1;
          var newTag = '<button lay-id="' + lastLayId + '"' +
                      (options.attr ? ' lay-attr="' + options.attr + '"' : "") + ' type="button" class="' + defaultOption.TAG_ITEM + '">' +
                      (options.text || "unnaming") + "</button>";
          // 标签数据设置
          tagData.push(options.text);
          var result = layui.event.call(this, MOD_NAME, "add(" + filter + ")", { elem: tagElem, index: index, othis: newTag, newData: tagData });
          if (result === false) return;
          buttonNewTag[0] ? buttonNewTag.before(newTag) : tagElem.append(newTag);
        }
      }
    },
    // Tag删除
    delete: function (e, othis) {
      var tagItem = othis || $(this).parent();
      var index = tagItem.index();
      var parents = tagItem.parents(defaultOption.TAG_CLASS).eq(0);
      var filter = parents.attr("lay-filter");
      var removeTagName = tagItem[0].innerText.replace("ဆ", "");
      let newTagData = tagData.filter((item) => {
        return removeTagName !== item;
      });

      tagData = newTagData;
      var result = layui.event.call(this, MOD_NAME, "delete(" + filter + ")", { elem: parents, index: index, newData: tagData });
      if (result === false) return;
      tagItem.remove();
    },
    // Tag输入事件
    input: function (e, othis) {
      var buttonNewTag = othis || $(this);
      var parents = buttonNewTag.parents(defaultOption.TAG_CLASS).eq(0);
      var filter = parents.attr("lay-filter");
      var options = (tag.configs[filter] = $.extend({}, tag.config, tag.configs[filter] || {}, options));
      //标签输入框
      var inpatNewTag = $('<div class="' + defaultOption.INPUT_NEW_TAG + '"><input type="text" autocomplete="off" class="layui-input"></div>');
      inpatNewTag.addClass(options.skin);
      buttonNewTag.after(inpatNewTag).remove();
      inpatNewTag.children(".layui-input").on("blur", function () {
          if (this.value) {
            var options = {
              text: this.value,
            };
            call.add(null, parents, options);
          }
          inpatNewTag.remove();
          call.tagAuto(filter);
        }).focus();
    },
    // Tag 自适应
    tagAuto: function (filter) {
      filter = filter || "";
      var options = filter ? tag.configs[filter] || tag.config : tag.config;
      var elemFilter = (function () {
        return filter ? '[lay-filter="' + filter + '"]' : "";
      })();

      $(defaultOption.TAG_CLASS + elemFilter).each(function () {
        var othis = $(this);
        var tagItem = othis.children("." + defaultOption.TAG_ITEM);
        var buttonNewTag = othis.children("." + defaultOption.BUTTON_NEW_TAG);
        tagItem.removeClass(defaultOption.DEFAULT_SKIN).addClass(options.skin);
        // 允许关闭
        if (othis.attr("lay-allowClose") && tagItem.length) {
          tagItem.each(function () {
            var li = $(this);
            if (!li.find("." + defaultOption.CLOSE)[0]) {
              var canDel = li.attr("lay-del");
              if (canDel !== "false") {
                var close = $('<i class="layui-icon layui-unselect ' + defaultOption.CLOSE + '">&#x1006;</i>');
                close.on("click", call.delete);
                li.append(close);
              }
            }
          });
        }
        // 允许新增标签
        if (othis.attr("lay-newTag") && buttonNewTag.length === 0) {
          buttonNewTag = $('<button type="button" class="' + defaultOption.BUTTON_NEW_TAG + '"></button>');
          buttonNewTag.on("click", call.input);
          othis.append(buttonNewTag);
        }

        buttonNewTag.html(options.tagText);
        buttonNewTag.removeClass(defaultOption.DEFAULT_SKIN).addClass(options.skin);
      });
    },
  };

  tag.prototype.init = function (filter, options) {
    if (filter) {
      tag.configs[filter] = $.extend({}, tag.config, tag.configs[filter] || {}, options);
    }

    if (options) {
       tagData = options.tagData;
    }

    return call.tagAuto.call(this, filter);
  };

  tag.prototype.render = tag.prototype.init;

  var tag = new tag();
  var dom = $(document);
  tag.render();
  dom.on("click", defaultOption.TAG_CLASS + " ." + defaultOption.TAG_ITEM, call.tagClick);
  exports(MOD_NAME, tag);
});
