<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" :productShow="true"></common-table>
        <Modal width="650px" v-model="showInfo" title="返回结果" >
            <highlight-code lang="json" style="overflow:auto" v-if="result">
                {{result}}
            </highlight-code>
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
                                h('div', {
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
                        render: (h, params) => {
                            if (params.row.fun_args === undefined) {
                                params.row.fun_args = [];
                            }
                            return h('div', params.row.fun_args.join(' '));
                        }
                    },
                    {
                        title: '时间',
                        key: '_stamp',
                        sortable: true
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