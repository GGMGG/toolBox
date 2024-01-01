// 初始化导入
const { BrowserWindow, BrowserView, ipcMain, app, globalShortcut, utilityProcess, MessageChannelMain } = require("electron");
// 工具类导入
const { commonUtil } = require("./commonUtil");
const { configUtil } = require("./configUtil");
const { shortCutUtil } = require("./shortCutUtil");
const { ipcSendUtil } = require("./ipcSendUtil");
const { exceptionUtil } = require("./exceptionUtil");
const { httpUtil } = require("./httpUtil");
const { operateUtil } = require("./operateUtil");
// 数据类导入
const { window } = require("../config/windowConfig");

/**
 * 窗体工具类
 */
class WindowUtil {
  /**
   * 窗体配置数据
   */
  windowConfig = {};
  /**
   * 项目开发配置
   */
  configObj = {};
  /**
   * 加载窗体对象
   */
  loadingWindows = null;
  /**
   * 主窗体对象
   */
  mainWindows = null;
  /**
   * 浏览器窗体对象
   */
  browserWindows = null;
  /**
   * 浏览器窗体内嵌webview对象
   */
  browserView = null;
  /**
   * 本地窗体对象
   */
  localWindows = null;
  /**
   * 全局参数
   */
  gloableParams = {};
  /**
   * 本地服务地址
   */
  localServer = "http://127.0.0.1";
  /**
   * 本地服务端口
   */
  localServerPort = 16666;

  /**
   * 窗体工具类
   */
  constructor() {}

  /**
   * 设置窗体基础配置
   * @param {string} dirName
   */
  setWindowConfig(dirName = "") {
    this.windowConfig = window.getWindowConfig(dirName);
  }

  /**
   * 获取窗体基础配置
   */
  getWindowConfig() {
    return this.windowConfig;
  }

  /**
   * 创建加载窗体
   */
  createLoadingView() {
    // 设置项目开发配置
    this.configObj = configUtil.getProjectConfig();
    // 创建加载窗体
    this.loadingWindows = new BrowserWindow({
      show: true,
      frame: false,
      resizable: false,
      transparent: true,
      autoHideMenuBar: true,
      width: 200,
      height: 200,
    });
    // 载入页面
    this.loadingWindows.loadFile(this.windowConfig.loadingHtmlUrl);
  }

  /**
   * 创建主窗体
   * @param {object} param
   */
  createMainView(param = null) {
    this.gloableParams = param;
    configUtil
      .getDataByFile(param.dataFile)
      .then((res) => {
        this.createMainWindows(param, res);
      })
      .catch((err) => {
        exceptionUtil.catchErr("获取数据出错", err);
        this.loadingWindows.close();
      });
  }

  /**
   * 创建主窗体
   * @param {object} param
   * @param {object} data
   */
  createMainWindows(param = null, data = null) {
    // 创建主窗体
    // 设置参数
    this.mainWindows = new BrowserWindow({
      title: param.sysTitle,
      show: false,
      resizable: true,
      autoHideMenuBar: true,
      titleBarOverlay: {
        color: this.windowConfig.whiteColor,
        symbolColor: this.windowConfig.whiteColor,
      },
      width: this.windowConfig.defaultWidth,
      height: this.windowConfig.defaultHeight,
      minWidth: this.windowConfig.defaultWidth,
      minHeight: this.windowConfig.defaultHeight,
      backgroundColor: this.windowConfig.whiteColor,
      icon: this.windowConfig.icon,
      webPreferences: {
        preload: this.windowConfig.preloadJsUrl,
        webSecurity: false, //禁用同源策略
        nodeIntegration: false, // 是否启用Node integration.
        webviewTag: false, // 是否启用webview
      },
    });
    // 载入页面
    this.mainWindows.loadFile(this.windowConfig.mainHtmlUrl);
    // 监听窗体准备状态
    this.mainWindows.once("ready-to-show", () => {
      // 发送进程间通信
      ipcSendUtil.setIpcSend(this.mainWindows, {
        ...param,
        data: data,
        setting: true,
        configPath: this.windowConfig.dirName,
        config: true,
        configFile: param.configFile,
        tag: true,
        tagFile: param.tagFile,
        imgPath: this.configObj.imagePath,
        dataConfigPath: this.configObj.dataPath,
        iconfont: true,
        iconfontPath: this.configObj.iconfontPath,
      });
      // 注册进程间通信
      this.setIpcOn();
      // 重新设置标题
      this.mainWindows.setTitle(param.sysTitle);
      // 展示窗口
      operateUtil.operateWin(this.mainWindows, this.loadingWindows, null, this.windowConfig.timeOut);
    });
    // 监听窗体奔溃
    this.mainWindows.on("unresponsive", () => {
      commonUtil.doCatchErr("错误", "页面奔溃了，即将重新创建窗体！", this.loadingWindows, this.mainWindows, this.browserWindows);
    });
    // 监听窗体获得焦点
    this.mainWindows.on("focus", () => {
      // 注册普通快捷键
      shortCutUtil.registryNormal(this.mainWindows);
    });
    // 监听窗体失去焦点
    this.mainWindows.on("blur", () => {
      globalShortcut.unregisterAll();
    });
  }

  /**
   * 创建web页面嵌入窗体
   * @param {string} title
   * @param {string} url
   */
  createBrowserView(title = "", url = "") {
    // 创建web窗体
    // 设置参数
    this.browserWindows = new BrowserWindow({
      title: title,
      show: false,
      resizable: true,
      autoHideMenuBar: true,
      titleBarOverlay: {
        color: this.windowConfig.whiteColor,
        symbolColor: this.windowConfig.whiteColor,
      },
      width: this.windowConfig.defaultWidth,
      height: this.windowConfig.defaultHeight + 8,
      minWidth: this.windowConfig.defaultWidth,
      minHeight: this.windowConfig.defaultHeight + 8,
      backgroundColor: this.windowConfig.whiteColor,
      icon: this.windowConfig.icon,
      webPreferences: {
        preload: this.windowConfig.preloadJsUrl,
        webSecurity: false, //禁用同源策略
        nodeIntegration: false, // 是否启用Node integration.
        webviewTag: false, // 是否启用webview
      },
    });
    // 创建web页面嵌入窗体
    this.browserView = new BrowserView();
    this.browserWindows.setBrowserView(this.browserView);
    // 设置初始大小
    this.browserView.setBounds({
      x: 0,
      y: 0,
      width: this.windowConfig.defaultWidth - 10,
      height: this.windowConfig.defaultHeight - 2,
    });
    // 设置自适应
    this.browserView.setAutoResize({
      width: true,
      height: true,
      horizontal: true,
      vertical: true,
    });
    // 载入web地址
    this.browserView.webContents.loadURL(url);
    // 监听web dom渲染完成，重新设置窗体标题
    this.browserView.webContents.once("dom-ready", () => {
      this.browserWindows.setTitle(title);
    });
    // 监听web dom导航完成时，避免之前的live serve还有缓存，这边强制刷新一下
    this.browserView.webContents.once("did-finish-load", () => {
      setTimeout(() => {
        this.browserView.webContents.reloadIgnoringCache();
      }, 100);
    });
    // 监听窗体奔溃
    this.browserWindows.on("unresponsive", () => {
      commonUtil.doCatchErr("错误", "远端页面奔溃了，即将重新创建窗体！", this.loadingWindows, this.mainWindows, this.browserWindows);
    });
    // 监听当前窗体关闭，展示主窗体
    this.browserWindows.on("close", () => {
      this.reShowMainWindows();
    });
    // 监听窗体获得焦点
    this.browserWindows.on("focus", () => {
      // 注册快捷键
      shortCutUtil.registrySpecial(this.mainWindows, this.browserView);
    });
    // 监听窗体失去焦点
    this.browserWindows.on("blur", () => {
      shortCutUtil.unRegistrySpecial();
    });
  }

  /**
   * 创建本地应用窗体
   * @param {string} title
   * @param {string} url
   */
  createLocalView(title = "", url = "") {
    // 创建本地应用窗体
    // 设置参数
    this.localWindows = new BrowserWindow({
      title: title,
      show: false,
      resizable: true,
      autoHideMenuBar: true,
      titleBarOverlay: {
        color: this.windowConfig.whiteColor,
        symbolColor: this.windowConfig.whiteColor,
      },
      width: this.windowConfig.defaultWidth,
      height: this.windowConfig.defaultHeight + 8,
      minWidth: this.windowConfig.defaultWidth,
      minHeight: this.windowConfig.defaultHeight + 8,
      backgroundColor: this.windowConfig.whiteColor,
      icon: this.windowConfig.icon,
      webPreferences: {
        preload: this.windowConfig.preloadJsUrl,
        webSecurity: false, //禁用同源策略
        nodeIntegration: true, // 是否启用Node integration.
        webviewTag: false, // 是否启用webview
      },
    });
    // 载入
    this.localWindows.loadFile("src" + url);
    // 监听dom渲染完成，重新设置窗体标题
    this.localWindows.webContents.once("dom-ready", () => {
      this.localWindows.setTitle(title);
    });
    // 监听窗体奔溃
    this.localWindows.webContents.on("unresponsive", () => {
      commonUtil.doCatchErr("错误", "本地页面奔溃了，即将重新创建窗体！", this.loadingWindows, this.mainWindows, this.browserWindows);
    });
    // 监听当前窗体关闭，展示主窗体
    this.localWindows.webContents.on("close", () => {
      this.reShowMainWindows();
    });
    // 监听窗体获得焦点
    this.localWindows.webContents.on("focus", () => {
      // 注册快捷键
      shortCutUtil.registrySpecial(this.mainWindows, this.localWindows);
    });
    // 监听窗体失去焦点
    this.localWindows.webContents.on("blur", () => {
      shortCutUtil.unRegistrySpecial();
    });
  }

  /**
   * 载入web页面
   * @param {string} title
   * @param {string} url
   */
  showWebWindow(title = "", url = "") {
    httpUtil
      .checkWebUrl(url)
      .then((res) => {
        this.createBrowserView(title, url);
        ipcSendUtil.setIpcSend(this.mainWindows, { closeTime: this.windowConfig.timeOut });
        operateUtil.operateWin(this.browserWindows, null, this.mainWindows, this.windowConfig.timeOut);
      })
      .catch((err) => {
        ipcSendUtil.setIpcSend(this.mainWindows, { waringMsg: "该地址无法访问，请检查网络！" });
      });
  }

  /**
   * 载入本地应用
   * @param {string} title
   * @param {string} id
   * @param {string} index
   */
  showLocalWindow(title = "", id = "", index = "") {
    const url = this.configObj.localModulePath + id + (index === "" ? "/index.html" : "/" + index);
    httpUtil
      .checkLocalUrl(this.windowConfig.dirName + url)
      .then((res) => {
        this.createLocalView(title, url);
        ipcSendUtil.setIpcSend(this.mainWindows, { closeTime: this.windowConfig.timeOut });
        operateUtil.operateWin(this.localWindows, null, this.mainWindows, this.windowConfig.timeOut);
      })
      .catch((err) => {
        ipcSendUtil.setIpcSend(this.mainWindows, { waringMsg: "该地址无法访问，请检查是否存在！" });
      });
  }

  /**
   * 载入本地应用（本地服务）
   * @param {string} title
   * @param {string} id
   * @param {string} index
   */
  showLocalServerWindow(title = "", id = "", index = "") {
    // 判断本地子进程服务是否已经启动，已经启动的要关闭掉子进程
    this.localServerStop();
    // 本地应用文件夹路径
    const url = commonUtil.replaceFilePath(this.windowConfig.dirName + this.configObj.localModulePath + id);
    // 子进程创建服务
    const child = utilityProcess.fork(this.windowConfig.dirName + this.configObj.serverPath);
    // 子进程发送参数
    child.once("spawn", () => {
      child.postMessage({ url: url, port: this.localServerPort });
    });

    // 子进程接收结果
    child.once("message", (e) => {
      if (!e.success) {
        ipcSendUtil.setIpcSend(this.mainWindows, { waringMsg: "该地址无法访问，请检查本地服务！" });
        return;
      }

      const localWebUrl = this.localServer + ":" + this.localServerPort + (index === "" ? "/index.html" : "/" + index);
      this.showWebWindow(title, localWebUrl);
    });
  }

  /**
   * 关闭本地服务
   */
  localServerStop() {
    const workerProcess = commonUtil.executeCMD("netstat -ano | findstr " + this.localServerPort);
    if (!workerProcess) {
      return;
    }

    workerProcess.stdout.on("data", function (data) {
      // 解析结果
      const listeningStr = data.substring(data.indexOf("LISTENING") + 9);
      const pidStr = listeningStr.substring(0, listeningStr.indexOf("TCP")).replaceAll(" ", "").trim();
      if (pidStr) {
        commonUtil.executeCMD("taskkill /pid " + pidStr + " /f");
      }
    });
  }

  /**
   * 打开本地应用
   * @param {string} exeUrl
   */
  openLocalExeApp(exeUrl = "") {
    commonUtil.executeCMD("start " + exeUrl);
    ipcSendUtil.setIpcSend(this.mainWindows, { closeTime: this.windowConfig.timeOut });
  }

  /**
   * 展示隐藏的主窗体
   */
  reShowMainWindows() {
    shortCutUtil.unRegistrySpecial();
    if (!this.mainWindows.isDestroyed()) {
      this.mainWindows.show();
    }
  }

  /**
   *注册进程间通信（渲染器到主进程）
   */
  setIpcOn() {
    // 展示web类型的窗口
    ipcMain.on("show-webWindow", (event, param) => {
      this.showWebWindow(param.title, param.url);
    });

    // 展示local类型的窗口
    ipcMain.on("show-localWindow", (event, param) => {
      this.showLocalWindow(param.title, param.id, param.index);
    });

    // 展示localServer类型的窗口
    ipcMain.on("show-locaServerlWindow", (event, param) => {
      this.showLocalServerWindow(param.title, param.id, param.index);
    });

    // 打开本地应用
    ipcMain.on("open-localExeApp", (event, param) => {
      this.openLocalExeApp(param.exeUrl);
    });

    // 操作数据data文件（有提示）
    ipcMain.on("operate-datajson", (event, formData) => {
      operateUtil.operateDataJson(this.configObj, this.gloableParams, formData, this.mainWindows);
    });

    // 操作数据data文件（无提示）
    ipcMain.on("operate-cardjson", (event, cardData) => {
      operateUtil.operateCardJson(this.configObj, this.gloableParams, cardData, this.mainWindows);
    });

    // 操作设置setting文件
    ipcMain.on("operate-settingjson", (event, settingData) => {
      operateUtil.operateSettingJson(this.configObj, this.gloableParams, settingData, this.mainWindows);
    });

    // 操作标签tag文件
    ipcMain.on("operate-tagjson", (event, tagData) => {
      operateUtil.operateTagJson(this.configObj, this.gloableParams, tagData, this.mainWindows);
    });

    // 操作背景图片数据
    ipcMain.on("operate-bgimg", (event, bgImgParam) => {
      operateUtil.operateBgImg(this.configObj, bgImgParam, this.mainWindows);
    });

    // 重启应用
    ipcMain.on("restart-app", (event) => {
      app.relaunch({ args: process.argv.slice(1).concat(["--relaunch"]) });
      app.exit(0);
    });
  }
}

const windowUtil = new WindowUtil();
module.exports = { windowUtil };
