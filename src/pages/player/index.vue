<template>
    <view class="player-detail">
        <!-- 顶部导航栏 -->
        <view class="top-bar">
            <view class="back-button" @tap="goBack">
                <text class="back-icon">⟨</text>
            </view>
            <view class="title-container">
                <text class="title">私人推荐</text>
            </view>
            <view class="refresh-button" @tap="refreshPlaylist">
                <text class="refresh-icon">↻</text>
            </view>
        </view>

        <!-- 唱片区域 -->
        <view class="vinyl-container">
            <view class="vinyl-record" :class="{ 'rotating': isPlaying }">
                <view class="vinyl-outer-ring"></view>
                <view class="vinyl-inner-circle">
                    <image :src="currentSong.cover" class="album-cover" />
                </view>
            </view>
            <view class="stylus" :class="{ 'playing': isPlaying }"></view>
        </view>

        <!-- 歌曲信息 -->
        <view class="song-info">
            <view class="song-title-container">
                <text class="song-title">{{ currentSong.title }}</text>
                <view class="artist-container">
                    <text class="song-artist">{{ currentSong.artist }}</text>
                    <text class="artist-more">></text>
                </view>
            </view>

            <!-- 互动图标 -->
            <view class="interaction-icons">
                <view class="icon-container">
                    <view class="heart-icon" @tap="toggleLike">
                        <text :class="{ 'liked': isLiked }">♥</text>
                    </view>
                    <text class="count-text">10w+</text>
                </view>
                <view class="icon-container">
                    <view class="comment-icon" @tap="showComments">
                        <text>💬</text>
                    </view>
                    <text class="count-text">999+</text>
                </view>
            </view>
        </view>

        <!-- 进度条 -->
        <view class="progress-container">
            <text class="current-time">{{ formatTime(currentTime) }}</text>
            <view class="slider-container">
                <view class="slider-track">
                    <view class="slider-fill" :style="{ width: `${progress * 100}%` }"></view>
                    <view class="slider-thumb" :style="{ left: `${progress * 100}%` }" @touchstart="onSliderTouchStart"
                        @touchmove="onSliderTouchMove" @touchend="onSliderTouchEnd"></view>
                </view>
            </view>
            <text class="total-time">{{ formatTime(currentSong.duration) }}</text>
            <text class="quality-indicator">极高</text>
        </view>

        <!-- 播放控制 -->
        <view class="playback-controls">
            <view class="control-button" @tap="togglePlayMode">
                <text class="mode-icon">{{ playModeIcon }}</text>
            </view>
            <view class="control-button" @tap="prevSong">
                <text class="prev-icon">⏮</text>
            </view>
            <view class="play-button" @tap="togglePlay">
                <text v-if="!isPlaying" class="play-icon">▶</text>
                <text v-else class="pause-icon">❚❚</text>
            </view>
            <view class="control-button" @tap="nextSong">
                <text class="next-icon">⏭</text>
            </view>
            <view class="control-button" @tap="showPlaylist">
                <text class="playlist-icon">☰</text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Taro from '@tarojs/taro'
import { audioService, PlayMode } from '../../services/audioService'

// 定义组件的props
const props = defineProps({
    // 当前播放的歌曲信息
    song: {
        type: Object,
        default: () => ({
            id: '1',
            title: '来日方长',
            artist: '黄龄/薛之谦',
            cover: 'https://picsum.photos/300/300?random=1',
            duration: 234, // 歌曲时长（秒）
        })
    },
    // 是否正在播放
    playing: {
        type: Boolean,
        default: false
    },
    // 当前播放进度（0-1之间的小数）
    progress: {
        type: Number,
        default: 0
    }
})

// 定义事件
const emit = defineEmits(['play', 'pause', 'prev', 'next', 'seek', 'showPlaylist'])

// 响应式状态
const isPlaying = ref(props.playing)
const progress = ref(props.progress)
const currentTime = ref(Math.floor(props.progress * props.song.duration))
const isLiked = ref(false)
const playMode = ref(PlayMode.REPEAT)
const isDragging = ref(false)

// 计算当前歌曲信息
const currentSong = computed(() => props.song)

// 计算播放模式图标
const playModeIcon = computed(() => {
    switch (playMode.value) {
        case PlayMode.REPEAT:
            return '🔁'
        case PlayMode.REPEAT_ONE:
            return '🔂'
        case PlayMode.SHUFFLE:
            return '🔀'
        default:
            return '🔁'
    }
})

// 监听props变化
watch(() => props.playing, (newVal) => {
    if (newVal !== isPlaying.value) {
        if (newVal) {
            audioService.play()
        } else {
            audioService.pause()
        }
    }
})

watch(() => props.progress, (newVal) => {
    if (!isDragging.value && Math.abs(newVal - progress.value) > 0.01) {
        // 只有当进度差异较大时才更新，避免循环更新
        progress.value = newVal
        currentTime.value = Math.floor(newVal * props.song.duration)
        audioService.seekByProgress(newVal)
    }
})

// 监听歌曲变化
watch(() => props.song, (newSong) => {
    if (newSong && newSong.id !== audioService.currentSong?.id) {
        audioService.playSong(newSong)
        if (!props.playing) {
            audioService.pause()
        }
    }
})

// 格式化时间（秒 -> MM:SS）
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 返回上一页
const goBack = () => {
    Taro.navigateBack()
}

// 刷新播放列表
const refreshPlaylist = () => {
    // 实现刷新播放列表的逻辑
    console.log('刷新播放列表')
}

// 切换播放/暂停状态
const togglePlay = () => {
    if (!isPlaying.value) {
        audioService.play()
        emit('play')
    } else {
        audioService.pause()
        emit('pause')
    }
    // 状态会通过audioService的事件回调更新
}

// 切换喜欢状态
const toggleLike = () => {
    isLiked.value = !isLiked.value
}

// 显示评论
const showComments = () => {
    // 实现显示评论的逻辑
    console.log('显示评论')
}

// 切换播放模式
const togglePlayMode = () => {
    playMode.value = audioService.togglePlayMode()
}

// 上一首歌曲
const prevSong = () => {
    emit('prev')
    // 实际的歌曲切换逻辑应该由父组件处理，然后通过props传入新的歌曲
}

// 下一首歌曲
const nextSong = () => {
    emit('next')
    // 实际的歌曲切换逻辑应该由父组件处理，然后通过props传入新的歌曲
}

// 显示播放列表
const showPlaylist = () => {
    emit('showPlaylist')
}

// 进度条拖动相关方法
const onSliderTouchStart = () => {
    isDragging.value = true
}

const onSliderTouchMove = (e: any) => {
    if (!isDragging.value) return

    // 获取滑动位置并更新进度
    const query = Taro.createSelectorQuery()
    query.select('.slider-track').boundingClientRect(rect => {
        if (!rect) return

        const touchX = e.touches[0].clientX
        const sliderWidth = rect.width
        const offsetX = touchX - rect.left

        // 计算新的进度值（0-1之间）
        let newProgress = offsetX / sliderWidth
        newProgress = Math.max(0, Math.min(1, newProgress))

        // 更新进度和当前时间
        progress.value = newProgress
        currentTime.value = Math.floor(newProgress * props.song.duration)
    })
    query.exec()
}

const onSliderTouchEnd = () => {
    isDragging.value = false
    // 发送seek事件，通知父组件更新播放进度
    emit('seek', progress.value)
    
    // 使用audioService调整播放进度
    audioService.seekByProgress(progress.value)
}

// 组件挂载时的逻辑
onMounted(() => {
    // 确保audioService已初始化
    if (!audioService.currentSong && props.song) {
        // 如果当前没有播放中的歌曲，加载当前歌曲
        audioService.playSong(props.song)
        if (!props.playing) {
            // 如果初始状态是不播放，则暂停
            audioService.pause()
        }
    }
    
    // 监听音频播放状态变化
    audioService.onPlay(() => {
        isPlaying.value = true
    })
    
    audioService.onPause(() => {
        isPlaying.value = false
    })
    
    audioService.onTimeUpdate((currentTime, duration, prog) => {
        if (!isDragging.value) {
            currentTime.value = currentTime
            progress.value = prog
        }
    })
    
    // 同步当前状态
    isPlaying.value = audioService.isPlaying
    progress.value = audioService.progress
    currentTime.value = audioService.currentTime
    playMode.value = audioService.playMode
})

// 组件卸载时的逻辑
onUnmounted(() => {
    // 实际应用中应该移除事件监听，但audioService目前没有提供移除单个监听器的方法
    // 这里不调用removeAllListeners()，因为可能会影响其他组件
})
</script>

<style lang="scss">
.player-detail {
    position: relative;
    height: 100vh;
    background: radial-gradient(circle at center, #333 0%, #111 100%);
    display: flex;
    flex-direction: column;
    padding: 0 30px;
    box-sizing: border-box;
    color: #fff;

    // 顶部导航栏
    .top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100px;

        .back-button,
        .refresh-button {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;

            .back-icon,
            .refresh-icon {
                font-size: 36px;
                color: #fff;
            }
        }

        .title-container {
            flex: 1;
            text-align: center;

            .title {
                font-size: 32px;
                font-weight: bold;
            }
        }
    }

    // 唱片区域
    .vinyl-container {
        position: relative;
        display: flex;
        justify-content: center;
        margin: 40px 0;
        height: 500px;

        .vinyl-record {
            position: relative;
            width: 400px;
            height: 400px;
            border-radius: 50%;

            &.rotating {
                animation: rotate 20s linear infinite;
            }

            .vinyl-outer-ring {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #000;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            }

            .vinyl-inner-circle {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 65%;
                height: 65%;
                border-radius: 50%;
                overflow: hidden;
                border: 2px solid #444;

                .album-cover {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
            }
        }

        .stylus {
            position: absolute;
            top: 0;
            right: 50%;
            width: 10px;
            height: 120px;
            background-color: #666;
            transform-origin: top center;
            transform: rotate(-30deg);
            transition: transform 0.5s ease;

            &::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #999;
            }

            &.playing {
                transform: rotate(0deg);
            }
        }
    }

    // 歌曲信息
    .song-info {
        margin-bottom: 40px;

        .song-title-container {
            margin-bottom: 20px;

            .song-title {
                font-size: 40px;
                font-weight: bold;
                margin-bottom: 10px;
                display: block;
            }

            .artist-container {
                display: flex;
                align-items: center;

                .song-artist {
                    font-size: 30px;
                    color: #ccc;
                }

                .artist-more {
                    font-size: 30px;
                    color: #ccc;
                    margin-left: 10px;
                }
            }
        }

        .interaction-icons {
            display: flex;
            margin-top: 20px;

            .icon-container {
                display: flex;
                align-items: center;
                margin-right: 40px;

                .heart-icon,
                .comment-icon {
                    font-size: 36px;
                    margin-right: 10px;

                    .liked {
                        color: #ff4757;
                    }
                }

                .count-text {
                    font-size: 24px;
                    color: #ccc;
                }
            }
        }
    }

    // 进度条
    .progress-container {
        display: flex;
        align-items: center;
        margin-bottom: 40px;

        .current-time,
        .total-time {
            font-size: 24px;
            color: #ccc;
            width: 80px;
        }

        .current-time {
            text-align: left;
        }

        .total-time {
            text-align: right;
        }

        .quality-indicator {
            font-size: 20px;
            color: #1aad19;
            margin-left: 10px;
        }

        .slider-container {
            flex: 1;
            height: 30px;
            display: flex;
            align-items: center;
            padding: 0 10px;

            .slider-track {
                position: relative;
                width: 100%;
                height: 4px;
                background-color: rgba(255, 255, 255, 0.2);
                border-radius: 2px;

                .slider-fill {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    background-color: #1aad19;
                    border-radius: 2px;
                }

                .slider-thumb {
                    position: absolute;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background-color: #fff;
                    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                }
            }
        }
    }

    // 播放控制
    .playback-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 60px;

        .control-button {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;

            .mode-icon,
            .prev-icon,
            .next-icon,
            .playlist-icon {
                font-size: 36px;
                color: #fff;
            }
        }

        .play-button {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: #1aad19;
            display: flex;
            align-items: center;
            justify-content: center;

            .play-icon {
                font-size: 50px;
                color: white;
                margin-left: 8px;
                /* 调整播放图标位置 */
            }

            .pause-icon {
                font-size: 40px;
                color: white;
            }
        }
    }
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
