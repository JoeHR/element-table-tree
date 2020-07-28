<!--
 * @Author: rh
 * @Date: 2020-07-08 09:48:20
 * @LastEditTime: 2020-07-28 16:03:08
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
-->
<template>
  <div class="rh-table-tree el-table el-table--border">
    <div class="hidden-columns" ref="hiddenColumns">
      <slot></slot>
    </div>
    <div class="rh-table-header el-table__header-wrapper">
      <div class="rh-check-header"  v-if="showCheckbox">
        <el-checkbox
          :disabled="store.states.data && store.states.data.length === 0"
          :indeterminate="store.states.selection.length > 0 && !isAllSelected"
          @click.native="toggleAllSelection"
          v-model="isAllSelected"/>
      </div>
      <tt-header
        ref="ttHeader"
        :store="store"
        :border="border"
        :style="{width:layout.bodyWidth?layout.bodyWidth+'px':'',marginLeft:showCheckbox?'5px':'24px'}"
      ></tt-header>
    </div>
    <div class="rh-table-wrapper" ref="bodyWrapper" style="height:calc(100% - 48px)">
      <div class="table-wrapper" style="height:100%;">
        <el-scrollbar wrapClass="scroll-wrap" viewClass="scroll-view" style="height:100%;width:100%;overflow-x:hidden;">
          <table class="el-table-header" cellspacing="0" cellpadding="0" border="0">
            <template v-if="showCheckbox">
              <el-tree :data="data" show-checkbox :defaultExpandAll="defaultExpandAll" :props="treeProps" :node-key="nodeKey" class="tableTree" ref="rhTree" @check-change="checkChange">
                <template slot-scope="{node,data}">
                  <tt-body
                    ref="ttBody"
                    :node="node"
                    :layout="layout"
                    :data="data"
                    :context="context"
                    :row-class-name="rowClassName"
                    :row-style="rowStyle"
                    :highlight="highlightCurrentRow"
                    :store="store"
                    :style="{width:layout.bodyWidth?layout.bodyWidth+'px':''}"
                  ></tt-body>
                </template>
              </el-tree>
            </template>
            <template v-else>
              <el-tree :data="data" :props="treeProps" :defaultExpandAll="defaultExpandAll" :node-key="nodeKey" class="tableTree" ref="rhTree" @check-change="checkChange">
                <template slot-scope="{node,data}">
                  <tt-body
                    ref="ttBody"
                    :node="node"
                    :layout="layout"
                    :data="data"
                    :context="context"
                    :row-class-name="rowClassName"
                    :row-style="rowStyle"
                    :highlight="highlightCurrentRow"
                    :store="store"
                    :style="{width:layout.bodyWidth?layout.bodyWidth+'px':''}"
                  ></tt-body>
                </template>
              </el-tree>
            </template>
          </table>
        </el-scrollbar>
      </div>
    </div>
    <div class="el-table__column-resize-proxy" ref="resizeProxy" v-show="resizeProxyVisible"></div>
  </div>
</template>

<script>
import TableTreeLayout from './layout'
import ttHeader from './header.js'
import ttBody from './body.js'
import { createStore, mapStates } from './store/helper'
import { addResizeListener } from './utils/resize-event'
import { debounce, throttle } from 'throttle-debounce'
import { parseHeight } from './utils/util'

let tableIdSeed = 1

export default {
  name: 'TableTree',

  components: {
    ttHeader,
    ttBody
  },

  props: {
    showCheckbox: {
      type: Boolean,
      default: false
    },

    data: {
      type: Array,
      default: function () {
        return []
      }
    },

    treeProps: {
      default () {
        return {
          children: 'children',
          label: 'label',
          disabled: 'disabled'
        }
      }
    },

    nodeKey: [String],

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

    highlightCurrentRow: Boolean,

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
    },

    defaultExpandAll: Boolean,

    selectOnIndeterminate: {
      type: Boolean,
      default: true
    }

  },

  data () {
    this.store = createStore(this, {
      rowKey: this.rowKey,
      defaultExpandAll: this.defaultExpandAll,
      selectOnIndeterminate: this.selectOnIndeterminate
    })
    const layout = new TableTreeLayout({
      store: this.store,
      table: this,
      fit: this.fit,
      showHeader: this.showHeader
    })
    return {
      layout,
      isAllSelected: false,
      isHidden: false,
      resizeProxyVisible: false,
      resizeState: {
        width: null,
        height: null
      },
      store: this.store
    }
  },

  computed: {
    bodyWrapper () {
      return this.$refs.bodyWrapper
    },

    rhTree () {
      return this.$refs.rhTree
    },

    selection () {
      return this.store.states.selection
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

  watch: {
    data: {
      immediate: true,
      handler (value) {
        this.store.commit('setData', value)
      }
    },
    selection: {
      immediate: false,
      deep: false,
      handler (value) {
        this.$emit('select-change', value)
      }
    }
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
    },

    toggleAllSelection (event) {
      event.stopPropagation()
      this.store.commit('toggleAllSelection')
    },

    checkChange (dataNode, isCheck, childHasCheck) {
      const rhTree = this.rhTree
      this.store.updateAllSelected()
      throttle(100, () => this.$emit('check-change', dataNode, isCheck, childHasCheck, rhTree))
    }
  }

}
</script>

<style lang="scss" scoped>
.rh-table-tree{
  &.el-table--border{
    border:none;
    &::after{
      width:0;
    }
  }
  .rh-table-header{
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    background: #9baabe;
    .rh-check-header{
      padding-left: 24px;
      padding-right: 2px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .el-table-header{
      background: #9baabe;
      /deep/ tr{
          color: #fff;
      }
    }
  }
  /deep/ .scroll-wrap{
    height: 100%;
    overflow-x: hidden;
  }
  /deep/ .el-scrollbar__bar.is-horizontal{
      display: none;
    }
  /deep/ th,/deep/ td,/deep/ tr{
    border: none;
    background:transparent;
  }
  /deep/ .el-tree-node__content{
    padding-left: 0 !important;
    min-height: 44px;
    // height: auto;
    border-bottom: 1px solid #EBEEF5;
    tr{
      // padding: 12px 0;
      td{
        padding: 0;
        .cell{
          white-space: nowrap;
          line-height: 44px;
        }
      }
    }
  }
  /deep/ .scroll-wrap{
    margin-bottom: 0 !important;
  }
}
</style>
