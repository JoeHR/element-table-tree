<!--
 * @Author: rh
 * @Date: 2020-07-08 10:12:00
 * @LastEditTime: 2020-07-27 16:15:09
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
-->
<template>
  <div id="app">
    <table-tree style="height:100%;" :tree-props="treeProps" node-key="index" showCheckbox :data="data">
      <table-tree-column label="使用单位" prop="useUnitName"></table-tree-column>
      <table-tree-column label="区县" prop="townName"></table-tree-column>
      <table-tree-column label="街道" prop="streetName"></table-tree-column>
      <table-tree-column label="电梯使用地址" prop="detailAddress"></table-tree-column>
      <table-tree-column label="内部编号" prop="innerNo"></table-tree-column>
      <table-tree-column label="注册代码" prop="registerCode"></table-tree-column>
      <table-tree-column label="认领状态" prop="claimStatus">
        <template  slot-scope="{row}">
          {{row.claimStatus | claimStatusFilter}}
        </template>
      </table-tree-column>
      <table-tree-column label="处理状态" prop="operateType"></table-tree-column>
      <table-tree-column label="是否本单位维保">
        <template slot-scope="scope">
          <el-button type="text" class="mybtn" @click="showClick(scope)" v-show="scope.row.registerCode">操作</el-button>
          <el-button type="text" class="mybtn" @click="showClick(scope)" v-show="scope.row.registerCode">撤销</el-button>
        </template>
      </table-tree-column>
    </table-tree>
  </div>
</template>
<script>
import { data } from './assets/data'
export default {
  name: 'App',
  filters: {
    claimStatusFilter (value) {
      if (typeof value === 'undefined') {
        return ''
      } else {
        return value === 1 ? '已认领' : '未认领'
      }
    }
  },
  data () {
    return {
      data: data,
      treeProps: {
        label: 'useUnitName',
        children: 'children',
        disabled: (data, node) => {
          if (!data.registerCode) {
            return false
          } else if (data.operateType) {
            return true
          } else {
            return false
          }
        }
      }
    }
  },
  methods: {
    showClick (data) {
      console.log(data)
    }
  }
}
</script>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 80%;
  height: 100%;
  margin: 0 auto;
}
</style>
