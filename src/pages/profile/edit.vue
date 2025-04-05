<template>
  <view class="edit-profile-page">
    <!-- 顶部导航栏 -->
    <view class="top-nav">
      <view class="back-button" @tap="goBack">
        <text class="back-icon">⟨</text>
      </view>
      <view class="title">编辑资料</view>
      <view class="save-button" @tap="saveProfile">
        <text>保存</text>
      </view>
    </view>

    <!-- 头像编辑 -->
    <view class="avatar-section">
      <image class="current-avatar" :src="userInfo.avatar" mode="aspectFill" @tap="changeAvatar"/>
      <text class="change-avatar-text">点击更换头像</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">用户名</text>
        <input 
          class="form-input" 
          type="text" 
          v-model="userInfo.username" 
          placeholder="请输入用户名"
        />
      </view>

      <view class="form-item">
        <text class="form-label">个人简介</text>
        <textarea 
          class="form-textarea" 
          v-model="userInfo.bio" 
          placeholder="介绍一下自己吧"
          maxlength="100"
        />
        <text class="char-count">{{ userInfo.bio.length }}/100</text>
      </view>

      <!-- 其他可编辑字段可以根据需要添加 -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Taro from '@tarojs/taro';
import { defaultDataService } from '../../services/defaultDataService';

// 用户信息
const userInfo = ref({
  username: '',
  avatar: '',
  bio: '',
  isVip: false,
  followers: '',
  level: 0,
  listenTime: 0,
  vipLevel: 0
});

// 初始化用户信息
onMounted(() => {
  // 从本地存储或默认数据服务获取用户信息
  try {
    const storedUserInfo = Taro.getStorageSync('userInfo');
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo);
    } else {
      // 使用默认数据
      userInfo.value = defaultDataService.getDefaultUserInfo();
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 使用默认数据
    userInfo.value = defaultDataService.getDefaultUserInfo();
  }
});

// 返回上一页
const goBack = () => {
  Taro.navigateBack();
};

// 保存用户资料
const saveProfile = () => {
  try {
    // 验证用户名不能为空
    if (!userInfo.value.username.trim()) {
      Taro.showToast({
        title: '用户名不能为空',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 保存到本地存储
    Taro.setStorageSync('userInfo', JSON.stringify(userInfo.value));
    
    Taro.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 2000
    });

    // 延迟返回，让用户看到保存成功的提示
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  } catch (error) {
    console.error('保存用户信息失败:', error);
    Taro.showToast({
      title: '保存失败，请重试',
      icon: 'none',
      duration: 2000
    });
  }
};

// 更换头像
const changeAvatar = () => {
  Taro.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: function (res) {
      // 获取选中图片的临时路径
      const tempFilePath = res.tempFilePaths[0];
      
      // 在实际应用中，这里应该上传图片到服务器
      // 这里简单地更新本地头像
      userInfo.value.avatar = tempFilePath;
      
      Taro.showToast({
        title: '头像已更新',
        icon: 'success',
        duration: 1500
      });
    },
    fail: function() {
      Taro.showToast({
        title: '选择图片失败',
        icon: 'none',
        duration: 2000
      });
    }
  });
};
</script>

<style>
.edit-profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40px;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #fff;
  position: relative;
}

.back-button {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.back-icon {
  font-size: 24px;
  color: #333;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.save-button {
  padding: 8px 16px;
  background-color: #ff4e4e;
  color: white;
  border-radius: 20px;
  font-size: 14px;
}

/* 头像编辑区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  background-color: #fff;
  margin-bottom: 20px;
}

.current-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
  border: 2px solid #eee;
}

.change-avatar-text {
  font-size: 14px;
  color: #666;
}

/* 表单区域 */
.form-section {
  background-color: #fff;
  padding: 20px;
}

.form-item {
  margin-bottom: 20px;
  position: relative;
}

.form-label {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.form-input {
  width: 100%;
  height: 50px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0 15px;
  font-size: 16px;
  color: #333;
  background-color: #f9f9f9;
}

.form-textarea {
  width: 100%;
  height: 120px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  color: #333;
  background-color: #f9f9f9;
}

.char-count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font-size: 12px;
  color: #999;
}
</style>