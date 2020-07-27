/*
 * @Author: rh
 * @Date: 2020-07-08 16:47:11
 * @LastEditTime: 2020-07-14 17:20:47
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */
import Store from './index'
// import debounce from 'throttle-debounce/debounce'

export function createStore (table, initialState = {}) {
  if (!table) {
    throw new Error('Table is required')
  }

  const store = new Store()

  store.table = table

  Object.keys(initialState).forEach(key => {
    store.states[key] = initialState[key]
  })
  return store
}

export function mapStates (mapper) {
  const res = {}
  Object.keys(mapper).forEach(key => {
    const value = mapper[key]
    let fn
    if (typeof value === 'string') {
      fn = function () {
        return this.store.states[value]
      }
    } else if (typeof value === 'function') {
      fn = function () {
        return value.call(this, this.store.states)
      }
    } else {
      console.error('invalid value type')
    }

    if (fn) {
      res[key] = fn
    }
  })
  return res
}
