<template>
  <view class="splash-screen" v-if="visible" :class="{ 'fade-out': isFading }">
    <!-- 额外的装饰音符 -->
    <text class="note-1">♩</text>
    <text class="note-2">♪</text>
    <text class="note-3">♬</text>

    <view class="splash-content">
      <view class="logo-container">
        <view class="music-note">♪</view>
        <view class="logo-text">霜霜音乐</view>
      </view>
      <demo/>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 控制开屏动画的显示状态
const visible = ref(true)
const isFading = ref(false)

// 在组件挂载后，设置一个定时器来隐藏开屏动画
onMounted(() => {
  // 先显示2秒
  setTimeout(() => {
    // 开始淡出动画
    isFading.value = true

    // 淡出动画完成后隐藏组件
    setTimeout(() => {
      visible.value = false
    }, 800) // 淡出动画持续时间
  }, 2000) // 2秒后开始淡出
})
</script>

<style lang="scss">
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #ff2c54, #ff6b81, #ff9a9e);
  animation: fadeIn 0.5s ease forwards;
  overflow: hidden;
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.splash-screen.fade-out {
  opacity: 0;
  transform: scale(1.1);
}

/* 添加背景音符装饰 */
.splash-screen::before,
.splash-screen::after {
  content: '♫';
  position: absolute;
  font-size: 120rpx;
  color: rgba(255, 255, 255, 0.1);
  animation: float 3s infinite ease-in-out;
}

.splash-screen::before {
  top: 15%;
  left: 20%;
  animation-delay: 0.5s;
}

.splash-screen::after {
  bottom: 15%;
  right: 20%;
  animation-delay: 1s;
}

/* 添加更多音符装饰 */
.splash-screen .note-1,
.splash-screen .note-2,
.splash-screen .note-3 {
  position: absolute;
  font-size: 80rpx;
  color: rgba(255, 255, 255, 0.15);
  animation: float 4s infinite ease-in-out;
}

.splash-screen .note-1 {
  top: 25%;
  left: 70%;
  content: '♩';
  animation-delay: 0.2s;
}

.splash-screen .note-2 {
  top: 65%;
  left: 30%;
  content: '♪';
  animation-delay: 1.5s;
}

.splash-screen .note-3 {
  top: 40%;
  left: 80%;
  content: '♬';
  animation-delay: 0.8s;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.8s ease-out forwards;
}

.logo-container {
  position: relative;
  width: 300rpx;
  height: 300rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 30rpx rgba(255, 255, 255, 0.3);
  animation: pulse 2s infinite;
  position: relative;
  overflow: hidden;
}

.logo-container::after {
  content: '';
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
  animation: rotate 8s linear infinite;
}

.music-note {
  font-size: 80rpx;
  color: #ffffff;
  margin-bottom: 10rpx;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.3);
  animation: bounce 2s ease infinite;
}

.logo-text {
  font-size: 60rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
  letter-spacing: 4rpx;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes scaleIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 30rpx rgba(255, 255, 255, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 50rpx rgba(255, 255, 255, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 30rpx rgba(255, 255, 255, 0.3);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10rpx);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(5deg);
  }
  50% {
    transform: translateY(-20rpx) rotate(-5deg);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
