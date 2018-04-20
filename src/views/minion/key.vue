<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" ref="childrenMethods">
            <Dropdown slot="downMenu">
                <Button type="primary">
                    操作
                    <Icon type="arrow-down-b"></Icon>
                </Button>
                <DropdownMenu slot="list">
                    <DropdownItem>
                        <div @click="customPage(5)">全部接受</div>
                    </DropdownItem>
                    <DropdownItem>
                        <div @click="customPage(10)">全部拒绝</div>
                    </DropdownItem>
                    <DropdownItem>
                        <div @click="customPage(50)">全部删除</div>
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Button slot="selectAll" @click="handleSelectAll(true)" >设置全选</Button>
            <Button slot="notSelectAll" @click="handleSelectAll(false)">取消全选</Button>
            <Button slot="accept" @click="handleSelectAll(false)">全部接受</Button>
            <Button slot="reject" @click="handleSelectAll(false)">全部拒绝</Button>
            <Button slot="delete" @click="handleSelectAll(false)">全部删除</Button>
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
                showInfo: false,
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
                                            this.minion = [];
                                            this.minion = params.row.Running;
                                            this.kill();
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
                                            this.minion = [];
                                            this.minion = params.row.Running;
                                            this.kill();
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
                                    }, '删除')
                                ])
                            ]);
                        }
                    },
                ]
            };
        },
        methods: {
            // 调用子组件进行删除
//            kill () {
//                let minionArray = this.minion.map(item => {
//                    return Object.keys(item)[0];
//                });
//                this.$refs.childrenMethods.kill(this.delId, minionArray);
//            },
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