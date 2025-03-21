import Taro from '@tarojs/taro';
import {Song} from './audioService';

// 定义API返回的歌单数据结构
interface ApiPlaylist {
  id: number;
  name: string;
  creator: string;
  description: string;
  createTime: string;
}

// 定义应用中使用的歌单数据结构
export interface Playlist {
  id: string;
  title: string;
  creator: string;
  description: string;
  cover: string;
  playCount: string;
  collectCount: string;
  songCount: number;
  updateTime: string;
}

/**
 * 音乐服务类 - 处理音乐数据的获取和转换
 */
class MusicService {
  private static instance: MusicService;
  private apiBaseUrl: string = 'http://localhost:8080/music';
  private apiPlaylistUrl: string = 'http://localhost:8080/api/playlists';

  private constructor() {
    // 私有构造函数，确保单例模式
  }

  /**
   * 获取MusicService实例
   */
  public static getInstance(): MusicService {
    if (!MusicService.instance) {
      MusicService.instance = new MusicService();
    }
    return MusicService.instance;
  }

  /**
   * 获取歌曲列表
   */
  public async getSongs(): Promise<Song[]> {
    try {
      const response = await Taro.request({
        url: `${this.apiBaseUrl}/songs`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        }
      });

      // 转换API返回的数据格式为应用中使用的Song格式
      return this.convertApiSongsToSongs(response.data);
    } catch (error) {
      console.error('获取歌曲列表失败:', error);
      return [];
    }
  }

  /**
   * 搜索歌曲
   */
  public async searchSongs(keyword: string): Promise<Song[]> {
    try {
      const response = await Taro.request({
        url: `${this.apiBaseUrl}/songs`,
        method: 'GET',
        data: {
          keyword: keyword
        },
        header: {
          'Content-Type': 'application/json'
        }
      });

      // 转换API返回的数据格式为应用中使用的Song格式
      return this.convertApiSongsToSongs(response.data);
    } catch (error) {
      console.error('搜索歌曲失败:', error);
      return [];
    }
  }

  /**
   * 获取歌单列表
   */
  public async getPlaylists(): Promise<Playlist[]> {
    try {
      const response = await Taro.request({
        url: `${this.apiBaseUrl}/playlists`,
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        }
      });

      // 转换API返回的数据格式为应用中使用的Playlist格式
      return this.convertApiPlaylistsToPlaylists(response.data);
    } catch (error) {
      console.error('获取歌单列表失败:', error);
      return [];
    }
  }

  /**
   * 获取指定ID的歌单详情
   */
  public async getPlaylistById(playlistId: string): Promise<Playlist | null> {
    try {
      const playlists = await this.getPlaylists();
      const playlist = playlists.find(p => p.id === playlistId);
      return playlist || null;
    } catch (error) {
      console.error('获取歌单详情失败:', error);
      return null;
    }
  }

  /**
   * 获取指定歌单ID的歌曲列表
   */
  public async getPlaylistSongs(playlistId: number): Promise<Song[]> {
    try {
      const response = await Taro.request({
        url: `${this.apiPlaylistUrl}/getSong`,
        method: 'GET',
        data: {
          id: playlistId
        }
      });

      // 检查API返回的数据格式
      if (!response.data) {
        console.error('API返回的数据为空');
        return [];
      }

      // 如果返回的是对象而不是数组，尝试从对象中提取歌曲数组
      let songsData = response.data;
      if (typeof response.data === 'object' && !Array.isArray(response.data)) {
        // 尝试从常见的API响应格式中提取歌曲数组
        if (response.data.songs) {
          songsData = response.data.songs;
        } else if (response.data.data) {
          songsData = response.data.data;
        } else if (response.data.result) {
          songsData = response.data.result;
        } else {
          // 如果无法找到歌曲数组，记录错误并返回空数组
          console.error('无法从API响应中提取歌曲数组:', response.data);
          return [];
        }
      }

      // 转换API返回的数据格式为应用中使用的Song格式
      return this.convertApiSongsToSongs(songsData);
    } catch (error) {
      console.error('获取歌单歌曲列表失败:', error);
      return [];
    }
  }

  /**
   * 将API返回的歌曲数据转换为应用中使用的Song格式
   */
  private convertApiSongsToSongs(apiSongs: any): Song[] {
    // 检查apiSongs是否为数组
    if (!apiSongs || !Array.isArray(apiSongs)) {
      console.error('API返回的歌曲数据不是数组格式:', apiSongs);
      return [];
    }

    return apiSongs.map(apiSong => ({
      id: apiSong.id.toString(),
      title: apiSong.name,
      artist: apiSong.singer,
      cover: 'https://picsum.photos/100/100?random=' + apiSong.id, // 使用默认封面
      duration: 240, // 默认歌曲时长
      url: apiSong.path // 使用path作为音频URL
    }));
  }

  /**
   * 将API返回的歌单数据转换为应用中使用的Playlist格式
   */
  private convertApiPlaylistsToPlaylists(apiPlaylists: ApiPlaylist[]): Playlist[] {
    return apiPlaylists.map(apiPlaylist => ({
      id: apiPlaylist.id.toString(),
      title: apiPlaylist.name,
      creator: apiPlaylist.creator,
      description: apiPlaylist.description,
      cover: 'https://picsum.photos/300/300?random=' + apiPlaylist.id, // 使用默认封面
      playCount: '10万+',  // 默认播放次数
      collectCount: '1万+', // 默认收藏次数
      songCount: 50,        // 默认歌曲数量
      updateTime: new Date(apiPlaylist.createTime).toLocaleDateString() // 使用创建时间作为更新时间
    }));
  }
}

// 导出单例实例
export const musicService = MusicService.getInstance();
