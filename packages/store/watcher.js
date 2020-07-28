/*
 * @Author: rh
 * @Date: 2020-07-08 17:45:32
 * @LastEditTime: 2020-07-28 15:03:47
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */
import Vue from 'vue'

const doFlattenColumns = (columns) => {
  const result = []
  columns.forEach(column => {
    if (column.children) {
      result.push.apply(result, doFlattenColumns(column.children))
    } else {
      result.push(column)
    }
  })
  return result
}

export default Vue.extend({
  data () {
    return {
      states: {
        rowKey: null,
        data: [],
        isAllSelected: false,
        selection: [],
        selectOnIndeterminate: false,
        selectable: null,
        // 列
        _columns: [], // 不可响应的
        originColumns: [],
        columns: [],
        fixedColumns: [],
        rightFixedColumns: []
      }
    }
  },

  mixins: [],

  methods: {

    // 更新列
    updateColumns () {
      const states = this.states
      const _columns = states._columns || []
      states.fixedColumns = _columns.filter(column => column.fixed === true || column.fixed === 'left')
      states.rightFixedColumns = _columns.filter(column => column.fixed === 'right')

      if (states.fixedColumns.length > 0 && _columns[0] && !_columns[0].fixed) {
        _columns[0].fixed = true
        states.fixedColumns.unshift(_columns[0])
      }

      const notFixedColumns = _columns.filter(column => !column.fixed)
      states.originColumns = [].concat(states.fixedColumns).concat(notFixedColumns).concat(states.rightFixedColumns)

      const leafColumns = doFlattenColumns(notFixedColumns)
      const fixedLeafColumns = doFlattenColumns(states.fixedColumns)
      const rightFixedLeafColumns = doFlattenColumns(states.rightFixedColumns)

      states.leafColumnsLength = leafColumns.length
      states.fixedLeafColumnsLength = fixedLeafColumns.length
      states.rightFixedLeafColumnsLength = rightFixedLeafColumns.length

      states.columns = [].concat(fixedLeafColumns).concat(leafColumns).concat(rightFixedLeafColumns)
      states.isComplex = states.fixedColumns.length > 0 || states.rightFixedColumns.length > 0
    },

    scheduleLayout (needUpdateColumns) {
      if (needUpdateColumns) {
        this.updateColumns()
      }
      this.table.debouncedUpdateLayout()
    },

    _toggleAllSelection () {
      const { table, states } = this
      const { rhTree } = table
      table.$nextTick(() => {
        const { data } = states
        if (table.isAllSelected) {
          rhTree.setCheckedNodes(data)
        } else {
          rhTree.setCheckedNodes([])
          states.selection = []
        }
        this.table.$emit('select-all', states.selection)
      })
    },

    clearSelection () {
      const states = this.states
      states.isAllSelected = false
      const oldSelection = states.selection
      if (oldSelection.length) {
        states.selection = []
        this.table.$emit('check-change', [])
      }
    },

    updateAllSelected () {
      const { states } = this
      const table = this.table
      table.$nextTick(() => {
        const { rhTree } = table
        const { data } = states
        const halfCheckedNodes = rhTree.getHalfCheckedNodes()
        const checkedNodes = rhTree.getCheckedNodes()
        const checkedLeafNodes = rhTree.getCheckedNodes(true)
        const level1DisLen = checkedNodes.length - checkedLeafNodes.length
        if (halfCheckedNodes.length) {
          table.isAllSelected = false
        } else if (!halfCheckedNodes.length && level1DisLen === data.length) {
          table.isAllSelected = true
        } else if (!halfCheckedNodes.length && !checkedNodes.length) {
          table.isAllSelected = false
        } else {
          table.isAllSelected = false
        }
        states.selection = checkedNodes
        if (table.isAllSelected) {
          table.$emit('select-all', states.selection)
        }
      })
    }
  }

})
