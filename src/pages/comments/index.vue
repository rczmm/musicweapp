<template>
  <view class="comments-container">
    <!-- 顶部导航栏 -->
    <view class="top-bar">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">⟨</text>
      </view>
      <view class="title-container">
        <text class="title">评论 ({{ comments.length }})</text>
      </view>
    </view>

    <!-- 评论列表区域 -->
    <view class="comments-list" @scroll="handleScroll" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
      <!-- 原始帖子内容预览 -->
      <view class="original-post" v-if="originalPost">
        <view class="user-info">
          <image class="avatar" :src="originalPost.user.avatar" mode="aspectFill"></image>
          <view class="user-details">
            <text class="username">{{ originalPost.user.name }}</text>
            <text class="post-time">{{ originalPost.postTime }}</text>
          </view>
        </view>
        <text class="post-content">{{ originalPost.text }}</text>
      </view>

      <!-- 评论列表 -->
      <view v-if="comments.length > 0" class="comments-section">
        <view v-for="(comment, index) in comments" :key="comment.id" class="comment-item">
          <view class="comment-header">
            <image class="avatar" :src="comment.user.avatar" mode="aspectFill"></image>
            <view class="comment-details">
              <view class="user-row">
                <text class="username">{{ comment.user.name }}</text>
                <text class="comment-time">{{ comment.time }}</text>
              </view>
              <text class="comment-content">{{ comment.content }}</text>
              <view class="comment-actions">
                <view class="action-button" @tap="toggleLike(index)">
                  <text :class="['like-icon', { 'liked': comment.isLiked }]">♥</text>
                  <text class="count">{{ comment.likes }}</text>
                </view>
                <view class="action-button" @tap="replyToComment(comment)">
                  <text class="reply-icon">↩</text>
                  <text class="action-text">回复</text>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 回复列表 -->
          <view v-if="comment.replies && comment.replies.length > 0" class="replies-container">
            <view v-for="(reply, replyIndex) in comment.replies" :key="reply.id" class="reply-item">
              <view class="reply-header">
                <image class="avatar" :src="reply.user.avatar" mode="aspectFill"></image>
                <view class="reply-details">
                  <view class="user-row">
                    <text class="username">{{ reply.user.name }}</text>
                    <text v-if="reply.replyTo" class="reply-to">回复</text>
                    <text v-if="reply.replyTo" class="reply-to-name">{{ reply.replyTo }}</text>
                    <text class="reply-time">{{ reply.time }}</text>
                  </view>
                  <text class="reply-content">{{ reply.content }}</text>
                  <view class="reply-actions">
                    <view class="action-button" @tap="toggleReplyLike(index, replyIndex)">
                      <text :class="['like-icon', { 'liked': reply.isLiked }]">♥</text>
                      <text class="count">{{ reply.likes }}</text>
                    </view>
                    <view class="action-button" @tap="replyToReply(comment, reply)">
                      <text class="reply-icon">↩</text>
                      <text class="action-text">回复</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 无评论提示 -->
      <view v-else-if="!isLoading" class="no-comments">
        <text>暂无评论，快来发表第一条评论吧</text>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="isLoading" class="loading-indicator">
        <text>加载中...</text>
      </view>
      
      <!-- 下拉刷新指示器 -->
      <view v-if="isRefreshing" class="refresh-indicator">
        <text>下拉刷新...</text>
      </view>
    </view>

    <!-- 评论输入区域 -->
    <view class="comment-input-area">
      <view class="input-container">
        <textarea
          class="comment-input"
          v-model="newComment"
          :placeholder="replyPlaceholder"
          maxlength="500"
          auto-height
          :focus="inputFocus"
          @blur="onInputBlur"
        />
        <view class="text-counter" :class="{ 'warning': newComment.length > 450 }">
          {{ newComment.length }}/500
        </view>
      </view>
      <view class="send-button" :class="{ 'active': newComment.trim().length > 0 }" @tap="submitComment">
        <text>发送</text>
      </view>
    </view>

    <!-- 回复取消提示 -->
    <view v-if="isReplying" class="reply-indicator">
      <text>回复: {{ replyToName }}</text>
      <view class="cancel-reply" @tap="cancelReply">
        <text>×</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import Taro from '@tarojs/taro'

// 获取路由参数
const router = Taro.getCurrentInstance().router
const postId = router?.params?.id || ''

// 原始帖子信息
const originalPost = ref(null)

// 评论列表
const comments = ref([])

// 加载状态
const isLoading = ref(false)
const isRefreshing = ref(false)

// 评论输入
const newComment = ref('')
const inputFocus = ref(false)

// 回复状态
const isReplying = ref(false)
const replyToReplyObj = ref(null)
const replyToName = ref('')

// 计算属性：回复的占位符
const replyPlaceholder = computed(() => {
  return isReplying.value ? `回复 ${replyToName.value}` : '写评论...'
})

// 获取帖子信息
const fetchPostInfo = () => {
  // 模拟获取帖子信息
  setTimeout(() => {
    originalPost.value = {
      id: postId,
      user: {
        id: '1',
        name: '音乐爱好者',
        avatar: 'https://picsum.photos/100/100?random=1'
      },
      postTime: '2小时前',
      text: '分享一首我最近超爱的歌曲，旋律太美了！大家一定要听听看～'
    }
  }, 500)
}

// 获取评论数据
const fetchComments = (refresh = false) => {
  isLoading.value = true
  
  // 返回Promise以支持链式调用
  return new Promise((resolve) => {
    // 模拟网络请求延迟
    setTimeout(() => {
      // 模拟数据
      const newComments = [
        {
          id: '1',
          user: {
            id: '2',
            name: '乐迷小王',
            avatar: 'https://picsum.photos/100/100?random=2'
          },
          content: '这首歌真的太好听了！旋律很抓耳，歌词也很有深度。',
          time: '1小时前',
          isLiked: false,
          likes: 12,
          replies: [
            {
              id: '1-1',
              user: {
                id: '3',
                name: '音乐制作人',
                avatar: 'https://picsum.photos/100/100?random=3'
              },
              replyTo: '乐迷小王',
              content: '编曲确实很棒，和声处理得很精彩！',
              time: '50分钟前',
              isLiked: false,
              likes: 5
            },
            {
              id: '1-2',
              user: {
                id: '4',
                name: '古典乐爱好者',
                avatar: 'https://picsum.photos/100/100?random=4'
              },
              replyTo: '音乐制作人',
              content: '我觉得这首歌的和弦进行很有古典音乐的影子',
              time: '30分钟前',
              isLiked: false,
              likes: 3
            }
          ]
        },
        {
          id: '2',
          user: {
            id: '5',
            name: '流行乐评论家',
            avatar: 'https://picsum.photos/100/100?random=5'
          },
          content: '这首歌的制作水平很高，混音很通透，人声处理得也很到位。',
          time: '2小时前',
          isLiked: false,
          likes: 18,
          replies: []
        },
        {
          id: '3',
          user: {
            id: '6',
            name: '音乐学院学生',
            avatar: 'https://picsum.photos/100/100?random=6'
          },
          content: '歌手的声线很特别，情感表达很到位，值得反复聆听！',
          time: '3小时前',
          isLiked: false,
          likes: 7,
          replies: []
        }
      ]
      
      if (refresh) {
        comments.value = newComments
      } else {
        comments.value = [...comments.value, ...newComments]
      }
      
      isLoading.value = false
      isRefreshing.value = false
      resolve() // 解决Promise
    }, 1000)
  })
}

// 滚动相关变量
const scrollTop = ref(0)
const startY = ref(0)
const moveY = ref(0)
const refreshThreshold = 50 // 下拉刷新阈值
const loadingThreshold = 30 // 上拉加载阈值
const isRefreshable = ref(true)

// 处理滚动事件
const handleScroll = (e) => {
  scrollTop.value = e.target.scrollTop
  
  // 检测是否滚动到底部，触发加载更多
  const scrollHeight = e.target.scrollHeight
  const clientHeight = e.target.clientHeight
  
  if (scrollHeight - scrollTop.value - clientHeight < loadingThreshold && !isLoading.value) {
    loadMoreComments()
  }
}

// 处理触摸开始事件
const handleTouchStart = (e) => {
  startY.value = e.touches[0].clientY
  moveY.value = 0
}

// 处理触摸移动事件
const handleTouchMove = (e) => {
  if (!isRefreshable.value) return
  
  const currentY = e.touches[0].clientY
  moveY.value = currentY - startY.value
  
  // 只有在顶部且向下拉动时才触发刷新动画
  if (scrollTop.value <= 0 && moveY.value > 0) {
    e.preventDefault() // 阻止默认滚动
    isRefreshing.value = moveY.value > refreshThreshold
  }
}

// 处理触摸结束事件
const handleTouchEnd = () => {
  if (scrollTop.value <= 0 && moveY.value > refreshThreshold) {
    // 触发刷新
    refreshContent()
  }
  
  // 重置移动距离
  moveY.value = 0
}

// 刷新内容
const refreshContent = () => {
  isRefreshing.value = true
  isRefreshable.value = false
  
  // 模拟刷新
  fetchComments(true).then(() => {
    setTimeout(() => {
      isRefreshing.value = false
      isRefreshable.value = true
    }, 300)
  })
}

// 加载更多评论
const loadMoreComments = () => {
  if (!isLoading.value) {
    fetchComments()
  }
}

// 下拉刷新
const onRefresh = () => {
  isRefreshing.value = true
  fetchComments(true)
}

// 点赞评论
const toggleLike = (index) => {
  const comment = comments.value[index]
  comment.isLiked = !comment.isLiked
  comment.likes += comment.isLiked ? 1 : -1
  
  // 这里可以添加实际的API调用
  // likeComment(comment.id, comment.isLiked)
}

// 点赞回复
const toggleReplyLike = (commentIndex, replyIndex) => {
  const reply = comments.value[commentIndex].replies[replyIndex]
  reply.isLiked = !reply.isLiked
  reply.likes += reply.isLiked ? 1 : -1
  
  // 这里可以添加实际的API调用
  // likeReply(reply.id, reply.isLiked)
}

// 回复评论
let replyToComment = (comment) => {
  isReplying.value = true
  replyToComment.value = comment
  replyToReplyObj.value = null
  replyToName.value = comment.user.name
  inputFocus.value = true
}

// 回复回复
const replyToReply = (comment, reply) => {
  isReplying.value = true
  replyToComment = comment
  replyToReplyObj.value = reply
  replyToName.value = reply.user.name
  inputFocus.value = true
}

// 取消回复
const cancelReply = () => {
  isReplying.value = false
  replyToComment = null
  replyToReplyObj.value = null
  replyToName.value = ''
}

// 输入框失焦
const onInputBlur = () => {
  // 这里可以添加一些处理逻辑
}

// 提交评论
const submitComment = () => {
  if (newComment.value.trim().length === 0) {
    Taro.showToast({
      title: '请输入评论内容',
      icon: 'none'
    })
    return
  }
  
  // 模拟提交评论
  const currentTime = new Date()
  const timeStr = '刚刚'
  
  if (isReplying.value) {
    // 添加回复
    const newReply = {
      id: Date.now().toString(),
      user: {
        id: 'current-user',
        name: '当前用户',
        avatar: 'https://picsum.photos/100/100?random=current'
      },
      replyTo: replyToName.value,
      content: newComment.value,
      time: timeStr,
      isLiked: false,
      likes: 0
    }
    
    // 找到对应的评论并添加回复
    const commentIndex = comments.value.findIndex(c => c.user.name === replyToName.value)
    if (commentIndex !== -1) {
      if (!comments.value[commentIndex].replies) {
        comments.value[commentIndex].replies = []
      }
      comments.value[commentIndex].replies.unshift(newReply)
    }
    
    // 重置回复状态
    cancelReply()
  } else {
    // 添加新评论
    const newCommentObj = {
      id: Date.now().toString(),
      user: {
        id: 'current-user',
        name: '当前用户',
        avatar: 'https://picsum.photos/100/100?random=current'
      },
      content: newComment.value,
      time: timeStr,
      isLiked: false,
      likes: 0,
      replies: []
    }
    
    comments.value.unshift(newCommentObj)
  }
  
  // 清空输入
  newComment.value = ''
  
  // 这里可以添加实际的API调用
  // await submitCommentToServer(postId, newComment)
}

// 返回上一页
const goBack = () => {
  Taro.navigateBack()
}

// 初始化
onMounted(() => {
  fetchPostInfo()
  fetchComments(true)
})
</script>

<style lang="scss">
.comments-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
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
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
  
  .original-post {
    background-color: #ffffff;
    padding: 30rpx;
    margin-bottom: 20rpx;
    
    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      
      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
      }
      
      .user-details {
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
    
    .post-content {
      font-size: 28rpx;
      color: #333;
      line-height: 1.5;
    }
  }
  
  .comments-section {
    .comment-item {
      background-color: #ffffff;
      padding: 30rpx;
      margin-bottom: 2rpx;
      
      .comment-header {
        display: flex;
        
        .avatar {
          width: 70rpx;
          height: 70rpx;
          border-radius: 50%;
          margin-right: 20rpx;
        }
        
        .comment-details {
          flex: 1;
          
          .user-row {
            display: flex;
            align-items: center;
            margin-bottom: 10rpx;
            
            .username {
              font-size: 28rpx;
              font-weight: 500;
              color: #333;
            }
            
            .comment-time {
              font-size: 24rpx;
              color: #999;
              margin-left: 20rpx;
            }
          }
          
          .comment-content {
            font-size: 28rpx;
            color: #333;
            line-height: 1.5;
            margin-bottom: 15rpx;
          }
          
          .comment-actions {
            display: flex;
            gap: 30rpx;
            
            .action-button {
              display: flex;
              align-items: center;
              
              .like-icon {
                font-size: 28rpx;
                color: #999;
                margin-right: 6rpx;
                
                &.liked {
                  color: #ff0000;
                }
              }
              
              .reply-icon {
                font-size: 28rpx;
                color: #999;
                margin-right: 6rpx;
              }
              
              .count, .action-text {
                font-size: 24rpx;
                color: #999;
              }
            }
          }
        }
      }
      
      .replies-container {
        margin-left: 90rpx;
        margin-top: 20rpx;
        
        .reply-item {
          margin-bottom: 20rpx;
          
          .reply-header {
            display: flex;
            
            .avatar {
              width: 50rpx;
              height: 50rpx;
              border-radius: 50%;
              margin-right: 15rpx;
            }
            
            .reply-details {
              flex: 1;
              
              .user-row {
                display: flex;
                align-items: center;
                margin-bottom: 8rpx;
                
                .username {
                  font-size: 26rpx;
                  font-weight: 500;
                  color: #333;
                }
                
                .reply-to {
                  font-size: 24rpx;
                  color: #999;
                  margin: 0 8rpx;
                }
                
                .reply-to-name {
                  font-size: 26rpx;
                  color: #333;
                }
                
                .reply-time {
                  font-size: 24rpx;
                  color: #999;
                  margin-left: 15rpx;
                }
              }
              
              .reply-content {
                font-size: 26rpx;
                color: #333;
                line-height: 1.5;
                margin-bottom: 12rpx;
              }
              
              .reply-actions {
                display: flex;
                gap: 30rpx;
                
                .action-button {
                  display: flex;
                  align-items: center;
                  
                  .like-icon {
                    font-size: 26rpx;
                    color: #999;
                    margin-right: 6rpx;
                    
                    &.liked {
                      color: #ff0000;
                    }
                  }
                  
                  .reply-icon {
                    font-size: 26rpx;
                    color: #999;
                    margin-right: 6rpx;
                  }
                  
                  .count, .action-text {
                    font-size: 24rpx;
                    color: #999;
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  .no-comments {
    text-align: center;
    padding: 100rpx 0;
    color: #999;
    font-size: 28rpx;
  }
  
  .loading-indicator {
    text-align: center;
    padding: 20rpx 0;
    color: #999;
    font-size: 24rpx;
  }
}

.comment-input-area {
  background-color: #ffffff;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: flex-end;
  gap: 20rpx;
  
  .input-container {
    flex: 1;
    
    .comment-input {
      width: 100%;
      min-height: 70rpx;
      max-height: 200rpx;
      font-size: 28rpx;
      line-height: 1.5;
      padding: 15rpx 20rpx;
      box-sizing: border-box;
      background-color: #f5f5f5;
      border-radius: 35rpx;
    }
    
    .text-counter {
      text-align: right;
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
      
      &.warning {
        color: #ff6600;
      }
    }
  }
  
  .send-button {
    padding: 15rpx 30rpx;
    border-radius: 30rpx;
    background-color: #f0f0f0;
    
    text {
      font-size: 28rpx;
      color: #999;
    }
    
    &.active {
      background-color: #ff0000;
      
      text {
        color: #ffffff;
      }
    }
  }
}

.refresh-indicator {
  text-align: center;
  padding: 20rpx 0;
  color: #999;
  font-size: 24rpx;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.8);
  transform: translateY(-100%);
  transition: transform 0.3s;
  
  &.visible {
    transform: translateY(0);
  }
}

.reply-indicator {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 120rpx;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 15rpx 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  text {
    color: #ffffff;
    font-size: 26rpx;
  }
  
  .cancel-reply {
    padding: 10rpx;
    
    text {
      font-size: 32rpx;
    }
  }
}
</style>