export default {
  pages: [
    'pages/index/index',
    'pages/player/index',
    'pages/social/socialIndex',
    'pages/create-post/index',
    'pages/comments/index',
    'pages/profile/index',
    'pages/profile/edit',
    'pages/playlist/index',
    'pages/album/albumIndex',
    'pages/search/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#ff4e4e',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/social/socialIndex',
        text: '社区'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
}
