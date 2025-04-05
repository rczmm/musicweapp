<template>
  <view class="page-container">

    <view class="search-bar">
      <nut-icon-search></nut-icon-search>
      <nut-searchbar v-model="searchKeyword" @search="handleSearch"></nut-searchbar>
    </view>

    <view class="tab-view">
      <view class="tab-list">
        <view class="tab-item" :class="{ 'active': currentIndex === index }" v-for="(item,index) in itemList"
              :key="index" @tap="currentIndex = index">
          <text>{{ item }}</text>
        </view>
      </view>
      <view class="tab-content">
        <view class="tab-content-item" v-if="currentIndex === 0">
          <view class="desc">
            <text>单曲精选</text>
          </view>
          <view class="music-list">
            <view class="music-item" v-for="(item,index) in musicList" :key="index">
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
                <nut-button type="primary" size="small" style="margin-right: 10px" @tap="playSong(item)">
                  <text>播放</text>
                </nut-button>
                <nut-button type="primary" size="small" @tap="addToPlaylist(item)">
                  <text>添加到列表</text>
                </nut-button>
              </view>
            </view>
          </view>
          <view class="desc">
            <text>歌单精选</text>
          </view>
          <view class="order-list">
            <view class="order-item" v-for="(item,index) in orderList" :key="index" @tap="openPlaylist(item)">
              <image :src="item.image" mode="aspectFill" class="order-image"/>
              <view class="order-content">
                <view class="order-title">
                  <text>{{ item.title }}</text>
                </view>
                <view class="order-author">
                  <text>{{ item.author }}</text>
                </view>
                <view class="order-play-count">
                  <text>{{ item.playCount }}次播放~</text>
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
                v-for="album in albumResults"
                :key="album.id"
                class="album-item"
                @tap="openAlbum(album)"
              >
                <image :src="album.cover" class="album-cover" mode="aspectFill"/>
                <text class="album-title">{{ album.title }}</text>
                <text class="album-artist">{{ album.artist }}</text>
              </view>
            </view>
          </view>
        </view>
        <view class="tab-content-item" v-if="currentIndex === 1">
          <view class="desc">
            <text>单曲精选</text>
          </view>
          <view class="music-list">
            <view class="music-item" v-for="(item,index) in musicList" :key="index">
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
                <nut-button type="primary" size="small" style="margin-right: 10px" @tap="playSong(item)">
                  <text>播放</text>
                </nut-button>
                <nut-button type="primary" size="small" @tap="addToPlaylist(item)">
                  <text>添加到列表</text>
                </nut-button>
              </view>
            </view>
          </view>
        </view>
        <view class="tab-content-item" v-if="currentIndex === 2">
          <view class="order-list">
            <view class="order-item" v-for="(item,index) in orderList" :key="index">
              <image :src="item.image" mode="aspectFill" class="order-image"/>
              <view class="order-content">
                <view class="order-title">
                  <text>{{ item.title }}</text>
                </view>
                <view class="order-author">
                  <text>{{ item.author }}</text>
                </view>
                <view class="order-play-count">
                  <text>{{ item.playCount }}次播放~</text>
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
import {onMounted, ref, onUnmounted} from "vue";
import Taro from "@tarojs/taro";
import MiniPlayer from "../../components/MiniPlayer/index.vue";
import {audioService} from "../../services/audioService";
import {musicService} from "../../services/musicService";

const searchKeyword = ref<string>('');
const currentIndex = ref<number>(0);
const currentTab = ref('songs'); // 当前标签页：songs, albums, playlists
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

const itemList = ['综合', '单曲', '歌单'];
const musicList = ref<any[]>([
  {
    id: '1',
    title: '来日方长',
    artist: '黄龄/薛之谦',
    tags: ['华语', '流行'],
  }, {
    id: '12',
    title: '来日方不长',
    artist: '黄龄/薛之谦',
    tags: ['华语', '流行'],
  },
]);
const orderList = ref<any[]>([
  {
    id: '1',
    title: '陈奕迅 请用心听，不要说话',
    num: 48,
    image: 'https://picsum.photos/100/100?random=1',
    playCount: 23121,
    author: 'Tom'
  }, {
    id: '1',
    title: '陈奕迅 请用心听，不要说话',
    num: 48,
    image: 'https://picsum.photos/100/100?random=1',
    playCount: 23121,
    author: 'Tom'
  }, {
    id: '1',
    title: '陈奕迅 请用心听，不要说话',
    num: 48,
    image: 'https://picsum.photos/100/100?random=1',
    playCount: 23121,
    author: 'Tom'
  },
]);

// 专辑搜索结果
const albumResults = ref<any[]>([
  {
    id: '1',
    title: '周杰伦的床边故事',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=1',
    releaseDate: '2016-06-24'
  },
  {
    id: '2',
    title: '魔杰座',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=2',
    releaseDate: '2008-10-14'
  },
  {
    id: '3',
    title: '叶惠美',
    artist: '周杰伦',
    cover: 'https://picsum.photos/200/200?random=3',
    releaseDate: '2003-07-31'
  }
])

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

const handlePlay = () => {
  audioService.play()
  isPlaying.value = true
  console.log('开始播放:', currentPlayingSong.value.title)
}

const handlePause = () => {
  audioService.pause()
  isPlaying.value = false
  console.log('暂停播放:', currentPlayingSong.value.title)
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

// 切换标签页
const switchTab = (tab) => {
  currentTab.value = tab;
};

const handleSearch = async () => {
  try {
    // 使用musicService搜索歌曲
    const songs = await musicService.searchSongs(searchKeyword.value);

    // 更新歌曲列表
    musicList.value = songs.map(song => ({
      ...song,
      tags: ['音乐'] // 添加默认标签
    }));

    // 这里可以添加搜索专辑和歌单的逻辑
    // 示例：模拟搜索专辑和歌单
    // 实际项目中应该调用相应的API

    console.log('搜索结果:', songs);
  } catch (error) {
    console.error('搜索失败:', error);
    Taro.showToast({
      title: '搜索失败，请稍后再试',
      icon: 'none',
      duration: 2000
    });
  }
};

onMounted(async () => {
  const currentInstance = Taro.getCurrentInstance();
  if (currentInstance.router && currentInstance.router.params && currentInstance.router.params.keyword) {
    searchKeyword.value = currentInstance.router.params.keyword;
    handleSearch();
  } else {
    // 如果没有搜索关键词，加载默认歌曲列表
    try {
      const songs = await musicService.getSongs();
      musicList.value = songs.map(song => ({
        ...song,
        tags: ['音乐'] // 添加默认标签
      }));
    } catch (error) {
      console.error('获取歌曲列表失败:', error);
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
}

.search-bar {
  display: flex;
  align-items: center;
}

.tab-list {
  display: flex;
  justify-content: space-around;

  padding: 10px 0;
  border-bottom: 1px solid #ccc;

  .tab-item {
    padding: 5px 10px;

    &.active {
      color: red;
      border-bottom: 2px solid red;
    }

  }
}

.tab-content-item {
  padding: 20px 20px;
  
  .album-scroll {
    white-space: nowrap;
    padding: 10px 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
  }

  .desc {
    color: red;
    font-weight: bold;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .music-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 20px 0;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 0 10px #ccc;

    .music-item-content {

      .music-title {
        font-weight: bold;
        margin: 10px 0;
      }

      .music-artist {
        color: #666;
      }

      .music-tags {
        display: flex;
        margin: 10px 0;

        .nut-tag {
          margin-right: 10px;
        }

      }
    }

  }

  .order-item {
    margin: 20px 10px;
    display: flex;
    align-items: center;
    box-shadow: 0 0 10px #ccc;

    .order-image {
      width: 140px;
      height: 140px;
      object-fit: cover;
      margin-right: 20px;
    }

    .order-content {

      .order-title {
        font-weight: bold;
        margin: 10px 0;
      }
    }
  }
}


</style>
