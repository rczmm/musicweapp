import Taro from '@tarojs/taro';
import { defaultDataService } from './defaultDataService';

// 定义歌词行接口
export interface LyricLine {
  time: number;  // 时间点（秒）
  text: string;  // 歌词文本
}

/**
 * 歌词服务类 - 处理歌词的获取和解析
 */
class LyricService {
  private static instance: LyricService;
  private apiBaseUrl: string = 'http://localhost:8080/music';
  
  // 缓存已获取的歌词
  private lyricCache: Map<string, string> = new Map();
  
  private constructor() {
    // 私有构造函数，确保单例模式
  }
  
  /**
   * 获取LyricService实例
   */
  public static getInstance(): LyricService {
    if (!LyricService.instance) {
      LyricService.instance = new LyricService();
    }
    return LyricService.instance;
  }
  
  /**
   * 获取歌曲的歌词
   * @param songId 歌曲ID
   * @returns 歌词内容（LRC格式）
   */
  public async getLyric(songId: string): Promise<string> {
    // 检查缓存
    if (this.lyricCache.has(songId)) {
      return this.lyricCache.get(songId) || '';
    }
    
    try {
      // 实际项目中，这里应该调用API获取歌词
      // 这里使用模拟数据
      const lyric = await this.fetchLyricFromApi(songId);
      
      // 缓存歌词
      this.lyricCache.set(songId, lyric);
      
      return lyric;
    } catch (error) {
      console.error('获取歌词失败:', error);
      // 返回默认歌词
      const defaultLyric = defaultDataService.getDefaultLyric(songId);
      // 缓存默认歌词
      this.lyricCache.set(songId, defaultLyric);
      return defaultLyric;
    }
  }
  
  /**
   * 从API获取歌词
   * @param songId 歌曲ID
   * @returns 歌词内容
   */
  private async fetchLyricFromApi(songId: string): Promise<string> {
    // 实际项目中，这里应该调用真实的API
    // 这里使用模拟数据，根据歌曲ID返回不同的歌词
    
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 根据歌曲ID返回不同的模拟歌词
    switch (songId) {
      case '1':
        return this.getMockLyric1();
      case '2':
        return this.getMockLyric2();
      case '3':
        return this.getMockLyric3();
      default:
        // 对于其他ID，生成随机歌词
        return this.getRandomLyric();
    }
  }
  
  /**
   * 解析LRC格式的歌词
   * @param lrcContent LRC格式的歌词内容
   * @returns 解析后的歌词行数组
   */
  public parseLyric(lrcContent: string): LyricLine[] {
    if (!lrcContent) return [];
    
    const lines = lrcContent.split('\n');
    const result: LyricLine[] = [];
    
    // 正则表达式匹配时间标签 [mm:ss.xx]
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    
    lines.forEach(line => {
      // 跳过空行
      if (!line.trim()) return;
      
      // 提取所有时间标签
      const timeMatches = [...line.matchAll(timeRegex)];
      if (timeMatches.length === 0) return;
      
      // 提取歌词文本（去除时间标签）
      const text = line.replace(timeRegex, '').trim();
      if (!text) return;
      
      // 为每个时间标签创建一个歌词行对象
      timeMatches.forEach(match => {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        
        // 计算总时间（秒）
        const time = minutes * 60 + seconds + milliseconds / (match[3].length === 2 ? 100 : 1000);
        
        result.push({ time, text });
      });
    });
    
    // 按时间排序
    return result.sort((a, b) => a.time - b.time);
  }
  
  /**
   * 获取模拟歌词1（《来日方长》）
   */
  private getMockLyric1(): string {
    return `[00:00.00]来日方长 - 黄龄/薛之谦
[00:03.50]词：薛之谦
[00:07.00]曲：薛之谦
[00:10.50]编曲：周以力
[00:14.00]
[00:18.00]我们之间没有星星
[00:22.50]没有月亮也没有晴天
[00:27.00]我们之间没有相遇
[00:31.50]没有拥抱也没有冒险
[00:36.00]我们之间没有浪漫
[00:40.50]没有誓言也没有改变
[00:45.00]我们之间没有明天
[00:49.50]没有永远也没有抱歉
[00:54.00]我们之间没有感觉
[00:58.50]没有回忆也没有纪念
[01:03.00]我们之间没有眼泪
[01:07.50]没有心碎也没有想念
[01:12.00]我们之间没有开始
[01:16.50]没有结束也没有改变
[01:21.00]我们之间没有明天
[01:25.50]没有永远也没有抱歉
[01:30.00]我们之间没有感觉
[01:34.50]没有回忆也没有纪念
[01:39.00]我们之间没有眼泪
[01:43.50]没有心碎也没有想念
[01:48.00]我们之间没有开始
[01:52.50]没有结束也没有改变
[01:57.00]我们之间没有明天
[02:01.50]没有永远也没有抱歉
[02:06.00]我们之间没有感觉
[02:10.50]没有回忆也没有纪念
[02:15.00]我们之间没有眼泪
[02:19.50]没有心碎也没有想念
[02:24.00]我们之间没有开始
[02:28.50]没有结束也没有改变
[02:33.00]我们之间没有明天
[02:37.50]没有永远也没有抱歉
[02:42.00]我们之间没有感觉
[02:46.50]没有回忆也没有纪念
[02:51.00]我们之间没有眼泪
[02:55.50]没有心碎也没有想念
[03:00.00]我们之间没有开始
[03:04.50]没有结束也没有改变
[03:09.00]我们之间没有明天
[03:13.50]没有永远也没有抱歉`;
  }
  
  /**
   * 获取模拟歌词2
   */
  private getMockLyric2(): string {
    return `[00:00.00]夏日旋律 - 音乐人B
[00:04.00]词：佚名
[00:08.00]曲：佚名
[00:12.00]
[00:16.00]阳光照耀着海滩
[00:20.00]微风轻抚我的脸
[00:24.00]这个夏天如此美丽
[00:28.00]让人忘记所有烦恼
[00:32.00]海浪轻轻拍打着沙滩
[00:36.00]留下一道道痕迹
[00:40.00]就像你在我心中
[00:44.00]留下难以忘怀的回忆
[00:48.00]夏日的旋律
[00:52.00]在耳边轻轻响起
[00:56.00]带我回到那个夏天
[01:00.00]与你相遇的时光
[01:04.00]椰子树下的承诺
[01:08.00]沙滩上的脚印
[01:12.00]构成了我们的故事
[01:16.00]永远珍藏在心底
[01:20.00]即使季节更替
[01:24.00]岁月流转
[01:28.00]那个夏天的旋律
[01:32.00]永远不会褪色
[01:36.00]就像心中的爱恋
[01:40.00]历久弥新
[01:44.00]夏日的旋律
[01:48.00]在耳边轻轻响起
[01:52.00]带我回到那个夏天
[01:56.00]与你相遇的时光
[02:00.00]椰子树下的承诺
[02:04.00]沙滩上的脚印
[02:08.00]构成了我们的故事
[02:12.00]永远珍藏在心底`;
  }
  
  /**
   * 获取模拟歌词3
   */
  private getMockLyric3(): string {
    return `[00:00.00]心跳的证明 - 音乐人A
[00:04.00]词：佚名
[00:08.00]曲：佚名
[00:12.00]
[00:16.00]当我第一次见到你
[00:20.00]心跳加速无法控制
[00:24.00]那一刻我才明白
[00:28.00]什么是心动的感觉
[00:32.00]你的微笑如此美丽
[00:36.00]让我沉醉无法自拔
[00:40.00]每一次与你相遇
[00:44.00]都是心跳的证明
[00:48.00]心跳是爱的证明
[00:52.00]让我知道我还活着
[00:56.00]因为有你在我生命里
[01:00.00]每一天都充满意义
[01:04.00]不需要华丽的语言
[01:08.00]不需要刻意的表白
[01:12.00]我的心跳已经告诉你
[01:16.00]你就是我的唯一
[01:20.00]即使相隔千山万水
[01:24.00]即使时光匆匆流逝
[01:28.00]我的心依然为你跳动
[01:32.00]这就是最真的证明
[01:36.00]心跳是爱的证明
[01:40.00]让我知道我还活着
[01:44.00]因为有你在我生命里
[01:48.00]每一天都充满意义
[01:52.00]不需要华丽的语言
[01:56.00]不需要刻意的表白
[02:00.00]我的心跳已经告诉你
[02:04.00]你就是我的唯一`;
  }
  
  /**
   * 生成随机歌词
   */
  private getRandomLyric(): string {
    const lines = [
      '这是一首随机生成的歌曲',
      '没有特定的含义',
      '但希望你能喜欢',
      '音乐是生活的调味剂',
      '让我们一起享受这美妙的旋律',
      '忘记所有的烦恼',
      '沉浸在音乐的海洋',
      '感受节奏的律动',
      '这就是音乐的魅力',
      '无需言语也能传达情感',
      '让心灵得到释放',
      '这是音乐的力量'
    ];
    
    let lyric = '[00:00.00]随机歌曲\n[00:04.00]词：AI作词\n[00:08.00]曲：AI作曲\n[00:12.00]\n';
    
    // 为每行歌词添加时间标签
    let time = 16;
    lines.forEach(line => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      lyric += `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.00]${line}\n`;
      time += 4; // 每行间隔4秒
    });
    
    return lyric;
  }
}

// 导出单例实例
export const lyricService = LyricService.getInstance();