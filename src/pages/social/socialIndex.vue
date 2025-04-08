<template>
  <view class="social-view">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view :class="['tab-item', { active: currentHoldTag === 'follow' }]" @tap="() => currentHoldTag = 'follow'">
        <text>关注</text>
      </view>
      <view :class="['tab-item', { active: currentHoldTag === 'recommend' }]"
            @tap="() => currentHoldTag = 'recommend'">
        <text>推荐</text>
      </view>
      <view class="tab-item-button" @tap="showCreatePost">
        <text>+</text>
      </view>
    </view>

    <!-- 内容流区域 -->
    <view class="content-stream custom-scroll-container"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
          :class="{ 'refreshing': isRefreshing }"
          @scrolltolower="loadMoreContent"
          :refresher-triggered="isRefreshing"
          @refresherrefresh="onRefresh">
      <!-- 内容卡片 -->
      <view v-for="(item, index) in contentList" :key="index" class="content-card" :style="{animation: `fadeIn 0.5s ease forwards ${index * 0.1}s`}">
        <!-- 卡片头部：用户信息 -->
        <view class="card-header">
          <view class="user-info">
            <image class="avatar" :src="item.user.avatar"/>
            <view class="user-details">
              <text class="username">{{ item.user.name }}</text>
              <text class="post-time">{{ item.postTime }}</text>
            </view>
          </view>
          <view class="more-options">
            <text class="more-icon">...</text>
          </view>
        </view>

        <!-- 卡片内容 -->
        <view class="card-content">
          <!-- 文本内容 -->
          <text class="content-text">{{ item.text }}</text>

          <!-- 媒体内容：根据类型显示不同内容 -->
          <view v-if="item.mediaType === 'image'" class="media-container">
            <image v-for="(img, imgIndex) in item.media" :key="imgIndex"
                   class="media-image" :src="img" mode="aspectFill"
                   @tap="previewImage(item.media, imgIndex)"></image>
          </view>

          <view v-else-if="item.mediaType === 'video'" class="media-container">
            <video class="media-video" :src="item.media[0]"
                   :poster="item.videoCover" object-fit="cover"></video>
          </view>

          <view v-else-if="item.mediaType === 'article'" class="article-preview" @tap="openArticle(item.articleId)">
            <view class="article-info">
              <text class="article-title">{{ item.articleTitle }}</text>
              <text class="article-summary">{{ item.articleSummary }}</text>
            </view>
            <image v-if="item.articleCover" class="article-cover" :src="item.articleCover" mode="aspectFill"></image>
          </view>

          <view v-else-if="item.mediaType === 'quote'" class="quote-container">
            <text class="quote-text">{{ item.quoteText }}</text>
            <text class="quote-author">—— {{ item.quoteAuthor }}</text>
          </view>
        </view>

        <!-- 卡片底部：互动按钮 -->
        <view class="card-footer">
          <view class="interaction-button" @tap="toggleLike(index)">
            <text :class="['icon', { 'liked': item.isLiked }]">♥</text>
            <text class="count">{{ item.likes }}</text>
          </view>
          <view class="interaction-button" @tap="showComments(index)">
            <text class="icon">💬</text>
            <text class="count">{{ item.comments.length }}</text>
          </view>
          <view class="interaction-button" @tap="shareContent(index)">
            <text class="icon">↗</text>
            <text class="count">{{ item.shares }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="isLoading" class="loading-indicator">
        <text>加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import Taro from '@tarojs/taro'

// 当前选中的标签
const currentHoldTag = ref('follow');

interface ContentItem {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  postTime: string;
  text: string;
  mediaType: 'image' | 'video' | 'article' | 'quote';
  media: string[];
  videoCover?: string;
  articleId?: string;
  articleTitle?: string;
  articleSummary?: string;
  articleCover?: string;
  quoteText?: string;
  quoteAuthor?: string;
  isLiked: boolean;
  likes: number;
  comments: { id: string; user: string; content: string }[];
  shares: number;
}


// 内容列表数据
const contentList = ref<ContentItem[]>([])

// 加载状态
const isLoading = ref(false)
const isRefreshing = ref(false)

// 触摸事件相关变量
const startY = ref(0)
const touchThreshold = 100 // 下拉阈值

// 模拟获取内容数据
const fetchContent = (refresh = isRefreshing) => {
  isLoading.value = true

  // 模拟网络请求延迟
  setTimeout(() => {
    // 模拟数据
    const newContent: ContentItem[] = [
      {
        id: Math.random() + '',
        user: {
          id: '1',
          name: '音乐爱好者',
          avatar: 'https://picsum.photos/100/100?random=1'
        },
        postTime: '刚刚',
        text: '分享一首我最近超爱的歌曲，旋律太美了！大家一定要听听看～',
        mediaType: 'image',
        media: [
          'https://picsum.photos/400/300?random=2'
        ],
        isLiked: false,
        likes: Math.floor(Math.random() * 200),
        comments: [
          {id: '1', user: '乐迷', content: '这首歌太棒了！'},
          {id: '2', user: '音乐人', content: '旋律很美，编曲也很精彩'}
        ],
        shares: Math.floor(Math.random() * 50)
      },
      {
        id: Math.random() + '',
        user: {
          id: '2',
          name: '古典音乐频道',
          avatar: 'https://picsum.photos/100/100?random=3'
        },
        postTime: '10分钟前',
        text: '贝多芬第九交响曲「欢乐颂」是西方古典音乐中最著名的作品之一，也是贝多芬最后一部完整的交响曲。',
        mediaType: 'video',
        media: ['https://example.com/video1.mp4'],
        videoCover: 'https://picsum.photos/400/300?random=4',
        isLiked: false,
        likes: Math.floor(Math.random() * 500),
        comments: [
          {id: '3', user: '古典乐迷', content: '最爱贝多芬！'},
          {id: '4', user: '音乐学院学生', content: '这部作品影响了后世无数音乐家'}
        ],
        shares: Math.floor(Math.random() * 100)
      },
      {
        id: Math.random() + '',
        user: {
          id: '3',
          name: '音乐资讯',
          avatar: 'https://picsum.photos/100/100?random=5'
        },
        media: [],
        postTime: '2小时前',
        text: '最新音乐产业报告出炉，流媒体音乐消费持续增长！',
        mediaType: 'article',
        articleId: '123',
        articleTitle: '2023年全球音乐产业报告',
        articleSummary: '报告显示，流媒体音乐收入同比增长15%，成为音乐产业最主要的收入来源...',
        articleCover: 'https://picsum.photos/200/150?random=6',
        isLiked: false,
        likes: Math.floor(Math.random() * 300),
        comments: [
          {id: '5', user: '音乐制作人', content: '好消息！'}
        ],
        shares: Math.floor(Math.random() * 80)
      },
      {
        id: Math.random() + '',
        user: {
          id: '4',
          name: '音乐语录',
          avatar: 'https://picsum.photos/100/100?random=7'
        },
        media: [],
        postTime: '昨天',
        text: '分享一句关于音乐的名言',
        mediaType: 'quote',
        quoteText: '音乐是一种比语言更高级的交流方式',
        quoteAuthor: '贝多芬',
        isLiked: false,
        likes: Math.floor(Math.random() * 1000),
        comments: [
          {id: '6', user: '文学爱好者', content: '说得太对了！'},
          {id: '7', user: '音乐老师', content: '我常在课堂上引用这句话'}
        ],
        shares: Math.floor(Math.random() * 200)
      }
    ]

    if (refresh) {
      contentList.value = newContent
    } else {
      contentList.value = [...contentList.value, ...newContent]
    }

    isLoading.value = false
    isRefreshing.value = false
  }, 1000)
}

// 加载更多内容
const loadMoreContent = () => {
  if (!isLoading.value) {
    fetchContent()
  }
}

// 下拉刷新
const onRefresh = () => {
  isRefreshing.value = true
  fetchContent(isRefreshing)
}

// 触摸开始事件
const handleTouchStart = (e) => {
  startY.value = e.touches[0].clientY
}

// 触摸移动事件
const handleTouchMove = (e) => {
  const currentY = e.touches[0].clientY
  const distance = currentY - startY.value

  if (distance > touchThreshold && !isLoading.value && !isRefreshing.value) {
    isRefreshing.value = true
    fetchContent(isRefreshing)
  }
}

// 触摸结束事件
const handleTouchEnd = () => {
  // 如果没有触发刷新，重置状态
  if (!isRefreshing.value) {
    startY.value = 0
  }
}


// 点赞功能
const toggleLike = (index) => {
  const item = contentList.value[index]
  item.isLiked = !item.isLiked
  item.likes += item.isLiked ? 1 : -1

  // 这里可以添加实际的API调用
  // likePost(item.id, item.isLiked)
}

// 显示评论
const showComments = (index) => {
  const item = contentList.value[index]
  // 跳转到评论页面
  Taro.navigateTo({
    url: `/pages/comments/index?id=${item.id}`
  })
}

// 分享内容
const shareContent = (index) => {
  const item = contentList.value[index]
  console.log('分享内容：', item)
  Taro.showShareMenu({
    withShareTicket: true,
    showShareItems: ['shareAppMessage', 'shareTimeline']
  })
}

// 预览图片
const previewImage = (images, current) => {
  Taro.previewImage({
    urls: images,
    current: images[current]
  })
}

// 打开文章
const openArticle = (articleId) => {
  Taro.showToast({
    title: `打开文章ID: ${articleId}`,
    icon: 'none'
  })
  // 实际项目中可以跳转到文章详情页
  // Taro.navigateTo({ url: `/pages/article/index?id=${articleId}` })
}

// 显示创建帖子界面
const showCreatePost = () => {
  // 跳转到发帖页面
  Taro.navigateTo({
    url: '/pages/create-post/index'
  })
}

// 初始化加载数据
onMounted(() => {
  fetchContent(isRefreshing)
})
</script>

<style lang="scss">
.social-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
  background-image: linear-gradient(to bottom, rgba(255, 0, 0, 0.02), rgba(255, 0, 0, 0.01));
}

.top-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20rpx 0;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  border-bottom: 1rpx solid rgba(255, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;

  .tab-item {
    position: relative;
    color: rgb(129, 132, 139);
    padding: 20rpx 30rpx;
    font-size: 32rpx;

    &.active {
      color: rgb(17, 19, 35);
      font-weight: 500;

      // 红色下划线
      &::after {
        content: '';
        position: absolute;
        bottom: -10rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 8rpx;
        background-color: #ff0000;
        border-radius: 5rpx;
      }
    }
  }

  .tab-item-button {
    background-color: #ff0000;
    border-radius: 50%;
    display: flex;
    color: white;
    justify-content: center;
    align-items: center;
    width: 60rpx;
    height: 60rpx;
    font-size: 32rpx;
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.9);
      background-color: #cc0000;
      opacity: 0.8;
    }
  }
}

.content-stream {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
  transition: opacity 0.3s ease;
  
  &.refreshing {
    opacity: 0.7;
  }
}

.custom-scroll-container {
  height: 100vh; /* 根据实际情况调整高度 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* 启用弹性滚动（iOS） */
  scroll-behavior: smooth;
  overscroll-behavior: contain; /* 防止父级滚动 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 0, 0, 0.3) transparent;
  
  &::-webkit-scrollbar {
    width: 6rpx;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 0, 0, 0.3);
    border-radius: 3rpx;
  }
}

.content-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(255, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  .user-info {
    display: flex;
    align-items: center;

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      object-fit: fill;
      border: 2rpx solid rgba(255, 0, 0, 0.2);
      box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      
      &:active {
        transform: scale(0.95);
        box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
      }
    }

    .user-details {
      display: flex;
      flex-direction: column;

      .username {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
      }

      .post-time {
        font-size: 24rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }
  }

  .more-options {
    padding: 10rpx;

    .more-icon {
      font-size: 36rpx;
      color: #999;
    }
  }
}

.card-content {
  margin-bottom: 20rpx;

  .content-text {
    font-size: 28rpx;
    line-height: 1.5;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
  }

  .media-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10rpx;
    margin-bottom: 20rpx;

    .media-image {
      width: 100%;
      height: 400rpx;
      border-radius: 16rpx;
      object-fit: cover;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, filter 0.3s ease;
      
      &:active {
        transform: scale(0.98);
        filter: brightness(0.95);
      }

      &:only-child {
        width: 100%;
      }
    }

    .media-video {
      width: 100%;
      height: 400rpx;
      border-radius: 16rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    }
  }

  .article-preview {
    display: flex;
    background-color: #f9f9f9;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    border-left: 4rpx solid #ff0000;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:active {
      transform: translateX(4rpx);
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    }

    .article-info {
      flex: 1;
      margin-right: 20rpx;

      .article-title {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 10rpx;
        display: block;
      }

      .article-summary {
        font-size: 24rpx;
        color: #666;
        display: block;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .article-cover {
      width: 160rpx;
      height: 120rpx;
      border-radius: 12rpx;
      object-fit: cover;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease;
      
      &:active {
        transform: scale(0.95);
      }
    }
  }

  .quote-container {
    background-color: #f5f5f5;
    border-left: 8rpx solid #ff0000;
    padding: 20rpx 30rpx;
    margin-bottom: 20rpx;
    border-radius: 0 16rpx 16rpx 0;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, border-left-width 0.2s ease;
    
    &:active {
      transform: translateX(4rpx);
      border-left-width: 12rpx;
    }

    .quote-text {
      font-size: 28rpx;
      font-style: italic;
      color: #555;
      line-height: 1.5;
      margin-bottom: 10rpx;
      display: block;
    }

    .quote-author {
      font-size: 24rpx;
      color: #888;
      text-align: right;
      display: block;
    }
  }
}

.card-footer {
  display: flex;
  justify-content: space-around;
  border-top: 2rpx solid #f0f0f0;
  padding-top: 20rpx;

  .interaction-button {
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;
    border-radius: 30rpx;
    transition: background-color 0.2s ease, transform 0.2s ease;
    
    &:active {
      transform: scale(0.9);
      background-color: rgba(255, 0, 0, 0.05);
    }

    .icon {
      font-size: 36rpx;
      color: #999;
      margin-right: 10rpx;
      transition: transform 0.3s ease, color 0.3s ease;

      &.liked {
        color: #ff0000;
        transform: scale(1.2);
      }
    }

    .count {
      font-size: 24rpx;
      color: #999;
      transition: color 0.3s ease;
    }
  }
}

.loading-indicator {
  text-align: center;
  padding: 20rpx 0;
  color: #999;
  font-size: 24rpx;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

.refreshing {
  transition: transform 0.3s ease;
}
</style>
