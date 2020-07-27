/*
 * @Author: rh
 * @Date: 2020-07-08 13:46:57
 * @LastEditTime: 2020-07-27 14:49:20
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */
import { getPropByPath } from './utils/util'

export function defaultRenderCell (h, { row, column, $index }) {
  const property = column.property
  const value = property && getPropByPath(row, property).v
  if (column && column.formatter) {
    return column.formatter(row, column, value, $index)
  }
  return value
}

export function treeCellPrefix (h, { row, treeNode, store }) {
  if (!treeNode) return null
  const ele = []
  const callback = function (e) {
    e.stopPropagation()
    store.loadOrToggle(row)
  }
  if (treeNode.indent) {
    ele.push(<span class="el-table__indent" style={{ 'padding-left': treeNode.indent + 'px' }}></span>)
  }
  if (typeof treeNode.expanded === 'boolean' && !treeNode.noLazyChildren) {
    const expandClasses = ['el-table__expand-icon', treeNode.expanded ? 'el-table__expand-icon--expanded' : '']
    let iconClasses = ['el-icon-arrow-right']
    if (treeNode.loading) {
      iconClasses = ['el-icon-loading']
    }
    ele.push(<div class={ expandClasses }
      on-click={ callback }>
      <i class={ iconClasses }></i>
    </div>)
  } else {
    ele.push(<span class="el-table__placeholder"></span>)
  }
  return ele
}

export const cellForced = {
  index: {
    renderHeader: function (h, { column }) {
      return column.label || '#'
    },
    renderCell: function (h, { column, $index }) {
      let i = $index + 1
      const index = column.index

      if (typeof index === 'number') {
        i = $index + index
      } else if (typeof index === 'function') {
        i = index($index)
      }
      return <div>{ i }</div>
    },
    sortable: false
  }
}
