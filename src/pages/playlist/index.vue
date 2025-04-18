<template>
  <view class="playlist-page">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="title">歌单详情</view>
      <view class="more-button" @tap="showMoreOptions">
        <text class="more-icon">⋮</text>
      </view>
    </view>

    <!-- 歌单信息区域 -->
    <view class="playlist-info-section">
      <view class="playlist-header">
        <image class="playlist-cover" :src="playlistInfo.cover" mode="aspectFill"/>
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

      <view class="similar-playlists">
        <view
          v-for="(playlist, index) in similarPlaylists"
          :key="playlist.id"
          class="similar-playlist-item"
          @tap="openPlaylist(playlist)"
        >
          <image :src="playlist.cover" class="similar-playlist-cover" mode="aspectFill"/>
          <text class="similar-playlist-title">{{ playlist.title }}</text>
          <text class="similar-playlist-creator">by {{ playlist.creator }}</text>
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
import {ref, computed, onMounted} from 'vue'
import Taro from '@tarojs/taro'
import MiniPlayer from '../../components/MiniPlayer/index.vue'
import {musicService} from '../../services/musicService'

// 歌单信息
const playlistInfo = ref({
  id: '',
  title: '',
  creator: '',
  cover: '',
  description: '',
  playCount: '',
  collectCount: '',
  songCount: 0,
  updateTime: ''
})

// 歌单歌曲列表
const playlistSongs = ref<any[]>([]);

// 加载歌曲数据
const loadSongs = async (playlistId: number) => {
  try {
    const songs = await musicService.getPlaylistSongs(playlistId);

    // 检查返回的歌曲数据是否为有效数组
    if (!songs || !Array.isArray(songs)) {
      console.error('返回的歌曲数据无效:', songs);
      Taro.showToast({
        title: '歌曲数据格式错误',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 将API返回的歌曲数据转换为播放列表所需的格式
    playlistSongs.value = songs.map(song => ({
      ...song,
      duration: song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '0:00',
      isHQ: true // 默认设置为高品质
    }));
  } catch (error) {
    console.error('加载歌单歌曲列表失败:', error);
    Taro.showToast({
      title: '加载歌单歌曲列表失败',
      icon: 'none',
      duration: 2000
    });
  }
}

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
    Taro.showToast({
      title: '开始播放全部歌曲',
      icon: 'success',
      duration: 2000
    })
  }
}

// 播放单曲
const playSong = (song: any ) => {
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


const handleShowPlaylist = () => {
  console.log('显示播放列表')
}

// 加载歌单详情
const loadPlaylistInfo = async (playlistId: string) => {
  try {
    const playlist = await musicService.getPlaylistById(playlistId);
    if (playlist) {
      playlistInfo.value = playlist;
    } else {
      Taro.showToast({
        title: '歌单不存在',
        icon: 'none',
        duration: 2000
      });
    }
  } catch (error) {
    console.error('加载歌单详情失败:', error);
    Taro.showToast({
      title: '加载歌单详情失败',
      icon: 'none',
      duration: 2000
    });
  }
}

// 页面加载时
onMounted(() => {
  // 获取路由参数
  const params = Taro.getCurrentInstance().router.params
  const playlistId = params.id;
  console.log('歌单ID:', playlistId);

  // 加载歌单详情
  if (playlistId) {
    loadPlaylistInfo(playlistId);
    // 加载歌单对应的歌曲列表
    loadSongs(playlistId);
  }
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
  justify-content: center;
  padding: 20rpx;
  background: linear-gradient(to right, #ff2c54, #ff6b81);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;

  .more-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .more-icon {
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
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 10rpx 0;

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
