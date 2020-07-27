/*
 * @Author: rh
 * @Date: 2020-07-08 16:18:29
 * @LastEditTime: 2020-07-16 15:46:28
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */

import Vue from 'vue'
// import scrollbarWidth from './scrollbar-width'

class TableTreeLayout {
  constructor (options) {
    this.observers = []
    this.table = null
    this.store = null
    this.columns = null
    this.fit = true
    this.showHeader = true

    this.height = null
    this.scrollX = false
    this.scrollY = false
    this.bodyWidth = null
    this.fixedWidth = null
    this.rightFixedWidth = null
    this.headerHeight = 44
    this.bodyHeight = null
    this.fixedBodyHeight = null
    this.gutterWidth = false

    for (const name in options) {
      if (Object.prototype.hasOwnProperty.call(options, name)) {
        this[name] = options[name]
      }
    }
    if (!this.table) {
      throw new Error('table is required for Table Layout')
    }
    if (!this.store) {
      throw new Error('store is required for Table Layout')
    }
  }

  updateElsHeight () {
    if (!this.table.$ready) return Vue.nextTick(() => this.updateElsHeight())
    const { headerWrapper } = this.table.$refs

    if (this.showHeader && !headerWrapper) return

    const headerTrElm = headerWrapper.querySelector('.el-table__header tr')
    const noneHeader = this.headerDisplayNode(headerTrElm)

    const headerHeight = this.headerHeight = !this.showHeader ? 0 : headerWrapper.offsetHeight

    if (this.showHeader && !noneHeader && headerWrapper.offsetWidth > 0 && (this.table.columns || []).length > 0 && headerHeight < 2) {
      return Vue.nextTick(() => this.updateElsHeight())
    }

    const tableHeight = this.tableHeight = this.table.$el.clientHeight
    if (this.height !== null) {
      this.bodyHeight = tableHeight - headerHeight
    }

    this.fixedBodyHeight = this.bodyHeight

    // const noData = !(this.store.states.data && this.store.states.data.length)
    this.viewportHeight = tableHeight

    this.updateScrollY()
    this.notifyObservers('scrollable')
  }

  headerDisplayNone (elm) {
    let headerChild = elm
    while (headerChild.tagName !== 'DIV') {
      if (getComputedStyle(headerChild).display === 'none') {
        return true
      }
      headerChild = headerChild.parentElement
    }
    return false
  }

  getFlattenColumns () {
    const flattenColumns = []
    const columns = this.table.columns
    columns.forEach(column => {
      if (column.isColumnGroup) {
        flattenColumns.push.apply(flattenColumns, column.columns)
      } else {
        flattenColumns.push(column)
      }
    })

    return flattenColumns
  }

  updateColumnsWidth () {
    if (Vue.prototype.$isServer) return
    const fit = this.fit
    const bodyWidth = this.table.$el.clientWidth
    let bodyMinWidth = 0

    const flattenColumns = this.getFlattenColumns()
    const flexColumns = flattenColumns.filter(column => typeof column.width !== 'number')

    flattenColumns.forEach(column => {
      if (typeof column.width !== 'undefined' && column.realWidth) column.realWidth = null
    })

    if (flexColumns.length > 0 && fit) {
      flattenColumns.forEach(column => {
        bodyMinWidth += column.width || column.minWidth || 80
      })

      const scrollYWidth = this.scrollY ? this.gutterWidth : 0

      if (bodyMinWidth <= bodyWidth - scrollYWidth) { // 有 纵向滚动条
        this.scrollY = true
        const totalFlexWidth = bodyWidth - scrollYWidth - bodyMinWidth

        if (flexColumns.length === 1) {
          flexColumns[0].realWidth = (flexColumns[0].minWidth || 80) + totalFlexWidth
        } else {
          const allColumnsWidth = flexColumns.reduce((prev, column) => prev + (column.minWidth || 80), 0)
          const flexWidthPerPixel = totalFlexWidth / allColumnsWidth
          let noneFirstWidth = 0

          flexColumns.forEach((column, index) => {
            if (index === 0) return
            const flexWidth = Math.floor((column.minWidth || 80) * flexWidthPerPixel)
            noneFirstWidth += flexWidth
            column.realWidth = (column.minWidth || 80) + flexWidth
          })

          flexColumns[0].realWidth = (flexColumns[0].minWidth || 80) + totalFlexWidth - noneFirstWidth
        }
      } else { // 有水平滚动条
        this.scrollX = true
        flexColumns.forEach(column => {
          column.realWidth = column.minWidth
        })
      }

      this.bodyWidth = Math.max(bodyMinWidth, bodyWidth)
      this.table.resizeState.width = this.bodyWidth
    } else {
      flattenColumns.forEach(column => {
        if (!column.width && !column.minWidth) {
          column.realWidth = 80
        } else {
          column.realWidth = column.width || column.minWidth
        }
        bodyMinWidth += column.realWidth
      })
      this.scrollX = bodyMinWidth > bodyWidth

      this.bodyWidth = bodyMinWidth
    }

    const fixedColumns = this.store.states.fixedColumns

    if (fixedColumns.length > 0) {
      let fixedWidth = 0
      fixedColumns.forEach(column => {
        fixedWidth += column.realWidth || column.width
      })

      this.fixedWidth = fixedWidth
    }

    const rightFixedColumns = this.store.states.rightFixedColumns
    if (rightFixedColumns.length > 0) {
      let rightFixedWidth = 0
      rightFixedColumns.forEach(column => {
        rightFixedWidth += column.realWidth || column.width
      })

      this.rightFixedWidth = rightFixedWidth
    }

    this.notifyObservers('columns')
  }

  addObserver (observer) {
    this.observers.push(observer)
  }

  removeObserver (observer) {
    const index = this.observers.indexOf(observer)
    if (index !== -1) {
      this.observers.splice(index, 1)
    }
  }

  notifyObservers (event) {
    const observers = this.observers
    observers.forEach(observer => {
      switch (event) {
        case 'columns':
          observer.onColumnsChange(this)
          break
        case 'scrollable':
          observer.onScrollableChange(this)
          break
        default:
          throw new Error(`Table Tree Layout don't have event ${event}`)
      }
    })
  }
}

export default TableTreeLayout
