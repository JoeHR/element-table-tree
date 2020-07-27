/*
 * @Author: rh
 * @Date: 2020-07-27 14:26:31
 * @LastEditTime: 2020-07-27 15:03:04
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */
import TableTree from './table-tree.vue'
import TableTreeColumn from './column'

const components = [
  TableTree,
  TableTreeColumn
]

const install = (Vue) => {
  components.forEach(component => {
    Vue.component(component.name, component)
  })
}

export default {
  version: '0.1.0',
  install,
  ...components
}
