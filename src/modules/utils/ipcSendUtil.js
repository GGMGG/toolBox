// 工具类导入
const { configUtil } = require("./configUtil");
/**
 * ipcMain通信工具类
 */
class IpcSendUtil {
  /**
   * ipcMain通信工具类
   */
  constructor() {}

  /**
   * 进程间通信（主进程到渲染器）
   * @param {object} windowName
   * @param {object} param
   */
  setIpcSend(windowName = null, param = null) {
    if (param.data) {
      windowName.webContents.send("set-carddata", param.data);
    }

    if (param.redata) {
      windowName.webContents.send("reset-carddata", param.redata);
    }

    if (param.setting) {
      delete param.data;
      delete param.redata;
      windowName.webContents.send("set-setting", JSON.stringify(param));
    }

    if (param.config) {
      configUtil
        .getDataByFile(param.configFile)
        .then((res) => {
          windowName.webContents.send("set-config", res);
        })
        .catch((err) => {
          console.log("获取配置文件失败！", err);
        });
    }

    if (param.tagFile) {
      configUtil
        .getDataByFile(param.tagFile)
        .then((res) => {
          windowName.webContents.send("set-tag", res);
        })
        .catch((err) => {
          console.log("获取标签文件失败！", err);
        });
    }

    if (param.iconfont) {
      configUtil
        .getDataByFile(param.iconfontPath, 1)
        .then((res) => {
          windowName.webContents.send("set-iconfont", JSON.stringify(res));
        })
        .catch((err) => {
          console.log("获取图标文件失败！", err);
        });
    }

    if (param.closeTime) {
      windowName.webContents.send("close-loading", param.closeTime);
    }

    if (param.waringMsg) {
      windowName.webContents.send("set-waring", param.waringMsg);
    }

    if (param.reretBgImg) {
      windowName.webContents.send("reset-bgimg", param.reretBgImg);
    }
  }
}

const ipcSendUtil = new IpcSendUtil();
module.exports = { ipcSendUtil };
