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
import { audioService } from "../../services/audioService";

const searchKeyword = ref<string>('');
const currentIndex = ref<number>(0);
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

const handleSearch = () => {
  Taro.request({
    url: 'https://api.github.com/search/repositories',
    data: {
      q: searchKeyword.value,
      sort: 'stars',
      order: 'desc',
      per_page: 10,
      page: 1
    },
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    },
    success: (res) => {
      console.log(res);
    },
    fail: (err) => {
      console.error(err);
    }
  })
};

onMounted(() => {
  const currentInstance = Taro.getCurrentInstance();
  if (currentInstance.router && currentInstance.router.params && currentInstance.router.params.keyword) {
    searchKeyword.value = currentInstance.router.params.keyword;
    handleSearch();
  }
  
  // 初始化audioService事件监听
  audioService.onPlay(() => {
    isPlaying.value = true;
  });
  
  audioService.onPause(() => {
    isPlaying.value = false;
  });
  
  audioService.onTimeUpdate((currentTime, duration, progress) => {
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

      .order-author {
        color: #666;
      }

      .order-play-count {
        color: #d91111;
      }


    }

  }

}


</style>
