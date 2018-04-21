<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" @getProductEvent="getProductEvent" :productShow="true" ref="childrenMethods">
            <Modal slot="option"
                v-model="key"
                :title="title">
                <p>Content of dialog</p>
                <p>Content of dialog</p>
                <p>Content of dialog</p>
            </Modal>
            <!--<Dropdown slot="downMenu">-->
                <!--<Button type="primary">-->
                    <!--操作-->
                    <!--<Icon type="arrow-down-b"></Icon>-->
                <!--</Button>-->
                <!--<DropdownMenu slot="list">-->
                    <!--<DropdownItem>-->
                        <!--<div @click="customPage(5)">全部接受</div>-->
                    <!--</DropdownItem>-->
                    <!--<DropdownItem>-->
                        <!--<div @click="customPage(10)">全部拒绝</div>-->
                    <!--</DropdownItem>-->
                    <!--<DropdownItem>-->
                        <!--<div @click="customPage(50)">全部删除</div>-->
                    <!--</DropdownItem>-->
                <!--</DropdownMenu>-->
            <!--</Dropdown>-->
            <!--<Button slot="selectAll" @click="handleSelectAll(true)" >设置全选</Button>-->
            <!--<Button slot="notSelectAll" @click="handleSelectAll(false)">取消全选</Button>-->
            <Button slot="accept" @click="key = true, title = '全部接受'">全部接受</Button>
            <Button slot="reject" @click="key = true, title = '全部拒绝'">全部拒绝</Button>
            <Button slot="delete" @click="key = true, title = '全部删除'">全部删除</Button>
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
            // 调用子组件消息通知
            nerror (title, info) {
                this.$refs.childrenMethods.nerror(title, info);
            },
            // key管理
            keyManage (action) {
                let postData = {
                    minion_id: this.minion
                };
                console.log(this.productId)
                this.axios.post(this.Global.serverSrc + this.apiService + '?product_id=' + this.productId + '&action=' + action,
                    postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.formView = false;
                            this.$Message.success('成功！');
                            this.tableList();
                        } else {
                            this.nerror(action.substring(0, 1).toUpperCase() + action.substring(1) + ' Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nerror(action.substring(0, 1).toUpperCase() + action.substring(1) + ' Failure', errInfo);
                    });
            },
            // 2018, Apr 18 20:30:48.960755 to yyyy-mm-dd hh:mm:ss
            convertTime (time) {
                let dt = new Date(time);
                let date = dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
                return date;
            },
            handleSelectAll (status) {
                this.$refs.childrenMethods.selection.selectAll(status);
            }
        }
    };
</script>