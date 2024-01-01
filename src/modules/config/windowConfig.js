// node path
const path = require("path");
// 工具类导入
const { commonUtil } = require("../utils/commonUtil");

/**
 * 窗体配置类
 */
class windowConfig {
  /**
   * 窗体配置
   */
  configObj = {
    // 默认窗体宽度
    defaultWidth: 1366,
    // 默认窗体高度
    defaultHeight: 760,
    // 白色
    whiteColor: "#FFFFFF",
    // setTimeOut默认时间
    timeOut: 500,
    // 加载页面路径
    loadingHtmlUrl: "src/views/loading.html",
    // 主窗体页面路径
    mainHtmlUrl: "src/views/index.html",
    // 应用图标路径
    icon: "assets/icon/favicon.ico",
    // 工程路径
    dirName: "",
    // 预加载脚本路径
    preloadJsUrl: "",
  };

  /**
   * 窗体配置类
   */
  constructor() {}

  /**
   * 获取窗体配置数据
   * @param {string} dirName
   * @returns
   */
  getWindowConfig(dirName = "") {
    return {
      ...this.configObj,
      dirName: commonUtil.replaceProjectPath(dirName),
      preloadJsUrl: path.join(dirName, "/modules/preload/preload.js"),
    };
  }
}

const window = new windowConfig();
module.exports = { window };
