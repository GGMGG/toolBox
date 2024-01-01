// 工具类导入
const { commonUtil } = require("../utils/commonUtil");

/**
 * 配置数据类
 */
class projectConfig {
  /**
   * 配置数据
   */
  configObj = {
    type: "dev",
    jsonPath: "/assets/config/",
    dataPath: "/assets/data/",
    imagePath: "/assets/images/",
    localModulePath: "/assets/module/",
    iconfontPath: "/plugins/extends/font/iconfont.json",
    devConfig: "devConfig.json",
    prdConfig: "prdConfig.json",
    serverPath: "/modules/utils/serverUtil.js",
    dirName: "",
  };

  /**
   * 配置数据类
   */
  constructor() {}

  /**
   * 获取配置数据
   * @param {string} dirName
   * @returns
   */
  getProjectConfig(dirName = "") {
    return {
      ...this.configObj,
      dirName: commonUtil.replaceProjectPath(dirName),
    };
  }
}

const project = new projectConfig();
module.exports = { project };
