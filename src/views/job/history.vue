<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService"></common-table>
    </div>
</template>

<script>
    import CommonTable from '../common-components/table/table.vue';
    export default {
        components: {
            CommonTable
        },
        data () {
            return {
                apiService: 'job',
                cColumns: [
                    {
                        title: 'Job ID',
                        key: 'jid',
                        sortable: true
                    },
                    {
                        title: '用户名',
                        key: 'user',
                        sortable: true
                    },
                    {
                        title: '目标',
                        key: 'tgt',
                        sortable: true
                    },
                    {
                        title: '功能',
                        key: 'fun',
                        sortable: true
                    },
                    {
                        title: '参数',
                        key: 'fun_args',
                        sortable: true
                    },
                    {
                        title: '时间',
                        key: '_stamp',
                        sortable: true
                    },
                    {
                        title: '结果',
                        key: 'return',
                        sortable: true
                    },
                    {
                        title: '状态',
                        key: 'success',
                        sortable: true
                    },
                    {
                        title: '详情',
                        key: 'show_more',
                        align: 'center',
                        render: (h, params) => {
                            return h('Button', {
                                props: {
                                    type: 'text',
                                    size: 'small'
                                },
                                on: {
                                    click: () => {
                                        let argu = { job_id: params.row.jid };
                                        console.log(argu)
                                        this.$router.push({
                                            name: 'job-info',
                                            params: argu
                                        });
                                    }
                                }
                            }, '了解详情');
                        }
                    }
                ]
            };
        }
    };
</script>