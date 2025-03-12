export default {
  pages: [
    'pages/index/index',
    'pages/player/index',
    'pages/social/index',
    'pages/create-post/index',
    'pages/comments/index',
    'pages/profile/index',
    'pages/playlist/index',
    'pages/album/index',
    'pages/search/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#1aad19',
    backgroundColor: '#fff',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/social/index',
        text: '社区'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
}
