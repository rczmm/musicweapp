<template>
  <view class="podcast-container" @scroll="handleScroll">
    <view class="header" :style="{ opacity: headerOpacity, transform: `translateY(${headerTranslateY}px)` }">
      <image :src="podcastCover" class="cover" mode="aspectFill" />
    </view>
    <view class="content-container">
      <view class="content">
        <!-- Podcast Info Section -->
        <view class="podcast-info">
          <text class="podcast-name">{{ podcastName }}</text>
          <text class="podcast-author">by {{ podcastAuthor }}</text>
          <view class="podcast-description">{{ podcastDescription }}</view>
        </view>

        <!-- Action Buttons -->
        <view class="action-buttons">
          <button class="action-button subscribe-button" @tap="subscribePodcast">订阅</button>
          <button class="action-button play-latest-button" @tap="playLatestEpisode">播放最新</button>
        </view>

        <!-- Episode List Section -->
        <view class="episode-list-section">
          <text class="section-title">剧集列表</text>
          <view class="episode-list">
            <view v-for="episode in episodes" :key="episode.id" class="episode-item" @tap="playEpisode(episode)">
              <text class="episode-title">{{ episode.title }}</text>
              <!-- Add more episode details here if needed, e.g., duration -->
              <text class="play-icon">▶</text> <!-- Simple play icon -->
            </view>
          </view>
        </view>

      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Taro from '@tarojs/taro';

// --- Refs for Podcast Data ---
const podcastName = ref('');
const podcastId = ref('');
const podcastCover = ref('');
const podcastDescription = ref('');
const podcastAuthor = ref('');

// --- Refs for Header Animation ---
const headerOpacity = ref(1);
const headerTranslateY = ref(0);
const lastScrollTop = ref(0);

// --- Refs for Episodes ---
const episodes = ref([
  // Mock episode data - replace with API call
  { id: 1, title: '第一集：起源故事', duration: '30:15' },
  { id: 2, title: '第二集：深入探讨', duration: '45:05' },
  { id: 3, title: '第三集：嘉宾访谈', duration: '55:20' },
  { id: 4, title: '第四集：未来展望', duration: '28:50' },
]);

// --- Lifecycle Hooks ---
onMounted(() => {
  const options = Taro.getCurrentInstance().router?.params;
  podcastName.value = decodeURIComponent(options?.name || '播客名称');
  podcastId.value = options?.id || '未知ID';

  // Mock podcast data - replace with API call
  podcastCover.value = 'https://m.ximalaya.com/images/radio/96/09/0c963063371a491b.jpg?x-oss-process=image/resize,m_fill,h_320,w_320/quality,Q_70'; // Placeholder
  podcastDescription.value = '这是一个关于科技，生活和一些瞎想的播客。在这里，我们深入探讨最新的技术趋势，分享有趣的生活见闻，并进行各种无边无际的畅想。'; // Placeholder
  podcastAuthor.value = 'AI 主播'; // Placeholder

  // TODO: Fetch actual podcast details and episodes from API using podcastId.value
});

// --- Event Handlers ---
const handleScroll = (e:any) => {
  // Use document scroll for non-scroll-view implementation if needed
  // For now, assuming scroll events might come from the container if properly configured
  const scrollTop = e.target?.scrollTop || e.detail?.scrollTop || 0; // Adapt based on how scroll is captured
  const delta = scrollTop - lastScrollTop.value;
  lastScrollTop.value = scrollTop;

  const maxScroll = 150; // Adjust sensitivity
  const opacityRatio = Math.max(0, 1 - scrollTop / maxScroll);
  headerOpacity.value = opacityRatio;

  const translateYRatio = Math.min(scrollTop / 2, maxScroll / 2);
  headerTranslateY.value = translateYRatio;
};

const subscribePodcast = () => {
  console.log('Subscribing to podcast:', podcastId.value);
  // TODO: Implement subscription logic (e.g., API call, update state)
  Taro.showToast({ title: '订阅成功（模拟）', icon: 'success', duration: 1500 });
};

const playLatestEpisode = () => {
  if (episodes.value.length > 0) {
    playEpisode(episodes.value[0]);
  } else {
    Taro.showToast({ title: '暂无剧集', icon: 'none' });
  }
};

const playEpisode = (episode: { id: number; title: string; duration: string }) => {
  console.log('Playing episode:', episode.id, episode.title);
  // TODO: Implement episode playback logic
  // Navigate to player page or control a global player service
  Taro.showToast({ title: `开始播放: ${episode.title}`, icon: 'none', duration: 1500 });
};

</script>

<style scoped>
.podcast-container {
  height: 100vh;
  width: 100vw;
  display: flex; /* Use flexbox for layout */
  flex-direction: column; /* Stack header and content vertically */
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%; /* Use 100% instead of 100vw sometimes avoids issues */
  height: 300px; /* Adjust as needed */
  z-index: 10;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none; /* Allow clicks to pass through if header overlaps content */
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensure image covers the area */
}

.content-container {
  flex: 1; /* Allow content to take remaining space */
  overflow-y: scroll; /* Enable vertical scrolling */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  width: 100%;
  z-index: 5; /* Ensure content is above header background potentially */
}

.content {
  padding: 0 20px 40px 20px; /* Add bottom padding */
  padding-top: 300px; /* Space for the fixed header */
  box-sizing: border-box; /* Include padding in width calculation */
  width: 100%;
}

.podcast-info {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px; /* Space below info */
  text-align: left;
}

.podcast-name {
  font-size: 22px; /* Slightly smaller */
  font-weight: bold;
  margin-bottom: 8px;
  display: block; /* Ensure takes full width */
  color: #333;
}

.podcast-author {
  font-size: 15px; /* Slightly smaller */
  color: #555; /* Darker grey */
  margin-bottom: 15px;
  display: block;
}

.podcast-description {
  font-size: 14px;
  color: #444; /* Slightly darker */
  line-height: 1.7; /* Increased line height */
  text-align: justify;
  margin-top: 10px;
}

/* Action Buttons Styling */
.action-buttons {
  display: flex;
  justify-content: space-around; /* Space out buttons */
  margin-bottom: 30px; /* Space below buttons */
  padding: 0 10px; /* Add some horizontal padding */
}

.action-button {
  flex: 1; /* Allow buttons to grow */
  margin: 0 10px; /* Space between buttons */
  padding: 10px 15px;
  border-radius: 20px; /* More rounded */
  font-size: 15px;
  font-weight: bold;
  text-align: center;
  border: none;
  color: #fff;
  cursor: pointer; /* Hand cursor on hover */
  transition: background-color 0.2s ease;
}

.subscribe-button {
  background-color: #ff5722; /* Example color - Orange */
}
.subscribe-button:active {
  background-color: #e64a19; /* Darker shade on press */
}

.play-latest-button {
  background-color: #03a9f4; /* Example color - Blue */
}
.play-latest-button:active {
  background-color: #0288d1; /* Darker shade on press */
}


/* Episode List Styling */
.episode-list-section {
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  display: block; /* Ensure it takes its own line */
  padding-left: 5px; /* Align with list items */
}

.episode-list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden; /* Clip items if needed */
}

.episode-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee; /* Separator */
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.episode-item:last-child {
  border-bottom: none; /* Remove border for the last item */
}
.episode-item:active {
  background-color: #f5f5f5; /* Slight grey on tap */
}

.episode-title {
  flex: 1; /* Take available space */
  font-size: 15px;
  color: #333;
  margin-right: 10px; /* Space before play icon */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-icon {
  font-size: 16px;
  color: #03a9f4; /* Blue color for play */
}

</style>
