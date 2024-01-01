// 工具类导入
const { ipcSendUtil } = require("./ipcSendUtil");
const { dataUtil } = require("./dataUtil");

/**
 * 操作工具类
 */
class OperateUtil {
  /**
   * 操作工具类
   */
  constructor() {}

  /**
   * 展示窗口，关闭窗口，隐藏窗口
   * @param {object} showWindowsName
   * @param {object} closeWindowsName
   * @param {object} hideWindowsName
   * @param {number} time
   */
  operateWin(showWindowsName = null, closeWindowsName = null, hideWindowsName = null, time = 3000) {
    setTimeout(function () {
      hideWindowsName && hideWindowsName.hide();
      closeWindowsName && closeWindowsName.close();
      showWindowsName && showWindowsName.show();
    }, time);
  }

  /**
   * 更新主窗口读取的datajson文件
   * @param {object} configObj
   * @param {object} param
   * @param {object} formData
   * @param {object} mainWindows
   */
  operateDataJson(configObj = null, param = null, formData = null, mainWindows = null) {
    dataUtil
      .doOperateDataJson(configObj, param.dataFile, formData)
      .then((res) => {
        ipcSendUtil.setIpcSend(mainWindows, { redata: res });
      })
      .catch((err) => {
        ipcSendUtil.setIpcSend(mainWindows, { waringMsg: err });
      });
  }

  /**
   * 更新主窗口读取的settingjson文件
   * @param {object} configObj
   * @param {object} param
   * @param {object} settingData
   * @param {object} mainWindows
   */
  operateSettingJson(configObj = null, param = null, settingData = null, mainWindows = null) {
    dataUtil
      .operateJsonDataByFileName(configObj, param.setFile, settingData)
      .then((res) => {
        //console.log("operateSettingJson-", "更新成功！");
      })
      .catch((err) => {
        ipcSendUtil.setIpcSend(mainWindows, { waringMsg: err });
      });
  }

  /**
   * 操作主窗口读取的tagjson文件
   * @param {object} configObj
   * @param {object} param
   * @param {object} tagData
   * @param {object} mainWindows
   */
  operateTagJson(configObj = null, param = null, tagData = null, mainWindows = null) {
    dataUtil
      .operateJsonDataByFileName(configObj, param.tagFile, tagData)
      .then((res) => {
        //console.log("operateTagJson-", "更新成功！");
      })
      .catch((err) => {
        ipcSendUtil.setIpcSend(mainWindows, { waringMsg: err });
      });
  }

  /**
   * 操作主窗口读取的cardjson文件
   * @param {object} configObj
   * @param {object} param
   * @param {object} cardData
   * @param {object} mainWindows
   */
  operateCardJson(configObj = null, param = null, cardData = null, mainWindows = null) {
    dataUtil
      .operateJsonDataByFileName(configObj, param.dataFile, cardData)
      .then((res) => {
        //console.log("operateCardJson-", "更新成功！");
      })
      .catch((err) => {
        ipcSendUtil.setIpcSend(mainWindows, { waringMsg: err });
      });
  }

  /**
   * 操作主窗口背景图
   * @param {object} configObj
   * @param {string} bgImgParam
   * @param {object} mainWindows
   */
  operateBgImg(configObj = null, bgImgParam = "", mainWindows = null) {
    dataUtil
      .doOperateBgImg(configObj, bgImgParam)
      .then((res) => {
        ipcSendUtil.setIpcSend(mainWindows, { reretBgImg: true });
      })
      .catch((err) => {
        ipcSendUtil.setIpcSend(mainWindows, { waringMsg: err });
      });
  }
}

const operateUtil = new OperateUtil();
module.exports = { operateUtil };
