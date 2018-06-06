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
            columns: [
                {
                    title: '',
                    key: 'key',
                    width: 200
                },
                {
                    title: '',
                    key: 'value'
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
                        for (var key of Object.keys(this.period)) {
                            this.task.push({'key': key, 'value': this.period[key]});
                        }
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
    },
    watch: {
        '$route' () {
            this.init();
        }
    }
};
</script>
