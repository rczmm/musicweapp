<template>
    <view class="player-detail">
        <!-- 顶部导航栏 -->
        <view class="top-bar">
            <view class="back-button" @tap="goBack">
                <text class="back-icon">⟨</text>
            </view>
            <view class="title-container">
                <text class="title">正在播放</text>
            </view>
            <view class="refresh-button" @tap="refreshPlaylist">
                <text class="refresh-icon">↻</text>
            </view>
        </view>

        <!-- 唱片区域 -->
        <view class="vinyl-container" :class="{ 'minimized': lyricsExpanded }">
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

        <!-- 歌词区域 -->
        <LyricScroller 
            :lyrics="currentLyrics" 
            :current-time="currentTime" 
            :auto-scroll="true"
            @seek="handleLyricSeek"
            @expand="lyricsExpanded = $event"
        />

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

        <!-- 播放列表面板 -->
        <PlaylistPanel 
            :visible="playlistVisible" 
            :songs="playlistSongs" 
            :current-song-id="currentSong.id"
            @close="playlistVisible = false"
            @play="handlePlaylistSongSelect"
            @remove="handleRemoveSong"
            @clear="handleClearPlaylist"
            @add="handleAddSongs"
            @toggle-like="handleToggleLike"
        />
    </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Taro from '@tarojs/taro'
import { audioService, PlayMode, Song } from '../../services/audioService'
import { lyricService } from '../../services/lyricService'
import { musicService } from '../../services/musicService'
import LyricScroller from '../../components/LyricScroller/index.vue'
import PlaylistPanel from '../../components/PlaylistPanel/index.vue'

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
const currentLyrics = ref('')
const lyricsExpanded = ref(false)
const playlistVisible = ref(false)
const playlistSongs = ref<Song[]>([])

// 计算当前歌曲信息
const currentSong = computed(() => {
    // 如果audioService有当前歌曲，优先使用它
    if (audioService.currentSong) {
        return audioService.currentSong
    }
    // 否则使用props传入的歌曲
    return props.song
})

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
        currentTime.value = Math.floor(newVal * currentSong.value.duration)
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
        // 加载歌词
        loadLyrics(newSong.id)
    }
})

// 监听当前歌曲变化
watch(() => currentSong.value, (newSong) => {
    if (newSong) {
        // 加载歌词
        loadLyrics(newSong.id)
    }
})

// 格式化时间（秒 -> MM:SS）
const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00'
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
    loadPlaylistSongs()
    Taro.showToast({
        title: '播放列表已刷新',
        icon: 'success',
        duration: 2000
    })
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
    Taro.showToast({
        title: isLiked.value ? '已添加到我喜欢的音乐' : '已从我喜欢的音乐中移除',
        icon: 'none',
        duration: 2000
    })
}

// 显示评论
const showComments = () => {
    // 跳转到评论页面
    Taro.navigateTo({
        url: `/pages/comments/index?id=${currentSong.value.id}&type=song`
    })
}

// 切换播放模式
const togglePlayMode = () => {
    playMode.value = audioService.togglePlayMode()
    const modeText = playMode.value === PlayMode.REPEAT ? '列表循环' :
                    playMode.value === PlayMode.REPEAT_ONE ? '单曲循环' : '随机播放'
    Taro.showToast({
        title: `已切换为${modeText}`,
        icon: 'none',
        duration: 2000
    })
}

// 上一首歌曲
const prevSong = () => {
    // 如果有播放列表，从列表中选择上一首
    if (playlistSongs.value.length > 1) {
        const currentIndex = playlistSongs.value.findIndex(song => song.id === currentSong.value.id)
        if (currentIndex > 0) {
            // 播放上一首
            audioService.playSong(playlistSongs.value[currentIndex - 1])
        } else {
            // 如果是第一首，循环到最后一首
            audioService.playSong(playlistSongs.value[playlistSongs.value.length - 1])
        }
    } else {
        // 如果没有播放列表，发送事件给父组件处理
        emit('prev')
    }
}

// 下一首歌曲
const nextSong = () => {
    // 如果有播放列表，从列表中选择下一首
    if (playlistSongs.value.length > 1) {
        const currentIndex = playlistSongs.value.findIndex(song => song.id === currentSong.value.id)
        if (currentIndex < playlistSongs.value.length - 1) {
            // 播放下一首
            audioService.playSong(playlistSongs.value[currentIndex + 1])
        } else {
            // 如果是最后一首，循环到第一首
            audioService.playSong(playlistSongs.value[0])
        }
    } else {
        // 如果没有播放列表，发送事件给父组件处理
        emit('next')
    }
}

// 显示播放列表
const showPlaylist = () => {
    playlistVisible.value = true
}

// 加载歌词
const loadLyrics = async (songId: string) => {
    try {
        const lyrics = await lyricService.getLyric(songId)
        currentLyrics.value = lyrics
    } catch (error) {
        console.error('加载歌词失败:', error)
        currentLyrics.value = ''
    }
}

// 加载播放列表歌曲
const loadPlaylistSongs = async () => {
    try {
        // 实际应用中，这里应该从服务获取当前播放列表
        // 这里使用模拟数据
        const songs = await musicService.getSongs()
        playlistSongs.value = songs
    } catch (error) {
        console.error('加载播放列表失败:', error)
    }
}

// 处理歌词点击跳转
const handleLyricSeek = (time: number) => {
    audioService.seek(time)
    // 更新当前时间和进度
    currentTime.value = time
    progress.value = time / currentSong.value.duration
}

// 处理播放列表中歌曲选择
const handlePlaylistSongSelect = (song: Song) => {
    audioService.playSong(song)
}

// 处理从播放列表中移除歌曲
const handleRemoveSong = (index: number) => {
    // 如果移除的是当前播放的歌曲，先播放下一首
    if (playlistSongs.value[index].id === currentSong.value.id) {
        nextSong()
    }
    // 从列表中移除
    playlistSongs.value.splice(index, 1)
}

// 处理清空播放列表
const handleClearPlaylist = () => {
    // 清空前先暂停播放
    audioService.pause()
    playlistSongs.value = []
    playlistVisible.value = false
}

// 处理添加歌曲到播放列表
const handleAddSongs = () => {
    // 跳转到搜索页面
    Taro.navigateTo({
        url: '/pages/search/index'
    })
    playlistVisible.value = false
}

// 处理切换歌曲喜欢状态
const handleToggleLike = (song: Song) => {
    // 实际应用中，这里应该调用API更新歌曲的喜欢状态
    // 这里只是更新UI状态
    const index = playlistSongs.value.findIndex(s => s.id === song.id)
    if (index !== -1) {
        playlistSongs.value[index] = {
            ...playlistSongs.value[index],
            liked: !playlistSongs.value[index].liked
        }
    }
    
    // 如果是当前播放的歌曲，同步喜欢状态
    if (song.id === currentSong.value.id) {
        isLiked.value = !isLiked.value
    }
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
        currentTime.value = Math.floor(newProgress * currentSong.value.duration)
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
    
    audioService.onTimeUpdate((time, duration, prog) => {
        if (!isDragging.value) {
            currentTime.value = time
            progress.value = prog
        }
    })
    
    // 同步当前状态
    isPlaying.value = audioService.isPlaying
    progress.value = audioService.progress
    currentTime.value = audioService.currentTime
    playMode.value = audioService.playMode
    
    // 加载歌词和播放列表
    if (currentSong.value) {
        loadLyrics(currentSong.value.id)
    }
    loadPlaylistSongs()
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
    background-color: #f5f5f5;
    color: #333;
    display: flex;
    flex-direction: column;
    padding: 0 30px;
    box-sizing: border-box;

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
        transition: height 0.3s ease, margin 0.3s ease;
        
        &.minimized {
            height: 300px;
            margin: 20px 0;
        }

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
                background-color: #fff;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
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
                border: 2px solid #eee;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);

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
            background-color: #ff4e4e;
            transform-origin: top center;
            transform: rotate(-30deg);
            transition: transform 0.5s ease;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

            &::before {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: #ff4e4e;
            }

            &.playing {
                transform: rotate(0deg);
            }
        }
    }

    // 歌曲信息
    .song-info {
        margin-bottom: 40px;
        background-color: #fff;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

        .song-title-container {
            margin-bottom: 20px;

            .song-title {
                font-size: 40px;
                font-weight: bold;
                margin-bottom: 10px;
                display: block;
                color: #333;
            }

            .artist-container {
                display: flex;
                align-items: center;

                .song-artist {
                    font-size: 30px;
                    color: #666;
                }

                .artist-more {
                    font-size: 30px;
                    color: #999;
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
                    transition: all 0.3s ease;

                    .liked {
                        color: #ff4e4e;
                    }
                }

                .count-text {
                    font-size: 24px;
                    color: #999;
                }
            }
        }
    }

    // 进度条
    .progress-container {
        display: flex;
        align-items: center;
        margin-bottom: 40px;
        background-color: #fff;
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

        .current-time,
        .total-time {
            font-size: 24px;
            color: #666;
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
            color: #ff4e4e;
            margin-left: 10px;
            font-weight: bold;
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
                background-color: rgba(0, 0, 0, 0.1);
                border-radius: 2px;

                .slider-fill {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    background-color: #ff4e4e;
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
                    box-shadow: 0 0 5px rgba(255, 78, 78, 0.5);
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
        background-color: #fff;
        border-radius: 12px;
        padding: 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

        .control-button {
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;

            &:active {
                background-color: rgba(0, 0, 0, 0.1);
            }

            .mode-icon,
            .prev-icon,
            .next-icon,
            .playlist-icon {
                font-size: 36px;
                color: #666;
            }
        }

        .play-button {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: #ff4e4e;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 10px rgba(255, 78, 78, 0.3);
            transition: all 0.3s ease;

            &:active {
                transform: scale(0.95);
            }

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
