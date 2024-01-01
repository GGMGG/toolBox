// 预加载脚本
// 初始化导入
const { contextBridge, ipcRenderer } = require("electron");

/**
 * 主进程通信渲染
 */
contextBridge.exposeInMainWorld("electronAPI", {
  // 主进程=>渲染器
  // 设置数据
  setCardData: (callback) => ipcRenderer.on("set-carddata", callback),
  // 重置数据
  resetCardData: (callback) => ipcRenderer.on("reset-carddata", callback),
  // 设置系统配置
  setSetting: (callback) => ipcRenderer.on("set-setting", callback),
  // 设置config数据
  setConfig: (callback) => ipcRenderer.on("set-config", callback),
  // 设置tag数据
  setTag: (callback) => ipcRenderer.on("set-tag", callback),
  // 设置iconfont数据
  setIconfont: (callback) => ipcRenderer.on("set-iconfont", callback),
  // 关闭加载信息
  closeLoading: (callback) => ipcRenderer.on("close-loading", callback),
  // 设置警告信息
  setWaring: (callback) => ipcRenderer.on("set-waring", callback),
  // 重新设置背景图片后的回调方法
  resetBgimg: (callback) => ipcRenderer.on("reset-bgimg", callback),

  // 渲染器=>主进程
  // 打开远端页面
  showWebWindow: (param) => ipcRenderer.send("show-webWindow", param),
  // 打开本地页面
  showLocalWindow: (param) => ipcRenderer.send("show-localWindow", param),
  // 打开本地页面（本地服务）
  showLocalServerWindow: (param) => ipcRenderer.send("show-locaServerlWindow", param),
  // 打开本地应用
  openLocalExeApp: (param) => ipcRenderer.send("open-localExeApp", param),
  // 操作cardjson文件（有提示）
  operateDataJson: (formData) => ipcRenderer.send("operate-datajson", formData),
  // 操作cardjson文件（无提示）
  operateCardJson: (cardData) => ipcRenderer.send("operate-cardjson", cardData),
  // 操作settingjson文件
  operateSettingJson: (configData) => ipcRenderer.send("operate-settingjson", configData),
  // 操作主窗口背景图
  operateBgImg: (bgImgParam) => ipcRenderer.send("operate-bgimg", bgImgParam),
  // 操作tagjson文件
  operateTagJson: (tagData) => ipcRenderer.send("operate-tagjson", tagData),
  // 重启应用
  restartApp: () => ipcRenderer.send("restart-app"),
});
