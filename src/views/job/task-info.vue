<template>
    <div>
        <Row class="margin-top-10">
            <Card dis-hover>
                <p slot="title">
                    任务详情
                </p>
                <Table :columns="columns" :data="task" :show-header="false" :border="true"></Table>
            </Card>
        </Row>
    </div>
</template>

<script>
export default {
    data () {
        return {
            period: '',
            // 关闭清理定时刷新
            timer: null,
            columns: [
                {
                    title: '',
                    key: 'key',
                    // className: 'demo-table-info-column',
                    width: 150
                },
                {
                    title: '',
                    key: 'value',
                    render: (h, params) => {
                        if (params.row.key === '目标组') {
                            return h('ul', params.row.value.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item.name);
                            })
                            );
                        } else if (params.row.key === '结果') {
                            return h('ul', params.row.value.map(item => {
                                return h('li', [
                                    h('Tag', item.option),
                                    h('Tag', {
                                        props: {
                                            'color': 'green'
                                        }
                                    }, item.time),
                                    h('div', Object.keys(item.result).map(k => {
                                        return h('highlight-code', {
                                            props: {
                                                'lang': 'yaml',
                                                'style': 'overflow:auto'
                                            }
                                        }, 'Minion: ' + k + '\n' + item.result[k]);
                                    }))
                                ]);
                            }));
                        } else if (params.row.key === 'ID') {
                            return h('div', [
                                h('Tag', {
                                    props: {
                                        'color': 'green'
                                    }
                                }, params.row.value)
                            ]);
                        } else if (params.row.key === 'Shell') {
                            return h('highlight-code', {
                                props: {
                                    'lang': 'yaml',
                                    'style': 'overflow:auto'
                                }
                            }, params.row.value);
                        } else if (params.row.key === '定时时间') {
                            if (params.row.value !== ' ') {
                                return params.row.value;
                            } else {
                                return '立即';
                            }
                        } else if (params.row.key === '审计') {
                            return h('ul', params.row.value.map(item => {
                                return h('li', [
                                    h('Tag', {
                                        props: {
                                            'color': 'yellow'
                                        }
                                    }, item.timestamp),
                                    h('Tag', {
                                        props: {
                                            'color': 'green'
                                        }
                                    }, item.user),
                                    h('Tag', {}, item.option)
                                ]);
                            }));
                        } else {
                            return params.row.value;
                        }
                    }
                }
            ],
            task: []
        };
    },
    methods: {
        init () {
            this.getPeriod();
        },
        getPeriod () {
            this.axios.get(this.Global.serverSrc + 'period/' + this.$route.query.id.toString()).then(
                res => {
                    if (res.data['status'] === true) {
                        this.period = res.data['data'];
                        this.task = [];
                        this.task.push(
                            {
                                key: 'ID',
                                value: this.period['id']
                            },
                            {
                                key: 'Job名',
                                value: this.period['name']
                            },
                            {
                                key: '描述',
                                value: this.period['description']
                            },
                            {
                                key: '产品',
                                value: this.period['product_id']
                            },
                            {
                                key: '周期',
                                value: this.period['period']
                            },
                            {
                                key: '定时时间',
                                value: this.period['date'].split('T')[0] + ' ' + this.period['time']
                            },
                            {
                                key: '类型',
                                value: this.period['type']
                            },
                            {
                                key: 'SLS',
                                value: this.period['sls']
                            },
                            {
                                key: 'Shell',
                                value: this.period['shell']
                            },
                            {
                                key: 'Cron',
                                value: this.period['cron']
                            },
                            {
                                key: '目标组',
                                value: this.period['target']
                            },
                            {
                                key: '并发',
                                value: this.period['concurrent']
                            },
                            {
                                key: '审计',
                                value: this.period['audit']
                            },
                            {
                                key: '结果',
                                value: this.period['result'],
//                                cellClassName: {
//                                    key: 'demo-table-info-row',
//                                    value: 'demo-table-info-column'
//                                }
                            }
                        );
                    } else {
                        this.nError('Get Task Failure', res.data['message']);
                    }
                },
                err => {
                    let errInfo = '';
                    try {
                        errInfo = err.response.data['message'];
                    } catch (error) {
                        errInfo = err;
                    }
                    this.nError('Get Task Failure', errInfo);
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
    },
    mounted () {
        this.init();
        this.timer = setInterval(this.getPeriod, 5000);
    },
    watch: {
        '$route' () {
            this.init();
        }
    },
    // 关闭销毁
    beforeDestroy () {
        clearInterval(this.timer);
    }
};
</script>
<style>
    .ivu-table .demo-table-info-row td{
        background-color: #2db7f5;
        color: #fff;
    }
    .ivu-table .demo-table-error-row td{
        background-color: #ff6600;
        color: #fff;
    }
    .ivu-table td.demo-table-info-column{
        background-color: #64d572;
        color: #fff;
    }
    .ivu-table .demo-table-info-cell-name {
        background-color: #2db7f5;
        color: #fff;
    }
    .ivu-table .demo-table-info-cell-age {
        background-color: #ff6600;
        color: #fff;
    }
    .ivu-table .demo-table-info-cell-address {
        background-color: #187;
        color: #fff;
    }
</style>