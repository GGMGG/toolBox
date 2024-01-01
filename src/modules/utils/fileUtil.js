// 初始化导入
// fs文件
const fs = require("fs");
// node path
const path = require("path");
// 工具类导入
const { commonUtil } = require("./commonUtil");

/**
 * 文件工具类
 */
class FileUtil {
  /**
   * 文件工具类
   */
  constructor() {}

  /**
   * 判断给定的路径是否存在
   * @param {string} path
   * @returns
   */
  checkPathExists(path = "") {
    return new Promise((resolve, reject) => {
      if (!path || !fs.existsSync(path)) {
        reject("路径不存在！");
      } else {
        resolve("路径存在！");
      }
    });
  }

  /**
   * 读取文件方法
   * @param {string} path
   * @returns
   */
  readFile(path = "") {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { flag: "r", encoding: "utf-8" }, (err, data) => {
        if (err) {
          reject("读取失败" + err);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * 复制文件夹
   * @param {string} sourcePath
   * @param {string} copyPath
   * @returns
   */
  cpFile(sourcePath = "", copyPath = "") {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(copyPath)) {
        this.delFile(copyPath)
          .then((res) => {
            fs.cp(sourcePath, copyPath, { recursive: true }, (err) => {
              if (err) {
                reject("操作失败" + err);
              } else {
                resolve("操作成功");
              }
            });
          })
          .catch((err) => {
            reject("操作失败" + err);
          });
      } else {
        fs.cp(sourcePath, copyPath, { recursive: true }, (err) => {
          if (err) {
            reject("操作失败" + err);
          } else {
            resolve("操作成功");
          }
        });
      }
    });
  }

  /**
   * 删除指定路径文件夹
   * @param {string} delPath
   * @returns
   */
  delFile(delPath = "") {
    return this.doDelFile(delPath, "删除文件");
  }

  /**
   * 清空指定路径文件夹
   * @param {string} filePath
   * @returns
   */
  emptyFile(filePath = "") {
    return this.doDelFile(filePath, "清空文件");
  }

  /**
   * 执行文件删除/清空操作
   * @param {string} filePath
   * @param {string} msg
   * @returns
   */
  doDelFile(filePath = "", msg = "") {
    filePath = commonUtil.replaceFilePath(filePath);
    //console.log("执行" + msg + "(" + filePath + ")");
    return new Promise((resolve, reject) => {
      // 判断给定的路径是否存在
      if (!fs.existsSync(filePath)) {
        reject("路径不存在！");
      } else {
        // 返回文件和子目录的数组
        const files = fs.readdirSync(filePath);
        files.forEach(function (file, index) {
          const curPath = path.join(filePath, file);
          if (fs.statSync(curPath).isDirectory()) {
            // 同步读取文件夹文件，如果是文件夹，则函数回调
            fileUtil.doDelFile(curPath, msg);
          } else {
            // 是指定文件，则删除
            fs.unlinkSync(curPath);
          }
        });

        // 清除文件夹
        fs.rmdirSync(filePath);
        resolve("操作成功");
      }
    });
  }

  /**
   * 新增json节点
   * @param {string} path
   * @param {object} obj
   * @param {string} copyPath
   * @returns
   */
  addObj(path = "", obj = null, copyPath = "") {
    return new Promise((resolve, reject) => {
      if (!obj) {
        reject("操作失败");
      } else {
        fs.readFile(path, { flag: "r", encoding: "utf-8" }, (err, data) => {
          if (err) {
            reject("读取失败" + err);
          } else {
            let res = JSON.parse(data);
            if (data == "" || res.length == 0) {
              obj.id = "1";
            } else {
              // 根据最后一个sort来设置下一个元素的id
              let index = parseInt(res.at(-1).sort) + 1;
              obj.id = index.toString();
            }

            obj.sort = obj.id;
            res.push(obj);
            fs.writeFile(path, JSON.stringify(res), (err) => {
              if (err) {
                reject("添加失败" + err);
              } else {
                if (obj.cardtype === "local" || obj.cardtype === "localServe") {
                  this.cpFile(obj.localurl, copyPath + obj.id);
                }

                resolve(res);
              }
            });
          }
        });
      }
    });
  }

  /**
   * 更新json节点
   * @param {string} path
   * @param {object} obj
   * @returns
   */
  updateObj(path = "", obj = null) {
    return new Promise((resolve, reject) => {
      if (!obj) {
        reject("操作失败");
      } else {
        fs.readFile(path, { flag: "r", encoding: "utf-8" }, (err, data) => {
          if (err) {
            reject("读取失败");
          } else {
            let res = JSON.parse(data);
            //let index = indexesOf(res, obj.id);
            let index = res.findIndex((item) => item.id == obj.id);
            // splice(索引,删除的个数,新增的数据)
            res.splice(index, 1, obj);
            fs.writeFile(path, JSON.stringify(res), (err) => {
              if (err) {
                reject("修改失败" + err);
              } else {
                resolve(res);
              }
            });
          }
        });
      }
    });
  }

  /**
   * 删除json节点
   * @param {string} path
   * @param {string} id
   * @returns
   */
  delObj(path = "", id = "") {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { flag: "r", encoding: "utf-8" }, (err, data) => {
        if (err) {
          reject("读取失败" + err);
        } else {
          const res = JSON.parse(data);
          // 数组的filter方法可以返回满足筛选条件的结果
          const newData = res.filter((item) => {
            return id !== parseInt(item.id);
          });

          fs.writeFile(path, JSON.stringify(newData), (err) => {
            if (err) {
              reject("删除失败" + err);
            } else {
              resolve(newData);
            }
          });
        }
      });
    });
  }

  /**
   * 更新json文件
   * @param {string} path
   * @param {object} obj
   * @returns
   */
  updateJsonData(path = "", obj = null) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(obj), (err) => {
        if (err) {
          reject("更新失败" + err);
        } else {
          resolve(obj);
        }
      });
    });
  }
}

const fileUtil = new FileUtil();
module.exports = { fileUtil };
