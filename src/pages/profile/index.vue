<template>
  <view class="profile-page">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="title">个人主页</view>
      <view class="settings-button" @tap.stop="openSettings">
        <text class="settings-icon">⚙</text>
      </view>
    </view>

    <!-- 用户基本信息区域 -->
    <view class="user-info-section">
      <view class="user-header">
        <image class="user-avatar" :src="userInfo.avatar" mode="aspectFill"/>
        <view class="user-details">
          <view class="name-container">
             <view class="username-container">
                <text class="username">{{ userInfo.username }}</text>
             </view>
            <image v-if="userInfo.isVip" class="vip-badge" src="/assets/vip-badge.png"/>
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
      <view class="edit-profile-button" @tap.stop="editProfile">
        <text>编辑资料</text>
      </view>
    </view>

    <!-- 广告横幅 -->
    <view class="ad-banner" v-if="adInfo">
      <image :src="adInfo.image" mode="aspectFill" class="ad-image"/>
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
          <image :src="privilege.icon" class="privilege-icon" mode="aspectFill"/>
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
        <view class="subscription-button" @tap.stop="subscribeVip">
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
      <view class="sub-tabs custom-scroll-container">
        <view
            v-for="subTab in musicSubTabs"
            :key="subTab.id"
            class="sub-tab-item"
            :class="{ 'active': currentMusicTab === subTab.id }"
            @tap="switchMusicTab(subTab.id)">
              {{ subTab.name }}
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
          <image :src="song.cover" class="song-cover" mode="aspectFill"/>
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
        <view class="playlist-scroll custom-scroll-container">
            <view
                v-for="playlist in yearlyPlaylists"
                :key="playlist.id"
                class="playlist-item"
                @tap="openPlaylist(playlist)"
            >
                <image :src="playlist.cover" class="playlist-cover" mode="aspectFill"/>
                <text class="playlist-name">{{ playlist.name }}</text>
                <text class="playlist-year">{{ playlist.year }}</text>
            </view>
        </view>
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
          <image :src="playlist.cover" class="playlist-cover" mode="aspectFill"/>
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
          <image :src="item.cover" class="recent-cover" mode="aspectFill"/>
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
      <view class="sub-tabs custom-scroll-container">
        <view
            v-for="subTab in podcastSubTabs"
            :key="subTab.id"
            class="sub-tab-item"
            :class="{ 'active': currentPodcastTab === subTab.id }"
            @tap="switchPodcastTab(subTab.id)">
            {{ subTab.name }}
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
          <image :src="podcast.cover" class="podcast-cover" mode="aspectFill"/>
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
          <image :src="episode.cover" class="episode-cover" mode="aspectFill"/>
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
            <image :src="note.songCover" class="note-song-cover" mode="aspectFill"/>
            <view class="note-song-info" >
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
      <view class="add-note-button" @tap.stop="addNewNote">
        <text class="add-icon">+</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'

// 动画和加载状态变量
const isLoading = ref(false);
const isMusicLoading = ref(false);
const isPodcastLoading = ref(false);
const slideDirection = ref('slide-left');
const musicSlideDirection = ref('slide-left');
const podcastSlideDirection = ref('slide-left');

// 用户信息
const userInfo = ref<any>({
  username: '音乐达人',
  avatar: 'https://picsum.photos/200/200?random=1',
  isVip: true,
  bio: '音乐是我的生命 🎵',
  followers: 1234,
  level: 8,
  listenTime: 3600 * 24 * 30 // 30天的秒数（用于计算听歌时长）
})

// 广告信息
const adInfo = ref({
  image: 'https://picsum.photos/600/200?random=2',
  text: '解锁VIP，享受无损音质'
})

// 顶部主标签页配置
const tabs = [
  { id: 'music', name: '音乐' },
  { id: 'podcast', name: '播客' },
  { id: 'notes', name: '笔记' }
]

const currentTab = ref('music') // 当前选中的主标签页，默认为“音乐”

// 音乐子标签页配置
const musicSubTabs = [
  { id: 'recent', name: '最近' },
  { id: 'created', name: '创建' },
  { id: 'collection', name: '收藏' }
]

const currentMusicTab = ref('collection') // 当前选中的音乐子标签页，默认为“收藏”

// 播客子标签页配置
const podcastSubTabs = [
  { id: 'subscribed', name: '订阅' },
  { id: 'episodes', name: '单集' }
]

const currentPodcastTab = ref('subscribed') // 当前选中的播客子标签页，默认为“订阅”

// 订阅的播客列表数据
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

// 收藏的播客单集列表数据
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

// 音乐笔记列表数据
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

// VIP特权列表数据
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

// 收藏的音乐列表数据
const favoriteMusic = ref<any[]>([
  {
    id: 1,
    name: '歌曲A',
    artist: '歌手A',
    cover: 'https://picsum.photos/100/100?random=50'
  },
  {
    id: 2,
    name: '歌曲B',
    artist: '歌手B',
    cover: 'https://picsum.photos/100/100?random=51'
  },
  {
    id: 3,
    name: '歌曲C',
    artist: '歌手C',
    cover: 'https://picsum.photos/100/100?random=52'
  }
]);

// 年度歌单列表数据
const yearlyPlaylists = ref<any[]>([
  { id: 1, name: '2022年度歌单', year: '2022', cover: 'https://picsum.photos/200/200?random=53' },
  { id: 2, name: '2023年度歌单', year: '2023', cover: 'https://picsum.photos/200/200?random=54' }
]);

// 创建的歌单列表数据
const createdPlaylists = ref<any[]>([
  { id: 1, name: '我的流行歌单', songCount: 25, playCount: 1200, cover: 'https://picsum.photos/100/100?random=55' },
  { id: 2, name: '放松时刻', songCount: 15, playCount: 500, cover: 'https://picsum.photos/100/100?random=56' }
]);

// 最近播放列表数据
const recentPlayed = ref<any[]>([
  {
    id: 1,
    name: '歌曲X',
    type: '音乐',
    artist: '歌手X',
    playTime: '5分钟前',
    cover: 'https://picsum.photos/100/100?random=57'
  },
  {
    id: 2,
    name: '专辑Y',
    type: '专辑',
    artist: '歌手Y',
    playTime: '10分钟前',
    cover: 'https://picsum.photos/100/100?random=58'
  },
  {
    id: 3,
    name: '歌曲Z',
    type: '音乐',
    artist: '歌手Z',
    playTime: '15分钟前',
    cover: 'https://picsum.photos/100/100?random=59'
  }
]);


// 方法/函数 (以下是对每个函数的详细中文解释)

// 1. openSettings: 打开设置，目前提示“即将上线”。
const openSettings = () => {
  Taro.showToast({
    title: '设置功能即将上线', // 提示文字
    icon: 'none', // 不显示图标
    duration: 2000 // 提示持续时间（2秒）
  })
}

// 2. editProfile: 编辑个人资料，目前提示“即将上线”。
const editProfile = () => {
  Taro.navigateTo({
    url: '/pages/profile/edit'
  })
}

// 3. subscribeVip: 弹出VIP订阅确认框，询问用户是否订阅VIP。
const subscribeVip = () => {
  Taro.showModal({
    title: 'VIP会员订阅', // 弹窗标题
    content: '是否立即开通VIP会员，享受无损音质和更多特权？', // 弹窗内容
    confirmText: '立即开通', // 确认按钮文字
    cancelText: '暂不开通', // 取消按钮文字
    success: function (res) {
      if (res.confirm) {
        console.log('用户点击确定')
        // 处理VIP订阅逻辑（例如：跳转到支付页面）
      } else if (res.cancel) {
        console.log('用户点击取消')
        // 处理取消操作
      }
    }
  })
}

// 4. switchTab: 切换顶部主标签页。
const switchTab = (tabId: string) => {
  if (currentTab.value === tabId) return; // 如果点击当前标签，不执行切换
  
  // 设置加载状态
  isLoading.value = true;
  
  // 设置滑动方向
  const tabs = ['music', 'podcast', 'notes'];
  const currentIndex = tabs.indexOf(currentTab.value);
  const newIndex = tabs.indexOf(tabId);
  slideDirection.value = newIndex > currentIndex ? 'slide-left' : 'slide-right';
  
  // 添加延迟以显示动画效果
  setTimeout(() => {
    currentTab.value = tabId; // 将当前选中的主标签页ID设置为传入的tabId
    
    // 模拟加载完成
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  }, 100);
}

// 5. switchMusicTab: 切换音乐子标签页。
const switchMusicTab = (tabId: string) => {
  if (currentMusicTab.value === tabId) return; // 如果点击当前标签，不执行切换
  
  // 设置加载状态
  isMusicLoading.value = true;
  
  // 设置滑动方向
  const tabs = ['recent', 'created', 'collection'];
  const currentIndex = tabs.indexOf(currentMusicTab.value);
  const newIndex = tabs.indexOf(tabId);
  musicSlideDirection.value = newIndex > currentIndex ? 'slide-left' : 'slide-right';
  
  // 添加延迟以显示动画效果
  setTimeout(() => {
    currentMusicTab.value = tabId; // 将当前选中的音乐子标签页ID设置为传入的tabId
    
    // 模拟加载完成
    setTimeout(() => {
      isMusicLoading.value = false;
    }, 300);
  }, 100);
}

// 6. switchPodcastTab: 切换播客子标签页。
const switchPodcastTab = (tabId: string) => {
  if (currentPodcastTab.value === tabId) return; // 如果点击当前标签，不执行切换
  
  // 设置加载状态
  isPodcastLoading.value = true;
  
  // 设置滑动方向
  const tabs = ['subscribed', 'episodes'];
  const currentIndex = tabs.indexOf(currentPodcastTab.value);
  const newIndex = tabs.indexOf(tabId);
  podcastSlideDirection.value = newIndex > currentIndex ? 'slide-left' : 'slide-right';
  
  // 添加延迟以显示动画效果
  setTimeout(() => {
    currentPodcastTab.value = tabId; // 将当前选中的播客子标签页ID设置为传入的tabId
    
    // 模拟加载完成
    setTimeout(() => {
      isPodcastLoading.value = false;
    }, 300);
  }, 100);
}

// 7. formatListenTime: 格式化听歌时长，将秒数转换为天数。
const formatListenTime = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24)) // 计算天数
  return `${days}天`
}

// 8. formatDuration: 格式化时长，将秒数转换为分钟:秒数（例如：3:45）。
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60) // 计算分钟数
  const remainingSeconds = seconds % 60 // 计算剩余秒数
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}` // 格式化输出
}

// 9. playSong: 播放歌曲（模拟），显示播放提示。
const playSong = (song: any) => {
  console.log('播放歌曲', song.name)
  Taro.showToast({
    title: `播放歌曲：${song.name}`,
    icon: 'none'
  })
}

// 10. openPlaylist: 打开歌单详情页。
const openPlaylist = (playlist: any) => {
  console.log('打开歌单', playlist.name)
  // 跳转到歌单详情页（需要对歌单名称进行URL编码）
  Taro.navigateTo({
    url: `/pages/playlist/index?id=${playlist.id}&name=${encodeURIComponent(playlist.name)}`
  })
}

// 11. playItem: 播放音乐或专辑（模拟），显示播放提示。
const playItem = (item: any) => {
  console.log('播放项目', item.name)
  Taro.showToast({
    title: `播放项目：${item.name}`,
    icon: 'none'
  })
}

// 12. openPodcast: 打开播客详情页。
const openPodcast = (podcast: any) => {
  console.log('打开播客', podcast.name)
  // 跳转到播客详情页（需要对播客名称进行URL编码）
  Taro.navigateTo({
    url: `/pages/podcast/index?id=${podcast.id}&name=${encodeURIComponent(podcast.name)}`
  })
}

// 13. playPodcastEpisode: 播放播客单集（模拟），显示播放提示。
const playPodcastEpisode = (episode: any) => {
  console.log('播放播客单集', episode.name)
  Taro.showToast({
    title: `播放播客单集：${episode.name}`,
    icon: 'none'
  })
}

// 14. openNote: 打开笔记，目前只是显示一个提示。
const openNote = (note: any) => {
  Taro.showToast({
    title: `打开笔记：${note.id}`,
    icon: 'none'
  })
}

// 15. previewImage: 预览图片，全屏显示图片。
const previewImage = (images: string[], current: number) => {
  Taro.previewImage({
    current: images[current], // 当前显示的图片URL
    urls: images // 所有图片URL的数组
  })
}

// 16. addNewNote: 打开新建笔记，目前只是显示一个提示。
const addNewNote = () => {
  Taro.showToast({
    title: '打开新建笔记',
    icon: 'none'
  })
}

// 滚动处理和无限加载

// 17. scrollStartY, scrollEndY, isScrolling, isLoadingMore: 滚动状态变量。
const scrollStartY = ref(0) // 滚动开始时的Y坐标
const scrollEndY = ref(0) // 滚动结束时的Y坐标
const isScrolling = ref(false) // 是否正在滚动
const isLoadingMore = ref(false) // 是否正在加载更多

// 18. handleScroll: 处理滚动事件，检查是否需要触发无限加载。
const handleScroll = (e: any) => {
  const touch = e.touches[0] // 获取触摸信息

  // 记录开始滚动时的位置
  if (!isScrolling.value) {
    scrollStartY.value = touch.clientY
    isScrolling.value = true
  }

  scrollEndY.value = touch.clientY // 更新当前滚动位置

  // 判断是否滚动到底部，并且当前没有在加载更多
  const container = e.currentTarget // 获取当前滚动元素
  if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50 && !isLoadingMore.value) {
    loadMore() // 触发加载更多
  }
}

// 19. handleTouchEnd: 处理触摸结束事件（滚动结束）。
const handleTouchEnd = () => {
  isScrolling.value = false // 滚动结束后，设置isScrolling为false
}

// 20. loadMore: 加载更多内容（模拟）。
const loadMore = () => {
  if (isLoadingMore.value) return // 如果正在加载更多，则不执行

  isLoadingMore.value = true // 设置正在加载更多
  console.log('加载更多内容')

  // 模拟加载更多数据，1秒后执行
  setTimeout(() => {
    // 根据当前标签页动态添加更多内容
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
      // 加载更多播客内容（待实现）
      // 根据 currentPodcastTab 添加不同的播客内容
    } else if (currentTab.value === 'notes') {
      // 加载更多笔记内容（待实现）
    }

    isLoadingMore.value = false // 加载完成后，设置isLoadingMore为false
  }, 1000)
}
</script>


<style lang="scss">
.profile-page {
  background-color: #f8f8f8;
  min-height: 100vh;
  padding-bottom: 100px;
  color-scheme: light;

  .top-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    position: relative;
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(255, 78, 78, 0.05);

    .title {
      font-size: 36px;
      font-weight: bold;
      color: #ff4e4e;
      text-shadow: 0 1px 2px rgba(255, 78, 78, 0.1);
    }

    .settings-button {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: background-color 0.3s ease;

      &:active {
        background-color: rgba(255, 78, 78, 0.1);
      }

      .settings-icon {
        font-size: 40px;
        color: #ff4e4e;
      }
    }
  }

  .user-info-section {
    background-color: #fff;
    margin: 15px;
    border-radius: 20px;
    padding: 20px 25px;
    box-shadow: 0 4px 15px rgba(255, 78, 78, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:active {
      transform: translateY(2px);
      box-shadow: 0 2px 10px rgba(255, 78, 78, 0.08);
    }

    .user-header {
      display: flex;
      align-items: center;

      .user-avatar {
        width: 120px;
        height: 120px;
        border-radius: 60px;
        margin-right: 15px;
        box-shadow: 0 4px 10px rgba(255, 78, 78, 0.15);
        border: 3px solid rgba(255, 255, 255, 0.8);
      }

      .user-details {
        flex: 1;
      
        .name-container {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          width: 100%;
          
          .username-container{
          display: inline-flex;
          align-items: center;
          margin-bottom: 10px;

          .username {
            font-size: 32px;
            font-weight: bold;
            color: #ff4e4e;
            margin-right: 10px;
            text-shadow: 0 1px 2px rgba(255, 78, 78, 0.1);
          }
          }

          .vip-badge {
            width: 30px;
            height: 30px;
            animation: pulse 2s infinite;
          }
        }

        .user-bio {
          display: block;
          width: 100%;
          overflow: hidden;
          font-size: 28px;
          color: #666;
          line-height: 1.4;
        }
      }
    }

    .user-stats {
      margin-top: 20px;
      display: flex;
      justify-content: space-around;
      padding: 20px 0;
      border-top: 1px solid rgba(255, 78, 78, 0.1);

      .stat-item {
        text-align: center;
        transition: transform 0.3s ease;
        
        &:active {
          transform: scale(1.05);
        }

        .stat-value {
          font-size: 28px;
          color: #ff4e4e;
          margin-bottom: 8px;
          display: block;
          font-weight: bold;
        }

        .stat-label {
          font-size: 22px;
          color: #999;
        }
      }
    }

    .edit-profile-button {
      background: linear-gradient(45deg, #ff4e4e, #ff7676);
      margin: 20px auto 0;
      padding: 12px 30px;
      border-radius: 25px;
      border-radius: 25px;
      border: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:active {
        transform: scale(0.95);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      }

      text-align: center;
      width: 200px;
      align-self: center;
      margin: 0 auto;

      text {
        font-size: 28px;
        color: #fff;
      }
    }
  }

  .ad-banner {
    margin: 15px;
    border-radius: 15px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .ad-image {
      width: 100%;
      height: 200px;
    }

    .ad-text {
      position: absolute;
      bottom: 20px;
      left: 20px;
      color: #eee;
      font-size: 24px;
      font-weight: bold;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
  }

  .vip-privileges {
    background: linear-gradient(135deg, #ff4e4e, #ff9a9e);
    background-size: 200% 200%;
    animation: gradientAnimation 8s ease infinite;
    margin: 15px;
    border-radius: 20px;
    padding: 20px 25px;
    box-shadow: 0 8px 20px rgba(255, 78, 78, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%);
      animation: shimmer 6s linear infinite;
      pointer-events: none;
    }

    .privilege-header {
      margin-bottom: 20px;

      .privilege-title {
        font-size: 28px;
        font-weight: bold;
        color: #fff;
        display: block;
        margin-bottom: 5px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      .privilege-subtitle {
        font-size: 22px;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .privilege-list {
      display: flex;
      flex-wrap: wrap;

      .privilege-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 25%;
        margin-bottom: 15px;
        transition: transform 0.3s ease, opacity 0.3s ease;
        
        &:active {
          transform: scale(1.1);
        }

        .privilege-icon {
          width: 60px;
          height: 60px;
          margin-bottom: 10px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          transition: transform 0.3s ease;
        }

        .privilege-name {
          font-size: 20px;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        &:hover .privilege-icon {
          transform: translateY(-5px);
        }
      }
    }
  }

  .vip-subscription {
    background: linear-gradient(135deg, #ff7676, #ff4e4e);
    background-size: 200% 200%;
    animation: gradientAnimation 8s ease infinite;
    margin: 15px;
    border-radius: 20px;
    padding: 20px 25px;
    box-shadow: 0 8px 20px rgba(255, 78, 78, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%);
      animation: shimmer 6s linear infinite;
      pointer-events: none;
    }

    .subscription-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .subscription-info {
        .subscription-title {
          font-size: 32px;
          font-weight: bold;
          color: #fff;
          display: block;
          margin-bottom: 5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .subscription-desc {
          font-size: 24px;
          color: rgba(255, 255, 255, 0.8);
        }
      }

      .subscription-button {
        padding: 12px 30px;
        background: #fff;
        border-radius: 30px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        position: relative;
        overflow: hidden;
        z-index: 1;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
          z-index: -1;
          transition: opacity 0.3s ease;
        }

        &:active {
          transform: scale(0.95) translateY(2px);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        &:active::before {
          opacity: 0.5;
        }

        text {
          font-size: 28px;
          color: #ff4e4e;
          font-weight: bold;
        }
      }
    }
  }


  .content-tabs {
    display: flex;
    background-color: #fff;
    padding: 0 20px;
    border-bottom: 1px solid rgba(255, 78, 78, 0.1);
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(255, 78, 78, 0.05);
    position: relative;
    z-index: 10;

    .tab-item {
      padding: 15px 20px;
      font-size: 24px;
      color: #888;
      position: relative;
      transition: all 0.3s ease;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 3px;
        background: linear-gradient(to right, #ff4e4e, #ff7676);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      &.active {
        color: #ff4e4e;
        font-weight: bold;

        &::before {
          width: 60%;
          animation: tabIndicator 0.3s ease forwards;
        }
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  .content-area {
    height: calc(100vh - 400px);
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    transition: all 0.5s ease;
    position: relative;

    &.fade-in {
      opacity: 0;
      animation: fadeIn 0.5s ease forwards;
    }

    .sub-tabs {
      display: flex;
      padding: 15px 20px;
      background-color: #fff;
      white-space: nowrap;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(255, 78, 78, 0.05);
      position: sticky;
      top: 0;
      z-index: 5;

      .sub-tab-item{
        padding: 12px 24px;
        margin-right: 20px;
        font-size: 20px;
        color: #777;
        background-color: #f8f8f8;
        border-radius: 25px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        position: relative;
        overflow: hidden;
        
        &::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
          opacity: 0;
          transition: opacity 0.3s ease;
        }
      
        &.active {
          color: #fff;
          background: linear-gradient(45deg, #ff4e4e, #ff7676);
          box-shadow: 0 4px 10px rgba(255, 78, 78, 0.2);
          transform: translateY(-2px);
        }
        
        &:active::after {
          opacity: 1;
        }
      }
    }

    .favorite-music, .yearly-playlist {
      background-color: #ffffff;
      margin: 20px;
      border-radius: 20px;
      padding: 20px;
      box-shadow: 0 4px 15px rgba(255, 78, 78, 0.08);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      overflow: hidden;

      &:active {
        transform: translateY(2px);
        box-shadow: 0 2px 8px rgba(255, 78, 78, 0.05);
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 5px;
        height: 100%;
        background: linear-gradient(to bottom, #ff4e4e, #ff7676);
        border-top-left-radius: 20px;
        border-bottom-left-radius: 20px;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .section-title {
          font-size: 26px;
          font-weight: bold;
          color: #ff4e4e;
          position: relative;
          padding-left: 15px;
        }

        .song-count {
          font-size: 24px;
          color: #999;
          background-color: rgba(255, 78, 78, 0.1);
          padding: 5px 12px;
          border-radius: 15px;
        }
      }
    }

    .song-item {
      background-color: #fff;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      padding: 15px 10px;
      margin-bottom: 10px;
      border-radius: 15px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

      &:active {
        background-color: rgba(255, 78, 78, 0.05);
        transform: scale(0.98);
      }

      .song-cover {
        width: 80px;
        height: 80px;
        border-radius: 15px;
        margin-right: 15px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .song-info {
        flex: 1;

        .song-name {
          font-size: 24px;
          color: #333;
          margin-bottom: 8px;
          display: block;
          font-weight: 500;
        }

        .song-artist {
          font-size: 22px;
          color: #999;
        }
      }

      .play-icon {
        font-size: 36px;
        color: #ff4e4e;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: rgba(255, 78, 78, 0.1);
        transition: all 0.3s ease;
        
        &:active {
          background-color: rgba(255, 78, 78, 0.2);
          transform: scale(0.9);
        }
      }
    }

    .playlist-scroll{
      white-space: nowrap;

      margin: 0 -10px;

      .playlist-item {
        display: inline-block;
        width: 200px;
        margin: 0 10px;

        .playlist-cover {
          width: 200px;
          height: 200px;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .playlist-name {
          font-size: 28px;
          color: #333;
          display: block;
          white-space: normal;
          margin-bottom: 2px;
        }

        .playlist-year {
          font-size: 24px;
          color: #999;
        }
      }
    }

    .created-playlists {
      background-color: #ffffff;
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
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #f8f8f8;
        }

        border-bottom: 1px solid #eee;

        .playlist-cover {
          width: 100px;
          height: 100px;
          border-radius: 10px;
          margin-right: 15px;
        }

        .playlist-info {
          flex: 1 0 0;

          .playlist-name {
            font-size: 24px;
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
      background-color: #ffffff;
      margin: 20px;
      border-radius: 20px;
      padding: 20px;

      .section-header {
        margin-bottom: 20px;

        .section-title {
          font-size: 26px;
          font-weight: bold;
          color: #333;
        }
      }

      .recent-item {
        display: flex;
        align-items: center;
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #f8f8f8;
        }

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
            font-size: 24px;
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
      background-color: #ffffff;
      margin: 20px;
      border-radius: 20px;
      padding: 20px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .section-title {
          font-size: 26px;
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
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #f8f8f8;
        }

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
        transition: background-color 0.3s ease;

        &:hover {
          background-color: #f8f8f8;
        }

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
      background-color: #ffffff;
      margin: 20px;
      border-radius: 20px;
      padding: 20px;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .section-title {
          font-size: 26px;
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

        transition: background-color 0.3s ease;

        &:hover {
          background-color: #f8f8f8;
        }

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
            transition: color 0.3s ease;

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
      border-radius: 50%;
      background: linear-gradient(to right, #ff6e7f, #bfe9ff);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:active {
        transform: scale(0.95);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      }

      .add-icon {
        font-size: 40px;
        color: #fff;
      }
    }
  }
}


.custom-scroll-container {
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    position: relative;
    
    &::-webkit-scrollbar {
      display: none;
    }
}

/* 加载状态视觉反馈 */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
  
  .loading-dots {
    display: flex;
    align-items: center;
    
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #ff4e4e;
      margin: 0 5px;
      animation: loadingPulse 1.5s infinite ease-in-out;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

/* 动画关键帧定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes shimmer {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes loadingPulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

@keyframes tabIndicator {
  0% {
    width: 0;
    opacity: 0;
  }
  100% {
    width: 60%;
    opacity: 1;
  }
}

/* 滑动动画效果 */
.slide-left-enter-active,
.slide-right-enter-active,
.slide-left-leave-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
