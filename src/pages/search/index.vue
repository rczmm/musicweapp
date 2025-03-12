<template>
  <view class="search-page">
    <!-- 顶部搜索栏 -->
    <view class="search-header">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">⟨</text>
      </view>
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索歌曲、歌手、专辑" 
          confirm-type="search"
          @confirm="handleSearch"
          @input="handleInput"
          focus
        />
        <text v-if="searchKeyword" class="clear-icon" @tap="clearSearch">✕</text>
      </view>
      <view class="cancel-button" @tap="goBack">取消</view>
    </view>

    <!-- 搜索内容区域 -->
    <scroll-view class="search-content" scroll-y @scrolltolower="loadMore">
      <!-- 搜索建议 -->
      <view class="search-suggestions" v-if="searchKeyword && !hasSearched">
        <view 
          v-for="(suggestion, index) in searchSuggestions" 
          :key="index" 
          class="suggestion-item"
          @tap="selectSuggestion(suggestion)"
        >
          <text class="suggestion-icon">🔍</text>
          <text class="suggestion-text">{{ suggestion }}</text>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view class="hot-search-section" v-if="!searchKeyword && !hasSearched">
        <view class="section-header">
          <text class="section-title">热门搜索</text>
        </view>
        <view class="hot-search-tags">
          <text 
            v-for="(tag, index) in hotSearchTags" 
            :key="index" 
            class="hot-tag"
            :class="{ 'hot-tag-top': index < 3 }"
            @tap="selectSuggestion(tag)"
          >
            {{ tag }}
          </text>
        </view>
      </view>

      <!-- 搜索历史 -->
      <view class="search-history" v-if="!searchKeyword && !hasSearched && searchHistory.length > 0">
        <view class="section-header">
          <text class="section-title">搜索历史</text>
          <text class="clear-history" @tap="clearHistory">清除</text>
        </view>
        <view class="history-list">
          <view 
            v-for="(item, index) in searchHistory" 
            :key="index" 
            class="history-item"
            @tap="selectSuggestion(item)"
          >
            <text class="history-icon">⏱</text>
            <text class="history-text">{{ item }}</text>
            <text class="delete-icon" @tap.stop="removeHistoryItem(index)">✕</text>
          </view>
        </view>
      </view>

      <!-- 搜索结果 -->
      <view class="search-results" v-if="hasSearched">
        <!-- 结果分类标签 -->
        <view class="result-tabs">
          <view 
            v-for="tab in resultTabs" 
            :key="tab.id"
            class="tab-item"
            :class="{ 'active': currentTab === tab.id }"
            @tap="switchTab(tab.id)"
          >
            <text>{{ tab.name }}</text>
          </view>
        </view>

        <!-- 综合结果 -->
        <view class="comprehensive-results" v-if="currentTab === 'comprehensive'">
          <!-- 歌曲结果 -->
          <view class="result-section" v-if="songResults.length > 0">
            <view class="section-header">
              <text class="section-title">歌曲</text>
              <text class="more-text" @tap="switchTab('songs')">更多 ></text>
            </view>
            <view 
              v-for="(song, index) in songResults.slice(0, 3)" 
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

          <!-- 专辑结果 -->
          <view class="result-section" v-if="albumResults.length > 0">
            <view class="section-header">
              <text class="section-title">专辑</text>
              <text class="more-text" @tap="switchTab('albums')">更多 ></text>
            </view>
            <scroll-view class="album-scroll" scroll-x>
              <view 
                v-for="album in albumResults.slice(0, 6)" 
                :key="album.id" 
                class="album-item"
                @tap="openAlbum(album)"
              >
                <image :src="album.cover" class="album-cover" mode="aspectFill" />
                <text class="album-title">{{ album.title }}</text>
                <text class="album-artist">{{ album.artist }}</text>
              </view>
            </scroll-view>
          </view>

          <!-- 歌单结果 -->
          <view class="result-section" v-if="playlistResults.length > 0">
            <view class="section-header">
              <text class="section-title">歌单</text>
              <text class="more-text" @tap="switchTab('playlists')">更多 ></text>
            </view>
            <scroll-view class="playlist-scroll" scroll-x>
              <view 
                v-for="playlist in playlistResults.slice(0, 6)" 
                :key="playlist.id" 
                class="playlist-item"
                @tap="openPlaylist(playlist)"
              >
                <image :src="playlist.cover" class="playlist-cover" mode="aspectFill" />
                <text class="playlist-title">{{ playlist.title }}</text>
                <text class="playlist-info">{{ playlist.songCount }}首</text>
              </view>
            </scroll-view>
          </view>

          <!-- 艺人结果 -->
          <view class="result-section" v-if="artistResults.length > 0">
            <view class="section-header">
              <text class="section-title">艺人</text>
              <text class="more-text" @tap="switchTab('artists')">更多 ></text>
            </view>
            <scroll-view class="artist-scroll" scroll-x>
              <view 
                v-for="artist in artistResults.slice(0, 6)" 
                :key="artist.id" 
                class="artist-item"
                @tap="openArtist(artist)"
              >
                <image :src="artist.avatar" class="artist-avatar" mode="aspectFill" />
                <text class="artist-name">{{ artist.name }}</text>
              </view>
            </scroll-view>
          </view>
        </view>

        <!-- 歌曲标签页 -->
        <view class="songs-tab" v-if="currentTab === 'songs'">
          <view 
            v-for="(song, index) in songResults" 
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

        <!-- 专辑标签页 -->
        <view class="albums-tab" v-if="currentTab === 'albums'">
          <view 
            v-for="album in albumResults" 
            :key="album.id" 
            class="album-list-item"
            @tap="openAlbum(album)"
          >
            <image :src="album.cover" class="album-list-cover" mode="aspectFill" />
            <view class="album-list-info">
              <text class="album-list-title">{{ album.title }}</text>
              <text class="album-list-artist">{{ album.artist }}</text>
              <text class="album-list-date">{{ album.releaseDate }}</text>
            </view>
          </view>
        </view>

        <!-- 歌单标签页 -->
        <view class="playlists-tab" v-if="currentTab === 'playlists'">
          <view 
            v-for="playlist in playlistResults" 
            :key="playlist.id" 
            class="playlist-list-item"
            @tap="openPlaylist(playlist)"
          >
            <image :src="playlist.cover" class="playlist-list-cover" mode="aspectFill" />
            <view class="playlist-list-info">
              <text class="playlist-list-title">{{ playlist.title }}</text>
              <text class="playlist-list-creator">by {{ playlist.creator }}</text>
              <text class="playlist-list-count">{{ playlist.songCount }}首 · {{ playlist.playCount }}次播放</text>
            </view>
          </view>
        </view>

        <!-- 艺人标签页 -->
        <view class="artists-tab" v-if="currentTab === 'artists'">
          <view 
            v-for="artist in artistResults" 
            :key="artist.id" 
            class="artist-list-item"
            @tap="openArtist(artist)"
          >
            <image :src="artist.avatar" class="artist-list-avatar" mode="aspectFill" />
            <view class="artist-list-info">
              <text class="artist-list-name">{{ artist.name }}</text>
              <text class="artist-list-fans">{{ artist.fans }}粉丝</text>
            </view>
          </view>
        </view>

        <!-- 无搜索结果 -->
        <view class="no-results" v-if="hasSearched && !hasResults">
          <image class="no-results-image" src="/assets/no-results.png" />
          <text class="no-results-text">没有找到相关内容</text>
          <text class="no-results-tips">换个关键词试试吧</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Taro from '@tarojs/taro'

// 搜索关键词
const searchKeyword = ref('')
const hasSearched = ref(false)

// 搜索历史
const searchHistory = ref<string[]>([])

// 热门搜索标签
const hotSearchTags = ref([
  '周杰伦新歌',
  '林俊杰',
  '热门歌单',
  '抖音热歌',
  '经典老歌',
  '流行音乐',
  '伤感情歌',
  '轻音乐',
  '摇滚',
  '民谣'
])

// 搜索建议
const searchSuggestions = ref<string[]>([])

// 搜索结果
const songResults = ref([])
const albumResults = ref([])
const playlistResults = ref([])
const artistResults = ref([])

// 结果标签页
const resultTabs = [
  { id: 'comprehensive', name: '综合' },
  { id: 'songs', name: '歌曲' },
  { id: 'albums', name: '专辑' },
  { id: 'playlists', name: '歌单' },
  { id: 'artists', name: '艺人' }
]
const currentTab = ref('comprehensive')

// 计算是否有搜索结果
const hasResults = computed(() => {
  return songResults.value.length > 0 || 
         albumResults.value.length > 0 || 
         playlistResults.value.length > 0 || 
         artistResults.value.length > 0
})

// 返回上一页
const goBack = () => {
  Taro.navigateBack()
}

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = ''
  searchSuggestions.value = []
  hasSearched.value = false
}

// 处理输入
const handleInput = () => {
  if (searchKeyword.value) {
    // 模拟获取搜索建议
    getSearchSuggestions(searchKeyword.value)
    hasSearched.value = false
  } else {
    searchSuggestions.value = []
  }
}

// 获取搜索建议
const getSearchSuggestions = (keyword: string) => {
  // 模拟API请求获取搜索建议
  // 实际项目中应该调用后端API
  setTimeout(() => {
    searchSuggestions.value = [
      `${keyword}的热门歌曲`,
      `${keyword}的专辑`,
      `${keyword}的歌单`,
      `${keyword}的MV`
    ]
  }, 300)
}

// 选择搜索建议
const selectSuggestion = (suggestion: string) => {
  searchKeyword.value = suggestion
  handleSearch()
}

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  
  // 添加到搜索历史
  addToSearchHistory(searchKeyword.value)
  
  // 模拟搜索结果
  mockSearchResults()
  hasSearched.value = true
}

// 添加到搜索历史
const addToSearchHistory = (keyword: string) => {
  // 如果已存在，先移除
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  // 添加到最前面
  searchHistory.value.unshift(keyword)
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value.pop()
  }
  // 保存到本地存储
  Taro.setStorageSync('searchHistory', searchHistory.value)
}

// 移除历史记录项
const removeHistoryItem = (index: number) => {
  searchHistory.value.splice(index, 1)
  Taro.setStorageSync('searchHistory', searchHistory.value)
}

// 清空历史记录
const clearHistory = () => {
  searchHistory.value = []
  Taro.removeStorageSync('searchHistory')
}

// 切换标签页
const switchTab = (tabId: string) => {
  currentTab.value = tabId
}

// 加载更多结果
const loadMore = () => {
  // 实际项目中应该分页加载更多数据
  console.log('加载更多结果')
}

// 播放歌曲
const playSong = (song: any) => {
  console.log('播放歌曲', song)
  // 实际项目中应该跳转到播放页面或调用播放API
}

// 打开专辑详情
const openAlbum = (album: any) => {
  console.log('打开专辑', album)
  // 实际项目中应该跳转到专辑详情页
}

// 打开歌单详情
const openPlaylist = (playlist: any) => {
  console.log('打开歌单', playlist)
  // 实际项目中应该跳转到歌单详情页
}

// 打开艺人详情
const openArtist = (artist: any) => {
  console.log('打开艺人', artist)
  // 实际项目中应该跳转到艺人详情页
}

// 模拟搜索结果数据
const mockSearchResults = () => {
  // 模拟歌曲结果
  songResults.value = [
    { id: 1, title: '七里香', artist: '周杰伦', isHQ: true },
    { id: 2, title: '晴天', artist: '周杰伦', isHQ: true },
    { id: 3, title: '稻香', artist: '周杰伦', isHQ: false },
    { id: 4, title: '青花瓷', artist: '周杰伦', isHQ: true },
    { id: 5, title: '菊花台', artist: '周杰伦', isHQ: false }
  ]
  
  // 模拟专辑结果
  albumResults.value = [
    { id: 1, title: '七里香', artist: '周杰伦', cover: 'https://picsum.photos/200/200?random=1', releaseDate: '2004-08-03' },
    { id: 2, title: '叶惠美', artist: '周杰伦', cover: 'https://picsum.photos/200/200?random=2', releaseDate: '2003-07-31' },
    { id: 3, title: '十一月的萧邦', artist: '周杰伦', cover: 'https://picsum.photos/200/200?random=3', releaseDate: '2005-11-01' }
  ]
  
  // 模拟歌单结果
  playlistResults.value = [
    { id: 1, title: '周杰伦热门歌曲', creator: '音乐平台', cover: 'https://picsum.photos/200/200?random=4', songCount: 50, playCount: 100000 },
    { id: 2, title: '周杰伦经典歌曲', creator: '音乐爱好者', cover: 'https://picsum.photos/200/200?random=5', songCount: 30, playCount: 50000 },
    { id: 3, title: '周杰伦情歌精选', creator: '音乐编辑', cover: 'https://picsum.photos/200/200?random=6', songCount: 20, playCount: 30000 }
  ]
  
  // 模拟艺人结果
  artistResults.value = [
    { id: 1, name: '周杰伦', avatar: 'https://picsum.photos/200/200?random=7', fans: '5000万' },
    { id: 2, name: '周杰伦粉丝团', avatar: 'https://picsum.photos/200/200?random=8', fans: '100万' }
  ]
}

// 页面加载时获取搜索历史
onMounted(() => {
  const history = Taro.getStorageSync('searchHistory')
  if (history) {
    searchHistory.value = history
  }
})
</script>

<style lang="scss">
.search-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.no-results-image {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
}

.no-results-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.no-results-tips {
  font-size: 12px;
  color: #999;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-button {
  padding: 5px 10px 5px 0;
}

.back-icon {
  font-size: 24px;
  color: #333;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 16px;
  padding: 8px 12px;
}

.search-icon {
  margin-right: 8px;
  color: #999;
}

.search-input {
  flex: 1;
  height: 20px;
  font-size: 14px;
  color: #333;
}

.clear-icon {
  color: #999;
  padding: 0 5px;
}

.cancel-button {
  padding: 0 10px;
  font-size: 14px;
  color: #333;
}

.search-content {
  flex: 1;
  background-color: #fff;
}

.search-suggestions {
  padding: 10px 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
}

.suggestion-icon {
  margin-right: 10px;
  color: #999;
}

.suggestion-text {
  font-size: 14px;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.clear-history {
  font-size: 14px;
  color: #999;
}

.hot-search-tags {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.no-results-image {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
}

.no-results-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.no-results-tips {
  font-size: 12px;
  color: #999;
}

.hot-tag {
  background-color: #f5f5f5;
  border-radius: 15px;
  padding: 6px 12px;
  margin: 5px;
  font-size: 12px;
  color: #333;
}

.hot-tag-top {
  color: #ff4d4f;
}

.history-list {
  padding: 0 15px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.history-icon {
  margin-right: 10px;
  color: #999;
}

.history-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.delete-icon {
  color: #999;
  padding: 5px;
}

.result-tabs {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 50px;
  z-index: 99;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
}

.tab-item.active {
  color: #ff4d4f;
  font-weight: bold;
  position: relative;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background-color: #ff4d4f;
}

.comprehensive-results {
  padding-bottom: 20px;
}

.result-section {
  margin-bottom: 15px;
}

.more-text {
  font-size: 12px;
  color: #999;
}

.song-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f5f5f5;
}

.song-index {
  width: 25px;
  font-size: 16px;
  color: #999;
  text-align: center;
}

.song-info {
  flex: 1;
  margin: 0 10px;
}

.song-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  display: block;
}

.song-meta {
  display: flex;
  align-items: center;
}

.hq-tag {
  font-size: 10px;
  color: #ff4d4f;
  border: 1px solid #ff4d4f;
  border-radius: 2px;
  padding: 0 2px;
  margin-right: 5px;
}

.song-artist {
  font-size: 12px;
  color: #999;
}

.song-actions {
  padding: 0 5px;
}

.more-icon {
  color: #999;
  font-size: 18px;
}

.album-scroll, .playlist-scroll, .artist-scroll {
  white-space: nowrap;
  padding: 0 15px;
}

.album-item, .playlist-item, .artist-item {
  display: inline-block;
  width: 100px;
  margin-right: 10px;
  vertical-align: top;
}

.album-cover, .playlist-cover {
  width: 100px;
  height: 100px;
  border-radius: 5px;
  margin-bottom: 5px;
}

.artist-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 5px;
}

.album-title, .playlist-title, .artist-name {
  font-size: 12px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.album-artist, .playlist-info {
  font-size: 10px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.album-list-item, .playlist-list-item, .artist-list-item {
  display: flex;
  padding: 10px 15px;
  border-bottom: 1px solid #f5f5f5;
}

.album-list-cover, .playlist-list-cover, .artist-list-avatar {
  width: 60px;
  height: 60px;
  border-radius: 5px;
}

.artist-list-avatar {
  border-radius: 50%;
}

.album-list-info, .playlist-list-info, .artist-list-info {
  flex: 1;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.no-results-image {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
}

.no-results-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.no-results-tips {
  font-size: 12px;
  color: #999;
}

.album-list-title, .playlist-list-title, .artist-list-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.album-list-artist, .playlist-list-creator, .artist-list-fans {
  font-size: 12px;
  color: #999;
  margin-bottom: 3px;
}

.album-list-date, .playlist-list-count {
  font-size: 12px;
  color: #999;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.no-results-image {
  width: 100px;
  height: 100px;
  margin-bottom: 15px;
}

.no-results-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.no-results-tips {
  font-size: 12px;
  color: #999;
}
</style>