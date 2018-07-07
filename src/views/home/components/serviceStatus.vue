<template>
    <div :style="styleObj">
        <Table :height="height" :columns="columns" :data="jobData" border ></Table>
    </div>
</template>

<script>
export default {
    name: 'serviceStatus',
    data () {
        return {
            jobData: this.tableList(),
            columns: [
                {
                    title: '服务',
                    key: 'name',
                    sortable: true
                },
                {
                    title: '状态',
                    key: 'status',
                    sortable: true,
                    render: (h, params) => {
                        let tagColor = 'green';
                        if (params.row.status === false || params.row.status === 0) {
                            tagColor = 'red';
                        }
                        return h('div', [
                            h('Tag', {
                                props: {
                                    'color': tagColor
                                }
                            }, params.row.status)
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
            if (this.productId) {
                this.axios.get(this.Global.serverSrc + 'dashboard/status' + '?product_id=' + this.productId).then(
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
            }
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
