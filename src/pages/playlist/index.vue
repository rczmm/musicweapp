<template>
  <view class="playlist-page">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">⟨</text>
      </view>
      <view class="title">歌单详情</view>
      <view class="more-button" @tap="showMoreOptions">
        <text class="more-icon">⋮</text>
      </view>
    </view>

    <!-- 歌单信息区域 -->
    <view class="playlist-info-section">
      <view class="playlist-header">
        <image class="playlist-cover" :src="playlistInfo.cover" mode="aspectFill" />
        <view class="playlist-details">
          <text class="playlist-title">{{ playlistInfo.title }}</text>
          <text class="playlist-creator">{{ playlistInfo.creator }}</text>
          <text class="playlist-desc">{{ playlistInfo.description }}</text>
          <view class="playlist-stats">
            <text class="playlist-play-count">{{ playlistInfo.playCount }}次播放</text>
            <text class="playlist-collect-count">{{ playlistInfo.collectCount }}次收藏</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-button play" @tap="playAll">
          <text class="play-icon">▶</text>
          <text>播放全部</text>
        </view>
        <view class="action-button collect" @tap="collectPlaylist">
          <text class="collect-icon">♡</text>
          <text>收藏</text>
        </view>
        <view class="action-button comment" @tap="showComments">
          <text class="comment-icon">💬</text>
          <text>评论</text>
        </view>
        <view class="action-button share" @tap="sharePlaylist">
          <text class="share-icon">↗</text>
          <text>分享</text>
        </view>
      </view>
    </view>

    <!-- 歌曲列表 -->
    <view class="song-list-section">
      <view class="section-header">
        <text class="section-title">歌曲列表</text>
        <text class="song-count">共{{ playlistSongs.length }}首</text>
      </view>

      <view 
        v-for="(song, index) in playlistSongs" 
        :key="song.id" 
        class="song-item"
        @tap="playSong(song)"
      >
        <text class="song-index">{{ index + 1 }}</text>
        <view class="song-info">
          <text class="song-title">{{ song.title }}</text>
          <view class="song-meta">
            <text v-if="song.isHQ" class="hq-tag">HQ</text>
            <text class="song-artist">{{ song.artist }}</text>
          </view>
        </view>
        <view class="song-actions">
          <text class="more-icon">⋮</text>
        </view>
      </view>
    </view>

    <!-- 相似歌单推荐 -->
    <view class="similar-section">
      <view class="section-header">
        <text class="section-title">相似歌单</text>
        <text class="more-text">更多 ></text>
      </view>

      <scroll-view class="similar-playlists" scroll-x>
        <view 
          v-for="(playlist, index) in similarPlaylists" 
          :key="playlist.id" 
          class="similar-playlist-item"
          @tap="openPlaylist(playlist)"
        >
          <image :src="playlist.cover" class="similar-playlist-cover" mode="aspectFill" />
          <text class="similar-playlist-title">{{ playlist.title }}</text>
          <text class="similar-playlist-creator">by {{ playlist.creator }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 迷你播放器组件 -->
    <mini-player 
      :song="currentPlayingSong" 
      :playing="isPlaying" 
      :progress="playProgress"
      @play="handlePlay"
      @pause="handlePause"
      @showPlaylist="handleShowPlaylist"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'
import MiniPlayer from '../../components/MiniPlayer/index.vue'

// 歌单信息
const playlistInfo = ref({
  id: '1',
  title: '华语流行热歌榜',
  creator: '音乐编辑部',
  cover: 'https://picsum.photos/300/300?random=10',
  description: '精选华语流行音乐热门歌曲，每周更新，让你随时了解最新流行趋势。',
  playCount: '3.5亿',
  collectCount: '256.8万',
  songCount: 50,
  updateTime: '每周五更新'
})

// 歌单歌曲列表
const playlistSongs = ref([
  {
    id: '201',
    title: '起风了',
    artist: '买辣椒也用券',
    duration: '5:22',
    isHQ: true
  },
  {
    id: '202',
    title: 'Former',
    artist: '隔壁老樊',
    duration: '4:45',
    isHQ: true
  },
  {
    id: '203',
    title: '世间美好与你环环相扣',
    artist: '柏松',
    duration: '4:30',
    isHQ: false
  },
  {
    id: '204',
    title: '阿拉斯加海湾',
    artist: '蓝心羽',
    duration: '3:18',
    isHQ: true
  },
  {
    id: '205',
    title: '句号',
    artist: '邓紫棋',
    duration: '4:12',
    isHQ: true
  },
  {
    id: '206',
    title: '光年之外',
    artist: '邓紫棋',
    duration: '3:55',
    isHQ: true
  },
  {
    id: '207',
    title: '倒数',
    artist: '邓紫棋',
    duration: '3:49',
    isHQ: false
  },
  {
    id: '208',
    title: '可惜没如果',
    artist: '林俊杰',
    duration: '4:28',
    isHQ: true
  }
])

// 相似歌单推荐
const similarPlaylists = ref([
  {
    id: '2',
    title: '欧美流行热歌榜',
    creator: '国际音乐部',
    cover: 'https://picsum.photos/200/200?random=11'
  },
  {
    id: '3',
    title: '抖音热歌榜',
    creator: '短视频音乐部',
    cover: 'https://picsum.photos/200/200?random=12'
  },
  {
    id: '4',
    title: '经典老歌榜',
    creator: '怀旧音乐部',
    cover: 'https://picsum.photos/200/200?random=13'
  },
  {
    id: '5',
    title: '新歌速递榜',
    creator: '新歌推广部',
    cover: 'https://picsum.photos/200/200?random=14'
  }
])

// 播放器相关状态
const currentPlayingSong = ref({
  id: '',
  title: '',
  artist: '',
  cover: '',
  duration: 0
})
const isPlaying = ref(false)
const playProgress = ref(0)

// 返回上一页
const goBack = () => {
  Taro.navigateBack()
}

// 显示更多选项
const showMoreOptions = () => {
  Taro.showActionSheet({
    itemList: ['下载全部', '添加到我的歌单', '设为私密收藏', '举报'],
    success: function (res) {
      console.log('选择了第' + (res.tapIndex + 1) + '个选项')
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  })
}

// 播放全部歌曲
const playAll = () => {
  if (playlistSongs.value.length > 0) {
    playSong(playlistSongs.value[0])
  }
}

// 播放单曲
const playSong = (song) => {
  currentPlayingSong.value = {
    id: song.id,
    title: song.title,
    artist: song.artist,
    cover: playlistInfo.value.cover,
    duration: song.duration || 240
  }
  
  isPlaying.value = true
  playProgress.value = 0
  
  console.log('播放歌曲:', song.title)
}

// 收藏歌单
const collectPlaylist = () => {
  Taro.showToast({
    title: '收藏成功',
    icon: 'success',
    duration: 2000
  })
}

// 显示评论
const showComments = () => {
  Taro.navigateTo({
    url: `/pages/comments/index?id=${playlistInfo.value.id}&type=playlist`
  })
}

// 分享歌单
const sharePlaylist = () => {
  Taro.showShareMenu({
    withShareTicket: true
  })
}

// 打开歌单详情
const openPlaylist = (playlist) => {
  Taro.navigateTo({
    url: `/pages/playlist/index?id=${playlist.id}`
  })
}

// 播放器相关方法
const handlePlay = () => {
  isPlaying.value = true
  console.log('开始播放:', currentPlayingSong.value.title)
}

const handlePause = () => {
  isPlaying.value = false
  console.log('暂停播放:', currentPlayingSong.value.title)
}

const handleShowPlaylist = () => {
  console.log('显示播放列表')
}

// 页面加载时
onMounted(() => {
  // 获取路由参数
  const params = Taro.getCurrentInstance().router.params
  const playlistId = params.id
  
  // 这里可以根据playlistId加载实际数据
  console.log('加载歌单ID:', playlistId)
})
</script>

<style lang="scss">
.playlist-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: linear-gradient(to right, #ff2c54, #ff6b81);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .back-button, .more-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .back-icon, .more-icon {
      font-size: 40rpx;
    }
  }
  
  .title {
    font-size: 32rpx;
    font-weight: bold;
  }
}

/* 歌单信息区域 */
.playlist-info-section {
  padding: 30rpx;
  background: linear-gradient(to bottom, #ff6b81, #f8f9fa);
  
  .playlist-header {
    display: flex;
    margin-bottom: 30rpx;
    
    .playlist-cover {
      width: 240rpx;
      height: 240rpx;
      border-radius: 20rpx;
      box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
      margin-right: 30rpx;
    }
    
    .playlist-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      
      .playlist-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
        margin-bottom: 10rpx;
      }
      
      .playlist-creator {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 20rpx;
      }
      
      .playlist-desc {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.5;
        margin-bottom: 20rpx;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .playlist-stats {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.7);
        
        .playlist-play-count {
          margin-right: 20rpx
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    
    .action-button {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15rpx 0;
      color: #fff;
      font-size: 24rpx;
      transition: all 0.3s ease;
      
      &:active {
        transform: scale(0.95);
      }
      
      &.play {
        background-color: #ff2c54;
        border-radius: 30rpx;
      }
      
      &.collect, &.comment, &.share {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 30rpx;
      }
      
      .play-icon, .collect-icon, .comment-icon, .share-icon {
        font-size: 32rpx;
        margin-bottom: 8rpx;
      }
    }
  }
}

/* 歌曲列表区域 */
.song-list-section {
  padding: 30rpx;
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  margin-top: -30rpx;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .song-count {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .song-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .song-index {
      width: 60rpx;
      font-size: 28rpx;
      color: #999;
      text-align: center;
    }
    
    .song-info {
      flex: 1;
      margin: 0 20rpx;
      
      .song-title {
        font-size: 28rpx;
        color: #333;
        margin-bottom: 8rpx;
        display: block;
      }
      
      .song-meta {
        display: flex;
        align-items: center;
        
        .hq-tag {
          font-size: 20rpx;
          color: #ff2c54;
          border: 1px solid #ff2c54;
          border-radius: 4rpx;
          padding: 0 6rpx;
          margin-right: 10rpx;
        }
        
        .song-artist {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
    
    .song-actions {
      .more-icon {
        font-size: 36rpx;
        color: #ccc;
      }
    }
  }
}

/* 相似歌单推荐区域 */
.similar-section {
  padding: 30rpx;
  background-color: #fff;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .more-text {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .similar-playlists {
    white-space: nowrap;
    margin: 0 -10rpx;
    
    .similar-playlist-item {
      display: inline-block;
      width: 200rpx;
      margin: 0 10rpx;
      
      .similar-playlist-cover {
        width: 200rpx;
        height: 200rpx;
        border-radius: 10rpx;
        margin-bottom: 10rpx;
      }
      
      .similar-playlist-title {
        font-size: 26rpx;
        color: #333;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .similar-playlist-creator {
        font-size: 22rpx;
        color: #999;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>