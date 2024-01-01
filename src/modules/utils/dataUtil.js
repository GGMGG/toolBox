// 工具类导入
const { fileUtil } = require("./fileUtil");
const { configUtil } = require("./configUtil");

/**
 * 数据操作工具类
 */
class DataUtil {
  /**
   * 允许的数据操作类型
   */
  allowType = ["add", "update", "del"];

  /**
   * 数据操作工具类
   */
  constructor() {}

  /**
   * 操作jsonArray数据文件
   * @param {object} configObj
   * @param {string} dataFile
   * @param {object} objData
   * @returns
   */
  doOperateDataJson(configObj = null, dataFile = "", objData = null) {
    return new Promise((resolve, reject) => {
      const actType = objData.acttype;
      delete objData.acttype;
      if (!this.allowType.includes(actType)) {
        reject("非法操作！");
        return;
      }

      // 文件路径
      const path = configObj.dirName + configObj.dataPath + dataFile;
      if (actType === "add") {
        fileUtil
          .addObj(path, objData, configObj.dirName + configObj.localModulePath)
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject("操作失败！" + err);
          });

        return;
      }

      if (actType === "update") {
        // 需要更新的旧数据
        configUtil
          .getDataByFile(dataFile)
          .then((res) => {
            const oldData = JSON.parse(res);
            // 需要更新的旧对象
            const updateObject = oldData.filter((item) => {
              return parseInt(objData.id) === parseInt(item.id);
            })[0];

            // 数据更新
            fileUtil
              .updateObj(path, objData)
              .then((res) => {
                // 数据更新成功后，如果是local类型，且新旧数据的本地文件路径不一样的情况下，需要复制本地文件
                if ((objData.cardtype === "local" || objData.cardtype === "localServe") && updateObject.localurl !== objData.localurl) {
                  this.doLocalFileCp(configObj, objData.localurl, objData.id);
                }

                resolve(res);
              })
              .catch((err) => {
                reject("操作失败！" + err);
              });
          })
          .catch((err) => {
            reject("操作失败！" + err);
          });

        return;
      }

      if (actType === "del") {
        fileUtil
          .delObj(path, objData.id)
          .then((res) => {
            if (objData.cardtype === "local" || objData.cardtype === "localServe") {
              this.doLocalFileDel(configObj, objData.id);
            }

            resolve(res);
          })
          .catch((err) => {
            reject("操作失败！" + err);
          });

        return;
      }
    });
  }

  /**
   * 更新json文件
   * @param {object} configObj
   * @param {string} fileName
   * @param {object} data
   * @returns
   */
  operateJsonDataByFileName(configObj = null, fileName = "", data = null) {
    return new Promise((resolve, reject) => {
      if (!configObj || !data) {
        reject("操作失败！");
      } else {
        fileUtil
          .updateJsonData(configObj.dirName + configObj.dataPath + fileName, data)
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject("操作失败！" + err);
          });
      }
    });
  }

  /**
   * 操作主窗口背景图
   * @param {object} configObj
   * @param {string} bgImgParam
   * @returns
   */
  doOperateBgImg(configObj = null, bgImgParam = "") {
    return new Promise((resolve, reject) => {
      if (!configObj || !bgImgParam) {
        reject("操作失败！");
      } else {
        const bgImgUrl = JSON.parse(bgImgParam).bgImgUrl;
        const bgImgName = JSON.parse(bgImgParam).bgImgName;
        const bgImagePath = configObj.dirName + configObj.imagePath + "bgImage/";
        fileUtil
          .emptyFile(bgImagePath)
          .then((res) => {
            fileUtil
              .cpFile(bgImgUrl, bgImagePath + bgImgName)
              .then((res) => {
                resolve(res);
              })
              .catch((err) => {
                reject(err);
              });
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }

  /**
   * 复制本地文件夹
   * @param {object} configObj
   * @param {string} sourcePath
   * @param {string} id
   * @returns
   */
  doLocalFileCp(configObj = null, sourcePath = "", id = "") {
    return new Promise((resolve, reject) => {
      if (!configObj) {
        reject("操作失败！");
      } else {
        fileUtil
          .cpFile(sourcePath, configObj.dirName + configObj.localModulePath + id)
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }

  /**
   * 删除本地文件夹，包括下面的文件
   * @param {object} configObj
   * @param {string} id
   * @returns
   */
  doLocalFileDel(configObj = null, id = "") {
    return new Promise((resolve, reject) => {
      if (!configObj) {
        reject("操作失败！");
      } else {
        fileUtil
          .delFile(configObj.dirName + configObj.localModulePath + id)
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }
}

const dataUtil = new DataUtil();
module.exports = { dataUtil };
