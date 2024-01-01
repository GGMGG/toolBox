// 主程序main
// 初始化导入
const { app, globalShortcut } = require("electron");
// 工具类导入
const { windowUtil } = require("./modules/utils/windowUtil");
const { configUtil } = require("./modules/utils/configUtil");
const { exceptionUtil } = require("./modules/utils/exceptionUtil");

/**
 * 程序执行类
 */
class Application {
  /**
   * 程序执行类
   */
  constructor() {}

  /**
   * 程序执行
   */
  appRun() {
    // ready时执行脚本
    app.whenReady().then(() => {
      this.init();
    });

    // 窗口关闭监听
    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    // 窗口退出监听，注销快捷键
    app.on("will-quit", () => {
      globalShortcut.unregisterAll();
    });

    // 禁止当前应用程序的硬件加速
    app.disableHardwareAcceleration();
  }

  /**
   * 初始化
   */
  init() {
    // 1.初始化配置数据
    windowUtil.setWindowConfig(__dirname);
    configUtil.setProjectConfig(__dirname);
    // 2.创建加载动画
    windowUtil.createLoadingView();
    // 3.读取项目配置
    configUtil
      .checkConfig(__dirname)
      .then((res) => {
        // 4.创建主窗体
        windowUtil.createMainView(res);
      })
      .catch((err) => {
        exceptionUtil.catchErr("初始化错误", err);
      });
  }
}

/**
 * 应用初始化
 */
const application = new Application();
application.appRun();
