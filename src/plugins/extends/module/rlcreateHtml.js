layui.define(["jquery", "layer"], function (exports) {
	var MOD_NAME = 'rlcreatehtml',
	$ = layui.jquery;

    // 创建html dom
    var createHtml = {}

    // 设置面板html
    // 设置主窗口标题html
    createHtml.buildWinTitleHtml = function () {
        let sysTitle = JSON.parse(localStorage.getItem("setting")).sysTitle;
        let html = "<input type='text' id='updateSystitle' placeholder='请输入应用标题' class='layui-input' lay-affix='clear' value='" + sysTitle + "'>";
        return "<div class='update-systitle'><div class='update-systitle-title'>应用标题</div><div class='update-systitle-content'>" + html + "</div></div>";
    }

    // 设置搜索引擎输入框html
    createHtml.buildWinEngineHtml = function () {
        let engineUrl = JSON.parse(localStorage.getItem("setting")).engineUrl;
        let html = "<input type='text' id='updatEengineUrl' placeholder='请输入搜索引擎地址' class='layui-input' lay-affix='clear' value='" + engineUrl + "'>";
        return "<div class='update-engineUrl'><div class='update-engineUrl-title'>搜索引擎</div><div class='update-engineUrl-content'>" + html + "</div></div>";
    }

    // 设置卡片大小html
    createHtml.buildCardSizeHtml = function () {
        let cardSize = "";
        let configCardSizes = JSON.parse(localStorage.getItem("config-data")).cardSizes;
        $.each(configCardSizes, function (i, value) {
            cardSize += "<sub class='select-cardsize-sub'>" + value.size + "</sub>";
            cardSize += "<input class='select-cardsize-item' type='radio' cardsize-id='" + value.id + "' value='" + value.id + "' title='" + value.size + "'>";
        });

        return "<div class='select-cardsize'><div class='select-cardsize-title'>卡片大小</div><div class='select-cardsize-content'>" + cardSize + "</div></div>";
    }

    // 设置卡片背景设置html
    createHtml.buildCardBgHtml = function () {
        let cardBg = "";
        let cardLinearGradient = localStorage.getItem("card-linear-gradient").split(",");
        $.each(cardLinearGradient, function (i, value) {
            let marginLeft = i === 0 ? "20" : "10";
            value = value || '#e4eff8';
            cardBg += "<div class='card-linear-gradient' card-linear-gradient='" + i + "' lay-options=\"{color: '" + value + "'}\" style='margin-left: " + marginLeft + "px;'></div>";
        });

        return "<div class='select-cardBg'><div class='select-cardBg-title'>卡片背景</div><div class='select-cardBg-content'>" + cardBg + "</div></div>";
    }

    // 设置主题颜色html
    createHtml.buildColorHtml = function () {
        let colors = "";
        let configColors = JSON.parse(localStorage.getItem("config-data")).colors;
        $.each(configColors, function (i, value) {
            colors += "<span class='select-color-item' color-id='" + value.id + "' style='background-color:" + value.color + ";'></span>";
        });

        return "<div class='select-color'><div class='select-color-title'>主题配色</div><div class='select-color-content'>" + colors + "</div></div>";
    }

    // 设置背景图片以及透明度
    createHtml.buildBgHtml = function () {
        let defaultBgOpacity = JSON.parse(localStorage.getItem("theme-bg")).defaultBgOpacity;
        let html = '';
        html += '<div class="range-wrapper">';
        html += ' <div class="range-slider-container">';
        html += '   <div class="tick-slider">';
        html += '     <div class="tick-slider-header">';
        html += '       <h5><label for="rangeSlider">透明度</label></h5>';
        html += '     </div>';
        html += '     <div class="tick-slider-value-container">';
        html += '       <div id="rangeLabelMin" class="tick-slider-label">0</div>';
        html += '       <div id="rangeLabelMax" class="tick-slider-label">1</div>';
        html += '       <div id="rangeValue" class="tick-slider-value"></div>';
        html += '     </div>';
        html += '     <div class="tick-slider-background"></div>';
        html += '     <div id="rangeProgress" class="tick-slider-progress"></div>';
        html += '     <div id="rangeTicks" class="tick-slider-tick-container"></div>';
        html += '     <input id="rangeSlider" class="tick-slider-input" type="range" min="0" max="1.0" step="0.1" value="' + defaultBgOpacity + '"';
        html += '     data-tick-step="0.5" data-tick-id="rangeTicks" data-value-id="rangeValue" data-progress-id="rangeProgress"';
        html += '     data-handle-size="18" data-min-label-id="rangeLabelMin" data-max-label-id="rangeLabelMax"/>';
        html += '   </div>';
        html += ' </div>';
        html += '</div>';

        html += '<div class="bgImgUploadDiv">';
        html += ' <div class="tick-slider-header">';
        html += '   <h5><label>背景图片</label></h5>';
        html += ' </div>';
        html += ' <div class="layui-upload-drag" style="display: block;" id="bgimg-upload-drag">';
        html += '   <i class="layui-icon layui-icon-upload layui-icon-color"></i> ';
        html += '   <div>点击上传，或将文件拖拽到此处</div>';
        html += '   <div class="layui-hide" id="bgimg-upload-preview">';
        html += '     <hr><img src="" alt="上传成功后渲染" style="max-width: 100%">';
        html += '   </div>';
        html += '   <input type="hidden" id="newBgImgUrl" value=""/>';
        html += '   <input type="hidden" id="newBgImgName" value=""/>';
        html += '   <button type="hidden" id="bgimg-upload-action" style="height:0px;width:0px;"></button>';
        html += ' </div>';
        html += ' <button class="layui-btn layui-btn-primary layui-border-color layui-btn-xs" id="clearBgImg" style="margin-top:10px;">清除背景</button>';
        html += '</div>';

        return "<div class='select-bg'><div class='select-bg-title'>背景设置</div><div class='select-bg-content'>" + html + "</div></div>";
    }

    // 设置其他功能html
    createHtml.buildOtherHtml = function () {
        let html = '<button class="layui-btn layui-btn-primary layui-border-color layui-btn-xs" id="clearStorageAndRestart" style="margin-left: 20px">清除缓存数据并重启</button>';
        return "<div class='select-other'><div class='select-other-title'>其他功能</div><div class='select-other-content'>" + html + "</div></div>";
    }

    // 标签html
    createHtml.buildCardTagHtml = function () {
        let tags = '<button lay-id="all" lay-del="false" type="button" class="tag-item">全部</button>';
        let tagArr = JSON.parse(localStorage.getItem("tag-data"));
        $.each(tagArr, function (i, value) {
            tags += '<button lay-id="' + i + '" type="button" class="tag-item">' + value + '</button>';
        });

        return  tags;
    }

    exports(MOD_NAME, createHtml);
});