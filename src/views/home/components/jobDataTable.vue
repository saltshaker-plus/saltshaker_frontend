<template>
    <div :style="styleObj">
        <Table :height="height" :columns="columns" :data="jobData" border></Table>
    </div>
</template>

<script>
export default {
    name: 'jobDataTable',
    data () {
        return {
            jobData: this.tableList(),
            columns: [
                {
                    title: 'Job 名',
                    key: 'name',
                    sortable: true,
                    render: (h, params) => {
                        return h('div', [
                            h('Tooltip', {
                                props: {
                                    content: params.row.id,
                                    transfer: true,
                                    placement: 'top-start'
                                }
                            }, params.row.name)
                        ]);
                    }
                },
                {
                    title: '目标',
                    key: 'target',
                    sortable: true,
                    render: (h, params) => {
                        return h('ul', params.row.target.map(item => {
                            return h('li', {
                                style: {
                                    textAlign: 'left',
                                    padding: '0px'
                                }
                            }, item.name);
                        })
                        );
                    }
                },
                {
                    title: '调度',
                    key: 'scheduler',
                    sortable: true,
                    render: (h, params) => {
                        if (params.row.scheduler === 'once') {
                            return '一次';
                        } else if (params.row.scheduler === 'period') {
                            return '周期';
                        } else {
                            return '计划任务';
                        }
                    }
                },
                {
                    title: '周期',
                    key: 'period',
                    sortable: true,
                    render: (h, params) => {
                        return params.row.period.interval + '/' + params.row.period.type[0];
                    }
                },
                {
                    title: '更新时间',
                    key: 'timestamp',
                    sortable: true,
                    width: 160,
                    render: (h, params) => {
                        return params.row.audit.map(item => {
                            return this.formatTime(item.result.timestamp);
                        });
                    }
                },
                {
                    title: '状态',
                    key: 'status',
                    sortable: true,
                    width: 120,
                    render: (h, params) => {
                        let tagColor = 'green';
                        if (params.row.status.id === 4) {
                            tagColor = 'red';
                        }
                        return h('div', [
                            h('Tag', {
                                props: {
                                    'color': tagColor
                                }
                            }, params.row.status.name)
                        ]);
                    }
                }
            ]
        };
    },
    props: {
        styleObj: Object,
        height: String,
        productId: {
            type: String,
            required: true
        }
    },
    watch: {
        productId () {
            this.tableList();
        }
    },
    methods: {
        tableList () {
            this.axios.get(this.Global.serverSrc + 'period' + '?product_id=' + this.productId + '&scheduler_type=once').then(
                res => {
                    if (res.data['status'] === true) {
                        this.jobData = res.data['data'];
                    } else {
                        this.nError('Get Info Failure', res.data['message']);
                    };
                },
                err => {
                    let errInfo = '';
                    try {
                        errInfo = err.response.data['message'];
                        if (err.response.status === 404) {
                            this.jobData = [];
                        } else {
                            this.nError('Get Info Failure', errInfo);
                        }
                    } catch (error) {
                        errInfo = err;
                        this.nError('Get Info Failure', errInfo);
                    }
                    this.jobData = [];
                });
        },
        nError (title, info) {
            this.$Notice.error({
                title: title,
                // 替换<>避免被解析为html标签
                desc: info.toString().replace(/<|>/g, ''),
                duration: 10
            });
        },
        formatTime (time) {
            let unixtime = time;
            let unixTimestamp = new Date(unixtime * 1000);
            let Y = unixTimestamp.getFullYear();
            let M = ((unixTimestamp.getMonth() + 1) > 10 ? (unixTimestamp.getMonth() + 1) : '0' + (unixTimestamp.getMonth() + 1));
            let D = (unixTimestamp.getDate() >= 10 ? unixTimestamp.getDate() : '0' + unixTimestamp.getDate());
            let h = (unixTimestamp.getHours() >= 10 ? unixTimestamp.getHours() : '0' + unixTimestamp.getHours());
            let m = (unixTimestamp.getMinutes() >= 10 ? unixTimestamp.getMinutes() : '0' + unixTimestamp.getMinutes());
            let s = (unixTimestamp.getSeconds() >= 10 ? unixTimestamp.getSeconds() : '0' + unixTimestamp.getSeconds());
            let toDay = Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
            return toDay;
        }
    }
};
</script>
