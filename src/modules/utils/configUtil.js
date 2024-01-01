// 工具类导入
const { fileUtil } = require("./fileUtil");
const { commonUtil } = require("./commonUtil");
// 数据类导入
const { project } = require("../config/projectConfig");

/**
 * 配置工具类
 */
class ConfigUtil {
  /**
   * 项目开发配置
   */
  configObj = {};

  /**
   * 配置工具类
   */
  constructor() {}

  /**
   * 设置项目配置
   * @param {string} dirName
   */
  setProjectConfig(dirName = "") {
    this.configObj = project.getProjectConfig(dirName);
  }

  /**
   * 获取项目配置
   * @returns
   */
  getProjectConfig() {
    return this.configObj;
  }

  /**
   * 检查配置文件，并获取配置文件数据的整合对象
   * @returns
   */
  checkConfig() {
    return new Promise((resolve, reject) => {
      this.getAndCheckConfig()
        .then((res) => {
          const resObj = JSON.parse(res);
          this.getDataByFile(resObj.setFile)
            .then((setRes) => {
              const setObj = JSON.parse(setRes);
              resolve({ ...resObj, ...setObj });
            })
            .catch((err) => {
              reject("读取配置文件数据失败！" + err);
            });
        })
        .catch((err) => {
          reject("读取配置文件失败！" + err);
        });
    });
  }

  /**
   * 获取配置文件参数
   * @returns
   */
  getAndCheckConfig() {
    return new Promise((resolve, reject) => {
      // 读取配置文件数据
      const configFileName = this.configObj.type === "dev" ? this.configObj.devConfig : this.configObj.prdConfig;
      const filePath = commonUtil.replaceFilePath(this.configObj.dirName + this.configObj.jsonPath + configFileName);
      fileUtil
        .readFile(filePath)
        .then((res) => {
          if (res) {
            resolve(res);
          } else {
            reject("配置文件有误，请检查配置文件！");
          }
        })
        .catch((err) => {
          reject("读取配置文件失败！" + err);
        });
    });
  }

  /**
   * 根据文件名称获取数据文件
   * @param {string} fileName
   * @param {number} type
   * @returns
   */
  getDataByFile(fileName = "", type = 0) {
    return new Promise((resolve, reject) => {
      const fileFullPath = type === 0 ? this.configObj.dirName + this.configObj.dataPath + fileName : this.configObj.dirName + fileName;
      const filePath = commonUtil.replaceFilePath(fileFullPath);
      fileUtil
        .readFile(filePath)
        .then((res) => {
          if (res) {
            resolve(res);
          } else {
            reject("数据文件有误，请检查数据文件！");
          }
        })
        .catch((err) => {
          reject("读取数据文件失败！" + err);
        });
    });
  }
}

const configUtil = new ConfigUtil();
module.exports = { configUtil };
