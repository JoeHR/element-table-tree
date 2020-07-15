<!--
 * @Author: rh
 * @Date: 2020-07-08 09:48:20
 * @LastEditTime: 2020-07-15 17:10:16
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
-->
<template>
  <div class="rh-table-tree el-table el-table--border">
    <div class="hidden-columns" ref="hiddenColumns"><slot></slot></div>
    <div class="rh-table-header el-table__header-wrapper">
      <tt-header ref="ttHeader" :store="store" :border="border" :style="{width:layout.bodyWidth?layout.bodyWidth+'px':''}"></tt-header>
    </div>
    <div class="rh-table-wrapper" ref="bodyWrapper"></div>
    <div class="el-table__column-resize-proxy" ref="resizeProxy" v-show="resizeProxyVisible"></div>
  </div>
</template>

<script>
import { data } from '@/assets/data'
import TableTreeLayout from './layout'
import ttHeader from './header.js'
import { createStore, mapStates } from './store/helper'
import { addResizeListener } from '@/utils/resize-event'
import { debounce, throttle } from 'throttle-debounce'
import { parseHeight } from './util'

let tableIdSeed = 1

export default {
  name: 'TableTree',

  components: {
    ttHeader
  },

  props: {
    data: {
      type: Array,
      default: function () {
        return data
      }
    },
    width: [String, Number],

    height: [String, Number],

    maxHeight: [String, Number],

    fit: {
      type: Boolean,
      default: true
    },

    border: {
      type: Boolean,
      default: true
    },

    rowKey: [String, Function],

    context: {},

    showHeader: {
      type: Boolean,
      default: true
    },

    rowClassName: [String, Function],

    rowStyle: [Object, Function],

    headerRowClassName: [String, Function],

    headerRowStyle: [Object, Function],

    currentRowKey: [String, Number],

    emptyText: String,

    tooltipEffect: String,

    indent: {
      type: Number,
      default: 16
    }

  },

  data () {
    this.store = createStore(this, {
      rowKey: this.rowKey
    })
    const layout = new TableTreeLayout({
      store: this.store,
      table: this,
      fit: this.fit,
      showHeader: this.showHeader
    })
    return {
      layout,
      isHidden: false,
      resizeProxyVisible: false,
      resizeState: {
        width: null,
        height: null
      }
      // store: this.store
    }
  },

  computed: {
    bodyWrapper () {
      return this.$refs.bodyWrapper
    },

    shouldUpdateHeight () {
      return this.height || this.maxHeight || this.fixedColumns.length > 0 || this.rightFixedColumns.length > 0
    },

    bodyWidth () {
      const { bodyWidth, scrollY, gutterWidth } = this.layout
      return bodyWidth ? bodyWidth - (scrollY ? gutterWidth : 0) + 'px' : ''
    },

    bodyHeight () {
      const { headerHeight = 0, bodyHeight } = this.layout
      if (this.height) {
        return {
          height: bodyHeight ? bodyHeight + 'px' : ''
        }
      } else if (this.maxHeight) {
        const maxHeight = parseHeight(this.maxHeight)
        if (typeof maxHeight === 'number') {
          return {
            'max-height': (maxHeight - (this.showHeader ? headerHeight : 0)) + 'px'
          }
        }
      }
      return {}
    },

    fixedBodyHeight () {
      if (this.height) {
        return {
          height: this.layout.fixedBodyHeight ? this.layout.fixedBodyHeight + 'px' : ''
        }
      } else if (this.maxHeight) {
        let maxHeight = parseHeight(this.maxHeight)
        if (typeof maxHeight === 'number') {
          maxHeight = this.layout.scrollX ? maxHeight - this.layout.gutterWidth : maxHeight
          if (this.showHeader) {
            maxHeight -= this.layout.headerHeight
          }
          maxHeight -= 0
          return {
            'max-height': maxHeight + 'px'
          }
        }
      }
      return {}
    },

    fixedHeight () {
      if (this.maxHeight) {
        return {
          bottom: (this.layout.scrollX && this.data.length) ? this.layout.gutterWidth + 'px' : ''
        }
      } else {
        return {
          height: this.layout.viewportHeight ? this.layout.viewportHeight + 'px' : ''
        }
      }
    },

    emptyBlockStyle () {
      if (this.data && this.data.length) return null
      const height = '100%'
      return {
        width: this.bodyWidth,
        height
      }
    },

    ...mapStates({
      columns: 'columns',
      tableData: 'data',
      fixedColumns: 'fixedColumns',
      rightFixedColumns: 'rightFixedColumns'
    })
  },

  created () {
    this.tableId = 'el-table_' + tableIdSeed++
    this.debouncedUpdateLayout = debounce(50, () => this.doLayout())
  },

  mounted () {
    this.bindEvents()
    this.store.updateColumns()
    this.doLayout()

    this.resizeState = {
      width: this.$el.offsetWidth,
      height: this.$el.offsetHeight
    }

    this.$ready = true
  },

  methods: {
    bindEvents () {
      this.bodyWrapper.addEventListener('scroll', this.syncPosition, { passive: true })
      if (this.fit) {
        addResizeListener(this.$el, this.resizeListener)
      }
    },

    syncPostion: throttle(20, function () {
      const { scrollLeft, scrollTop, offsetWidth, scrollWidth } = this.bodyWrapper
      const { headerWrapper, footerWrapper, fixedBodyWrapper, rightFixedBodyWrapper } = this.$refs
      if (headerWrapper) headerWrapper.scrollLeft = scrollLeft
      if (footerWrapper) footerWrapper.scrollLeft = scrollLeft
      if (fixedBodyWrapper) fixedBodyWrapper.scrollTop = scrollTop
      if (rightFixedBodyWrapper) rightFixedBodyWrapper.scrollTop = scrollTop

      const maxScrollLeftPosition = scrollWidth - offsetWidth - 1

      if (scrollLeft >= maxScrollLeftPosition) {
        this.scrollPosition = 'right'
      } else if (scrollLeft === 0) {
        this.scrollPosition = 'left'
      } else {
        this.scrollPosition = 'middle'
      }
    }),

    resizeListener () {
      if (!this.$ready) return
      let shouldUpdateLayout = false
      const el = this.$el
      const { width: oldWidth, height: oldHeight } = this.resizeState

      const width = el.offsetWidth
      if (oldWidth !== width) {
        shouldUpdateLayout = true
      }

      const height = el.offsetHeight
      if ((this.height || this.shouldUpdateHeight) && oldHeight !== height) {
        shouldUpdateLayout = true
      }

      if (shouldUpdateLayout) {
        this.resizeState.width = width
        this.resizeState.height = height
        this.doLayout()
      }
    },

    doLayout () {
      if (this.shouldUpdateHeight) {
        this.layout.updateElsHeight()
      }
      this.layout.updateColumnsWidth()
    }
  }

}
</script>

<style lang="scss" scoped>

</style>
