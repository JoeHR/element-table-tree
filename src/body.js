/*
 * @Author: rh
 * @Date: 2020-07-16 16:01:00
 * @LastEditTime: 2020-07-16 18:51:02
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */

import { mapStates } from './store/helper'
import LayoutObserver from './layout-observer'

const convertToRows = (originColumns) => {
  let maxLevel = 1
  const traverse = (column, parent) => {
    if (parent) {
      column.level = parent.level + 1
      if (maxLevel < column.level) {
        maxLevel = column.level
      }
    }
    column.colspan = 1
  }

  originColumns.forEach(column => {
    column.level = 1
    traverse(column)
  })

  const rows = []
  for (let i = 0; i < maxLevel; i++) {
    rows.push([])
  }

  // const allColumns = getAllColumns(originColumns)
  const allColumns = originColumns

  allColumns.forEach(column => {
    if (!column.children) {
      column.colspan = maxLevel - column.level + 1
    } else {
      column.rowspan = 1
    }
    rows[column.level - 1].push(column)
  })

  return rows
}

export default {
  name: 'ttBody',

  mixins: [LayoutObserver],

  render (h) {
    const orginColumns = this.store.states.originColumns
    const columnRows = convertToRows(orginColumns, this.columns)
    return <div class="tr" style="display:flex;flex-wrap:nowrap;">
      {
        this._l(columnRows, (columns, rowIndex) =>
          columns.map((column, cellIndex) => (
            <div class="td"
              style={{ width: column.realWidth + 'px' }}
              colspan={column.colspan}
            >
              {this.data[column.property]}
            </div>
          ))
        )
      }
    </div>
  },

  props: {
    data: {},

    layout: {},

    node: {},

    context: {},

    rowClassName: [String, Function],

    rowStyle: [Object, Function],

    fixed: String,

    highlight: Boolean,

    store: {
      required: true
    }
  },

  computed: {
    ...mapStates({
      columns: 'columns'
    })
  },

  methods: {

  }
}
