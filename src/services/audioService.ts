import Taro from '@tarojs/taro';

// 定义歌曲接口
export interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  url?: string; // 音频URL
  audioUrl?: string; // 兼容现有代码中的两种URL属性名
}

// 播放模式枚举
export enum PlayMode {
  REPEAT = 'repeat',
  REPEAT_ONE = 'repeat-one',
  SHUFFLE = 'shuffle'
}

// 音频播放事件类型
export type AudioEventCallback = () => void;
export type AudioErrorCallback = (error: any) => void;
export type AudioTimeUpdateCallback = (currentTime: number, duration: number, progress: number) => void;

/**
 * 音频服务类 - 管理音频播放状态和控制
 */
class AudioService {
  private static instance: AudioService;
  private audioContext: Taro.InnerAudioContext | null = null;
  
  // 当前播放状态
  private _currentSong: Song | null = null;
  private _isPlaying: boolean = false;
  private _currentTime: number = 0;
  private _duration: number = 0;
  private _progress: number = 0;
  private _playMode: PlayMode = PlayMode.REPEAT;
  
  // 事件回调
  private onPlayCallbacks: AudioEventCallback[] = [];
  private onPauseCallbacks: AudioEventCallback[] = [];
  private onEndedCallbacks: AudioEventCallback[] = [];
  private onErrorCallbacks: AudioErrorCallback[] = [];
  private onTimeUpdateCallbacks: AudioTimeUpdateCallback[] = [];
  
  private constructor() {
    // 私有构造函数，确保单例模式
  }
  
  /**
   * 获取AudioService实例
   */
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }
  
  /**
   * 初始化音频上下文
   */
  public init(): void {
    if (this.audioContext) {
      this.destroy();
    }
    
    this.audioContext = Taro.createInnerAudioContext();
    
    // 设置事件监听
    this.audioContext.onPlay(() => {
      this._isPlaying = true;
      this.onPlayCallbacks.forEach(callback => callback());
    });
    
    this.audioContext.onPause(() => {
      this._isPlaying = false;
      this.onPauseCallbacks.forEach(callback => callback());
    });
    
    this.audioContext.onEnded(() => {
      this._isPlaying = false;
      this.onEndedCallbacks.forEach(callback => callback());
    });
    
    this.audioContext.onError((error) => {
      this._isPlaying = false;
      this.onErrorCallbacks.forEach(callback => callback(error));
    });
    
    this.audioContext.onTimeUpdate(() => {
      if (this.audioContext) {
        this._currentTime = this.audioContext.currentTime;
        this._duration = this.audioContext.duration || 0;
        this._progress = this._duration > 0 ? this._currentTime / this._duration : 0;
        
        this.onTimeUpdateCallbacks.forEach(callback => 
          callback(this._currentTime, this._duration, this._progress)
        );
      }
    });
  }
  
  /**
   * 加载并播放歌曲
   */
  public playSong(song: Song): void {
    if (!this.audioContext) {
      this.init();
    }
    
    if (!this.audioContext) return;
    
    // 设置音频源
    const audioSource = song.url || song.audioUrl;
    if (!audioSource) {
      console.error('歌曲没有可用的音频URL');
      return;
    }
    
    this._currentSong = song;
    this.audioContext.src = audioSource;
    this.audioContext.play();
  }
  
  /**
   * 播放当前歌曲
   */
  public play(): void {
    if (!this.audioContext) {
      this.init();
    }
    
    if (this.audioContext && this._currentSong) {
      this.audioContext.play();
    }
  }
  
  /**
   * 暂停播放
   */
  public pause(): void {
    if (this.audioContext) {
      this.audioContext.pause();
    }
  }
  
  /**
   * 跳转到指定时间点
   */
  public seek(position: number): void {
    if (this.audioContext) {
      this.audioContext.seek(position);
    }
  }
  
  /**
   * 跳转到指定进度（0-1之间的小数）
   */
  public seekByProgress(progress: number): void {
    if (this.audioContext && this._duration > 0) {
      const position = progress * this._duration;
      this.audioContext.seek(position);
    }
  }
  
  /**
   * 设置播放模式
   */
  public setPlayMode(mode: PlayMode): void {
    this._playMode = mode;
  }
  
  /**
   * 切换播放模式
   */
  public togglePlayMode(): PlayMode {
    const modes = [PlayMode.REPEAT, PlayMode.REPEAT_ONE, PlayMode.SHUFFLE];
    const currentIndex = modes.indexOf(this._playMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this._playMode = modes[nextIndex];
    return this._playMode;
  }
  
  /**
   * 添加播放事件监听
   */
  public onPlay(callback: AudioEventCallback): void {
    this.onPlayCallbacks.push(callback);
  }
  
  /**
   * 添加暂停事件监听
   */
  public onPause(callback: AudioEventCallback): void {
    this.onPauseCallbacks.push(callback);
  }
  
  /**
   * 添加播放结束事件监听
   */
  public onEnded(callback: AudioEventCallback): void {
    this.onEndedCallbacks.push(callback);
  }
  
  /**
   * 添加错误事件监听
   */
  public onError(callback: AudioErrorCallback): void {
    this.onErrorCallbacks.push(callback);
  }
  
  /**
   * 添加时间更新事件监听
   */
  public onTimeUpdate(callback: AudioTimeUpdateCallback): void {
    this.onTimeUpdateCallbacks.push(callback);
  }
  
  /**
   * 移除事件监听
   */
  public removeAllListeners(): void {
    this.onPlayCallbacks = [];
    this.onPauseCallbacks = [];
    this.onEndedCallbacks = [];
    this.onErrorCallbacks = [];
    this.onTimeUpdateCallbacks = [];
  }
  
  /**
   * 销毁音频上下文
   */
  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.destroy();
      this.audioContext = null;
    }
    this.removeAllListeners();
  }
  
  // Getters
  get currentSong(): Song | null { return this._currentSong; }
  get isPlaying(): boolean { return this._isPlaying; }
  get currentTime(): number { return this._currentTime; }
  get duration(): number { return this._duration; }
  get progress(): number { return this._progress; }
  get playMode(): PlayMode { return this._playMode; }
}

// 导出单例实例
export const audioService = AudioService.getInstance();