<template>
  <view class="profile-page">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="title">个人主页</view>
      <view class="settings-button" @tap="openSettings">
        <text class="settings-icon">⚙</text>
      </view>
    </view>

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

      <!-- 编辑个人资料按钮 -->
      <view class="edit-profile-button" @tap="editProfile">
        <text>编辑资料</text>
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

    <!-- VIP会员特权展示 -->
    <view class="vip-privileges" v-if="userInfo.isVip">
      <view class="privilege-header">
        <text class="privilege-title">VIP特权</text>
        <text class="privilege-subtitle">尊享{{ userInfo.vipLevel || 1 }}级会员特权</text>
      </view>
      <view class="privilege-list">
        <view class="privilege-item" v-for="(privilege, index) in vipPrivileges" :key="index">
          <image :src="privilege.icon" class="privilege-icon" />
          <text class="privilege-name">{{ privilege.name }}</text>
        </view>
      </view>
    </view>

    <!-- VIP订阅入口 -->
    <view class="vip-subscription" v-if="!userInfo.isVip">
      <view class="subscription-content">
        <view class="subscription-info">
          <text class="subscription-title">开通VIP会员</text>
          <text class="subscription-desc">享受无损音质和独家音乐内容</text>
        </view>
        <view class="subscription-button" @tap="subscribeVip">
          <text>立即开通</text>
        </view>
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

    <!-- 播客内容区域 -->
    <view
      v-if="currentTab === 'podcast'"
      class="content-area"
      @touchmove="handleScroll"
      @touchend="handleTouchEnd"
    >
      <!-- 播客子标签页 -->
      <view class="sub-tabs">
        <view
          v-for="subTab in podcastSubTabs"
          :key="subTab.id"
          class="sub-tab-item"
          :class="{ 'active': currentPodcastTab === subTab.id }"
          @tap="switchPodcastTab(subTab.id)"
        >
          <text>{{ subTab.name }}</text>
        </view>
      </view>

      <!-- 订阅的播客 -->
      <view class="podcast-subscriptions" v-if="currentPodcastTab === 'subscribed'">
        <view class="section-header">
          <text class="section-title">我的订阅</text>
          <text class="podcast-count">{{ subscribedPodcasts.length }}个</text>
        </view>
        <view
          v-for="podcast in subscribedPodcasts"
          :key="podcast.id"
          class="podcast-item"
          @tap="openPodcast(podcast)"
        >
          <image :src="podcast.cover" class="podcast-cover" mode="aspectFill" />
          <view class="podcast-info">
            <text class="podcast-name">{{ podcast.name }}</text>
            <text class="podcast-author">{{ podcast.author }}</text>
          </view>
          <text class="podcast-update">{{ podcast.lastUpdate }}</text>
        </view>
      </view>

      <!-- 播客收藏的单集 -->
      <view class="podcast-episodes" v-if="currentPodcastTab === 'episodes'">
        <view class="section-header">
          <text class="section-title">收藏的单集</text>
        </view>
        <view
          v-for="episode in favoritePodcastEpisodes"
          :key="episode.id"
          class="episode-item"
          @tap="playPodcastEpisode(episode)"
        >
          <image :src="episode.cover" class="episode-cover" mode="aspectFill" />
          <view class="episode-info">
            <text class="episode-name">{{ episode.name }}</text>
            <text class="episode-podcast">{{ episode.podcastName }}</text>
            <text class="episode-duration">{{ formatDuration(episode.duration) }}</text>
          </view>
          <text class="play-icon">▶</text>
        </view>
      </view>
    </view>

    <!-- 笔记内容区域 -->
    <view
      v-if="currentTab === 'notes'"
      class="content-area"
      @touchmove="handleScroll"
      @touchend="handleTouchEnd"
    >
      <!-- 笔记列表 -->
      <view class="notes-list">
        <view class="section-header">
          <text class="section-title">我的音乐笔记</text>
          <text class="notes-count">{{ musicNotes.length }}条</text>
        </view>
        <view
          v-for="note in musicNotes"
          :key="note.id"
          class="note-item"
          @tap="openNote(note)"
        >
          <view class="note-header">
            <image :src="note.songCover" class="note-song-cover" mode="aspectFill" />
            <view class="note-song-info">
              <text class="note-song-name">{{ note.songName }}</text>
              <text class="note-song-artist">{{ note.artist }}</text>
            </view>
            <text class="note-time">{{ note.createTime }}</text>
          </view>
          <view class="note-content">
            <text class="note-text">{{ note.content }}</text>
            <view class="note-images" v-if="note.images && note.images.length > 0">
              <image
                v-for="(image, index) in note.images"
                :key="index"
                :src="image"
                class="note-image"
                mode="aspectFill"
                @tap.stop="previewImage(note.images, index)"
              />
            </view>
          </view>
          <view class="note-footer">
            <view class="note-likes">
              <text class="like-icon">♥</text>
              <text class="like-count">{{ note.likes }}</text>
            </view>
            <view class="note-comments">
              <text class="comment-icon">💬</text>
              <text class="comment-count">{{ note.comments }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 添加笔记按钮 -->
      <view class="add-note-button" @tap="addNewNote">
        <text class="add-icon">+</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'

// 用户信息
const userInfo = ref<any>({
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

// 播客子标签页配置
const podcastSubTabs = [
  { id: 'subscribed', name: '订阅' },
  { id: 'episodes', name: '单集' }
]

const currentPodcastTab = ref('subscribed')

// 订阅的播客
const subscribedPodcasts = ref([
  {
    id: 1,
    name: '音乐人生',
    author: '主播小明',
    cover: 'https://picsum.photos/100/100?random=20',
    lastUpdate: '昨天更新'
  },
  {
    id: 2,
    name: '古典音乐赏析',
    author: '音乐学院',
    cover: 'https://picsum.photos/100/100?random=21',
    lastUpdate: '3天前更新'
  },
  {
    id: 3,
    name: '流行音乐周刊',
    author: '音乐评论家',
    cover: 'https://picsum.photos/100/100?random=22',
    lastUpdate: '1周前更新'
  }
])

// 收藏的播客单集
const favoritePodcastEpisodes = ref([
  {
    id: 1,
    name: '如何欣赏交响乐',
    podcastName: '古典音乐赏析',
    cover: 'https://picsum.photos/100/100?random=23',
    duration: 3600
  },
  {
    id: 2,
    name: '流行音乐的发展历程',
    podcastName: '流行音乐周刊',
    cover: 'https://picsum.photos/100/100?random=24',
    duration: 2400
  }
])

// 音乐笔记
const musicNotes = ref([
  {
    id: 1,
    songName: '心跳的证明',
    artist: '音乐人A',
    songCover: 'https://picsum.photos/100/100?random=3',
    content: '这首歌的旋律太美了，每次听都有不同的感受...',
    createTime: '2023-12-15',
    likes: 42,
    comments: 5,
    images: [
      'https://picsum.photos/200/200?random=25',
      'https://picsum.photos/200/200?random=26'
    ]
  },
  {
    id: 2,
    songName: '夏日旋律',
    artist: '音乐人B',
    songCover: 'https://picsum.photos/100/100?random=4',
    content: '夏天必听的一首歌，充满活力！',
    createTime: '2023-11-20',
    likes: 18,
    comments: 2,
    images: []
  }
])

// VIP特权
const vipPrivileges = ref([
  {
    icon: 'https://picsum.photos/40/40?random=30',
    name: '无损音质'
  },
  {
    icon: 'https://picsum.photos/40/40?random=31',
    name: '专属皮肤'
  },
  {
    icon: 'https://picsum.photos/40/40?random=32',
    name: '会员专区'
  },
  {
    icon: 'https://picsum.photos/40/40?random=33',
    name: '下载特权'
  }
])

const favoriteMusic = ref<any[]>([]);

const yearlyPlaylists = ref<any[]>([]);

const createdPlaylists = ref<any[]>([]);

const recentPlayed = ref<any[]>([]);



// 方法
const goBack = () => {
  Taro.navigateBack()
}

const openSettings = () => {
  Taro.showActionSheet({
    itemList: ['账号设置', '通知设置', '隐私设置', '关于我们'],
    success: function (res) {
      console.log('用户点击了第' + (res.tapIndex + 1) + '个按钮')
      // 根据点击的选项执行相应操作
    },
    fail: function (res) {
      console.log(res.errMsg)
    }
  })
}

const editProfile = () => {
  Taro.showToast({
    title: '编辑个人资料功能即将上线',
    icon: 'none',
    duration: 2000
  })
}

const subscribeVip = () => {
  Taro.showModal({
    title: 'VIP会员订阅',
    content: '是否立即开通VIP会员，享受无损音质和更多特权？',
    confirmText: '立即开通',
    cancelText: '暂不开通',
    success: function(res) {
      if (res.confirm) {
        console.log('用户点击确定')
        // 处理VIP订阅逻辑
      } else if (res.cancel) {
        console.log('用户点击取消')
      }
    }
  })
}

const switchTab = (tabId: string) => {
  currentTab.value = tabId
}

const switchMusicTab = (tabId: string) => {
  currentMusicTab.value = tabId
}

const switchPodcastTab = (tabId: string) => {
  currentPodcastTab.value = tabId
}

const formatListenTime = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24))
  return `${days}天`
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}

const playSong = (song: any) => {
  console.log('播放歌曲', song.name)
  // 调用音频服务播放歌曲
}

const openPlaylist = (playlist: any) => {
  console.log('打开歌单', playlist.name)
  // 跳转到歌单详情页
  Taro.navigateTo({
    url: `/pages/playlist/index?id=${playlist.id}&name=${encodeURIComponent(playlist.name)}`
  })
}

const playItem = (item: any) => {
  console.log('播放项目', item.name)
  // 根据项目类型调用不同的播放逻辑
}

const openPodcast = (podcast: any) => {
  console.log('打开播客', podcast.name)
  // 跳转到播客详情页
  Taro.navigateTo({
    url: `/pages/podcast/index?id=${podcast.id}&name=${encodeURIComponent(podcast.name)}`
  })
}

const playPodcastEpisode = (episode: any) => {
  console.log('播放播客单集', episode.name)
  // 调用音频服务播放播客
}

const openNote = (note: any) => {
  console.log('打开笔记', note.id)
  // 跳转到笔记详情页
}

const previewImage = (images: string[], current: number) => {
  Taro.previewImage({
    current: images[current],
    urls: images
  })
}

const addNewNote = () => {
  Taro.showToast({
    title: '添加笔记功能即将上线',
    icon: 'none',
    duration: 2000
  })
}

// 滚动处理
const scrollStartY = ref(0)
const scrollEndY = ref(0)
const isScrolling = ref(false)
const isLoadingMore = ref(false)

const handleScroll = (e: any) => {
  const touch = e.touches[0]
  if (!isScrolling.value) {
    scrollStartY.value = touch.clientY
    isScrolling.value = true
  }
  scrollEndY.value = touch.clientY

  // 如果滚动到底部，触发加载更多
  const container = e.currentTarget
  if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50 && !isLoadingMore.value) {
    loadMore()
  }
}

const handleTouchEnd = () => {
  isScrolling.value = false
}

const loadMore = () => {
  if (isLoadingMore.value) return

  isLoadingMore.value = true
  console.log('加载更多内容')

  // 模拟加载更多数据
  setTimeout(() => {
    // 根据当前标签页加载不同的内容
    if (currentTab.value === 'music') {
      if (currentMusicTab.value === 'collection') {
        // 加载更多收藏的音乐
        favoriteMusic.value.push({
          id: favoriteMusic.value.length + 1,
          name: `新添加的歌曲${favoriteMusic.value.length + 1}`,
          artist: '新音乐人',
          cover: `https://picsum.photos/100/100?random=${30 + favoriteMusic.value.length}`
        })
      } else if (currentMusicTab.value === 'created') {
        // 加载更多创建的歌单
        createdPlaylists.value.push({
          id: createdPlaylists.value.length + 1,
          name: `新歌单${createdPlaylists.value.length + 1}`,
          songCount: Math.floor(Math.random() * 50),
          playCount: Math.floor(Math.random() * 1000),
          cover: `https://picsum.photos/200/200?random=${40 + createdPlaylists.value.length}`
        })
      }
    } else if (currentTab.value === 'podcast') {
      // 加载更多播客内容
    } else if (currentTab.value === 'notes') {
      // 加载更多笔记
    }

    isLoadingMore.value = false
  }, 1000)
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

    .edit-profile-button {
      margin-top: 20px;
      padding: 10px 30px;
      background-color: #f5f5f5;
      border-radius: 30px;
      text-align: center;
      width: 200px;
      align-self: center;
      margin: 0 auto;

      text {
        font-size: 28px;
        color: #333;
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

  .vip-privileges {
    background-color: #fff;
    margin: 20px;
    border-radius: 20px;
    padding: 20px;

    .privilege-header {
      margin-bottom: 20px;

      .privilege-title {
        font-size: 32px;
        font-weight: bold;
        color: #333;
        display: block;
        margin-bottom: 5px;
      }

      .privilege-subtitle {
        font-size: 24px;
        color: #999;
      }
    }

    .privilege-list {
      display: flex;
      flex-wrap: wrap;

      .privilege-item {
        width: 25%;
        text-align: center;
        margin-bottom: 15px;

        .privilege-icon {
          width: 60px;
          height: 60px;
          margin-bottom: 8px;
        }

        .privilege-name {
          font-size: 24px;
          color: #666;
        }
      }
    }
  }

  .vip-subscription {
    background-color: #fff;
    margin: 20px;
    border-radius: 20px;
    padding: 20px;

    .subscription-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .subscription-info {
        .subscription-title {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          display: block;
          margin-bottom: 5px;
        }

        .subscription-desc {
          font-size: 24px;
          color: #999;
        }
      }

      .subscription-button {
        padding: 10px 20px;
        background-color: #1aad19;
        border-radius: 30px;

        text {
          font-size: 28px;
          color: #fff;
        }
      }
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

    .podcast-subscriptions, .podcast-episodes {
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

        .podcast-count {
          font-size: 24px;
          color: #999;
        }
      }

      .podcast-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #eee;

        .podcast-cover {
          width: 80px;
          height: 80px;
          border-radius: 10px;
          margin-right: 15px;
        }

        .podcast-info {
          flex: 1;

          .podcast-name {
            font-size: 28px;
            color: #333;
            margin-bottom: 5px;
            display: block;
          }

          .podcast-author {
            font-size: 24px;
            color: #999;
          }
        }

        .podcast-update {
          font-size: 24px;
          color: #999;
        }
      }

      .episode-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #eee;

        .episode-cover {
          width: 80px;
          height: 80px;
          border-radius: 10px;
          margin-right: 15px;
        }

        .episode-info {
          flex: 1;

          .episode-name {
            font-size: 28px;
            color: #333;
            margin-bottom: 5px;
            display: block;
          }

          .episode-podcast {
            font-size: 24px;
            color: #999;
            margin-bottom: 5px;
            display: block;
          }

          .episode-duration {
            font-size: 22px;
            color: #999;
          }
        }
      }
    }

    .notes-list {
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

        .notes-count {
          font-size: 24px;
          color: #999;
        }
      }

      .note-item {
        padding: 15px 0;
        border-bottom: 1px solid #eee;

        .note-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          .note-song-cover {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            margin-right: 10px;
          }

          .note-song-info {
            flex: 1;

            .note-song-name {
              font-size: 26px;
              color: #333;
              display: block;
            }

            .note-song-artist {
              font-size: 22px;
              color: #999;
            }
          }

          .note-time {
            font-size: 22px;
            color: #999;
          }
        }

        .note-content {
          margin-bottom: 15px;

          .note-text {
            font-size: 28px;
            color: #333;
            line-height: 1.5;
            margin-bottom: 10px;
            display: block;
          }

          .note-images {
            display: flex;
            flex-wrap: wrap;

            .note-image {
              width: 150px;
              height: 150px;
              border-radius: 8px;
              margin-right: 10px;
              margin-bottom: 10px;
            }
          }
        }

        .note-footer {
          display: flex;

          .note-likes, .note-comments {
            display: flex;
            align-items: center;
            margin-right: 20px;

            .like-icon, .comment-icon {
              font-size: 24px;
              color: #999;
              margin-right: 5px;
            }

            .like-count, .comment-count {
              font-size: 24px;
              color: #999;
            }
          }
        }
      }
    }

    .add-note-button {
      position: fixed;
      right: 30px;
      bottom: 30px;
      width: 100px;
      height: 100px;
      border-radius: 50px;
      background-color: #1aad19;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

      .add-icon {
        font-size: 50px;
        color: #fff;
      }
    }
  }
}
</style>
