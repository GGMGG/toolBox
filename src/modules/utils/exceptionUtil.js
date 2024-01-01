// 工具类导入
const { noticeUtil } = require("./noticeUtil");

/**
 * 异常处理工具类
 */
class ExceptionUtil {
  /**
   * 异常处理工具类
   */
  constructor() {}

  /**
   * 统一异常处理
   * @param {string} title
   * @param {string} msg
   * @param {...any} args
   * @returns
   */
  catchErr(title = "", msg = "", ...args) {
    return new Promise((resolve, reject) => {
      noticeUtil.showNotice(title, msg);
      if (args instanceof Array) {
        args.forEach((windowsName) => {
          windowsName && windowsName.close();
        });
      }

      resolve("OK");
    });
  }
}

const exceptionUtil = new ExceptionUtil();
module.exports = { exceptionUtil };
