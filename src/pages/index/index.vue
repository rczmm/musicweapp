<template>
  <view class="index">
    <!-- 搜索栏区域 -->
    <view class="search-bar">
      <view class="menu-icon">≡</view>
      <view class="notification">99+</view>
      <view class="search-input">
        <nut-icon-search></nut-icon-search>
        <input type="text" v-model="searchKeyword" placeholder="搜索歌曲、歌手、专辑" @confirm="handleSearch"/>
      </view>
      <view class="action-icons">
        <nut-icon-heart></nut-icon-heart>
        <nut-icon-plus></nut-icon-plus>
        <nut-icon-voice></nut-icon-voice>
      </view>
    </view>

    <!-- 可滚动内容区域 -->
    <view class="content-area">

      <!-- 上午好个性化推荐区域 -->
      <view class="section">
        <view class="section-header">
          <view class="greeting-header">
            <text class="highlight">上午好</text>
            <view class="free-listening-button">免费听歌模式</view>
          </view>
        </view>

        <!-- 推荐网格 - 2x2布局 -->
        <view class="recommendation-grid">
          <view
            class="grid-item"
            v-for="(item, index) in morningRecommendations"
            :key="index"
            :style="{ '--index': index }"
            @tap="handleGridItemTap(item)"
          >
            <image :src="item.cover" class="grid-item-bg"></image>
            <view class="grid-item-content">
              <view class="play-icon-grid">▶️</view>
              <view class="grid-item-info">
                <text class="grid-item-title">{{ item.title }}</text>
                <text class="grid-item-subtitle">{{ item.subtitle }}</text>
              </view>
              <text v-if="item.freeTag" class="free-tag">免费听</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 为你推荐的热门节目区域 -->
      <view class="section">
        <view class="section-header">
          <text class="highlight">为你推荐的热门节目</text>
        </view>

        <!-- 节目列表 - 垂直布局 -->
        <view class="program-list">
          <view
            class="program-item"
            v-for="(item, index) in recommendedPrograms"
            :key="index"
            :style="{ '--index': index }"
            @tap="handleProgramTap(item)"
          >
            <view class="program-cover-container">
              <image :src="item.cover" class="program-cover"></image>
            </view>
            <view class="program-info">
              <text class="program-title">{{ item.title }}</text>
              <text class="program-description">{{ item.description }}</text>
              <text class="program-stats">{{ item.stats }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 热门榜单区域 -->
      <view class="section">
        <view class="section-header">
          <view class="tag-list">
            <view
              v-for="(tag, index) in hotTags"
              :key="index"
              :class="['tag-item', { active: currentHotTag === tag.id }]"
              @tap="switchHotTag(tag.id)"
            >
              {{ tag.name }}
            </view>
          </view>
        </view>

        <!-- 歌曲列表 - 横向滑动 -->
        <view class="horizontal-song-list">
          <view class="song-list-container">
            <view
              class="song-item"
              v-for="(item, index) in currentHotSongs"
              :key="index"
              :style="{ '--index': index }"
              @tap="handleSongTap(item)"
            >
              <image :src="item.cover" class="song-cover"></image>
              <view class="play-icon">▶️</view>
              <view class="song-info">
                <text class="song-title">{{ item.title }}</text>
                <text class="song-artist">{{ item.artist }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 推荐歌单区域 -->
      <view class="section">
        <view class="section-header">
          <text class="highlight">推荐歌单</text>
        </view>

        <!-- 播放列表横向滑动 -->
        <view class="horizontal-playlist">
          <view class="playlist-container">
            <view
              class="playlist-item"
              v-for="(item, index) in recommendedPlaylists"
              :key="index"
              :style="{ '--index': index }"
              @tap="handlePlaylistTap(item)"
            >
              <view class="playlist-cover-container">
                <image :src="item.cover" class="playlist-cover"></image>
                <view class="play-icon-large">▶️</view>
              </view>
              <text class="playlist-title">{{ item.title }}</text>
              <text v-if="item.recommendReason" class="recommend-reason">{{ item.recommendReason }}</text>
            </view>
          </view>
        </view>
      </view>


      <!-- 根据喜爱歌曲推荐区域 -->
      <view class="section">
        <view class="section-header">
          <text class="highlight">根据你喜爱的歌曲推荐</text>
        </view>

        <!-- 歌曲列表 - 横向滑动 -->
        <view class="horizontal-song-list">
          <view class="song-list-container">
            <view
              class="song-item"
              v-for="(item, index) in recommendedSongs"
              :key="index"
              :style="{ '--index': index }"
              @tap="handleSongTap(item)"
            >
              <view class="song-cover-container">
                <image :src="item.cover" class="song-cover"></image>
                <view class="play-icon">▶️</view>
              </view>
              <view class="song-info">
                <text class="song-title">{{ item.title }}</text>
                <text class="song-artist">{{ item.artist }}</text>
                <view class="song-tags">
                  <text v-if="item.isHQ" class="sq-tag">SQ</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 迷你播放器组件 -->
    <mini-player
      :song="currentPlayingSong"
      @showPlaylist="handleShowPlaylist"
    />
  </view>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from 'vue';
import {
  Search as NutIconSearch,
  Heart as NutIconHeart,
  Plus as NutIconPlus,
  Voice as NutIconVoice
} from '@nutui/icons-vue-taro';
// 导入迷你播放器组件
import MiniPlayer from '../../components/MiniPlayer/index.vue';
import Taro from '@tarojs/taro';

const show = ref(false);
const isLoading = ref(true);
const msg = ref('我成功了');
const searchKeyword = ref('');

const handleSearch = () => {
  console.log('搜索关键词：', searchKeyword.value);
  if (searchKeyword.value) {
    Taro.navigateTo({
      url: '/pages/search/index' + `?keyword=${searchKeyword.value}`
    })
  }
};

// 热门标签
const hotTags = ref([
  {id: 'chinese', name: '中文'},
  {id: 'cantonese', name: '粤语'},
  {id: 'western', name: '欧美'},
  {id: 'hotlist', name: '热门榜单'},
  {id: 'free', name: '免费听'}
]);

// 当前选中的标签
const currentHotTag = ref('chinese');

// 切换标签
const switchHotTag = (tagId: string) => {
  // 添加过渡动画效果
  isLoading.value = true
  setTimeout(() => {
    currentHotTag.value = tagId
    isLoading.value = false
  }, 300)
};

const handleSongTap = (song: any) => {
  currentPlayingSong.value = {
    id: song.id || Math.random().toString(36).substring(2, 15),
    title: song.title,
    artist: song.artist,
    cover: song.cover,
    duration: song.duration || 240,
    audioUrl: song.audioUrl || song.url
  }

  if (!audioContext.value) {
    audioContext.value = Taro.createInnerAudioContext()

    audioContext.value.onEnded(() => {
      console.log('播放结束')
      isPlaying.value = false // Update UI
      stopProgressUpdate()
    })
    audioContext.value.onError((res) => {
      console.error('播放错误', res)
      isPlaying.value = false // Update UI
      stopProgressUpdate()
      Taro.showToast({title: '播放出错', icon: 'error', duration: 2000})
    })
    audioContext.value.onTimeUpdate(() => {
      if (audioContext.value && audioContext.value.duration) {
        playProgress.value = audioContext.value.currentTime / audioContext.value.duration
      }
    })
  }

  audioContext.value.src = song.url // Assuming your song object has a 'url' property
  isPlaying.value = true
  playProgress.value = 0
  // startProgressUpdate() // Remove this as progress will be updated by onTimeUpdate
  if (isPlaying.value) {
    audioContext.value.play()
  }

  show.value = true
  msg.value = `正在播放: ${song.title}`
  console.log('播放歌曲:', song.title, song.url) // Log the URL for debugging
};

// 处理播放列表点击
const handlePlaylistTap = (playlist: any) => {
  show.value = true
  console.log('打开播放列表:', playlist.title)

  // 跳转到播放列表详情页
  Taro.navigateTo({
    url: `/pages/playlist/index?id=${playlist.id || Math.random().toString(36).substr(2, 9)}&title=${encodeURIComponent(playlist.title)}`
  })
};

// 不同标签下的歌曲数据
const hotSongsByTag = ref({
  chinese: [
    {
      url: 'https://example.com/song1.mp3',
      cover: 'https://picsum.photos/100/100?random=1',
      title: '起风了',
      artist: '买辣椒也用券'
    },
    {
      cover: 'https://picsum.photos/100/100?random=2',
      title: 'Former',
      artist: '隔壁老樊'
    },
    {
      cover: 'https://picsum.photos/100/100?random=3',
      title: '世间美好与你环环相扣',
      artist: '柏松'
    },
    {
      cover: 'https://picsum.photos/100/100?random=3',
      title: '世间美好与你环环相扣',
      artist: '柏松'
    },
    {
      cover: 'https://picsum.photos/100/100?random=3',
      title: '世间美好与你环环相扣',
      artist: '柏松'
    }
  ],
  cantonese: [
    {
      cover: 'https://picsum.photos/100/100?random=10',
      title: '红日',
      artist: '李克勤'
    },
    {
      cover: 'https://picsum.photos/100/100?random=11',
      title: '海阔天空',
      artist: 'Beyond'
    },
    {
      cover: 'https://picsum.photos/100/100?random=12',
      title: '喜欢你',
      artist: '陈奕迅'
    }
  ],
  western: [
    {
      cover: 'https://picsum.photos/100/100?random=13',
      title: 'Shape of You',
      artist: 'Ed Sheeran'
    },
    {
      cover: 'https://picsum.photos/100/100?random=14',
      title: 'Blinding Lights',
      artist: 'The Weeknd'
    },
    {
      cover: 'https://picsum.photos/100/100?random=15',
      title: 'Bad Guy',
      artist: 'Billie Eilish'
    }
  ],
  hotlist: [
    {
      cover: 'https://picsum.photos/100/100?random=16',
      title: '热门歌曲1',
      artist: '热门歌手1'
    },
    {
      cover: 'https://picsum.photos/100/100?random=17',
      title: '热门歌曲2',
      artist: '热门歌手2'
    },
    {
      cover: 'https://picsum.photos/100/100?random=18',
      title: '热门歌曲3',
      artist: '热门歌手3'
    }
  ],
  free: [
    {
      cover: 'https://picsum.photos/100/100?random=19',
      title: '免费歌曲1',
      artist: '免费歌手1'
    },
    {
      cover: 'https://picsum.photos/100/100?random=20',
      title: '免费歌曲2',
      artist: '免费歌手2'
    },
    {
      cover: 'https://picsum.photos/100/100?random=21',
      title: '免费歌曲3',
      artist: '免费歌手3'
    }
  ]
});

// 根据当前选中的标签获取对应的歌曲列表
const currentHotSongs = computed(() => {
  return hotSongsByTag.value[currentHotTag.value] || []
});

// 推荐歌单数据
const recommendedPlaylists = ref([
  {
    cover: 'https://picsum.photos/200/200?random=4',
    title: '华语速爆新歌',
    recommendReason: '根据收藏推荐'
  },
  {
    cover: 'https://picsum.photos/200/200?random=5',
    title: '流行趋势榜',
    recommendReason: ''
  },
  {
    cover: 'https://picsum.photos/200/200?random=6',
    title: '怀旧经典',
    recommendReason: ''
  }
]);

// 上午好个性化推荐数据
const morningRecommendations = ref([
  {
    cover: 'https://picsum.photos/200/200?random=22',
    title: '每日推荐',
    subtitle: '根据你的口味生成',
    freeTag: true
  },
  {
    cover: 'https://picsum.photos/200/200?random=23',
    title: '私人雷达',
    subtitle: '为你发现相似歌曲',
    freeTag: false
  },
  {
    cover: 'https://picsum.photos/200/200?random=24',
    title: '新歌首发',
    subtitle: '最新上线新歌',
    freeTag: true
  },
  {
    cover: 'https://picsum.photos/200/200?random=25',
    title: '歌单精选',
    subtitle: '精品歌单推荐',
    freeTag: false
  }
]);

// 为你推荐的热门节目数据
const recommendedPrograms = ref([
  {
    cover: 'https://picsum.photos/120/120?random=26',
    title: '岁月如歌',
    description: '那些年，我们一起听过的歌曲，重温经典',
    stats: '超34%人播放'
  },
  {
    cover: 'https://picsum.photos/120/120?random=27',
    title: '音乐故事会',
    description: '每首歌背后都有一个动人的故事，聆听音乐背后的情感',
    stats: '超28%人播放'
  },
  {
    cover: 'https://picsum.photos/120/120?random=28',
    title: '深夜电台',
    description: '当世界安静下来，让音乐陪伴你度过每个夜晚',
    stats: '超22%人播放'
  }
]);

// 处理网格项点击
const handleGridItemTap = (item: any) => {
  show.value = true
  console.log('打开推荐内容:', item.title)

  // 根据类型跳转到不同页面
  if (item.title.includes('每日推荐') || item.title.includes('新歌')) {
    // 跳转到歌单页面
    Taro.navigateTo({
      url: `/pages/playlist/index?id=daily&title=${encodeURIComponent(item.title)}`
    })
  } else if (item.title.includes('歌单')) {
    // 跳转到歌单页面
    Taro.navigateTo({
      url: `/pages/playlist/index?id=recommend&title=${encodeURIComponent(item.title)}`
    })
  } else {
    // 默认跳转到歌单页面
    Taro.navigateTo({
      url: `/pages/playlist/index?id=featured&title=${encodeURIComponent(item.title)}`
    })
  }
};

// 处理节目点击
const handleProgramTap = (program: any) => {
  show.value = true
  console.log('打开节目:', program.title)

  // 跳转到专辑页面
  Taro.navigateTo({
    url: `/pages/album/albumIndex?id=${program.id || Math.random().toString(36).substr(2, 9)}&title=${encodeURIComponent(program.title)}`
  })
};

// 根据喜爱歌曲推荐数据
const recommendedSongs = ref([
  {
    cover: 'https://picsum.photos/100/100?random=7',
    title: '夜曲',
    artist: '周杰伦',
    isHQ: true,
    isLiked: true
  },
  {
    cover: 'https://picsum.photos/100/100?random=8',
    title: '晴天',
    artist: '周杰伦',
    isHQ: true,
    isLiked: false
  },
  {
    cover: 'https://picsum.photos/100/100?random=9',
    title: '稻香',
    artist: '周杰伦',
    isHQ: true,
    isLiked: false
  }
]);

// 页面加载时的动画效果
onMounted(() => {
  // 模拟加载完成
  setTimeout(() => {
    isLoading.value = false
  }, 500);

  audioContext.value = Taro.createInnerAudioContext();

  audioContext.value.onEnded(() => {
    console.log('播放结束');
    isPlaying.value = false;
    playProgress.value = 0;
  });

  audioContext.value.onError((res) => {
    console.error('播放错误', res);
    isPlaying.value = false;
    playProgress.value = 0;
    Taro.showToast({title: '播放出错', icon: 'error'});
  });

  audioContext.value.onTimeUpdate(() => {
    if (audioContext.value && audioContext.value.duration) {
      playProgress.value = audioContext.value.currentTime / audioContext.value.duration;
    }
  });


});

// 播放器相关状态
const currentPlayingSong = ref({
  id: '1',
  title: '来日方长',
  artist: '黄龄/薛之谦',
  cover: 'https://picsum.photos/100/100?random=1',
  duration: 240, // 歌曲时长（秒）
  audioUrl: 'https://picsum.photos/100/100?random=1'
});
const isPlaying = ref(false);
const playProgress = ref(0);
const audioContext = ref<Taro.InnerAudioContext | null>(null);

// 播放器相关方法
const handlePlay = () => {
  isPlaying.value = true
  audioContext.value = Taro.createInnerAudioContext()
  audioContext.value.src = currentPlayingSong.value.audioUrl
  if (audioContext.value) {
    console.log('开始播放:', currentPlayingSong.value.title)
    audioContext.value.play()
  }
  // 模拟播放进度更新
  startProgressUpdate()
};

const handlePause = () => {
  isPlaying.value = false
  if (audioContext.value) {
    audioContext.value.pause()
    console.log('暂停播放:', currentPlayingSong.value.title)
  }
};

const handleShowPlaylist = () => {
  show.value = true
  msg.value = '播放列表功能即将上线'
  // 跳转到播放列表页面
  Taro.navigateTo({
    url: '/pages/playlist/index?id=current&title=当前播放列表'
  })
  console.log('显示播放列表')
};

// 模拟播放进度更新的定时器
let progressTimer = null;

const startProgressUpdate = () => {
  // 清除可能存在的旧定时器
  if (progressTimer) {
    clearInterval(progressTimer)
  }

  // 创建新的定时器，每100毫秒更新一次进度
  progressTimer = setInterval(() => {
    // 增加进度，当达到1时重置为0
    playProgress.value += 0.001
    if (playProgress.value >= 1) {
      playProgress.value = 0
    }
  }, 100)
};

const stopProgressUpdate = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
};

// 组件卸载时清理定时器
onUnmounted(() => {
  if (audioContext.value) {
    audioContext.value.destroy()
    audioContext.value = null
  }
  stopProgressUpdate()
});
</script>

<style lang="scss">
.index {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
}

/* 搜索栏样式 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(to right, #ff2c54, #ff6b81);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  .menu-icon {
    font-size: 48rpx;
    margin-right: 10rpx;
    color: #fff;
    transition: transform 0.3s ease;

    &:active {
      transform: scale(0.9);
    }
  }

  .notification {
    background-color: #fff;
    color: #ff2c54;
    font-size: 24rpx;
    padding: 2rpx 10rpx;
    border-radius: 20rpx;
    margin-right: 20rpx;
    transition: transform 0.3s ease;

    &:active {
      transform: scale(0.9);
    }
  }

  .search-input {
    flex: 1;
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 36rpx;
    padding: 10rpx 20rpx;
    transition: background-color 0.3s ease;

    &:active {
      background-color: rgba(255, 255, 255, 0.3);
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      margin-left: 10rpx;
      font-size: 28rpx;
      color: #fff;

      &::placeholder {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .action-icons {
    display: flex;
    margin-left: 20rpx;

    .nut-icon {
      margin-left: 20rpx;
      color: #fff;
      transition: transform 0.3s ease;

      &:active {
        transform: scale(0.9);
      }
    }
  }
}

/* 内容区域样式 */
.content-area {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: calc(100vh - 80rpx);
}

/* 区块通用样式 */
.section {
  margin: 20rpx;
  padding: 20rpx;
  background: linear-gradient(to bottom, #fff, #f8f9fa);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.08);
  }

  .section-header {
    margin-bottom: 20rpx;
    font-size: 32rpx;

    .highlight {
      color: #ff2c54;
      font-weight: bold;
      margin: 0 10rpx;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -4rpx;
        left: 0;
        width: 100%;
        height: 4rpx;
        background: linear-gradient(to right, #ff2c54, #ff6b81);
        border-radius: 2rpx;
      }
    }
  }
}

/* 标签列表样式 */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;

  .tag-item {
    padding: 8rpx 16rpx;
    background-color: #f5f5f5;
    border-radius: 20rpx;
    font-size: 26rpx;
    color: #666;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, #ff2c54, #ff6b81);
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: -1;
    }

    &:active {
      transform: scale(0.95);
    }

    &.active {
      color: #d41414;
      box-shadow: 0 4rpx 8rpx rgba(255, 44, 84, 0.3);

      &::before {
        opacity: 1;
      }
    }

    &:hover:not(.active) {
      transform: translateY(-2rpx);
      box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
    }
  }
}

/* 横向滑动歌曲列表样式 */
.horizontal-song-list {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  .song-list-container {
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    padding: 10rpx 0;
    width: max-content;
    animation: slideIn 0.5s ease-out;
  }

  .song-item {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 200rpx;
    margin-right: 20rpx;
    position: relative;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
    animation: scaleIn 0.5s ease-out forwards;
    animation-delay: calc(var(--index, 0) * 0.05s);
    opacity: 0;

    &:active {
      transform: scale(0.95);
    }

    &:hover {
      transform: translateY(-5rpx);
      box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);

      .song-cover {
        transform: scale(1.05);
      }

      .song-title {
        color: #ff2c54;
      }
    }

    .song-cover-container, .song-cover {
      width: 200rpx;
      height: 200rpx;
      border-radius: 10rpx;
      position: relative;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;
    }

    .song-info {
      margin-top: 10rpx;
      width: 100%;
      animation: fadeIn 0.3s ease-out forwards;
      animation-delay: calc(var(--index, 0) * 0.05s + 0.2s);

      .song-title {
        font-size: 26rpx;
        font-weight: 500;
        margin-bottom: 6rpx;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.3s ease;
      }

      .song-artist {
        font-size: 22rpx;
        color: #999;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.3s ease;
      }
    }

    .play-icon {
      position: absolute;
      right: 10rpx;
      bottom: 10rpx;
      font-size: 30rpx;
      color: white;
      border-radius: 50%;
      width: 40rpx;
      height: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      text-shadow: 0 0 10rpx rgba(0, 0, 0, 0.5);
      z-index: 2;
    }

    &:hover .play-icon {
      opacity: 1;
      transform: scale(1.2);
    }
  }
}

/* 横向滑动播放列表样式 */
.horizontal-playlist {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  .playlist-container {
    display: flex;
    flex-direction: row;
    white-space: nowrap;
    padding: 10rpx 0;
    width: max-content;
    animation: slideIn 0.5s ease-out;
  }

  .playlist-item {
    display: inline-block;
    width: 220rpx;
    margin-right: 20rpx;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
    animation: scaleIn 0.5s ease-out forwards;
    animation-delay: calc(var(--index, 0) * 0.05s);
    opacity: 0;

    &:active {
      transform: scale(0.95);
    }

    &:hover {
      transform: translateY(-5rpx);
      box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);

      .playlist-cover {
        transform: scale(1.05);
      }

      .playlist-title {
        color: #ff2c54;
      }
    }

    .playlist-cover-container {
      position: relative;
      width: 220rpx;
      height: 220rpx;
      border-radius: 10rpx;
      overflow: hidden;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

      .playlist-cover {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
    }

    .playlist-title {
      font-size: 26rpx;
      margin-top: 10rpx;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.3s ease;
      animation: fadeIn 0.3s ease-out forwards;
      animation-delay: calc(var(--index, 0) * 0.05s + 0.2s);
    }

    .recommend-reason {
      font-size: 22rpx;
      color: #999;
      display: block;
      margin-top: 6rpx;
      transition: color 0.3s ease;
      animation: fadeIn 0.3s ease-out forwards;
      animation-delay: calc(var(--index, 0) * 0.05s + 0.3s);
    }
  }
}

/* 动画关键帧 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateX(30rpx);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 上午好个性化推荐区域样式 */
.greeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.free-listening-button {
  font-size: 24rpx;
  color: #ff2c54;
  background-color: rgba(255, 44, 84, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.95);
    background-color: rgba(255, 44, 84, 0.2);
  }
}

.recommendation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-top: 20rpx;

  .grid-item {
    position: relative;
    border-radius: 16rpx;
    overflow: hidden;
    height: 180rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
    animation: scaleIn 0.5s ease-out forwards;
    animation-delay: calc(var(--index, 0) * 0.05s);
    opacity: 0;

    &:active {
      transform: scale(0.95);
    }

    &:hover {
      transform: translateY(-5rpx);
      box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
    }

    .grid-item-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
      filter: brightness(0.7);
      transition: transform 0.3s ease, filter 0.3s ease;
    }

    &:hover .grid-item-bg {
      transform: scale(1.05);
      filter: brightness(0.8);
    }

    .grid-item-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      padding: 16rpx;
      color: #fff;
    }

    .play-icon-grid {
      position: absolute;
      right: 16rpx;
      bottom: 16rpx;
      font-size: 36rpx;
      opacity: 0.8;
      transition: all 0.3s ease;
      text-shadow: 0 0 10rpx rgba(0, 0, 0, 0.5);
    }

    &:hover .play-icon-grid {
      opacity: 1;
      transform: scale(1.2);
    }

    .grid-item-info {
      display: flex;
      flex-direction: column;
    }

    .grid-item-title {
      font-size: 28rpx;
      font-weight: bold;
      margin-bottom: 6rpx;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
    }

    .grid-item-subtitle {
      font-size: 22rpx;
      opacity: 0.9;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
    }

    .free-tag {
      position: absolute;
      top: 16rpx;
      right: 16rpx;
      font-size: 20rpx;
      background-color: rgba(255, 44, 84, 0.8);
      color: #fff;
      padding: 4rpx 10rpx;
      border-radius: 10rpx;
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
    }
  }
}

/* 为你推荐的热门节目区域样式 */
.program-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;

  .program-item {
    display: flex;
    background-color: #f9f9f9;
    border-radius: 16rpx;
    padding: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
    animation: fadeIn 0.5s ease-out forwards;
    animation-delay: calc(var(--index, 0) * 0.05s);
    opacity: 0;

    &:active {
      transform: scale(0.98);
    }

    &:hover {
      transform: translateY(-3rpx);
      box-shadow: 0 6rpx 12rpx rgba(0, 0, 0, 0.08);
      background-color: #fff;
    }

    .program-cover-container {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      overflow: hidden;
      margin-right: 16rpx;
      flex-shrink: 0;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
    }

    .program-cover {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover .program-cover {
      transform: scale(1.05);
    }

    .program-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }

    .program-title {
      font-size: 28rpx;
      font-weight: bold;
      margin-bottom: 8rpx;
      transition: color 0.3s ease;
    }

    &:hover .program-title {
      color: #ff2c54;
    }

    .program-description {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 10rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .program-stats {
      font-size: 22rpx;
      color: #999;
    }
  }
}

/* 每日推荐歌单样式 */
.daily-playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300rpx, 1fr));
  gap: 20rpx;
  padding: 10rpx 0;

  .daily-playlist-item {
    position: relative;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    animation: scaleIn 0.5s ease-out forwards;
    animation-delay: calc(var(--index, 0) * 0.05s);

    &:active {
      transform: scale(0.98);
    }

    .daily-playlist-cover {
      width: 100%;
      height: 200rpx;
      transition: transform 0.3s ease;
    }

    .daily-playlist-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 20rpx;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);

      .daily-playlist-title {
        color: #fff;
        font-size: 28rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
        display: block;
      }

      .daily-playlist-desc {
        color: rgba(255, 255, 255, 0.8);
        font-size: 24rpx;
        display: block;
      }
    }
  }
}

/* 音乐电台样式 */
.radio-list {
  .radio-item {
    display: flex;
    padding: 20rpx 0;
    border-bottom: 1px solid #eee;
    animation: slideIn 0.5s ease-out forwards;
    animation-delay: calc(var(--index, 0) * 0.05s);

    &:last-child {
      border-bottom: none;
    }

    .radio-cover {
      width: 120rpx;
      height: 120rpx;
      border-radius: 12rpx;
      margin-right: 20rpx;
    }

    .radio-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .radio-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .radio-host {
        font-size: 24rpx;
        color: #666;
      }

      .radio-listeners {
        font-size: 22rpx;
        color: #999;
      }
    }
  }
}

.refresh-text, .more-text {
  font-size: 24rpx;
  color: #999;
}
</style>
