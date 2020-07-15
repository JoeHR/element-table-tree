/*
 * @Author: rh
 * @Date: 2020-07-15 16:40:52
 * @LastEditTime: 2020-07-15 16:59:31
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */

export default {
  created () {
    this.tableLayout.addObserver(this)
  },

  destroyed () {
    this.tableLayout.removeObserver(this)
  },

  computed: {
    tableLayout () {
      let layout = this.layout
      if (!layout && this.table) {
        layout = this.table.layout
      }
      if (!layout) {
        throw new Error('Can not find table layout.')
      }
      return layout
    }
  },

  mounted () {
    this.onColumnsChange(this.tableLayout)
    this.onScrollableChange(this.tableLayout)
  },

  updated () {
    if (this.__updated__) return
    this.onColumnsChange(this.tableLayout)
    this.onScrollableChange(this.tableLayout)
    this.__updated__ = true
  },

  methods: {
    onColumnsChange (layout) {
      const cols = this.$el.querySelectorAll('colgroup > col')
      if (!cols.length) return
      const flattenColumns = layout.getFlattenColumns()
      const columnsMap = {}
      flattenColumns.forEach(column => {
        columnsMap[column.id] = column
      })
      for (let i = 0; i < cols.length; i++) {
        const col = cols[i]
        const name = col.getAttribute('name')
        const column = columnsMap[name]
        if (column) {
          col.setAttribute('width', column.realWidth || column.width)
        }
      }
    },

    onScrollableChange (layout) {
      const cols = this.$el.querySelectorAll('colgroup > col[name=gutter]')
      for (let i = 0, j = cols.length; i < j; i++) {
        const col = cols[i]
        col.setAttribute('width', layout.scrollY ? layout.gutterWidth : '0')
      }
      const ths = this.$el.querySelectorAll('th.gutter')
      for (let i = 0, j = ths.length; i < j; i++) {
        const th = ths[i]
        th.style.width = layout.scrollY ? layout.gutterWidth + 'px' : '0'
        th.style.display = layout.scrollY ? '' : 'none'
      }
    }
  }
}
