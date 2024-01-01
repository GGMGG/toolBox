// 初始化导入
const { globalShortcut } = require("electron");

/**
 * 快捷键注册工具类
 */
class ShortCutUtil {
  /**
   * 快捷键注册工具类
   */
  constructor() {}

  /**
   * 快捷键注册
   * @param {object} windowsName
   */
  registryNormal(windowsName = null) {
    // 销毁所有快捷键
    globalShortcut.unregisterAll();

    if (!windowsName) {
      return;
    }

    // 注册开发者工具
    globalShortcut.register("CommandOrControl+F12", () => {
      windowsName.webContents.openDevTools();
    });

    // 刷新当前页面
    globalShortcut.register("F5", () => {
      windowsName.webContents.reload();
    });

    // 强制刷新页面
    globalShortcut.register("CommandOrControl+F5", () => {
      windowsName.webContents.reload();
    });

    // 返回上一页
    globalShortcut.register("F1", () => {
      windowsName.webContents.goBack();
    });

    // 前进到下一个页面
    globalShortcut.register("F2", () => {
      windowsName.webContents.goForward();
    });
  }

  /**
   * 特殊快捷键注册（子窗口）
   * @param {object} mainWindowsName
   * @param {object} nowWindowsName
   */
  registrySpecial(mainWindowsName = null, nowWindowsName = null) {
    this.unRegistrySpecial();

    if (nowWindowsName) {
      // 开发者工具
      globalShortcut.register("CommandOrControl+F11", () => {
        nowWindowsName.webContents.openDevTools();
      });

      // 强制刷新页面
      globalShortcut.register("CommandOrControl+F6", () => {
        nowWindowsName.webContents.reload();
      });
    }

    if (mainWindowsName) {
      // 主窗口显示隐藏切换
      globalShortcut.register("CommandOrControl+/", () => {
        if (mainWindowsName.isDestroyed()) {
          return;
        }

        mainWindowsName.isVisible() ? mainWindowsName.hide() : mainWindowsName.show();
      });
    }
  }

  /**
   * 销毁特殊快捷键（子窗口）
   */
  unRegistrySpecial() {
    globalShortcut.unregister("CommandOrControl+/");
    globalShortcut.unregister("CommandOrControl+F11");
    globalShortcut.unregister("CommandOrControl+F6");
  }
}

const shortCutUtil = new ShortCutUtil();
module.exports = { shortCutUtil };
