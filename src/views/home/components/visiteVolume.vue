<template>
    <div style="width:100%;height:100%;" id="visite_volume_con"></div>
</template>

<script>
import echarts from 'echarts';
export default {
    name: 'visiteVolume',
    data () {
        return {
            //
        };
    },
    mounted () {
        this.$nextTick(() => {
            let visiteVolume = echarts.init(document.getElementById('visite_volume_con'));
            let xAxisData = [];
            let data1 = [];
            let data2 = [];
            for (let i = 0; i < 20; i++) {
                xAxisData.push('类目' + i);
                data1.push((Math.sin(i / 5) * (i / 5 - 10) + i / 6));
                data2.push((Math.cos(i / 5) * (i / 5 - 10) + i / 6));
            }
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
                    right: 0,
                    bottom: 0,
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    data: ['Down', 'Rejected', 'Unaccepted', 'Accepted', 'Up'],
                    nameTextStyle: {
                        color: '#c3c3c3'
                    }
                },
                series: [
                    {
                        name: 'Minion',
                        type: 'bar',
                        data: [
                            {value: 678, name: 'Down', itemStyle: {normal: {color: '#f25e43'}}},
                            {value: 403, name: 'Rejected', itemStyle: {normal: {color: '#ffd572'}}},
                            {value: 250, name: 'Unaccepted', itemStyle: {normal: {color: '#2d8cf0'}}},
                            {value: 523, name: 'Accepted', itemStyle: {normal: {color: '#f0e334'}}},
                            {value: 456, name: 'Up', itemStyle: {normal: {color: '#64d572'}}}
                        ]
                    }
                ]
            };
            visiteVolume.setOption(option);
            window.addEventListener('resize', function () {
                visiteVolume.resize();
            });
        });
    }
};
</script>
