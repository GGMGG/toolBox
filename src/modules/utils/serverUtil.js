// 初始化导入
const httpServer = require("http-server");

/**
 * 服务工具类
 */
class ServerUtil {
  /**
   * 默认端口
   */
  port = 16666;

  /**
   * 服务状态
   */
  serverLive = false;

  /**
   * 服务工具类
   */
  constructor() {}

  /**
   * 服务子进程监听
   */
  serverListening() {
    process.parentPort.once("message", (e) => {
      const url = e.data.url;
      const port = e.data.port;
      if (!url) {
        process.parentPort.postMessage({ success: false });
        return;
      }

      this.createLocalServer(url, port);
      setTimeout(() => {
        if (this.serverLive) {
          process.parentPort.postMessage({ success: true });
          return;
        }

        process.parentPort.postMessage({ success: false });
        return;
      }, 100);
    });
  }

  /**
   * 创建本地服务
   * @param {string} url
   * @param {number} port
   */
  createLocalServer(url = "", port = this.port) {
    httpServer.createServer({ root: url, cors: true }).listen(port, () => {
      this.serverLive = true;
    });
  }
}

const serverUtil = new ServerUtil();
serverUtil.serverListening();
// module.exports = { serverUtil };
