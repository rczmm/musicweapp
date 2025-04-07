import { createApp } from 'vue'
import SplashScreen from './components/SplashScreen/index.vue'

import './app.scss';

const App = createApp({
  onShow() {
    // 应用显示时的逻辑
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

// 注册全局组件
App.component('SplashScreen', SplashScreen)

export default App
