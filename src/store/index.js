/*
 * @Author: rh
 * @Date: 2020-07-08 09:48:20
 * @LastEditTime: 2020-07-14 16:54:48
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */
import Watcher from './watcher'

Watcher.prototype.mutations = {

  insertColumn (states, column, index, parent) {
    let array = states._columns
    if (parent) {
      array = parent.children
      if (!array) array = parent.children = []
    }

    if (typeof index !== 'undefined') {
      array.splice(index, 0, column)
    } else {
      array.push(column)
    }

    if (this.table.$ready) {
      this.updateColumns()
    }
  }
}

Watcher.prototype.commit = function (name, ...args) {
  const mutations = this.mutations
  if (mutations[name]) {
    mutations[name].apply(this, [this.states].concat(args))
  } else {
    throw new Error(`Action not found:${name}`)
  }
}

export default Watcher
