<template>
  <view class="album-page">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">⟨</text>
      </view>
      <view class="title">专辑详情</view>
      <view class="more-button" @tap="showMoreOptions">
        <text class="more-icon">⋮</text>
      </view>
    </view>

    <!-- 专辑信息区域 -->
    <view class="album-info-section">
      <view class="album-header">
        <image class="album-cover" :src="albumInfo.cover" mode="aspectFill"/>
        <view class="album-details">
          <text class="album-title">{{ albumInfo.title }}</text>
          <text class="album-artist">{{ albumInfo.artist }}</text>
          <text class="album-desc">{{ albumInfo.description }}</text>
          <view class="album-stats">
            <text class="album-release">发行于 {{ albumInfo.releaseDate }}</text>
            <text class="album-play-count">{{ albumInfo.playCount }}次播放</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <view class="action-button play" @tap="playAll">
          <text class="play-icon">▶</text>
          <text>播放全部</text>
        </view>
        <view class="action-button collect" @tap="collectAlbum">
          <text class="collect-icon">♡</text>
          <text>收藏</text>
        </view>
        <view class="action-button comment" @tap="showComments">
          <text class="comment-icon">💬</text>
          <text>评论</text>
        </view>
        <view class="action-button share" @tap="shareAlbum">
          <text class="share-icon">↗</text>
          <text>分享</text>
        </view>
      </view>
    </view>

    <!-- 歌曲列表 -->
    <view class="song-list-section">
      <view class="section-header">
        <text class="section-title">歌曲列表</text>
        <text class="song-count">共{{ albumSongs.length }}首</text>
      </view>

      <view
        v-for="(song, index) in albumSongs"
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

    <!-- 相关推荐 -->
    <view class="related-section">
      <view class="section-header">
        <text class="section-title">相关推荐</text>
        <text class="more-text">更多 ></text>
      </view>

      <view class="related-albums">
        <view
          v-for="(album, index) in relatedAlbums"
          :key="index"
          class="related-album-item"
          @tap="openAlbum(album)"
        >
          <image :src="album.cover" class="related-album-cover"/>
          <text class="related-album-title">{{ album.title }}</text>
          <text class="related-album-artist">{{ album.artist }}</text>
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
import {ref, onMounted} from 'vue'
import Taro from '@tarojs/taro'
import MiniPlayer from '../../components/MiniPlayer/index.vue'

// 专辑信息
const albumInfo = ref({
  id: '1',
  title: '周杰伦的床边故事',
  artist: '周杰伦',
  cover: 'https://picsum.photos/300/300?random=1',
  description: '周杰伦2016年发行的专辑，融合了多种音乐元素，展现了不同的音乐风格。',
  releaseDate: '2016-06-24',
  playCount: '1.2亿',
  songCount: 10
})

// 专辑歌曲列表
const albumSongs = ref([
  {
    id: '101',
    title: '床边故事',
    artist: '周杰伦',
    duration: '3:45',
    isHQ: true
  },
  {
    id: '102',
    title: '说走就走',
    artist: '周杰伦',
    duration: '4:12',
    isHQ: true
  },
  {
    id: '103',
    title: '一点点',
    artist: '周杰伦',
    duration: '3:30',
    isHQ: false
  },
  {
    id: '104',
    title: '前世情人',
    artist: '周杰伦',
    duration: '4:05',
    isHQ: true
  },
  {
    id: '105',
    title: '英雄',
    artist: '周杰伦',
    duration: '3:58',
    isHQ: true
  },
  {
    id: '106',
    title: '不该',
    artist: '周杰伦/张惠妹',
    duration: '4:45',
    isHQ: true
  },
  {
    id: '107',
    title: '土耳其冰淇淋',
    artist: '周杰伦',
    duration: '3:23',
    isHQ: false
  },
  {
    id: '108',
    title: '告白气球',
    artist: '周杰伦',
    duration: '3:35',
    isHQ: true
  }
])

// 相关推荐专辑
const relatedAlbums = ref([
  {
    id: '2',
    title: '魔杰座',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=2'
  },
  {
    id: '3',
    title: '叶惠美',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: '4',
    title: '范特西',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=4'
  },
  {
    id: '5',
    title: '七里香',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=5'
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
    itemList: ['下载', '添加到歌单', '设为私密收藏', '举报'],
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
  if (albumSongs.value.length > 0) {
    playSong(albumSongs.value[0])
  }
}

// 播放单曲
const playSong = (song) => {
  currentPlayingSong.value = {
    id: song.id,
    title: song.title,
    artist: song.artist,
    cover: albumInfo.value.cover,
    duration: song.duration || 240
  }

  isPlaying.value = true
  playProgress.value = 0

  console.log('播放歌曲:', song.title)
}

// 收藏专辑
const collectAlbum = () => {
  Taro.showToast({
    title: '收藏成功',
    icon: 'success',
    duration: 2000
  })
}

// 显示评论
const showComments = () => {
  Taro.navigateTo({
    url: `/pages/comments/index?id=${albumInfo.value.id}&type=album`
  })
}

// 分享专辑
const shareAlbum = () => {
  Taro.showShareMenu({
    withShareTicket: true
  })
}

// 打开专辑详情
const openAlbum = (album) => {
  Taro.navigateTo({
    url: `/pages/album/index?id=${album.id}`
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
  const albumId = params.id

  // 这里可以根据albumId加载实际数据
  console.log('加载专辑ID:', albumId)
})
</script>

<style lang="scss">
.album-page {
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

/* 专辑信息区域 */
.album-info-section {
  padding: 30rpx;
  background: linear-gradient(to bottom, #ff6b81, #f8f9fa);

  .album-header {
    display: flex;
    margin-bottom: 30rpx;

    .album-cover {
      width: 240rpx;
      height: 240rpx;
      border-radius: 20rpx;
      box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.2);
      margin-right: 30rpx;
    }

    .album-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .album-title {
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
        margin-bottom: 10rpx;
      }

      .album-artist {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 20rpx;
      }

      .album-desc {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.5;
        margin-bottom: 20rpx;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .album-stats {
        font-size: 22rpx;
        color: rgba(255, 255, 255, 0.7);

        .album-release {
          margin-right: 20rpx;
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

    // 移除了这里多余的右花括号
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

/* 相关推荐区域 */
.related-section {
  padding: 30rpx;
  background-color: #fff;
  margin-bottom: 100px;

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

  .related-albums {
    white-space: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    /* 隐藏滚动条 */
    &::-webkit-scrollbar {
      display: none;
    }

    .related-album-item {
      display: inline-block;
      width: 200rpx;
      margin: 0 10rpx;

      .related-album-cover {
        width: 200rpx;
        height: 200rpx;
        border-radius: 10rpx;
        margin-bottom: 10rpx;
        object-fit: fill;
      }

      .related-album-title {
        font-size: 26rpx;
        color: #333;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .related-album-artist {
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
