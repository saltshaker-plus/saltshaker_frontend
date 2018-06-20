<template>
    <div style="width:100%;height:100%;" id="visite_volume_con"></div>
</template>

<script>
import echarts from 'echarts';
export default {
    name: 'minionStatus',
    data () {
        return {
            //
        };
    },
    props: {
        productId: {
            type: String,
            required: true
        }
    },
    watch: {
        productId () {
            this.minionStatus();
        }
    },
    methods: {
        nError (title, info) {
            this.$Notice.error({
                title: title,
                // 替换<>避免被解析为html标签
                desc: info.toString().replace(/<|>/g, ''),
                duration: 10
            });
        },
        minionStatus () {
            let minionStatus = echarts.init(document.getElementById('visite_volume_con'));
            this.axios.get(this.Global.serverSrc + 'dashboard/minion?product_id=' + this.productId).then(
                res => {
                    if (res.data['status'] === true) {
                        let title = res.data['data']['title'];
                        let seriesData = res.data['data']['series'];
                        const option = {
                            tooltip: {
                                trigger: 'axis',
                                axisPointer: {
                                    type: 'shadow'
                                }
                            },
                            grid: {
                                top: 0,
                                left: 0,
                                right: '5%',
                                bottom: 0,
                                containLabel: true
                            },
                            xAxis: {
                                type: 'value',
                                boundaryGap: [0, 0.01]
                            },
                            yAxis: {
                                type: 'category',
                                data: title,
                                nameTextStyle: {
                                    color: '#c3c3c3'
                                },
                                // axisLabel: {
                                // interval: 0,
                                // rotate: 45, // 倾斜度 -90 至 90 默认为0
                                // margin: 5
                                // }
                            },
                            series: [
                                {
                                    name: 'Minion',
                                    type: 'bar',
                                    data: seriesData
                                }
                            ]
                        };
                        minionStatus.setOption(option);
                        window.addEventListener('resize', function () {
                            minionStatus.resize();
                        });
                    } else {
                        this.nError('Get Info Failure', res.data['message']);
                    };
                },
                err => {
                    let errInfo = '';
                    try {
                        errInfo = err.response.data['message'];
                        if (err.response.status === 404) {
                            //
                        } else {
                            this.nError('Get Info Failure', errInfo);
                        }
                    } catch (error) {
                        errInfo = err;
                        this.nError('Get Info Failure', errInfo);
                    }
                });
        }
    }
};
</script>
