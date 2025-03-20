<template>
  <view class="mini-player">
    <!-- 专辑封面 -->
    <view class="album-cover" @tap="navigateToPlayer">
      <image :src="currentSong.cover" class="cover-image"/>
    </view>

    <!-- 歌曲信息 -->
    <view class="song-info" @tap="navigateToPlayer">
      <view class="marquee-container">
        <view class="marquee-content" :class="{ 'scrolling': isTextOverflow }">
          <text class="song-title">{{ currentSong.title }}</text>
          <text class="song-artist"> - {{ currentSong.artist }}</text>
        </view>
      </view>
    </view>

    <!-- 播放控制 -->
    <view class="playback-controls">
      <view class="play-button-container">
        <view class="progress-circle">
          <view class="progress-circle-bg"></view>
          <view
            class="progress-circle-fill"
            :style="{ transform: `rotate(${progressDegrees}deg)` }"
          ></view>
        </view>
        <view class="play-button" @tap="togglePlay">
          <text v-if="!isPlaying" class="play-icon">▶</text>
          <text v-else class="pause-icon">❚❚</text>
        </view>
      </view>
      <view class="playlist-button" @tap="showPlaylist">
        <text class="playlist-icon">☰</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import Taro from '@tarojs/taro'
import { audioService } from '../../services/audioService'

// 定义组件的props
const props = defineProps({
  // 当前播放的歌曲信息
  song: {
    type: Object,
    default: () => ({
      id: '1',
      title: '来日方长',
      artist: '黄龄/薛之谦',
      cover: 'https://picsum.photos/100/100?random=1',
      duration: 240, // 歌曲时长（秒）
    })
  },
  // 是否正在播放
  playing: {
    type: Boolean,
    default: false
  },
  // 当前播放进度（0-1之间的小数）
  progress: {
    type: Number,
    default: 0
  }
})

// 定义事件
const emit = defineEmits(['play', 'pause', 'showPlaylist'])

// 响应式状态
const isPlaying = ref(props.playing)
const currentProgress = ref(props.progress)
const isTextOverflow = ref(false)

// 计算当前歌曲信息
const currentSong = computed(() => props.song)

// 计算进度条角度（用于圆形进度条）
const progressDegrees = computed(() => {
  return currentProgress.value * 360
})

// 监听props变化
watch(() => props.playing, (newVal) => {
  isPlaying.value = newVal
})

watch(() => props.progress, (newVal) => {
  currentProgress.value = newVal
})

// 切换播放/暂停状态
const togglePlay = () => {
  if (!isPlaying.value) {
    audioService.play()
    emit('play')
  } else {
    audioService.pause()
    emit('pause')
  }
  // 状态会通过audioService的事件回调更新
}

// 显示播放列表
const showPlaylist = () => {
  emit('showPlaylist')
}

// 跳转到播放器详情页
const navigateToPlayer = () => {
  Taro.navigateTo({
    url: '/pages/player/index'
  })
}

// 检查文本是否溢出需要滚动并设置音频事件监听
onMounted(() => {
  // 在实际应用中，这里应该有检测文本宽度的逻辑
  // 简化起见，这里假设文本总是需要滚动
  isTextOverflow.value = true
  
  // 监听音频服务的事件
  audioService.onPlay(() => {
    isPlaying.value = true
  })
  
  audioService.onPause(() => {
    isPlaying.value = false
  })
  
  audioService.onTimeUpdate((currentTime, duration, progress) => {
    currentProgress.value = progress
  })
  
  // 同步当前状态
  isPlaying.value = audioService.isPlaying
  currentProgress.value = audioService.progress
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  // 实际应用中应该移除事件监听，但audioService目前没有提供移除单个监听器的方法
  // 这里不调用removeAllListeners()，因为可能会影响其他组件
})
</script>

<style lang="scss">
.mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  z-index: 999;

  // 专辑封面
  .album-cover {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20px;
    flex-shrink: 0;

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  // 歌曲信息
  .song-info {
    flex: 1;
    overflow: hidden;

    .marquee-container {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
    }

    .marquee-content {
      display: inline-block;

      &.scrolling {
        animation: marquee 10s linear infinite;
      }
    }

    .song-title {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }

    .song-artist {
      font-size: 24px;
      color: #666;
    }
  }

  // 播放控制
  .playback-controls {
    display: flex;
    align-items: center;
    margin-left: 20px;

    .play-button-container {
      position: relative;
      width: 60px;
      height: 60px;
      margin-right: 20px;
    }

    .progress-circle {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;

      .progress-circle-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid #eee;
        box-sizing: border-box;
      }

      .progress-circle-fill {
        position: absolute;
        top: 0;
        left: 0;
        width: 50%;
        height: 100%;
        transform-origin: right center;
        background-color: transparent;

        &::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          width: 200%;
          height: 100%;
          border-radius: 100% 0 0 100% / 50% 0 0 50%;
          border: 2px solid #1aad19;
          box-sizing: border-box;
          transform-origin: right center;
        }
      }
    }

    .play-button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #1aad19;
      display: flex;
      align-items: center;
      justify-content: center;

      .play-icon {
        font-size: 24px;
        color: white;
        margin-left: 4px; /* 调整播放图标位置 */
      }

      .pause-icon {
        font-size: 20px;
        color: white;
      }
    }

    .playlist-button {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;

      .playlist-icon {
        font-size: 30px;
        color: #666;
      }
    }
  }
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
