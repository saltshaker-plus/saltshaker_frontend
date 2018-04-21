<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" :productShow="true"></common-table>
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
                apiService: 'job',
                showInfo: false,
                result: '',
                cColumns: [
                    {
                        title: 'Job ID',
                        key: 'jid',
                        sortable: true,
                        width: 195,
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.showInfo = true;
                                            this.result = params.row.return;
                                        }
                                    }
                                }, params.row.jid)
                            ]);
                        }
                    },
                    {
                        title: '用户名',
                        key: 'user',
                        sortable: true
                    },
                    {
                        title: '目标',
                        key: 'id',
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
                        sortable: true,
                        render: (h, params) => {
                            return this.convertTime(params.row._stamp);
                        }
                    }
                ]
            };
        },
        methods: {
            // 2018-04-18T12:51:59.321743 to yyyy-mm-dd hh:mm:ss
            convertTime (time) {
                let dt = new Date(time);
                dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
                let date = dt.toISOString().slice(0, -5).replace(/[T]/g, ' ');
                return date;
            }
        }
    };
</script>