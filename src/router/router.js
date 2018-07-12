import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: 'Login - 登录'
    },
    component: () => import('@/views/login.vue')
};

export const page404 = {
    path: '/*',
    name: 'error-404',
    meta: {
        title: '404-页面不存在'
    },
    component: () => import('@/views/error-page/404.vue')
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足'
    },
    name: 'error-403',
    component: () => import('@//views/error-page/403.vue')
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误'
    },
    name: 'error-500',
    component: () => import('@/views/error-page/500.vue')
};

export const locking = {
    path: '/locking',
    name: 'locking',
    component: () => import('@/views/main-components/lockscreen/components/locking-page.vue')
};

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        { path: 'home', title: {i18n: 'home'}, name: 'home_index', component: () => import('@/views/home/home.vue') },
        { path: 'ownspace', title: '个人中心', name: 'ownspace_index', component: () => import('@/views/own-space/own-space.vue') },
        { path: 'task', title: '任务', name: 'task', component: () => import('@/views/job/task-info.vue') },
        { path: 'message', title: '消息中心', name: 'message_index', component: () => import('@/views/message/message.vue') }
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
    {
        path: '/job',
        icon: 'arrow-swap',
        name: 'job',
        title: 'Job管理',
        access: 1,
        component: Main,
        children: [
            { path: 'create', title: 'Job创建', name: 'create', access: 1, component: () => import('@/views/job/create.vue') },
            { path: 'history', title: 'Job历史', name: 'history', access: 1, component: () => import('@/views/job/history.vue') },
            { path: 'manager', title: 'Job管理', name: 'manager', access: 1, component: () => import('@/views/job/manager.vue') }
        ]
    },
    {
        path: '/minion',
        icon: 'ios-keypad',
        name: 'minion',
        title: 'Minion管理',
        access: 1,
        component: Main,
        children: [
            { path: 'status', title: '状态信息', name: 'status', access: 1, component: () => import('@/views/minion/status.vue') },
            { path: 'key', title: 'Key管理', name: 'key', access: 111, component: () => import('@/views/minion/key.vue') },
            { path: 'grains', title: 'Grains', name: 'grains', access: 1, component: () => import('@/views/minion/grains.vue') }
        ]
    },
    {
        path: '/host',
        icon: 'ios-barcode',
        name: 'host',
        title: '主机管理',
        access: 1,
        component: Main,
        children: [
            { path: 'index', title: '主机管理', name: 'host_index', access: 1, component: () => import('@/views/host/host.vue') }
        ]
    },
    {
        path: '/group',
        icon: 'social-buffer',
        name: 'group',
        title: '分组管理',
        access: 2,
        component: Main,
        children: [
            { path: 'index', title: '分组管理', name: 'group_index', access: 2, component: () => import('@/views/groups/groups.vue') }
        ]
    },
    {
        path: '/file',
        icon: 'document-text',
        name: 'file',
        title: '文件服务',
        access: 1,
        component: Main,
        children: [
            // { path: 'pillar_sls', title: 'Pillar SLS', name: 'pillar sls', component: () => import('@/views/my-components/draggable-list/draggable-list.vue') },
            { path: 'index', title: '文件服务', name: 'file_index', access: 1, component: () => import('@/views/fileserver/gitlab.vue') }
        ]
    },
    {
        path: '/execute',
        icon: 'ios-play',
        name: 'execute',
        title: '执行命令',
        access: 1,
        component: Main,
        children: [
            { path: 'shell', title: 'Shell', name: 'shell', access: 1, component: () => import('@/views/execute/shell.vue') },
            { path: 'state', title: 'State', name: 'state', access: 1, component: () => import('@/views/execute/state.vue') },
            { path: 'module', title: 'Module', name: 'module', access: 1, component: () => import('@/views/execute/module.vue') },
            { path: 'pillar', title: 'Pillar', name: 'pillar', access: 1, component: () => import('@/views/execute/pillar.vue') }
        ]
    },
    {
        path: '/product',
        icon: 'person-stalker',
        name: 'product',
        title: '产品线管理',
        access: 2,
        component: Main,
        children: [
            { path: 'index', title: '产品线管理', name: 'product_index', icon: 'social-dropbox', access: 2, component: () => import('@/views/product/product.vue') }
        ]
    },
    {
        path: '/acl',
        icon: 'person-stalker',
        name: 'acl',
        title: 'ACL管理',
        access: 2,
        component: Main,
        children: [
            { path: 'index', title: 'ACL管理', name: 'acl_index', icon: 'funnel', access: 2, component: () => import('@/views/acl/acl.vue') }
        ]
    },
    {
        path: '/system',
        icon: 'settings',
        title: '系统管理',
        name: 'system',
        access: 0,
        component: Main,
        children: [
            { path: 'user', title: '用户管理', name: 'user', access: 100, component: () => import('@/views/user/user.vue') },
            { path: 'role', title: '角色管理', name: 'role', access: 101, component: () => import('@/views/role/role.vue') },
            { path: 'token', title: 'Token管理', name: 'token', access: 102, component: () => import('@/views/error-page/error-page.vue') },
            { path: 'log', title: '操作日志', name: 'log', access: 103, component: () => import('@/views/audit_log/audit_log.vue') },
            { path: 'tools', title: '系统工具', name: 'tools', access: 104, component: () => import('@/views/system/tool.vue') }
        ]
    }
];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    otherRouter,
    locking,
    ...appRouter,
    page500,
    page403,
    page404
];
