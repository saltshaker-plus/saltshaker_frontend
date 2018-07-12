<template>
    <div>
        <Row class="margin-top-10">
            <Card dis-hover>
                <p slot="title">
                    系统工具
                </p>
                <Table :columns="columns1" :data="data1" :border="true"></Table>
            </Card>
        </Row>
    </div>
</template>
<script>
    export default {
        data () {
            return {
                columns1: [
                    {
                        title: '服务',
                        key: 'service'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            let tagColor = 'green';
                            if (params.row.status.id === 0) {
                                tagColor = 'red';
                            } else if (params.row.status.id === 11) {
                                tagColor = 'yellow';
                            }
                            return h('div', [
                                h('Tag', {
                                    props: {
                                        'color': tagColor
                                    }
                                }, 'UP')
                            ]);
                        }
                    },
                    {
                        title: '操作',
                        key: 'option',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleEvent('start');
                                        }
                                    }
                                }, '启动'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleEvent('stop');
                                        }
                                    }
                                }, '停止'),
                                h('Button', {
                                    props: {
                                        type: 'default',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.handleEvent('restart');
                                        }
                                    }
                                }, '重启')
                            ]);
                        }
                    }
                ],
                data1: [
                    {
                        service: 'Event',
                        status: 0,
                        address: 'New York No. 1 Lake Park'
                    }
                ]
            };
        },
        methods: {
            handleEvent (action) {
                this.axios.get(this.Global.serverSrc + 'sse?action=' + action).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('成功！');
                            this.tableList();
                        } else {
                            this.nError('Event Action Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Event Action Failure', errInfo);
                    });
            },
            // 重新定义错误消息
            nError (title, info) {
                this.$Notice.error({
                    title: title,
                    // 替换<>避免被解析为html标签
                    desc: info.toString().replace(/<|>/g, ''),
                    duration: 10
                });
            },
        }
    };
</script>
