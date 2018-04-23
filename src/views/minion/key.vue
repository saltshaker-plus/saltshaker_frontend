<template>
    <div>
        <common-table
                :cColumns="cColumns"
                :apiService="apiService"
                @getProductEvent="getProductEvent"
                @getRowEvent="getRowEvent"
                :productShow="true" ref="childrenMethods">
            <Modal slot="option" v-model="key" :title="title" @on-ok="handleSubmit">
                <div style="text-align:center">
                    <p v-for="item in rowData">{{item.minions_id}}</p>
                </div>
            </Modal>
            <Button v-show="buttonShow" slot="accept" @click="handleSelectAll('全部接受','accept')">全部接受</Button>
            <Button v-show="buttonShow" slot="reject" @click="handleSelectAll('全部拒绝','reject')">全部拒绝</Button>
            <Button v-show="buttonShow" slot="delete" @click="handleSelectAll('全部删除','delete')">全部删除</Button>
        </common-table>
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
                apiService: 'minions/key',
                productData: [],
                productId: '',
                showInfo: false,
                key: false,
                title: '',
                minion: [],
                rowData: [],
                action: '',
                buttonShow: false,
                // 删除数据
                delId: '',
                delIndex: '',
                result: '',
                cColumns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: 'Minions',
                        key: 'minions_id',
                        sortable: true
                    },
                    {
                        title: '状态',
                        key: 'minions_status',
                        sortable: true
                    },
                    {
                        title: '接受 Key',
                        key: 'Function',
                        sortable: true,
                        align: 'center',
                        render: (h, params) => {
                            let buttonDisabled = true;
                            if (params.row.minions_status === 'Unaccepted') {
                                buttonDisabled = false;
                            }
                            return h('div', [
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要接受 ' + params.row.minions_id + ' 吗?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.minions_id;
                                            this.delIndex = params.index;
                                            this.minion = [params.row.minions_id];
                                            this.keyManage('accept');
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'success',
                                            disabled: buttonDisabled,
                                            size: 'small'
                                        }
                                    }, '接受')
                                ])
                            ]);
                        }
                    },
                    {
                        title: '拒绝 Key',
                        key: 'Function',
                        sortable: true,
                        align: 'center',
                        render: (h, params) => {
                            let buttonDisabled = true;
                            if (params.row.minions_status === 'Unaccepted') {
                                buttonDisabled = false;
                            }
                            return h('div', [
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要拒绝 ' + params.row.minions_id + ' 吗?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.minions_id;
                                            this.delIndex = params.index;
                                            this.minion = [params.row.minions_id];
                                            this.keyManage('reject');
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'warning',
                                            disabled: buttonDisabled,
                                            size: 'small'
                                        }
                                    }, '拒绝')
                                ])
                            ]);
                        }
                    },
                    {
                        title: '删除 Key',
                        key: 'Function',
                        sortable: true,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要删除 ' + params.row.minions_id + ' 吗?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.minions_id;
                                            this.delIndex = params.index;
                                            this.minion = [params.row.minions_id];
                                            this.keyManage('delete');
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            disabled: false,
                                            size: 'small'
                                        }
                                    }, '删除')
                                ])
                            ]);
                        }
                    },
                ]
            };
        },
        methods: {
            getProductEvent: function (productData, productId) {
                this.productData = productData;
                this.productId = productId;
            },
            getRowEvent: function (rowData) {
                this.rowData = rowData;
                if (this.rowData.length > 0) {
                    this.buttonShow = true;
                } else {
                    this.buttonShow = false;
                }
            },
            // 调用子组件消息通知
            nerror (title, info) {
                this.$refs.childrenMethods.nerror(title, info);
            },
            // 调用子组件进行数据刷新
            tableList () {
                this.$refs.childrenMethods.tableList();
            },
            handleSelectAll (title, action) {
                this.key = true;
                this.title = title;
                this.action = action;
                // 获取minion id
                this.minion = [];
                for (var i = 0; i < this.rowData.length; i++) {
                    this.minion.push(this.rowData[i]['minions_id']);
                }
            },
            // 处理确定
            handleSubmit () {
                this.keyManage(this.action);
                this.action = '';
            },
            // key管理
            keyManage (action) {
                let postData = {
                    'minion_id': this.minion
                };
                this.axios.post(this.Global.serverSrc + this.apiService + '?product_id=' + this.productId + '&action=' + action,
                    postData).then(
                    res => {
                        this.buttonShow = false;
                        if (res.data['status'] === true) {
                            this.formView = false;
                            this.$Message.success('成功！');
                            this.tableList();
                        } else {
                            this.nerror(action.substring(0, 1).toUpperCase() + action.substring(1) + ' Failure', res.data['message']);
                        };
                    },
                    err => {
                        this.buttonShow = false;
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nerror(action.substring(0, 1).toUpperCase() + action.substring(1) + ' Failure', errInfo);
                    });
            }
        }
    };
</script>