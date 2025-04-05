<template>
  <view class="playlist-panel" :class="{ 'visible': visible }">
    <!-- 顶部标题栏 -->
    <view class="panel-header">
      <view class="header-left">
        <text class="play-mode" @tap="togglePlayMode">{{ playModeIcon }}</text>
        <text class="mode-text">{{ playModeText }}</text>
      </view>
      <text class="header-title">播放列表 ({{ songs.length }})</text>
      <view class="header-right">
        <text class="clear-button" @tap="clearPlaylist">清空</text>
      </view>
    </view>

    <!-- 歌曲列表 -->
    <view class="songs-container">
      <view 
        v-for="(song, index) in songs" 
        :key="song.id"
        class="song-item"
        :class="{ 'active': currentSongId === song.id }"
        @tap="playSong(song)"
      >
        <view class="song-info">
          <text class="playing-icon" v-if="currentSongId === song.id">♫</text>
          <text class="song-title">{{ song.title }}</text>
          <text class="song-artist">{{ song.artist }}</text>
        </view>
        <view class="song-actions">
          <text class="like-button" :class="{ 'liked': song.liked }" @tap.stop="toggleLike(song)">♥</text>
          <text class="delete-button" @tap.stop="removeSong(index)">×</text>
        </view>
      </view>

      <!-- 空列表提示 -->
      <view class="empty-list" v-if="songs.length === 0">
        <text>播放列表为空</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="panel-footer">
      <view class="add-button" @tap="addSongs">
        <text class="add-icon">+</text>
        <text>添加歌曲</text>
      </view>
      <view class="close-button" @tap="close">
        <text>关闭</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Taro from '@tarojs/taro'
import { audioService, PlayMode, Song } from '../../services/audioService'

// 定义组件的props
const props = defineProps({
  // 是否可见
  visible: {
    type: Boolean,
    default: false
  },
  // 歌曲列表
  songs: {
    type: Array as () => Song[],
    default: () => []
  },
  // 当前播放的歌曲ID
  currentSongId: {
    type: String,
    default: ''
  }
})

// 定义事件
const emit = defineEmits(['close', 'play', 'remove', 'clear', 'add', 'toggleLike'])

// 响应式状态
const playMode = ref(audioService.playMode)

// 计算播放模式图标
const playModeIcon = computed(() => {
  switch (playMode.value) {
    case PlayMode.REPEAT:
      return '🔁'
    case PlayMode.REPEAT_ONE:
      return '🔂'
    case PlayMode.SHUFFLE:
      return '🔀'
    default:
      return '🔁'
  }
})

// 计算播放模式文本
const playModeText = computed(() => {
  switch (playMode.value) {
    case PlayMode.REPEAT:
      return '列表循环'
    case PlayMode.REPEAT_ONE:
      return '单曲循环'
    case PlayMode.SHUFFLE:
      return '随机播放'
    default:
      return '列表循环'
  }
})

// 切换播放模式
const togglePlayMode = () => {
  playMode.value = audioService.togglePlayMode()
}

// 播放歌曲
const playSong = (song: Song) => {
  emit('play', song)
}

// 移除歌曲
const removeSong = (index: number) => {
  emit('remove', index)
}

// 清空播放列表
const clearPlaylist = () => {
  Taro.showModal({
    title: '清空播放列表',
    content: '确定要清空当前播放列表吗？',
    success: (res) => {
      if (res.confirm) {
        emit('clear')
      }
    }
  })
}

// 添加歌曲
const addSongs = () => {
  emit('add')
}

// 切换喜欢状态
const toggleLike = (song: Song) => {
  emit('toggleLike', song)
}

// 关闭面板
const close = () => {
  emit('close')
}

// 监听audioService的播放模式变化
watch(() => audioService.playMode, (newMode) => {
  playMode.value = newMode
})
</script>

<style lang="scss">
.playlist-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70vh;
  background-color: #fff;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &.visible {
    transform: translateY(0);
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 30px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    
    .header-left {
      display: flex;
      align-items: center;
      
      .play-mode {
        font-size: 32px;
        margin-right: 10px;
        color: #666;
      }
      
      .mode-text {
        font-size: 24px;
        color: #999;
      }
    }
    
    .header-title {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }
    
    .header-right {
      .clear-button {
        font-size: 24px;
        color: #999;
      }
    }
  }
  
  .songs-container {
    flex: 1;
    padding: 0 20px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: calc(100% - 120px); /* 减去头部和底部的高度 */
    max-height: 60vh;
    
    .song-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 15px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      margin-bottom: 4px;
      
      &.active {
        background-color: rgba(255, 78, 78, 0.05);
        
        .song-title {
          color: #ff4e4e;
          font-weight: bold;
        }
      }
      
      .song-info {
        display: flex;
        align-items: center;
        flex: 1;
        overflow: hidden;
        margin-right: 15px;
        
        .playing-icon {
          color: #ff4e4e;
          font-size: 28px;
          margin-right: 12px;
          width: 28px;
          text-align: center;
        }
        
        .song-title {
          font-size: 28px;
          color: #333;
          margin-right: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 280px;
          font-weight: 500;
        }
        
        .song-artist {
          font-size: 24px;
          color: #999;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }
      }
      
      .song-actions {
        display: flex;
        align-items: center;
        min-width: 90px;
        justify-content: flex-end;
        
        .like-button {
          font-size: 30px;
          color: #ccc;
          margin-right: 24px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          &.liked {
            color: #ff4e4e;
          }
        }
        
        .delete-button {
          font-size: 32px;
          color: #ccc;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
    
    .empty-list {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      color: #ccc;
      font-size: 28px;
    }
  }
  
  .panel-footer {
    display: flex;
    justify-content: space-between;
    padding: 20px 30px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    
    .add-button {
      display: flex;
      align-items: center;
      color: #ff4e4e;
      font-size: 28px;
      
      .add-icon {
        margin-right: 8px;
        font-size: 32px;
      }
    }
    
    .close-button {
      color: #999;
      font-size: 28px;
    }
  }
}
</style>