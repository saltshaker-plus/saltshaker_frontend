<template>
    <div>
        <common-table
                :cColumns="cColumns"
                :apiService="apiService"
                @getProductEvent="getProductEvent"
                @getRowEvent="getRowEvent"
                :productShow="true"
                ref="childrenMethods">
            <Button slot="create" type="primary" @click="sync()">同步主机</Button>
            <Button slot="create" type="primary" @click="add('formValidate')" v-show="false">创建主机</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="70" inline>
                    <FormItem label="标签">
                        <Tag v-for="item in formValidate.tag" :key="item.name" :name="item.name" :color="item.color" closable @on-close="handleTagDel">{{item.name}}</Tag>
                    </FormItem>
                    <FormItem label="添加标签" prop="tagName">
                        <Input size="small" v-model="formValidate.tagName" style="width:220px"></Input>
                        <Select size="small" v-model="tagColor" style="width:80px">
                            <Option value="default" key="default">默认</Option>
                            <Option value="green" key="green">绿色</Option>
                            <Option value="red" key="red">红色</Option>
                            <Option value="yellow" key="yellow">黄色</Option>
                        </Select>
                        <Button icon="ios-plus-empty" type="dashed" size="small" @click="handleTagAdd('formValidate')">添加标签</Button>
                    </FormItem>
                </Form>
                <div slot="footer">
                    <Button type="ghost" @click="handleCancel()" style="margin-left: 8px">取消</Button>
                </div>
            </Modal>
            <Modal slot="option" v-model="syncHost" title="同步主机" @on-ok="handleSubmit">
                <div style="text-align:center">
                    此功能会根据Minion状态同步主机信息，以确保数据一致性
                    <Button type="success" size="small" @click="handleSync()">同步</Button>
                    <Progress v-show="progress" :percent="percent" status="active"></Progress>
                </div>
                <div slot="footer">
                    <Button type="ghost" @click="handleCancel()" style="margin-left: 8px">取消</Button>
                </div>
            </Modal>
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
                apiService: 'host',
                productData: [],
                productId: '',
                // 删除数据
                delId: '',
                delIndex: '',
                // 编辑数据
                formView: false,
                buttonShow: false,
                syncHost: false,
                progress: false,
                percent: 0,
                count: [],
                id: '',
                optionType: '',
                optionTypeName: '',
                index: 1,
                // tag
                tagName: '',
                tagColor: 'default',
                minionId: '',
                cColumns: [
                    {
                        title: 'Minion',
                        key: 'minion_id',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', [
                                h('Tooltip', {
                                    props: {
                                        content: params.row.id,
                                        transfer: true,
                                        placement: 'top-start'
                                    }
                                }, params.row.minion_id)
                            ]);
                        }
                    },
                    {
                        title: '分组',
                        key: 'groups',
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.groups.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item);
                            })
                            );
                        }
                    },
                    {
                        title: '标签',
                        key: 'tag',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', params.row.tag.map(item => {
                                return h('Tag', {
                                    props: {
                                        color: item['color'],
                                        name: item['name']
                                    },
                                }, item['name']);
                            })
                            );
                        }
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 123,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.formView = true;
                                            this.optionType = 'edit';
                                            this.optionTypeName = '编辑';
                                            this.id = params.row.id;
                                            this.minionId = params.row.minion_id;
                                            this.formValidate.tagName = '';
                                            this.formValidate.tag = params.row.tag;
                                        }
                                    }
                                }, '编辑'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要删除 ' + params.row.name + ' 吗?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.id;
                                            this.delIndex = params.index;
                                            this.del();
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            size: 'small',
                                            disabled: true
                                        }
                                    }, '删除')
                                ])
                            ]);
                        }
                    }
                ],
                // 表单验证
                formValidate: {
                    tagName: '',
                    tag: []
                },
                ruleValidate: {
                    tagName: [
                        { required: true, message: '标签不能为空', trigger: 'blur' }
                    ]
                }
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
            // 调用子组件进行删除
            del () {
                this.$refs.childrenMethods.del(this.delId);
            },
            // 调用子组件进行数据刷新
            tableList () {
                this.$refs.childrenMethods.tableList();
            },
            // 调用子组件消息通知
            nError (title, info) {
                this.$refs.childrenMethods.nError(title, info);
            },
            // 添加展示
            add (name) {
                this.handleReset(name);
                this.optionType = 'add';
                this.optionTypeName = '添加';
                this.formView = true;
            },
            // 表单提
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        // 编辑
                        let postData = {
                            'name': this.formValidate.name,
                            'description': this.formValidate.description,
                            'product_id': this.formValidate.productId,
                            'allow': this.formValidate.allow.split('\n'),
                            'deny': this.formValidate.deny.split('\n')
                        };
                        if (this.optionType === 'edit') {
                            this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id,
                                postData).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nError('Edit Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nError('Edit Failure', errInfo);
                                });
                        } else {
                            // 添加
                            this.axios.post(this.Global.serverSrc + this.apiService,
                                postData).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nError('Add Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nError('Add Failure', errInfo);
                                });
                        }
                    } else {
                        this.$Message.error('请检查表单数据！');
                    }
                });
            },
            // 表单重置
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            handleCancel () {
                this.formView = false;
                this.syncHost = false;
            },
            handleRemove (index) {
                this.formDynamic.items[index].status = 0;
            },
            handleTagAdd (name) {
                for (var i = 0; i < this.formValidate.tag.length; i++) {
                    if (this.formValidate.tag[i]['name'] === this.formValidate.tagName) {
                        this.$Message.error('标签不能重复！');
                        return;
                    }
                }
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.formValidate.tag.push({'name': this.formValidate.tagName, 'color': this.tagColor});
                        let postData = {
                            'tag': this.formValidate.tag,
                            'minion_id': this.minionId,
                            'product_id': this.productId
                        };
                        this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id, postData).then(
                            res => {
                                if (res.data['status'] === true) {
                                    this.$Message.success('添加成功！');
                                } else {
                                    this.nError('Add Failure', res.data['message']);
                                }
                            },
                            err => {
                                let errInfo = '';
                                try {
                                    errInfo = err.response.data['message'];
                                } catch (error) {
                                    errInfo = err;
                                }
                                this.nError('Add Failure', errInfo);
                            });
                    } else {
                        this.$Message.error('请检查表单数据！');
                    }
                });
            },
            handleTagDel (event, name) {
                // 删除tag
                this.formValidate.tag.splice(this.formValidate.tag.findIndex(item => item.name === name), 1);
                let postData = {
                    'tag': this.formValidate.tag,
                    'minion_id': this.minionId,
                    'product_id': this.productId
                };
                this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('删除成功！');
                        } else {
                            this.nError('Delete Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Delete Failure', errInfo);
                    });
            },
            sync () {
                this.syncHost = true;
                this.progress = false;
            },
            handleSync () {
                this.progress = true;
                this.axios.get(this.Global.serverSrc + this.apiService + '/sync?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.percent = 100;
                            this.tableList();
                        } else {
                            this.loading = false;
                            this.nError('Sync Host Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.loading = false;
                        this.nError('Get Product Failure', errInfo);
                    });
            }
        }
    };
</script>