// 初始化导入
const { net } = require("electron");
// 工具类导入
const { fileUtil } = require("./fileUtil");

/**
 * 网络工具类
 */
class HttpUtil {
  /**
   * 网络工具类
   */
  constructor() {}

  /**
   * 检查web页面能否访问
   * @param {string} url
   * @returns
   */
  async checkWebUrl(url = "") {
    return new Promise((resolve, reject) => {
      const request = net.request(url);
      request.on("response", (response) => {
        response.on("data", (chunk) => {});
        response.on("end", (res) => {});
        if (response.statusCode === 200) {
          resolve("OK");
        } else {
          reject("请求远端服务出错! (" + response.statusCode + "-" + response.statusMessage + ")");
        }
      });

      request.on("error", function (e) {
        reject("请求远端服务出错!(" + e.message + ")");
      });

      request.end();
    });
  }

  /**
   * 检查本地应用是否存在
   * @param {string} url
   * @returns
   */
  checkLocalUrl(url = "") {
    return new Promise((resolve, reject) => {
      fileUtil
        .checkPathExists(url)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

const httpUtil = new HttpUtil();
module.exports = { httpUtil };
