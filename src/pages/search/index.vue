<template>
  <view class="page-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <nut-icon-search></nut-icon-search>
      <nut-searchbar
        v-model="searchKeyword"
        @search="handleSearch"
        placeholder="搜索歌曲、歌手、专辑"
      ></nut-searchbar>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="custom-loading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <!-- 内容区域 -->
    <view v-else class="tab-view">
      <!-- 标签页导航 -->
      <view class="tab-list">
        <view
          class="tab-item"
          :class="{ 'active': currentIndex === index }"
          v-for="(item,index) in itemList"
          :key="index"
          @tap="currentIndex = index"
        >
          <text>{{ item }}</text>
        </view>
      </view>

      <!-- 标签页内容 -->
      <view class="tab-content">
        <!-- 综合标签页 -->
        <view class="tab-content-item" v-if="currentIndex === 0">
          <!-- 空状态显示 -->
          <view v-if="hasSearched && !hasResults" class="empty-state">
            <text class="empty-icon">🔍</text>
            <text class="empty-text">未找到"{{ searchKeyword }}"相关内容</text>
            <text class="empty-subtext">试试其他关键词，或查看以下推荐内容</text>
          </view>

          <!-- 有内容时显示 -->
          <template v-else>
            <!-- 单曲精选 -->
            <view class="desc">
              <text>单曲精选</text>
            </view>
            <view class="music-list">
              <view
                class="music-item"
                v-for="(item,index) in musicList"
                :key="index"
                :style="{ '--index': index }"
              >
                <view class="music-item-content">
                  <view class="music-title">
                    <text>{{ item.title }}</text>
                  </view>
                  <view class="music-artist">
                    <text>{{ item.artist }}</text>
                  </view>
                  <view class="music-tags">
                    <view v-for="(tag,index) in item.tags" :key="index">
                      <nut-tag type="danger">
                        <text>{{ tag }}</text>
                      </nut-tag>
                    </view>
                  </view>
                </view>
                <view class="music-oper">
                  <nut-button type="primary" size="small" @tap="playSong(item)">
                    <text>播放</text>
                  </nut-button>
                  <nut-button type="default" size="small" @tap="addToPlaylist(item)">
                    <text>+</text>
                  </nut-button>
                </view>
              </view>
            </view>

            <!-- 歌单精选 -->
            <view class="desc">
              <text>歌单精选</text>
            </view>
            <view class="order-list">
              <view
                class="order-item"
                v-for="(item,index) in orderList"
                :key="index"
                @tap="openPlaylist(item)"
                :style="{ '--index': index }">
                <image :src="item.image" mode="aspectFill" class="order-image"/>
                <view class="order-content">
                  <view class="order-title">
                    <text>{{ item.title }}</text>
                  </view>
                  <view class="order-author">
                    <text>{{ item.author }}</text>
                  </view>
                  <view class="order-play-count">
                    <text>{{ item.playCount }}次播放 · </text>
                    <text>{{ item.num }}首歌曲</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 专辑精选 -->
            <view class="desc">
              <text>专辑精选</text>
            </view>
            <view class="album-list">
              <view class="album-scroll">
                <view
                  v-for="(album, index) in albumResults"
                  :key="album.id"
                  class="album-item"
                  @tap="openAlbum(album)"
                  :style="{ '--index': index }"
                >
                  <image :src="album.cover" class="album-cover" mode="aspectFill"/>
                  <text class="album-title">{{ album.title }}</text>
                  <text class="album-artist">{{ album.artist }}</text>
                </view>
              </view>
            </view>
          </template>
        </view>

        <!-- 单曲标签页 -->
        <view class="tab-content-item" v-if="currentIndex === 1">
          <!-- 空状态显示 -->
          <view v-if="hasSearched && musicList.length === 0" class="empty-state">
            <text class="empty-icon">🎵</text>
            <text class="empty-text">未找到"{{ searchKeyword }}"相关歌曲</text>
            <text class="empty-subtext">试试其他关键词，或查看推荐内容</text>
          </view>

          <!-- 有内容时显示 -->
          <view v-else class="music-list">
            <view
              class="music-item"
              v-for="(item,index) in musicList"
              :key="index"
              :style="{ '--index': index }"
            >
              <view class="music-item-content">
                <view class="music-title">
                  <text>{{ item.title }}</text>
                </view>
                <view class="music-artist">
                  <text>{{ item.artist }}</text>
                </view>
                <view class="music-tags">
                  <view v-for="(tag,index) in item.tags" :key="index">
                    <nut-tag type="danger">
                      <text>{{ tag }}</text>
                    </nut-tag>
                  </view>
                </view>
              </view>
              <view class="music-oper">
                <nut-button type="primary" size="small" @tap="playSong(item)">
                  <text>播放</text>
                </nut-button>
                <nut-button type="default" size="small" @tap="addToPlaylist(item)">
                  <text>+</text>
                </nut-button>
              </view>
            </view>
          </view>
        </view>

        <!-- 歌单标签页 -->
        <view class="tab-content-item" v-if="currentIndex === 2">
          <!-- 空状态显示 -->
          <view v-if="hasSearched && orderList.length === 0" class="empty-state">
            <text class="empty-icon">📋</text>
            <text class="empty-text">未找到"{{ searchKeyword }}"相关歌单</text>
            <text class="empty-subtext">试试其他关键词，或查看推荐内容</text>
          </view>

          <!-- 有内容时显示 -->
          <view v-else class="order-list">
            <view
              class="order-item"
              v-for="(item,index) in orderList"
              :key="index"
              :style="{ '--index': index }"
              @tap="openPlaylist(item)"
            >
              <image :src="item.image" mode="aspectFill" class="order-image"/>
              <view class="order-content">
                <view class="order-title">
                  <text>{{ item.title }}</text>
                </view>
                <view class="order-author">
                  <text>{{ item.author }}</text>
                </view>
                <view class="order-play-count">
                  <text>{{ item.playCount }}次播放 · </text>
                  <text>{{ item.num }}首歌曲</text>
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
import {Search as NutIconSearch} from '@nutui/icons-vue-taro';
import {onMounted, ref, onUnmounted, computed} from "vue";
import Taro from "@tarojs/taro";
import MiniPlayer from "../../components/MiniPlayer/index.vue";
import {audioService} from "../../services/audioService";
import {musicService} from "../../services/musicService";
import {defaultDataService} from "../../services/defaultDataService";


const searchKeyword = ref<string>('');
const currentIndex = ref<number>(0);
const currentTab = ref('songs'); // 当前标签页：songs, albums, playlists
const currentPlayingSong = ref({
  id: '1',
  title: '来日方长',
  artist: '黄龄/薛之谦',
  cover: 'https://picsum.photos/300/300?random=1',
  duration: 240, // 歌曲时长（秒）
  audioUrl: 'https://picsum.photos/100/100?random=1'
});
const isPlaying = ref(false);
const playProgress = ref(0);
const isLoading = ref(false);
const hasSearched = ref(false);

const itemList = ['综合', '单曲', '歌单'];
const musicList = ref<any[]>([]);
const orderList = ref<any[]>([]);
const albumResults = ref<any[]>([]);

// 是否有搜索结果
const hasResults = computed(() => {
  return musicList.value.length > 0 || orderList.value.length > 0 || albumResults.value.length > 0;
});

// 初始化默认数据
const initDefaultData = () => {
  // 默认歌曲列表
  musicList.value = [
    {
      id: 'default-1',
      title: '来日方长',
      artist: '黄龄/薛之谦',
      tags: ['华语', '流行'],
      cover: 'https://picsum.photos/300/300?random=1',
    },
    {
      id: 'default-2',
      title: '演员',
      artist: '薛之谦',
      tags: ['华语', '流行'],
      cover: 'https://picsum.photos/300/300?random=2',
    },
    {
      id: 'default-3',
      title: '光年之外',
      artist: '邓紫棋',
      tags: ['华语', '流行'],
      cover: 'https://picsum.photos/300/300?random=3',
    },
    {
      id: 'default-4',
      title: '起风了',
      artist: '买辣椒也用券',
      tags: ['华语', '民谣'],
      cover: 'https://picsum.photos/300/300?random=4',
    },
  ];

  // 默认歌单列表
  orderList.value = [
    {
      id: 'playlist-1',
      title: '华语流行：听听那些熟悉的旋律',
      num: 48,
      image: 'https://picsum.photos/300/300?random=10',
      playCount: 23121,
      author: '音乐编辑'
    },
    {
      id: 'playlist-2',
      title: '民谣精选：城市的孤独与温暖',
      num: 36,
      image: 'https://picsum.photos/300/300?random=11',
      playCount: 18432,
      author: '民谣爱好者'
    },
    {
      id: 'playlist-3',
      title: '经典粤语：回味港乐黄金时代',
      num: 52,
      image: 'https://picsum.photos/300/300?random=12',
      playCount: 31245,
      author: '粤语歌迷'
    },
  ];

  // 默认专辑列表
  albumResults.value = [
    {
      id: 'album-1',
      title: '周杰伦的床边故事',
      artist: '周杰伦',
      cover: 'https://picsum.photos/300/300?random=20',
      releaseDate: '2016-06-24'
    },
    {
      id: 'album-2',
      title: '魔杰座',
      artist: '周杰伦',
      cover: 'https://picsum.photos/300/300?random=21',
      releaseDate: '2008-10-14'
    },
    {
      id: 'album-3',
      title: '叶惠美',
      artist: '周杰伦',
      cover: 'https://picsum.photos/300/300?random=22',
      releaseDate: '2003-07-31'
    },
    {
      id: 'album-4',
      title: 'Lover',
      artist: 'Taylor Swift',
      cover: 'https://picsum.photos/300/300?random=23',
      releaseDate: '2019-08-23'
    },
    {
      id: 'album-5',
      title: '25',
      artist: 'Adele',
      cover: 'https://picsum.photos/300/300?random=24',
      releaseDate: '2015-11-20'
    }
  ]
}

const playSong = (song) => {
  // 更新当前播放歌曲信息
  currentPlayingSong.value = {
    id: song.id || Math.random().toString(36).substring(2, 15),
    title: song.title,
    artist: song.artist,
    cover: song.cover || 'https://picsum.photos/100/100?random=1',
    duration: song.duration || 240,
    audioUrl: song.audioUrl || song.url || 'https://example.com/song1.mp3' // 使用默认URL作为示例
  }

  // 使用audioService播放歌曲
  audioService.playSong(currentPlayingSong.value)
  isPlaying.value = true
  playProgress.value = 0

  console.log('播放歌曲:', song.title)
  Taro.showToast({
    title: `正在播放: ${song.title}`,
    icon: 'success',
    duration: 2000
  })
}

const addToPlaylist = (song) => {
  console.log('添加到播放列表:', song.title)
  Taro.showToast({
    title: `已添加到播放列表: ${song.title}`,
    icon: 'success',
    duration: 2000
  })
}

const handleShowPlaylist = () => {
  console.log('显示播放列表')
  Taro.navigateTo({
    url: '/pages/playlist/index?id=current&title=当前播放列表'
  })
}

// 打开专辑详情页
const openAlbum = (album) => {
  console.log('打开专辑:', album.title);
  Taro.navigateTo({
    url: `/pages/album/albumIndex?id=${album.id}`
  });
};

// 打开歌单详情页
const openPlaylist = (playlist) => {
  console.log('打开歌单:', playlist.title);
  Taro.navigateTo({
    url: `/pages/playlist/index?id=${playlist.id}`
  });
};


const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    Taro.showToast({
      title: '请输入搜索关键词',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  isLoading.value = true;
  hasSearched.value = true;

  try {
    // 使用musicService搜索歌曲
    const songs = await musicService.searchSongs(searchKeyword.value);

    // 更新歌曲列表
    musicList.value = songs.map(song => ({
      ...song,
      tags: song.tags || ['华语', '流行'] // 添加默认标签
    }));

    // 模拟搜索专辑
    // 在实际项目中应该调用API
    const keyword = searchKeyword.value.toLowerCase();
    albumResults.value = defaultDataService.getDefaultAlbums().filter(album =>
      album.title.toLowerCase().includes(keyword) ||
      album.artist.toLowerCase().includes(keyword)
    );

    // 模拟搜索歌单
    // 在实际项目中应该调用API
    orderList.value = defaultDataService.getDefaultPlaylists().filter(playlist =>
      playlist.title.toLowerCase().includes(keyword) ||
      playlist.creator.toLowerCase().includes(keyword)
    ).map(playlist => ({
      id: playlist.id,
      title: playlist.title,
      num: playlist.songCount,
      image: playlist.cover,
      playCount: playlist.playCount,
      author: playlist.creator
    }));

    console.log('搜索结果:', songs);
  } catch (error) {
    console.error('搜索失败:', error);
    Taro.showToast({
      title: '搜索失败，请稍后再试',
      icon: 'none',
      duration: 2000
    });

    // 搜索失败时加载一些默认数据
    initDefaultData();
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;

  // 初始化默认数据
  initDefaultData();

  const currentInstance = Taro.getCurrentInstance();
  if (currentInstance.router && currentInstance.router.params && currentInstance.router.params.keyword) {
    searchKeyword.value = currentInstance.router.params.keyword;
    await handleSearch();
  } else {
    // 如果没有搜索关键词，加载默认歌曲列表
    try {
      const songs = await musicService.getSongs();
      if (songs && songs.length > 0) {
        musicList.value = songs.map(song => ({
          ...song,
          tags: song.tags || ['华语', '流行'] // 添加默认标签
        }));
      }
    } catch (error) {
      console.error('获取歌曲列表失败:', error);
      // 错误时已经有默认数据，不需要额外处理
    } finally {
      isLoading.value = false;
    }
  }

  // 初始化audioService事件监听
  audioService.onPlay(() => {
    isPlaying.value = true;
  });

  audioService.onPause(() => {
    isPlaying.value = false;
  });

  audioService.onTimeUpdate((time, duration, progress) => {
    playProgress.value = progress;
  });

  // 同步当前状态
  if (audioService.currentSong) {
    currentPlayingSong.value = audioService.currentSong;
    isPlaying.value = audioService.isPlaying;
    playProgress.value = audioService.progress;
  }
});

onUnmounted(() => {
  // 组件卸载时不需要移除所有监听器，因为其他页面可能也在使用
  // 如果需要，可以添加移除特定监听器的方法
})

</script>

<style lang="scss">

.page-container {
  padding: 10px 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  margin: 20px 0;
}

.custom-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 77, 79, 0.2);
  border-top-color: #ff4d4f;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

.loading-text {
  color: #666;
  font-size: 14px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 12px 15px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
}

.tab-list {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  padding: 12px 0;
  border-radius: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .tab-item {
    padding: 8px 15px;
    font-size: 16px;
    position: relative;
    transition: all 0.3s ease;

    &.active {
      color: #ff4d4f;
      font-weight: bold;

      &:after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 3px;
        background-color: #ff4d4f;
        border-radius: 3px;
      }
    }
  }
}

.tab-content-item {
  padding: 10px 0;

  .album-scroll {
    white-space: nowrap;
    padding: 15px 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    gap: 15px;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .desc {
    color: #ff4d4f;
    font-weight: bold;
    margin: 25px 0 15px;
    font-size: 18px;
    display: flex;
    align-items: center;

    &:before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 18px;
      background-color: #ff4d4f;
      margin-right: 8px;
      border-radius: 2px;
    }
  }

  .music-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .music-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-radius: 12px;
    background-color: #fff;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.98);
    }

    .music-item-content {
      flex: 1;
      margin-right: 10px;

      .music-title {
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 16px;
        color: #333;
      }

      .music-artist {
        color: #666;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .music-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;

        .nut-tag {
          margin-right: 5px;
          font-size: 12px;
        }
      }
    }

    .music-oper {
      display: flex;
      gap: 8px;
    }
  }

  .order-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .order-item {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.98);
    }

    .order-image {
      width: 120px;
      height: 120px;
      border-radius: 8px;
      object-fit: cover;
      margin-right: 15px;
    }

    .order-content {
      flex: 1;

      .order-title {
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 16px;
        color: #333;
      }

      .order-author {
        color: #666;
        font-size: 14px;
        margin-bottom: 5px;
      }

      .order-play-count {
        color: #999;
        font-size: 12px;
      }
    }
  }

  .album-item {
    display: inline-block;
    width: 150px;
    margin-right: 15px;
    text-align: center;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.95);
    }

    .album-cover {
      width: 150px;
      height: 150px;
      border-radius: 8px;
      margin-bottom: 8px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
    }

    .album-title {
      font-size: 14px;
      font-weight: bold;
      color: #333;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
    }

    .album-artist {
      font-size: 12px;
      color: #666;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  // 空状态样式
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #999;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 15px;
      color: #ddd;
    }

    .empty-text {
      font-size: 16px;
      margin-bottom: 20px;
    }

    .empty-subtext {
      font-size: 14px;
      text-align: center;
      margin-bottom: 20px;
    }
  }
}

// 添加动画效果
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.music-item, .order-item, .album-item {
  animation: fadeIn 0.3s ease forwards;
  animation-delay: calc(var(--index, 0) * 0.05s);
  opacity: 0;
}

</style>
