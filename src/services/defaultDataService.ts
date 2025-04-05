import { Song } from './audioService';
import { Playlist } from './musicService';

/**
 * 默认数据服务 - 提供网络请求失败时的备用数据
 */
class DefaultDataService {
  private static instance: DefaultDataService;

  // 默认歌曲列表
  private readonly defaultSongs: Song[] = [
    {
      id: 'default-1',
      title: '来日方长',
      artist: '黄龄/薛之谦',
      cover: 'https://picsum.photos/300/300?random=1',
      duration: 234,
      url: 'https://music.163.com/song/media/outer/url?id=417859631.mp3',
      fallbackUrl: '/static/assets/sample.mp3'
    },
    {
      id: 'default-2',
      title: '演员',
      artist: '薛之谦',
      cover: 'https://picsum.photos/300/300?random=2',
      duration: 261,
      url: 'https://music.163.com/song/media/outer/url?id=32507038.mp3',
      fallbackUrl: '/static/assets/sample.mp3'
    },
    {
      id: 'default-3',
      title: '光年之外',
      artist: '邓紫棋',
      cover: 'https://picsum.photos/300/300?random=3',
      duration: 235,
      url: 'https://music.163.com/song/media/outer/url?id=449818741.mp3',
      fallbackUrl: '/static/assets/sample.mp3'
    },
    {
      id: 'default-4',
      title: '起风了',
      artist: '买辣椒也用券',
      cover: 'https://picsum.photos/300/300?random=4',
      duration: 325,
      url: 'https://music.163.com/song/media/outer/url?id=1330348068.mp3',
      fallbackUrl: '/static/assets/sample.mp3'
    },
    {
      id: 'default-5',
      title: '说好不哭',
      artist: '周杰伦',
      cover: 'https://picsum.photos/300/300?random=5',
      duration: 258,
      url: 'https://music.163.com/song/media/outer/url?id=1391891631.mp3',
      fallbackUrl: '/static/assets/sample.mp3'
    }
  ];

  // 默认歌单列表
  private readonly defaultPlaylists: Playlist[] = [
    {
      id: 'default-playlist-1',
      title: '流行热歌',
      creator: '音乐小编',
      description: '精选流行热门歌曲，带你感受音乐的魅力',
      cover: 'https://picsum.photos/300/300?random=10',
      playCount: '10万+',
      collectCount: '5千+',
      songCount: 20,
      updateTime: '2023-12-01'
    },
    {
      id: 'default-playlist-2',
      title: '经典老歌',
      creator: '怀旧音乐馆',
      description: '那些年，我们一起听过的歌',
      cover: 'https://picsum.photos/300/300?random=11',
      playCount: '8万+',
      collectCount: '4千+',
      songCount: 15,
      updateTime: '2023-11-15'
    },
    {
      id: 'default-playlist-3',
      title: '轻音乐',
      creator: '心灵治愈师',
      description: '舒缓压力，放松心情',
      cover: 'https://picsum.photos/300/300?random=12',
      playCount: '5万+',
      collectCount: '2千+',
      songCount: 12,
      updateTime: '2023-12-10'
    }
  ];

  // 默认歌词
  private readonly defaultLyrics: Record<string, string> = {
    'default-1': `[00:00.00]来日方长 - 黄龄/薛之谦
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
[00:49.50]没有永远也没有抱歉`,
    'default-2': `[00:00.00]演员 - 薛之谦
[00:04.00]词：薛之谦
[00:08.00]曲：薛之谦
[00:12.00]
[00:16.00]简单点说话的方式简单点
[00:20.00]递进的情绪请省略
[00:24.00]你又不是个演员
[00:28.00]别设计那些情节
[00:32.00]没意见我只想看看你怎么圆
[00:36.00]你难过的太表面 像没天赋的演员
[00:40.00]观众一眼能看见`,
    'default-3': `[00:00.00]光年之外 - 邓紫棋
[00:04.00]词：邓紫棋
[00:08.00]曲：邓紫棋
[00:12.00]
[00:16.00]感受停在我发端的指尖
[00:20.00]如此安心 却又飘远
[00:24.00]感受你掌心的体温
[00:28.00]只有一瞬间`,
    'default-4': `[00:00.00]起风了 - 买辣椒也用券
[00:04.00]词：米果
[00:08.00]曲：高橋優
[00:12.00]
[00:16.00]这一路上走走停停
[00:20.00]顺着少年漂流的痕迹
[00:24.00]迈出车站的前一刻
[00:28.00]竟有些犹豫`,
    'default-5': `[00:00.00]说好不哭 - 周杰伦
[00:04.00]词：方文山
[00:08.00]曲：周杰伦
[00:12.00]
[00:16.00]没有了联络 后来的生活
[00:20.00]我都是听别人说
[00:24.00]说你怎么了 说你怎么过
[00:28.00]放不下的人是我`
  };

  // 默认用户信息
  private readonly defaultUserInfo = {
    username: '音乐爱好者',
    avatar: 'https://picsum.photos/200/200?random=20',
    bio: '热爱音乐，享受生活',
    isVip: false,
    followers: '128',
    level: 5,
    listenTime: 12345, // 单位：分钟
    vipLevel: 0
  };

  private constructor() {
    // 私有构造函数，确保单例模式
  }

  /**
   * 获取DefaultDataService实例
   */
  public static getInstance(): DefaultDataService {
    if (!DefaultDataService.instance) {
      DefaultDataService.instance = new DefaultDataService();
    }
    return DefaultDataService.instance;
  }

  /**
   * 获取默认歌曲列表
   */
  public getDefaultSongs(): Song[] {
    return [...this.defaultSongs];
  }

  /**
   * 获取默认歌单列表
   */
  public getDefaultPlaylists(): Playlist[] {
    return [...this.defaultPlaylists];
  }

  /**
   * 获取默认歌词
   * @param songId 歌曲ID
   */
  public getDefaultLyric(songId: string): string {
    // 尝试获取指定ID的歌词，如果不存在则返回第一首歌的歌词
    return this.defaultLyrics[songId] || this.defaultLyrics['default-1'] || '';
  }

  /**
   * 获取默认用户信息
   */
  public getDefaultUserInfo(): any {
    return { ...this.defaultUserInfo };
  }

  /**
   * 获取指定ID的默认歌曲
   * @param songId 歌曲ID
   */
  public getDefaultSongById(songId: string): Song | null {
    const song = this.defaultSongs.find(s => s.id === songId);
    return song ? { ...song } : null;
  }

  /**
   * 获取指定ID的默认歌单
   * @param playlistId 歌单ID
   */
  public getDefaultPlaylistById(playlistId: string): Playlist | null {
    const playlist = this.defaultPlaylists.find(p => p.id === playlistId);
    return playlist ? { ...playlist } : null;
  }

  /**
   * 获取指定歌单的默认歌曲列表
   * @param playlistId 歌单ID
   */
  public getDefaultPlaylistSongs(playlistId: string): Song[] {
    // 简单实现：返回所有默认歌曲
    return [...this.defaultSongs];
  }
}

// 导出单例实例
export const defaultDataService = DefaultDataService.getInstance();