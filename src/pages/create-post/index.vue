<template>
  <view class="create-post-container">
    <!-- 顶部导航栏 -->
    <view class="top-bar">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">⟨</text>
      </view>
      <view class="title-container">
        <text class="title">创建帖子</text>
      </view>
      <view class="publish-button" :class="{ 'active': canPublish }" @tap="publishPost">
        <text>发布</text>
      </view>
    </view>

    <!-- 内容编辑区 -->
    <view class="content-edit-area">
      <!-- 文本输入区 -->
      <textarea
        class="post-text-input"
        v-model="postContent.text"
        placeholder="分享你的音乐见解..."
        maxlength="2000"
        auto-height
        @input="checkCanPublish"
      />
      <view class="text-counter" :class="{ 'warning': postContent.text.length > 1800 }">
        {{ postContent.text.length }}/2000
      </view>

      <!-- 媒体内容预览区 -->
      <view v-if="postContent.mediaType && postContent.media.length > 0" class="media-preview">
        <!-- 图片预览 -->
        <view v-if="postContent.mediaType === 'image'" class="image-preview-container">
          <view 
            v-for="(img, index) in postContent.media" 
            :key="index" 
            class="image-preview-item"
          >
            <image class="preview-image" :src="img" mode="aspectFill" />
            <view class="remove-media-button" @tap="removeMedia(index)">
              <text>×</text>
            </view>
          </view>
        </view>

        <!-- 视频预览 -->
        <view v-else-if="postContent.mediaType === 'video'" class="video-preview-container">
          <video 
            class="preview-video" 
            :src="postContent.media[0]" 
            :poster="postContent.videoCover"
            object-fit="cover"
          ></video>
          <view class="remove-media-button" @tap="removeAllMedia">
            <text>×</text>
          </view>
        </view>

        <!-- 引用预览 -->
        <view v-else-if="postContent.mediaType === 'quote'" class="quote-preview">
          <view class="quote-container">
            <textarea 
              class="quote-text-input" 
              v-model="postContent.quoteText" 
              placeholder="输入引用内容"
              maxlength="200"
              auto-height
            />
            <input 
              class="quote-author-input" 
              v-model="postContent.quoteAuthor" 
              placeholder="引用来源"
              maxlength="50"
            />
          </view>
          <view class="remove-media-button" @tap="removeAllMedia">
            <text>×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部工具栏 -->
    <view class="bottom-toolbar">
      <view class="media-button" @tap="chooseImage">
        <text class="media-icon">🖼️</text>
      </view>
      <view class="media-button" @tap="chooseVideo">
        <text class="media-icon">🎬</text>
      </view>
      <view class="media-button" @tap="addQuote">
        <text class="media-icon">"</text>
      </view>
      <view class="media-button" @tap="addEmoji">
        <text class="media-icon">😊</text>
      </view>
    </view>

    <!-- 发布中遮罩 -->
    <view v-if="isPublishing" class="publishing-mask">
      <view class="publishing-indicator">
        <text>发布中...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Taro from '@tarojs/taro'

// 帖子内容
const postContent = reactive({
  text: '',
  mediaType: '',  // 'image', 'video', 'quote'
  media: [],      // 图片或视频的URL数组
  videoCover: '',  // 视频封面
  quoteText: '',   // 引用内容
  quoteAuthor: ''  // 引用作者
})

// 状态变量
const isPublishing = ref(false)

// 计算属性：是否可以发布
const canPublish = computed(() => {
  return postContent.text.trim().length > 0 || 
    (postContent.mediaType === 'quote' && postContent.quoteText.trim().length > 0)
})

// 检查是否可以发布
const checkCanPublish = () => {
  // 这里可以添加更复杂的验证逻辑
  return canPublish.value
}

// 返回上一页
const goBack = () => {
  if (postContent.text.trim() || postContent.media.length > 0 || postContent.quoteText.trim()) {
    Taro.showModal({
      title: '提示',
      content: '是否放弃当前编辑的内容？',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateBack()
        }
      }
    })
  } else {
    Taro.navigateBack()
  }
}

// 选择图片
const chooseImage = () => {
  // 如果已经有其他类型的媒体，提示用户
  if (postContent.mediaType && postContent.mediaType !== 'image') {
    Taro.showModal({
      title: '提示',
      content: '添加图片将会清除当前已添加的其他媒体内容，是否继续？',
      success: (res) => {
        if (res.confirm) {
          selectImage()
        }
      }
    })
  } else {
    selectImage()
  }
}

// 选择图片的实际逻辑
const selectImage = () => {
  Taro.chooseImage({
    count: 9 - postContent.media.length,  // 最多9张图片
    sizeType: ['compressed'],  // 压缩图
    sourceType: ['album', 'camera'],  // 相册和相机
    success: (res) => {
      // 清除其他类型媒体
      if (postContent.mediaType !== 'image') {
        postContent.mediaType = 'image'
        postContent.media = []
        postContent.videoCover = ''
        postContent.quoteText = ''
        postContent.quoteAuthor = ''
      }
      
      // 添加新选择的图片
      const newImages = res.tempFilePaths
      if (postContent.media.length + newImages.length > 9) {
        Taro.showToast({
          title: '最多只能添加9张图片',
          icon: 'none'
        })
      }
      
      // 将新图片添加到现有图片中
      postContent.media = [...postContent.media, ...newImages].slice(0, 9)
    }
  })
}

// 选择视频
const chooseVideo = () => {
  // 如果已经有其他类型的媒体，提示用户
  if (postContent.mediaType && postContent.mediaType !== 'video') {
    Taro.showModal({
      title: '提示',
      content: '添加视频将会清除当前已添加的其他媒体内容，是否继续？',
      success: (res) => {
        if (res.confirm) {
          selectVideo()
        }
      }
    })
  } else {
    selectVideo()
  }
}

// 选择视频的实际逻辑
const selectVideo = () => {
  Taro.chooseVideo({
    sourceType: ['album', 'camera'],
    maxDuration: 60,  // 最长60秒
    camera: 'back',
    compressed: true,
    success: (res) => {
      // 清除其他类型媒体
      postContent.mediaType = 'video'
      postContent.media = [res.tempFilePath]
      postContent.videoCover = res.thumbTempFilePath || ''
      postContent.quoteText = ''
      postContent.quoteAuthor = ''
    }
  })
}

// 添加引用
const addQuote = () => {
  // 如果已经有其他类型的媒体，提示用户
  if (postContent.mediaType && postContent.mediaType !== 'quote') {
    Taro.showModal({
      title: '提示',
      content: '添加引用将会清除当前已添加的其他媒体内容，是否继续？',
      success: (res) => {
        if (res.confirm) {
          postContent.mediaType = 'quote'
          postContent.media = []
          postContent.videoCover = ''
          postContent.quoteText = ''
          postContent.quoteAuthor = ''
        }
      }
    })
  } else if (postContent.mediaType !== 'quote') {
    postContent.mediaType = 'quote'
    postContent.media = []
    postContent.videoCover = ''
  }
}

// 添加表情
const addEmoji = () => {
  Taro.showToast({
    title: '表情功能开发中...',
    icon: 'none'
  })
}

// 移除单个媒体
const removeMedia = (index) => {
  postContent.media.splice(index, 1)
  if (postContent.media.length === 0) {
    postContent.mediaType = ''
  }
}

// 移除所有媒体
const removeAllMedia = () => {
  postContent.mediaType = ''
  postContent.media = []
  postContent.videoCover = ''
  postContent.quoteText = ''
  postContent.quoteAuthor = ''
}

// 发布帖子
const publishPost = () => {
  if (!canPublish.value) {
    Taro.showToast({
      title: '请输入内容后再发布',
      icon: 'none'
    })
    return
  }
  
  isPublishing.value = true
  
  // 模拟发布过程
  setTimeout(() => {
    isPublishing.value = false
    
    // 这里应该是实际的API调用
    // 例如：uploadPost(postContent)
    
    Taro.showToast({
      title: '发布成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        setTimeout(() => {
          Taro.navigateBack()
        }, 2000)
      }
    })
  }, 1500)
}
</script>

<style lang="scss">
.create-post-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #ffffff;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .back-button {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .back-icon {
      font-size: 40rpx;
      color: #333;
    }
  }
  
  .title-container {
    flex: 1;
    text-align: center;
    
    .title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }
  }
  
  .publish-button {
    padding: 10rpx 30rpx;
    border-radius: 30rpx;
    background-color: #f0f0f0;
    color: #999;
    font-size: 28rpx;
    
    &.active {
      background-color: #ff0000;
      color: #ffffff;
    }
  }
}

.content-edit-area {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  
  .post-text-input {
    width: 100%;
    min-height: 200rpx;
    font-size: 30rpx;
    line-height: 1.5;
    color: #333;
    padding: 0;
  }
  
  .text-counter {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
    
    &.warning {
      color: #ff6600;
    }
  }
  
  .media-preview {
    margin-top: 30rpx;
    
    .image-preview-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
      
      .image-preview-item {
        position: relative;
        width: calc((100% - 40rpx) / 3);
        height: 200rpx;
        
        .preview-image {
          width: 100%;
          height: 100%;
          border-radius: 10rpx;
          object-fit: cover;
        }
        
        .remove-media-button {
          position: absolute;
          top: -15rpx;
          right: -15rpx;
          width: 40rpx;
          height: 40rpx;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          
          text {
            color: #ffffff;
            font-size: 24rpx;
          }
        }
      }
    }
    
    .video-preview-container {
      position: relative;
      width: 100%;
      height: 400rpx;
      margin-bottom: 20rpx;
      
      .preview-video {
        width: 100%;
        height: 100%;
        border-radius: 10rpx;
        object-fit: cover;
      }
      
      .remove-media-button {
        position: absolute;
        top: 10rpx;
        right: 10rpx;
        width: 40rpx;
        height: 40rpx;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        
        text {
          color: #ffffff;
          font-size: 24rpx;
        }
      }
    }
    
    .quote-preview {
      position: relative;
      margin-bottom: 20rpx;
      
      .quote-container {
        background-color: #f5f5f5;
        border-left: 8rpx solid #ddd;
        padding: 20rpx 30rpx;
        border-radius: 0 10rpx 10rpx 0;
        
        .quote-text-input {
          width: 100%;
          font-size: 28rpx;
          font-style: italic;
          color: #555;
          line-height: 1.5;
          margin-bottom: 10rpx;
        }
        
        .quote-author-input {
          width: 100%;
          font-size: 24rpx;
          color: #888;
          text-align: right;
        }
      }
      
      .remove-media-button {
        position: absolute;
        top: -15rpx;
        right: -15rpx;
        width: 40rpx;
        height: 40rpx;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        
        text {
          color: #ffffff;
          font-size: 24rpx;
        }
      }
    }
  }
}

.bottom-toolbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20rpx 0;
  border-top: 1rpx solid #f0f0f0;
  background-color: #ffffff;
  
  .media-button {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .media-icon {
      font-size: 40rpx;
      color: #666;
    }
    
    &:active {
      opacity: 0.7;
    }
  }
}

.publishing-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  .publishing-indicator {
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 10rpx;
    padding: 30rpx 50rpx;
    
    text {
      color: #ffffff;
      font-size: 28rpx;
    }
  }
}
</style>