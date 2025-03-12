<template>
  <view class="profile-page">
    <!-- 用户基本信息区域 -->
    <view class="user-info-section">
      <view class="user-header">
        <image class="user-avatar" :src="userInfo.avatar" mode="aspectFill" />
        <view class="user-details">
          <view class="name-container">
            <text class="username">{{ userInfo.username }}</text>
            <image v-if="userInfo.isVip" class="vip-badge" src="/assets/vip-badge.png" />
          </view>
          <text class="user-bio">{{ userInfo.bio }}</text>
        </view>
      </view>

      <!-- 用户数据统计 -->
      <view class="user-stats">
        <view class="stat-item">
          <text class="stat-value">{{ userInfo.followers }}</text>
          <text class="stat-label">关注者</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">Lv.{{ userInfo.level }}</text>
          <text class="stat-label">等级</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ formatListenTime(userInfo.listenTime) }}</text>
          <text class="stat-label">听歌时长</text>
        </view>
      </view>
    </view>

    <!-- 广告横幅 -->
    <view class="ad-banner" v-if="adInfo">
      <image :src="adInfo.image" mode="aspectFill" class="ad-image" />
      <text class="ad-text">{{ adInfo.text }}</text>
    </view>

    <!-- 内容标签页 -->
    <view class="content-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-item"
        :class="{ 'active': currentTab === tab.id }"
        @tap="switchTab(tab.id)"
      >
        <text>{{ tab.name }}</text>
      </view>
    </view>

    <!-- 音乐内容区域 -->
    <view 
      v-if="currentTab === 'music'" 
      class="content-area" 
      @touchmove="handleScroll"
      @touchend="handleTouchEnd"
    >
      <!-- 子标签页 -->
      <view class="sub-tabs">
        <view 
          v-for="subTab in musicSubTabs" 
          :key="subTab.id"
          class="sub-tab-item"
          :class="{ 'active': currentMusicTab === subTab.id }"
          @tap="switchMusicTab(subTab.id)"
        >
          <text>{{ subTab.name }}</text>
        </view>
      </view>

      <!-- 我喜欢的音乐 -->
      <view class="favorite-music" v-if="currentMusicTab === 'collection'">
        <view class="section-header">
          <text class="section-title">我喜欢的音乐</text>
          <text class="song-count">{{ favoriteMusic.length }}首</text>
        </view>
        <view 
          v-for="song in favoriteMusic" 
          :key="song.id" 
          class="song-item"
          @tap="playSong(song)"
        >
          <image :src="song.cover" class="song-cover" mode="aspectFill" />
          <view class="song-info">
            <text class="song-name">{{ song.name }}</text>
            <text class="song-artist">{{ song.artist }}</text>
          </view>
          <text class="play-icon">▶</text>
        </view>
      </view>

      <!-- 年度歌单 -->
      <view class="yearly-playlist" v-if="currentMusicTab === 'collection'">
        <view class="section-header">
          <text class="section-title">年度歌单</text>
        </view>
        <scroll-view class="playlist-scroll" scroll-x>
          <view 
            v-for="playlist in yearlyPlaylists" 
            :key="playlist.id" 
            class="playlist-item"
            @tap="openPlaylist(playlist)"
          >
            <image :src="playlist.cover" class="playlist-cover" mode="aspectFill" />
            <text class="playlist-name">{{ playlist.name }}</text>
            <text class="playlist-year">{{ playlist.year }}</text>
          </view>
        </scroll-view>
      </view>
      
      <!-- 创建的歌单 -->
      <view class="created-playlists" v-if="currentMusicTab === 'created'">
        <view class="section-header">
          <text class="section-title">我创建的歌单</text>
          <text class="playlist-count">{{ createdPlaylists.length }}个</text>
        </view>
        <view 
          v-for="playlist in createdPlaylists" 
          :key="playlist.id" 
          class="playlist-card"
          @tap="openPlaylist(playlist)"
        >
          <image :src="playlist.cover" class="playlist-cover" mode="aspectFill" />
          <view class="playlist-info">
            <text class="playlist-name">{{ playlist.name }}</text>
            <text class="playlist-desc">{{ playlist.songCount }}首歌 · {{ playlist.playCount }}次播放</text>
          </view>
        </view>
      </view>

      <!-- 最近播放 -->
      <view class="recent-played" v-if="currentMusicTab === 'recent'">
        <view class="section-header">
          <text class="section-title">最近播放</text>
        </view>
        <view 
          v-for="item in recentPlayed" 
          :key="item.id" 
          class="recent-item"
          @tap="playItem(item)"
        >
          <image :src="item.cover" class="recent-cover" mode="aspectFill" />
          <view class="recent-info">
            <text class="recent-name">{{ item.name }}</text>
            <text class="recent-desc">{{ item.type }} · {{ item.artist }}</text>
          </view>
          <text class="recent-time">{{ item.playTime }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'

// 用户信息
const userInfo = ref({
  username: '音乐达人',
  avatar: 'https://picsum.photos/200/200?random=1',
  isVip: true,
  bio: '音乐是我的生命 🎵',
  followers: 1234,
  level: 8,
  listenTime: 3600 * 24 * 30 // 30天的秒数
})

// 广告信息
const adInfo = ref({
  image: 'https://picsum.photos/600/200?random=2',
  text: '解锁VIP，享受无损音质'
})

// 标签页配置
const tabs = [
  { id: 'music', name: '音乐' },
  { id: 'podcast', name: '播客' },
  { id: 'notes', name: '笔记' }
]

const currentTab = ref('music')

// 音乐子标签页配置
const musicSubTabs = [
  { id: 'recent', name: '最近' },
  { id: 'created', name: '创建' },
  { id: 'collection', name: '收藏' }
]

const currentMusicTab = ref('collection')

// 喜欢的音乐列表
const favoriteMusic = ref([
  {
    id: 1,
    name: '心跳的证明',
    artist: '音乐人A',
    cover: 'https://picsum.photos/100/100?random=3'
  },
  {
    id: 2,
    name: '夏日旋律',
    artist: '音乐人B',
    cover: 'https://picsum.photos/100/100?random=4'
  },
  {
    id: 3,
    name: '星空协奏曲',
    artist: '音乐人C',
    cover: 'https://picsum.photos/100/100?random=5'
  }
])

// 年度歌单
const yearlyPlaylists = ref([
  {
    id: 1,
    name: '2023年度歌单',
    year: '2023',
    cover: 'https://picsum.photos/200/200?random=6'
  },
  {
    id: 2,
    name: '2022年度歌单',
    year: '2022',
    cover: 'https://picsum.photos/200/200?random=7'
  }
])

// 创建的歌单
const createdPlaylists = ref([
  {
    id: 1,
    name: '我的私藏歌单',
    songCount: 42,
    playCount: 1024,
    cover: 'https://picsum.photos/200/200?random=8'
  },
  {
    id: 2,
    name: '轻松时刻',
    songCount: 18,
    playCount: 512,
    cover: 'https://picsum.photos/200/200?random=9'
  }
])

// 最近播放
const recentPlayed = ref([
  {
    id: 1,
    name: '夏日旋律',
    type: '单曲',
    artist: '音乐人B',
    cover: 'https://picsum.photos/100/100?random=10',
    playTime: '昨天'
  },
  {
    id: 2,
    name: '轻松时刻',
    type: '歌单',
    artist: '自建歌单',
    cover: 'https://picsum.photos/100/100?random=11',
    playTime: '3天前'
  },
  {
    id: 3,
    name: '城市之声',
    type: '专辑',
    artist: '音乐人D',
    cover: 'https://picsum.photos/100/100?random=12',
    playTime: '上周'
  }
])

// 方法
const goBack = () => {
  Taro.navigateBack()
}

const openSettings = () => {
  console.log('打开设置')
}

const switchTab = (tabId: string) => {
  currentTab.value = tabId
}

const switchMusicTab = (tabId: string) => {
  currentMusicTab.value = tabId
}

const formatListenTime = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24))
  return `${days}天`
}

const playSong = (song: any) => {
  console.log('播放歌曲', song.name)
}

const openPlaylist = (playlist: any) => {
  console.log('打开歌单', playlist.name)
}

const playItem = (item: any) => {
  console.log('播放项目', item.name)
}

const loadMore = () => {
  console.log('加载更多内容')
}

// 滚动处理
const scrollStartY = ref(0)
const scrollEndY = ref(0)
const isScrolling = ref(false)

const handleScroll = (e: any) => {
  const touch = e.touches[0]
  if (!isScrolling.value) {
    scrollStartY.value = touch.clientY
    isScrolling.value = true
  }
  scrollEndY.value = touch.clientY
  
  // 如果滚动到底部，触发加载更多
  const container = e.currentTarget
  if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50) {
    loadMore()
  }
}

const handleTouchEnd = () => {
  isScrolling.value = false
}
</script>

<style lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;

  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background-color: #fff;

    .back-button, .settings-button {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;

      .back-icon, .settings-icon {
        font-size: 36px;
        color: #333;
      }
    }

    .title {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
  }

  .user-info-section {
    background-color: #fff;
    padding: 30px 20px;

    .user-header {
      display: flex;
      align-items: center;
      margin-bottom: 30px;

      .user-avatar {
        width: 120px;
        height: 120px;
        border-radius: 60px;
        margin-right: 20px;
      }

      .user-details {
        flex: 1;

        .name-container {
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          .username {
            font-size: 36px;
            font-weight: bold;
            color: #333;
            margin-right: 10px;
          }

          .vip-badge {
            width: 40px;
            height: 40px;
          }
        }

        .user-bio {
          font-size: 28px;
          color: #666;
          line-height: 1.4;
        }
      }
    }

    .user-stats {
      display: flex;
      justify-content: space-around;
      border-top: 1px solid #eee;
      padding-top: 30px;

      .stat-item {
        text-align: center;

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
          display: block;
        }

        .stat-label {
          font-size: 24px;
          color: #999;
        }
      }
    }
  }

  .ad-banner {
    margin: 20px;
    border-radius: 20px;
    overflow: hidden;
    position: relative;

    .ad-image {
      width: 100%;
      height: 200px;
    }

    .ad-text {
      position: absolute;
      bottom: 20px;
      left: 20px;
      color: #fff;
      font-size: 28px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }

  .content-tabs {
    display: flex;
    background-color: #fff;
    padding: 0 20px;
    border-bottom: 1px solid #eee;

    .tab-item {
      padding: 20px 30px;
      font-size: 28px;
      color: #666;
      position: relative;

      &.active {
        color: #333;
        font-weight: bold;

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 30px;
          right: 30px;
          height: 4px;
          background-color: #1aad19;
          border-radius: 2px;
        }
      }
    }
  }

  .content-area {
    height: calc(100vh - 400px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;

    .sub-tabs {
      display: flex;
      padding: 20px;
      background-color: #fff;

      .sub-tab-item {
        padding: 10px 20px;
        margin-right: 20px;
        font-size: 24px;
        color: #666;
        background-color: #f5f5f5;
        border-radius: 30px;

        &.active {
          color: #fff;
          background-color: #1aad19;
        }
      }
    }

    .favorite-music, .yearly-playlist {
      background-color: #fff;
      margin: 20px;
      border-radius: 20px;
      padding: 20px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .section-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
        }

        .song-count {
          font-size: 24px;
          color: #999;
        }
      }
    }

    .song-item {
      display: flex;
      align-items: center;
      padding: 15px 0;
      border-bottom: 1px solid #eee;

      .song-cover {
        width: 80px;
        height: 80px;
        border-radius: 10px;
        margin-right: 15px;
      }

      .song-info {
        flex: 1;

        .song-name {
          font-size: 28px;
          color: #333;
          margin-bottom: 5px;
          display: block;
        }

        .song-artist {
          font-size: 24px;
          color: #999;
        }
      }

      .play-icon {
        font-size: 36px;
        color: #1aad19;
      }
    }

    .playlist-scroll {
      white-space: nowrap;
      margin: 0 -10px;

      .playlist-item {
        display: inline-block;
        width: 200px;
        margin: 0 10px;

        .playlist-cover {
          width: 200px;
          height: 200px;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .playlist-name {
          font-size: 28px;
          color: #333;
          display: block;
          white-space: normal;
          margin-bottom: 5px;
        }

        .playlist-year {
          font-size: 24px;
          color: #999;
        }
      }
    }
    
    .created-playlists {
      background-color: #fff;
      margin: 20px;
      border-radius: 20px;
      padding: 20px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .section-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
        }

        .playlist-count {
          font-size: 24px;
          color: #999;
        }
      }

      .playlist-card {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #eee;

        .playlist-cover {
          width: 100px;
          height: 100px;
          border-radius: 10px;
          margin-right: 15px;
        }

        .playlist-info {
          flex: 1;

          .playlist-name {
            font-size: 28px;
            color: #333;
            margin-bottom: 5px;
            display: block;
          }

          .playlist-desc {
            font-size: 24px;
            color: #999;
          }
        }
      }
    }

    .recent-played {
      background-color: #fff;
      margin: 20px;
      border-radius: 20px;
      padding: 20px;

      .section-header {
        margin-bottom: 20px;

        .section-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
        }
      }

      .recent-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #eee;

        .recent-cover {
          width: 80px;
          height: 80px;
          border-radius: 10px;
          margin-right: 15px;
        }

        .recent-info {
          flex: 1;

          .recent-name {
            font-size: 28px;
            color: #333;
            margin-bottom: 5px;
            display: block;
          }

          .recent-desc {
            font-size: 24px;
            color: #999;
          }
        }

        .recent-time {
          font-size: 24px;
          color: #999;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>