<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" ref="childrenMethods"></common-table>
        <Modal width="650px" v-model="showInfo" title="返回结果" >
            <pre style="overflow:auto">
{{result}}
            </pre>
            <div slot="footer"></div>
        </Modal>
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
                apiService: 'job/manager',
                showInfo: false,
                minion: [],
                tmp: '',
                // 删除数据
                delId: '',
                delIndex: '',
                result: '',
                cColumns: [
                    {
                        title: 'Job ID',
                        key: 'Jid',
                        sortable: true,
                        width: 195
                    },
                    {
                        title: '用户名',
                        key: 'User',
                        sortable: true
                    },
                    {
                        title: 'Minion:PPid',
                        key: 'Running',
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.Running.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, Object.keys(item)[0] + ' : ' + Object.values(item)[0]);
                            })
                            );
                        }
                    },
                    {
                        title: '功能',
                        key: 'Function',
                        sortable: true
                    },
                    {
                        title: '参数',
                        key: 'Arguments',
                        sortable: true,
                        render: (h, params) => {
                            return params.row.Arguments[0];
                        }
                    },
                    {
                        title: '时间',
                        key: 'StartTime',
                        sortable: true,
                        render: (h, params) => {
                            return this.convertTime(params.row.StartTime);
                        }
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 70,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要Kill ' + params.row.Jid + ' 吗?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.Jid;
                                            this.delIndex = params.index;
                                            this.minion = [];
                                            this.minion = params.row.Running;
                                            this.kill();
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            size: 'small'
                                        }
                                    }, 'Kill')
                                ])
                            ]);
                        }
                    }
                ]
            };
        },
        methods: {
            // 调用子组件进行kill
            kill () {
                this.$refs.childrenMethods.kill(this.delId, this.minion);
            },
            // 2018, Apr 18 20:30:48.960755 to yyyy-mm-dd hh:mm:ss
            convertTime (time) {
                let dt = new Date(time);
                let date = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
                return date;
            }
        }
    };
</script>