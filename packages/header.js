/*
 * @Author: rh
 * @Date: 2020-07-08 17:28:10
 * @LastEditTime: 2020-07-27 20:12:23
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */
// import Vue from 'vue'

import { mapStates } from './store/helper'
import { addClass, removeClass } from './utils/util'
import LayoutObserver from './layout-observer'

// const getAllColumns = (columns) => {
//   const result = []
//   columns.forEach((column) => {
//     if (column.children) {
//       result.push(column)
//       result.push.apply(result, getAllColumns(column.children))
//     } else {
//       result.push(column)
//     }
//   })
//   return result
// }

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
  name: 'ttHeader',

  mixins: [LayoutObserver],

  props: {
    fixed: String,
    border: Boolean,
    store: {
      required: true
    }
  },

  data () {
    return {
      draggingColumn: null,
      dragging: false,
      dragState: {}
    }
  },

  computed: {
    table () {
      return this.$parent
    },

    hasGutter () {
      return !this.fixed && this.tableLayout.gutterWidth
    },

    ...mapStates({
      columns: 'columns'
    })

  },

  render (h) {
    const orginColumns = this.store.states.originColumns
    const columnRows = convertToRows(orginColumns, this.columns)
    return (
      <table
        class="el-table-header"
        cellspacing="0"
        cellpadding="0"
        border="0"
      >
        <colgroup>
          {
            this.columns.map(column => <col name={ column.id } key={column.id} />)
          }
          {
            this.hasGutter ? <col name="gutter" /> : ''
          }
        </colgroup>
        <thead class={{ 'has-gutter': this.hasGutter }}>
          {
            this._l(columnRows, (columns, rowIndex) =>
              <tr style={this.getHeaderRowStyle(rowIndex)} class={this.getHeaderRowClass(rowIndex)}>
                {
                  columns.map((column, cellIndex) => (
                    <th
                      colspan={column.colspan}
                      rowspan ={column.rowspan}
                      style={ this.getHeaderCellStyle(rowIndex, cellIndex, columns, column) }
                      class={ this.getHeaderCellClass(rowIndex, cellIndex, columns, column) }
                      on-mousemove={ ($event) => this.handleMouseMove($event, column) }
                      on-mouseout={ this.handleMouseOut }
                      on-mousedown={ ($event) => this.handleMouseDown($event, column) }
                      key={ column.id }
                    >
                      <div class='cell'>
                        {
                          column.renderHeader ? column.renderHeader.call(this._renderProxy, h, { column, $index: cellIndex, store: this.store, _self: this.$parent.$vnode.context }) : column.label
                        }
                      </div>
                    </th>
                  ))
                }
                {
                  this.hasGutter ? <th class="gutter"></th> : ''
                }
              </tr>
            )
          }
        </thead>
      </table>
    )
  },

  methods: {
    getHeaderRowStyle (rowIndex) {
      const headerRowStyle = this.table.headerRowStyle
      if (typeof headerRowStyle === 'function') {
        return headerRowStyle({ rowIndex })
      }
      return headerRowStyle
    },

    getHeaderRowClass (rowIndex) {
      const classes = []

      const headerRowClassName = this.table.headerRowClassName
      if (typeof headerRowClassName === 'string') {
        classes.push(headerRowClassName)
      } else if (typeof headerRowClassName === 'function') {
        classes.push(headerRowClassName({ rowIndex }))
      }

      return classes.join(' ')
    },

    getHeaderCellStyle (rowIndex, columnIndex, row, column) {
      const headerCellStyle = this.table.headerCellStyle
      if (typeof headerCellStyle === 'function') {
        return headerCellStyle({
          rowIndex,
          columnIndex,
          row,
          column
        })
      }
      return headerCellStyle
    },

    getHeaderCellClass (rowIndex, columnIndex, row, column) {
      const classes = [column.id, column.order, column.headerAlign, column.className, column.labelClassName]

      // if (rowIndex === 0 && this.isCellHidden(columnIndex, row)) {
      //   classes.push('is-hidden')
      // }

      // if (!column.children) {
      //   classes.push('is-leaf')
      // }

      // if (column.sortable) {
      //   classes.push('is-sortable')
      // }

      const headerCellClassName = this.table.headerCellClassName
      if (typeof headerCellClassName === 'string') {
        classes.push(headerCellClassName)
      } else if (typeof headerCellClassName === 'function') {
        classes.push(headerCellClassName({
          rowIndex,
          columnIndex,
          row,
          column
        }))
      }

      return classes.join(' ')
    },

    handleMouseOut () {
      if (this.$isServer) return
      document.body.style.cursor = ''
    },

    handleMouseDown (event, column) {
      if (this.$isServer) return
      if (column.children && column.children.length > 0) return

      if (this.draggingColumn && this.border) {
        this.dragging = true

        this.$parent.resizeProxyVisible = true

        const table = this.$parent
        const tableEl = table.$el
        const tableLeft = tableEl.getBoundingClientRect().left
        const columnEl = this.$el.querySelector(`th.${column.id}`)
        const columnRect = columnEl.getBoundingClientRect()
        const minLeft = columnRect.left - tableLeft + 30

        addClass(column, 'noclick')

        this.dragState = {
          startMouseLeft: event.clientX,
          startLeft: columnRect.right - tableLeft,
          startColumnLeft: columnRect.left - tableLeft,
          tableLeft
        }

        const resizeProxy = table.$refs.resizeProxy
        resizeProxy.style.left = this.dragState.startLeft + 'px'

        document.onselectstart = function () { return false }
        document.ondragstart = function () { return false }

        const handleMouseMove = (event) => {
          const deltaLeft = event.clientX - this.dragState.startMouseLeft
          const proxyLeft = this.dragState.startLeft + deltaLeft

          resizeProxy.style.left = Math.max(minLeft, proxyLeft) + 'px'
        }

        const handleMouseUp = () => {
          if (this.dragging) {
            const { startColumnLeft, startLeft } = this.dragState
            const finalLeft = parseInt(resizeProxy.style.left, 10)
            const columnWidth = finalLeft - startColumnLeft
            column.width = column.realWidth = columnWidth
            table.$emit('header-dragend', column.width, startLeft - startColumnLeft, column, event)

            this.store.scheduleLayout()

            document.body.style.cursor = ''
            this.dragging = false
            this.draggingColumn = null
            this.dragState = {}

            table.resizeProxyVisible = false
          }

          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.onselectstart = null
          document.ondragstart = null

          setTimeout(function () {
            removeClass(columnEl, 'noclick')
          }, 0)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp.bind(this))
      }
    },

    handleMouseMove (event, column) {
      if (column.children && column.children.length > 0) return
      let target = event.target

      while (target && target.tagName !== 'TH') {
        target = target.parentNode
      }

      if (!column || !column.resizable) return

      if (!this.dragging && this.border) {
        const rect = target.getBoundingClientRect()

        const bodyStyle = document.body.style

        if (rect.width > 12 && rect.right - event.pageX < 8) {
          bodyStyle.cursor = 'col-resize'

          this.draggingColumn = column
        } else if (!this.dragging) {
          bodyStyle.cursor = ''
          this.draggingColumn = null
        }
      }
    }
  }
}
