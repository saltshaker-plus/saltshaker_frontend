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
                    title: '类型',
                    key: 'type',
                    sortable: true
                },
                {
                    title: '并行数',
                    key: 'concurrent',
                    sortable: true
                },
                {
                    title: '时间',
                    key: 'data',
                    sortable: true,
                    width: 160,
                    render: (h, params) => {
                        return params.row.date.split('T')[0] + ' ' + params.row.time;
                    }
                },
                {
                    title: '状态',
                    key: 'status',
                    sortable: true,
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
            this.axios.get(this.Global.serverSrc + 'period' + '?product_id=' + this.productId).then(
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
        }
    }
};
</script>
