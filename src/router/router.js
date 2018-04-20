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
        { path: 'order/:order_id', title: '订单详情', name: 'order-info', component: () => import('@/views/advanced-router/component/order-info.vue') }, // 用于展示动态路由
        { path: 'shopping', title: '购物详情', name: 'shopping', component: () => import('@/views/advanced-router/component/shopping-info.vue') }, // 用于展示带参路由
        { path: 'message', title: '消息中心', name: 'message_index', component: () => import('@/views/message/message.vue') }
    ]
};

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
    {
        path: '/minion',
        icon: 'ios-keypad',
        name: 'minion',
        title: 'Minion管理',
        component: Main,
        children: [
            { path: 'status', title: '状态信息', name: 'status', component: () => import('@/views/minion/status.vue') },
            { path: 'key', title: 'Key管理', name: 'key', component: () => import('@/views/minion/key.vue') },
            { path: 'grains', title: 'Grains', name: 'grains', component: () => import('@/views/minion/grains.vue') }
        ]
    },
    {
        path: '/job',
        icon: 'arrow-swap',
        name: 'job',
        title: 'Job管理',
        component: Main,
        children: [
            { path: 'history', title: 'Job历史', name: 'history', component: () => import('@/views/job/history.vue') },
            { path: 'manager', title: 'Job管理', name: 'manager', component: () => import('@/views/job/manager.vue') }
        ]
    },
    {
        path: '/host',
        icon: 'ios-barcode',
        name: 'host',
        title: '分组管理',
        component: Main,
        children: [
            { path: 'index', title: '主机管理', name: 'host_index', component: () => import('@/views/host/host.vue') }
        ]
    },
    {
        path: '/group',
        icon: 'social-buffer',
        name: 'group',
        title: '分组管理',
        component: Main,
        children: [
            { path: 'index', title: '分组管理', name: 'group_index', component: () => import('@/views/groups/groups.vue') }
        ]
    },
    {
        path: '/sls',
        icon: 'steam',
        name: 'sls',
        title: 'SLS管理',
        component: Main,
        children: [
            { path: 'pillar', title: 'Pillar SLS', name: 'pillar', component: () => import('@/views/execute/sls.vue') },
            { path: 'state', title: 'State SLS', name: 'state', component: () => import('@/views/execute/sls.vue') }
        ]
    },
    {
        path: '/执行命令',
        icon: 'ios-play',
        name: 'execute',
        title: '执行命令',
        component: Main,
        children: [
            { path: 'shell', title: 'Shell命令', name: 'shell', component: () => import('@/views/execute/sls.vue') },
            { path: 'models', title: 'Models命令', name: 'models', component: () => import('@/views/execute/sls.vue') }
        ]
    },
    {
        path: '/product',
        icon: 'person-stalker',
        name: 'product',
        title: '产品管理',
        component: Main,
        children: [
            { path: 'index', title: '产品管理', name: 'product_index', icon: 'social-dropbox', component: () => import('@/views/product/product.vue') }
        ]
    },
    {
        path: '/acl',
        icon: 'person-stalker',
        name: 'acl',
        title: 'ACL管理',
        component: Main,
        children: [
            { path: 'index', title: 'ACL管理', name: 'acl_index', icon: 'funnel', component: () => import('@/views/acl/acl.vue') }
        ]
    },
    {
        path: '/user',
        icon: 'person-stalker',
        name: 'user',
        title: '用户管理',
        component: Main,
        children: [
            { path: 'index', title: '用户管理', name: 'user_index', component: () => import('@/views/user/user.vue') }
        ]
    },
    {
        path: '/system',
        icon: 'settings',
        title: '系统管理',
        name: 'system',
        component: Main,
        children: [
            { path: 'role', title: '角色管理', name: 'role', component: () => import('@/views/role/role.vue') },
            { path: 'token', title: 'Token管理', name: 'token',component: () => import('@/views/error-page/error-page.vue') },
            { path: 'log', title: '操作日志', name: 'log', component: () => import('@/views/audit_log/audit_log.vue') },
            { path: 'tools', title: '系统工具', name: 'tools', component: () => import('@/views/error-page/error-page.vue') }
        ]
    },
    {
        path: '/component',
        icon: 'social-buffer',
        name: 'component',
        title: '组件',
        component: Main,
        children: [
            {
                path: 'image-editor',
                icon: 'crop',
                name: 'image-editor',
                title: '图片预览编辑',
                component: () => import('@/views/my-components/image-editor/image-editor.vue')
            },
            {
                path: 'draggable-list',
                icon: 'arrow-move',
                name: 'draggable-list',
                title: '可拖拽列表',
                component: () => import('@/views/my-components/draggable-list/draggable-list.vue')
            },
            {
                path: 'file-upload',
                icon: 'android-upload',
                name: 'file-upload',
                title: '文件上传',
                component: () => import('@/views/my-components/file-upload/file-upload.vue')
            },
        ]
    },
    {
        path: '/form',
        icon: 'android-checkbox',
        name: 'form',
        title: '表单编辑',
        component: Main,
        children: [
            { path: 'workflow', title: '工作流', name: 'workflow', icon: 'arrow-swap', component: () => import('@/views/form/work-flow/work-flow.vue') }

        ]
    },
    {
        path: '/tables',
        icon: 'ios-grid-view',
        name: 'tables',
        title: '表格',
        component: Main,
        children: [
            { path: 'testTable', title: '翻页', name: 'test-table', icon: 'arrow-move', component: () => import('@/views/tables/test-table.vue') },
            { path: 'dragableTable', title: '可拖拽排序', name: 'dragable-table', icon: 'arrow-move', component: () => import('@/views/tables/dragable-table.vue') },
            { path: 'editableTable', title: '可编辑表格', name: 'editable-table', icon: 'edit', component: () => import('@/views/tables/editable-table.vue') },
            { path: 'searchableTable', title: '可搜索表格', name: 'searchable-table', icon: 'search', component: () => import('@/views/tables/searchable-table.vue') },
            { path: 'exportableTable', title: '表格导出数据', name: 'exportable-table', icon: 'code-download', component: () => import('@/views/tables/exportable-table.vue') },
            { path: 'table2image', title: '表格转图片', name: 'table-to-image', icon: 'images', component: () => import('@/views/tables/table-to-image.vue') }
        ]
    },
    {
        path: '/advanced-router',
        icon: 'ios-infinite',
        name: 'advanced-router',
        title: '高级路由',
        component: Main,
        children: [
            { path: 'mutative-router', title: '动态路由', name: 'mutative-router', icon: 'link', component: () => import('@/views/advanced-router/mutative-router.vue') },
            { path: 'argument-page', title: '带参页面', name: 'argument-page', icon: 'android-send', component: () => import('@/views/advanced-router/argument-page.vue') }
        ]
    },
    {
        path: '/access',
        icon: 'key',
        name: 'access',
        title: '权限管理',
        component: Main,
        children: [
            { path: 'index', title: '权限管理', name: 'access_index', component: () => import('@/views/access/access.vue') }
        ]
    },
    {
        path: '/access-test',
        icon: 'lock-combination',
        title: '权限测试页',
        name: 'accesstest',
        access: 0,
        component: Main,
        children: [
            { path: 'index', title: '权限测试页', name: 'accesstest_index', access: 0, component: () => import('@/views/access/access-test.vue') }
        ]
    },
    {
        path: '/international',
        icon: 'earth',
        title: {i18n: 'international'},
        name: 'international',
        component: Main,
        children: [
            { path: 'index', title: {i18n: 'international'}, name: 'international_index', component: () => import('@/views/international/international.vue') }
        ]
    },
    {
        path: '/error-page',
        icon: 'android-sad',
        title: '错误页面',
        name: 'errorpage',
        component: Main,
        children: [
            { path: 'index', title: '错误页面', name: 'errorpage_index', component: () => import('@/views/error-page/error-page.vue') }
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
