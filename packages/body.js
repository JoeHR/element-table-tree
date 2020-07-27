/*
 * @Author: rh
 * @Date: 2020-07-16 16:01:00
 * @LastEditTime: 2020-07-27 15:00:06
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */

import { mapStates } from './store/helper'
import LayoutObserver from './layout-observer'

// const convertToRows = (originColumns) => {
//   let maxLevel = 1
//   const traverse = (column, parent) => {
//     if (parent) {
//       column.level = parent.level + 1
//       if (maxLevel < column.level) {
//         maxLevel = column.level
//       }
//     }
//     column.colspan = 1
//   }

//   originColumns.forEach(column => {
//     column.level = 1
//     traverse(column)
//   })

//   const rows = []
//   for (let i = 0; i < maxLevel; i++) {
//     rows.push([])
//   }

//   // const allColumns = getAllColumns(originColumns)
//   const allColumns = originColumns

//   allColumns.forEach(column => {
//     if (!column.children) {
//       column.colspan = maxLevel - column.level + 1
//     } else {
//       column.rowspan = 1
//     }
//     rows[column.level - 1].push(column)
//   })

//   return rows
// }

export default {
  name: 'ttBody',

  mixins: [LayoutObserver],

  render (h) {
    // const store = this.store
    // const { rowKey } = store
    // const orginColumns = this.store.states.originColumns
    // const columnRows = convertToRows(orginColumns, this.columns)
    return this.rowRender(this.data)
    // <tr class="tr table-tree-item" style="display:flex;flex-wrap:nowrap;height:100%;box-sizing:border-box;">
    //   {
    //     this._l(columnRows, (columns, rowIndex) =>
    //       columns.map((column, cellIndex) => (
    //         <td class="td"
    //           style={{ width: column.realWidth + 'px', 'border-bottom': 'none' }}
    //           colspan={ column.colspan }
    //         >
    //           <div class="cell">
    //             {
    //               column.renderCell.call(
    //                 this._renderProxy,
    //                 this.$createElement,
    //                 this.data
    //               )
    //             }
    //           </div>
    //         </td>
    //       ))
    //     )
    //   }
    // </tr>
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
    table () {
      return this.layout.table
    },

    ...mapStates({
      columns: 'columns'
    })
  },

  methods: {
    getSpan (row, column, columnIndex) {
      let rowspan = 1
      let colspan = 1
      const fn = this.table.spanMethod
      if (typeof fn === 'function') {
        const result = fn({
          row,
          column,
          columnIndex
        })
        if (Array.isArray(result)) {
          rowspan = result[0]
          colspan = result[1]
        } else if (typeof result === 'object') {
          rowspan = result.rowspan
          colspan = result.colspan
        }
      }
      return { rowspan, colspan }
    },

    getColspanRealWidth (columns, colspan, cellIndex) {
      if (colspan < 1) {
        return columns[cellIndex].realWidth
      }
      const widthArr = columns.map(({ realWidth }) => realWidth).slice(cellIndex, cellIndex + colspan)
      return widthArr.reduce((acc, width) => acc + width, -1)
    },

    getCellStyle (columnIndex, row, column) {
      const cellStyle = this.table.cellStyle
      if (typeof cellStyle === 'function') {
        return cellStyle({
          columnIndex,
          row,
          column
        })
      }
      return cellStyle
    },

    getCellClass (columnIndex, row, column) {
      const classes = [column.id, column.align, column.className, 'td']
      const cellClassName = this.table.cellClassName
      if (typeof cellClassName === 'string') {
        classes.push(cellClassName)
      } else if (typeof cellClassName === 'function') {
        classes.push(cellClassName({
          columnIndex,
          row,
          column
        }))
      }

      return classes.join(' ')
    },

    rowRender (row) {
      // const orginColumns = this.store.states.originColumns
      // const columnRows = convertToRows(orginColumns, this.columns)
      const { columns } = this
      return (
        <tr class="tr table-tree-item" style="display:flex;flex-wrap:nowrap;height:100%;box-sizing:border-box;">
          {
            columns.map((column, cellIndex) => {
              const { rowspan, colspan } = this.getSpan(row, column, cellIndex)
              if (!rowspan || !colspan) {
                return null
              }
              const columnData = { ...column }
              columnData.realWidth = this.getColspanRealWidth(columns, colspan, cellIndex)
              const data = { store: this.store, _self: this.context || this.table.$vnode.context, column: column, row }
              return (
                <td
                  style={{ width: column.realWidth + 'px', 'border-bottom': 'none' }}
                  class={this.getCellClass(cellIndex, row, column)}
                  rowspan={rowspan}
                  colspan={colspan}
                >
                  {
                    column.renderCell.call(
                      this._renderProxy,
                      this.$createElement,
                      data
                    )
                  }
                </td>
              )
            })
          }
        </tr>
      )
    }
  }
}