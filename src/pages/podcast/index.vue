<template>
  <view class="podcast-container">
    <view class="header" :style="{ opacity: headerOpacity, transform: `translateY(${headerTranslateY}px)` }">
      <image :src="podcastCover" class="cover" mode="aspectFill" />
    </view>
    <view class="content-container" @scroll="handleScroll" :style="{ overflowY: 'scroll' }">
      <view class="content">
        <view class="podcast-info">
          <text class="podcast-name">{{ podcastName }}</text>
          <text class="podcast-author">by {{ podcastAuthor }}</text>
          <view class="podcast-description">{{ podcastDescription }}</view>
        </view>

      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import Taro from '@tarojs/taro';

const podcastName = ref('');
const podcastId = ref('');
const podcastCover = ref('');
const podcastDescription = ref('');
const podcastAuthor = ref('');
const headerOpacity = ref(1);
const headerTranslateY = ref(0);
const lastScrollTop = ref(0);

const options = Taro.getCurrentInstance().router?.params;
podcastName.value = decodeURIComponent(options?.name || '');
podcastId.value = options?.id || '';

onMounted(() => {
  // 模拟数据，实际项目中应从API获取
  podcastCover.value = 'https://m.ximalaya.com/images/radio/96/09/0c963063371a491b.jpg?x-oss-process=image/resize,m_fill,h_320,w_320/quality,Q_70';
  podcastDescription.value = '这是一个关于科技，生活和一些瞎想的播客。';
  podcastAuthor.value = 'AI';
})

const handleScroll = (e:any) => {
  const scrollTop = e.detail.scrollTop;
  const delta = scrollTop - lastScrollTop.value;
  lastScrollTop.value = scrollTop;

  // 动态调整头部透明度和位移
  const maxScroll = 100;
  const opacityRatio = Math.max(0, 1 - scrollTop / maxScroll);
  headerOpacity.value = opacityRatio;

  const translateYRatio = Math.min(scrollTop / 2, maxScroll / 2);
  headerTranslateY.value = translateYRatio;
};
</script>

<style scoped>
.podcast-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
.content-container {
  width: 100vw;
  overflow: hidden;
}
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 300px;
  z-index: 10;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.cover {
  width: 100%;
  height: 100%;
}

.content {
  z-index: 5;
  padding: 0 20px;
  width: 100vw;
  padding-top: 300px;
}
.podcast-info {
  text-align: left;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.podcast-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.podcast-author {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.podcast-description {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  text-align: justify;
  word-break: break-all;
  margin-top: 10px;
}
</style>