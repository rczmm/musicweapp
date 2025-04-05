<template>
  <view class="lyric-scroller" :class="{ 'expanded': expanded }">
    <!-- 歌词展开/收起按钮 -->
    <view class="lyric-toggle" @tap="toggleExpand">
      <text>{{ expanded ? '收起歌词' : '展开歌词' }}</text>
      <text class="toggle-icon">{{ expanded ? '▲' : '▼' }}</text>
    </view>
    
    <!-- 歌词滚动区域 -->
    <view 
      class="lyric-container" 
      @tap="handleLyricTap"
      :style="{scrollTop: scrollTop + 'px'}"
    >
      <view 
        v-for="(line, index) in parsedLyrics" 
        :key="index"
        :id="`lyric-line-${index}`"
        class="lyric-line"
        :class="{ 'active': currentLineIndex === index }"
        :data-time="line.time"
      >
        <text>{{ line.text }}</text>
      </view>
      
      <!-- 如果没有歌词，显示提示信息 -->
      <view v-if="parsedLyrics.length === 0" class="no-lyric">
        <text>暂无歌词</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Taro from '@tarojs/taro'

// 定义组件的props
const props = defineProps({
  // 歌词内容（LRC格式的字符串）
  lyrics: {
    type: String,
    default: ''
  },
  // 当前播放时间（秒）
  currentTime: {
    type: Number,
    default: 0
  },
  // 是否自动滚动
  autoScroll: {
    type: Boolean,
    default: true
  }
})

// 定义事件
const emit = defineEmits(['seek'])

// 响应式状态
const expanded = ref(false)  // 是否展开歌词
const scrollTop = ref(0)     // 滚动位置
const currentLineIndex = ref(-1) // 当前高亮的歌词行索引
const lineHeights = ref<number[]>([]) // 每行歌词的高度
const lyricLineElements = ref<any[]>([]) // 歌词行元素引用

// 解析LRC格式的歌词
const parsedLyrics = computed(() => {
  if (!props.lyrics) return []
  
  const lines = props.lyrics.split('\n')
  const result: { time: number; text: string }[] = []
  
  // 正则表达式匹配时间标签 [mm:ss.xx]
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g
  
  lines.forEach(line => {
    // 跳过空行
    if (!line.trim()) return
    
    // 提取所有时间标签
    const timeMatches = [...line.matchAll(timeRegex)]
    if (timeMatches.length === 0) return
    
    // 提取歌词文本（去除时间标签）
    const text = line.replace(timeRegex, '').trim()
    if (!text) return
    
    // 为每个时间标签创建一个歌词行对象
    timeMatches.forEach(match => {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const milliseconds = parseInt(match[3])
      
      // 计算总时间（秒）
      const time = minutes * 60 + seconds + milliseconds / (match[3].length === 2 ? 100 : 1000)
      
      result.push({ time, text })
    })
  })
  
  // 按时间排序
  return result.sort((a, b) => a.time - b.time)
})

// 切换歌词展开/收起状态
const toggleExpand = () => {
  expanded.value = !expanded.value
  
  // 如果展开，确保当前行可见
  if (expanded.value && currentLineIndex.value >= 0) {
    scrollToLine(currentLineIndex.value)
  }
}

// 处理歌词点击事件（跳转到对应时间）
const handleLyricTap = (e: any) => {
  if (!expanded.value) return
  
  // 获取点击位置的歌词行
  const query = Taro.createSelectorQuery()
  query.selectAll('.lyric-line').boundingClientRect(rects => {
    if (!rects || rects.length === 0) return
    
    const touch = e.touches[0] || e.changedTouches[0]
    const touchY = touch.clientY
    
    // 找到点击的歌词行
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i]
      if (touchY >= rect.top && touchY <= rect.bottom) {
        // 获取该行的时间
        const time = parsedLyrics.value[i]?.time
        if (time !== undefined) {
          // 发送seek事件
          emit('seek', time)
        }
        break
      }
    }
  })
  query.exec()
}

// 滚动到指定行
const scrollToLine = (lineIndex: number) => {
  if (lineIndex < 0 || lineIndex >= parsedLyrics.value.length) return
  
  // 计算目标滚动位置
  let targetScrollTop = 0
  for (let i = 0; i < lineIndex; i++) {
    targetScrollTop += lineHeights.value[i] || 0
  }
  
  // 居中显示当前行
  const query = Taro.createSelectorQuery()
  query.select('.lyric-container').boundingClientRect(rect => {
    if (!rect) return
    
    const containerHeight = rect.height
    const lineHeight = lineHeights.value[lineIndex] || 0
    
    // 调整滚动位置，使当前行居中
    targetScrollTop = Math.max(0, targetScrollTop - (containerHeight / 2) + (lineHeight / 2))
    scrollTop.value = targetScrollTop
  })
  query.exec()
}

// 根据当前时间更新高亮的歌词行
const updateCurrentLine = () => {
  const time = props.currentTime
  let index = -1
  
  // 找到当前时间对应的歌词行
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (parsedLyrics.value[i].time <= time) {
      index = i
    } else {
      break
    }
  }
  
  // 如果找到了对应的行，并且与当前高亮行不同
  if (index !== -1 && index !== currentLineIndex.value) {
    currentLineIndex.value = index
    
    // 如果启用了自动滚动，滚动到当前行
    if (props.autoScroll && expanded.value) {
      scrollToLine(index)
    }
  }
}

// 测量每行歌词的高度
const measureLineHeights = () => {
  const query = Taro.createSelectorQuery()
  query.selectAll('.lyric-line').boundingClientRect(rects => {
    if (!rects || rects.length === 0) return
    
    lineHeights.value = rects.map(rect => rect.height)
    lyricLineElements.value = rects
    
    // 初始滚动到当前行
    if (currentLineIndex.value >= 0 && expanded.value) {
      scrollToLine(currentLineIndex.value)
    }
  })
  query.exec()
}

// 监听当前时间变化
watch(() => props.currentTime, () => {
  updateCurrentLine()
})

// 监听歌词内容变化
watch(() => props.lyrics, () => {
  currentLineIndex.value = -1
  scrollTop.value = 0
  
  // 在下一个渲染周期测量行高
  setTimeout(() => {
    measureLineHeights()
    updateCurrentLine()
  }, 50)
})

// 监听展开状态变化
watch(() => expanded.value, () => {
  // 在状态变化后重新测量行高
  setTimeout(() => {
    measureLineHeights()
  }, 300) // 等待展开/收起动画完成
})

// 组件挂载时
onMounted(() => {
  // 初始测量行高
  setTimeout(() => {
    measureLineHeights()
    updateCurrentLine()
  }, 50)
})
</script>

<style lang="scss">
.lyric-scroller {
  width: 100%;
  transition: height 0.3s ease;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  margin: 20px 0;
  height: 80px; // 默认收起状态的高度
  
  &.expanded {
    height: 400px; // 展开状态的高度
  }
  
  .lyric-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
    font-size: 24px;
    color: #888;
    
    .toggle-icon {
      margin-left: 8px;
    }
  }
  
  .lyric-container {
    height: calc(100% - 44px); // 减去切换按钮的高度
    padding: 0 20px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    transition: scroll-top 0.3s ease;
    
    .lyric-line {
      padding: 12px 0;
      text-align: center;
      font-size: 28px;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s ease;
      
      &.active {
        color: #fff;
        font-size: 32px;
        font-weight: bold;
      }
    }
    
    .no-lyric {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      color: rgba(255, 255, 255, 0.4);
      font-size: 28px;
    }
  }
}
</style>