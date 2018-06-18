<template>
    <div style="width:100%;height:100%;" id="data_source_con"></div>
</template>

<script>
import echarts from 'echarts';

export default {
    name: 'grainsPie',
    data () {
        return {
            legendData: [],
            seriesData: [],
            selected: {}
        };
    },
    props: {
        productId: {
            type: String,
            required: true
        },
        item: {
            type: String,
            required: true
        },
        itemName: {
            type: String,
            required: true
        },
    },
    watch: {
        productId () {
            this.getGrains();
        },
        item () {
            this.getGrains();
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
        getGrains () {
            var dataSourcePie = echarts.init(document.getElementById('data_source_con'), 'westeros');
            this.axios.get(this.Global.serverSrc + 'dashboard/grains/' + this.item + '?product_id=' + this.productId).then(
                res => {
                    if (res.data['status'] === true) {
                        this.legendData = res.data['data']['legendData'];
                        this.seriesData = res.data['data']['seriesData'];
                        const option = {
                            title: {
                                x: 'center',
                                text: this.itemName
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: '{a} <br/>{b} : {c} ({d}%)'
                            },
                            legend: {
                                type: 'scroll',
                                orient: 'vertical',
                                right: 10,
                                top: 20,
                                bottom: 20,
                                data: this.legendData,
                                selected: this.selected
                            },
                            series: [
                                {
                                    name: this.itemName,
                                    type: 'pie',
                                    radius: '55%',
                                    center: ['40%', '50%'],
                                    data: this.seriesData,
                                    itemStyle: {
                                        emphasis: {
                                            shadowBlur: 10,
                                            shadowOffsetX: 0,
                                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                                        }
                                    }
                                }
                            ]
                        };
                        dataSourcePie.setOption(option);
                        window.addEventListener('resize', function () {
                            dataSourcePie.resize();
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
                            this.legendData = [];
                            this.seriesData = [];
                        } else {
                            this.nError('Get Info Failure', errInfo);
                        }
                    } catch (error) {
                        errInfo = err;
                        this.nError('Get Info Failure', errInfo);
                    }
                    this.legendData = [];
                    this.seriesData = [];
                });
        }
    }
};
</script>
