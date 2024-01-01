// 初始化导入
const { app } = require("electron");
const exec = require("child_process").exec;
// 工具类导入
const { exceptionUtil } = require("./exceptionUtil");

/**
 * 通用工具类
 */
class CommonUtil {
  /**
   * 通用工具类
   */
  constructor() {}

  /**
   * 文件路径格式化
   * @param {string} filePath
   * @returns
   */
  replaceFilePath(filePath = "") {
    return filePath.replaceAll("/", "\\");
  }

  /**
   * 工程路径格式化
   * @param {string} projectPath
   * @returns
   */
  replaceProjectPath(projectPath = "") {
    return projectPath.replace("modules", "");
  }

  /**
   * 执行异常捕捉
   * @param {string} title
   * @param {string} msg
   * @param {object} loadingWindows
   * @param {object} mainWindows
   * @param {object} browserWindows
   */
  doCatchErr(title = "", msg = "", loadingWindows = null, mainWindows = null, browserWindows = null) {
    exceptionUtil
      .catchErr(title, msg, loadingWindows, mainWindows, browserWindows)
      .then((res) => {
        app.relaunch({ args: process.argv.slice(1).concat(["--relaunch"]) });
        app.exit(0);
      })
      .catch((err) => {
        console.log("doCatchErr-操作失败", err);
      });
  }

  /**
   * 执行CMD命令
   * @param {string} cmdStr
   * @returns
   */
  executeCMD(cmdStr = "") {
    if (!cmdStr) {
      return null;
    }

    return exec(cmdStr, {});
  }
}

const commonUtil = new CommonUtil();
module.exports = { commonUtil };
