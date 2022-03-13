// 路由配置  这个配置会自动的帮我们生成一个侧边的主菜单
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/flight', // 访问的路径
    name: '航线管理', // 在菜单显示的中文名称
    icon: 'crown', // 在菜单当中的图标
    component: './Flight', // 对应的要渲染的组件  这个组件是以src/pages/
  },
  {
    path: '/order',
    name: '订单管理',
    icon: 'crown',
    component: './Order',
  },
  {
    path: '/station',
    name: '站点管理',
    icon: 'crown',
    component: './Station',
  },
];
