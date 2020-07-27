/*
import default from './components/HelloWorld';
 * @Author: rh
 * @Date: 2020-07-08 10:28:17
 * @LastEditTime: 2020-07-27 14:48:57
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */
import { parseWidth, parseMinWidth, mergeOptions, compose } from './utils/util'
import { defaultRenderCell, treeCellPrefix, cellForced } from './config'

let columnIdSeed = 1

export default {
  name: 'TableTreeColumn',

  props: {
    label: String,
    className: String,
    prop: String,
    property: String,
    width: {},
    minWidth: {},
    renderHeader: Function,
    resizable: {
      type: Boolean,
      default: true
    },
    columnKey: String,
    showTooltipWhenOverflow: Boolean,
    showOverflowTooltip: Boolean,
    formatter: Function,
    index: [Number, Function]
  },

  data () {
    return {
      columns: []
    }
  },

  computed: {
    owner () {
      let parent = this.$parent
      while (parent && !parent.tableId) {
        parent = parent.$parent
      }
      return parent
    },

    columnOrTableParent () {
      let parent = this.$parent
      while (parent && !parent.tableId && !parent.columnId) {
        parent = parent.$parent
      }
      return parent
    },

    realWidth () {
      return parseWidth(this.width)
    },

    realMinWidth () {
      return parseMinWidth(this.minWidth)
    },

    realAlign () {
      return this.align ? 'is-' + this.align : null
    },

    realHeaderAlign () {
      return this.headerAlign ? 'is-' + this.headerAlign : this.realAlign
    }
  },

  beforeCreate () {
    this.row = {}
    this.column = {}
  },

  created () {
    const parent = this.columnOrTableParent
    this.columnId = (parent.tableId || parent.columnId) + '_column_' + columnIdSeed++

    // const sortable = this.sorttable === '' ? true : this.sorttable
    const defaults = {
      id: this.columnId,
      property: this.prop || this.property,
      align: this.realAlign,
      headerAlign: this.realHeaderAlign,
      showOverflowTooltip: this.showOverflowTooltip || this.showTooltipWhenOverflow,

      // // sort 相关属性
      // sortable:sortable,

      // index 列
      index: this.index
    }

    const basicProps = ['columnKey', 'label', 'className', 'labelClassName', 'type', 'renderHeader', 'formatter', 'fixed', 'resizable']

    let column = this.getPropsData(basicProps)
    column = mergeOptions(defaults, column)

    const chains = compose(this.setColumnRenders, this.setColumnWidth, this.setColumnForcedProps)
    column = chains(column)

    this.columnConfig = column
  },

  mounted () {
    const owner = this.owner
    const parent = this.columnOrTableParent
    const children = parent.$refs.hiddenColumns.children
    const columnIndex = this.getColumnElIndex(children, this.$el)
    owner.store.commit('insertColumn', this.columnConfig, columnIndex)
  },

  destroyed () {
    // if (!this.$parent) return
    // this.owner.store.commit('removeColumn', this.columnConfig)

  },

  render (h) {
    // slots也要渲染
    return h('div', this.$slots.default)
  },

  methods: {
    getColumnElIndex (children, child) {
      return [].indexOf.call(children, child)
    },

    getPropsData (...props) {
      return props.reduce((prev, cur) => {
        if (Array.isArray(cur)) {
          cur.forEach((key) => {
            prev[key] = this[key]
          })
        }
        return prev
      }, {})
    },

    setColumnRenders (column) {
      if (this.renderHeader) {
        console.warn('[Element Warn][TableColumn]Comparing to render-header, scoped-slot header is easier to use. We recommend users to use scoped-slot header.')
      }
      const originRenderCell = column.renderCell || defaultRenderCell
      column.renderCell = (h, data) => {
        let children = null
        if (this.$scopedSlots.default) {
          children = this.$scopedSlots.default(data)
        } else {
          children = originRenderCell(h, data)
        }
        const prefix = treeCellPrefix(h, data)
        const props = {
          class: 'cell',
          style: {}
        }
        if (column.showOverflowTooltip) {
          props.class += 'el-tooltip'
          props.style = { width: (data.column.realWidth || data.column.width) - 1 + 'px' }
        }
        return (<div {...props}>
          {prefix}
          {children}
        </div>)
      }
      return column
    },

    setColumnWidth (column) {
      if (this.realWidth) {
        column.width = this.realWidth
      }

      if (this.realMinWidth) {
        column.minWidth = this.realMinWidth
      }

      if (!column.minWidth) {
        column.minWidth = 80
      }
      column.realWidth = column.width === undefined ? column.minWidth : column.width
      return column
    },

    setColumnForcedProps (column) {
      // 对于特定类型的column,某些属性不允许设置
      const type = column.type
      const source = cellForced[type] || {}
      Object.keys(source).forEach(prop => {
        const value = source[prop]
        if (value !== undefined) {
          column[prop] = prop === 'className' ? `${column[prop]} ${value}` : value
        }
      })
      return column
    },

    registerNormalWatchers () {
      const props = ['label', 'property', 'index', 'formatter', 'className', 'labelClassName', 'showOverflowTooltip']

      const aliases = {
        prop: 'property',
        realAlign: 'align',
        realHeaderAlign: 'headerAlign',
        realWidth: 'width'
      }
      const allAliases = props.reduce((prev, cur) => {
        prev[cur] = cur
        return prev
      }, aliases)

      Object.keys(allAliases).forEach(key => {
        const columnKey = aliases[key]

        this.$watch(key, newVal => {
          this.columnConfig[columnKey] = newVal
        })
      })
    }

  }

}
