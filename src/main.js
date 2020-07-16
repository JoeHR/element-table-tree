/*
 * @Author: rh
 * @Date: 2020-07-08 09:48:20
 * @LastEditTime: 2020-07-16 15:53:42
 * @LastEditors: rh
 * @Description: 命名规范
 * @变量: - 小驼峰式命名法（前缀应当是名词）
 * @常量: - 全大写（使用大写字母和下划线来组合命名，下划线用以分割单词）
 * @函数:  - 小驼峰式命名法（前缀应当为动词）
 * @这不是一个 bug，这只是一个未列出来的特性
 */
import Vue from 'vue'
import App from './App.vue'
import store from './store'
import { Tree, Checkbox, Button } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false

Vue.use(Tree)
Vue.use(Checkbox)
Vue.use(Button)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
