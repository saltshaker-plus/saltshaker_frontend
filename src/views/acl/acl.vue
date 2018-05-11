<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" @getProductEvent="getProductEvent" :productShow="true" ref="childrenMethods">
            <Button slot="create" type="primary" @click="add('formValidate')">创建ACL</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                    <FormItem label="ACL名" prop="name">
                        <Input v-model="formValidate.name" placeholder="输入用户名"></Input>
                    </FormItem>
                    <FormItem label="描述" prop="description">
                        <Input v-model="formValidate.description" placeholder="输入描述"></Input>
                    </FormItem>
                    <FormItem label="产品线" prop="productId">
                        <Select v-model="formValidate.productId" placeholder="选择产品线">
                            <Option v-for="item in productData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="允许" prop="allow">
                        <Input v-model.trim="formValidate.allow" type="textarea" :autosize="{minRows: 2,maxRows: 5}"  placeholder="输入允许信息"></Input>
                    </FormItem>
                    <FormItem label="拒绝" prop="deny">
                        <Input v-model.trim="formValidate.deny" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="输入拒绝信息"></Input>
                    </FormItem>
                </Form>
                <div slot="footer">
                    <Button type="ghost" @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>
                    <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
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
                apiService: 'acl',
                productData: [],
                productId: '',
                // 删除数据
                delId: '',
                delIndex: '',
                // 编辑数据
                formView: false,
                id: '',
                optionType: '',
                optionTypeName: '',
                cColumns: [
                    {
                        title: 'ACL名',
                        key: 'name',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', [
                                h('Tooltip', {
                                    props: {
                                        content: params.row.id,
                                        transfer: true,
                                        placement: 'top-start'
                                    }
                                }, params.row.name)
                            ]);
                        }
                    },
                    {
                        title: '描述',
                        key: 'description',
                        sortable: true
                    },
                    {
                        title: '允许',
                        key: 'allow',
                        sortable: true,
                        render: (h, params) => {
                            return h('Poptip', {
                                props: {
                                    trigger: 'hover',
                                    title: '允许列表',
                                    placement: 'bottom'
                                }
                            }, [
                                h('Tag', params.row.allow.length),
                                h('div', {
                                    slot: 'content'
                                }, [
                                    h('ul', params.row.allow.map(item => {
                                        return h('li', {
                                            style: {
                                                textAlign: 'left',
                                                padding: '0px'
                                            }
                                        }, item);
                                    }))
                                ])
                            ]);
                        }
                    },
                    {
                        title: '拒绝',
                        key: 'deny',
                        sortable: true,
                        render: (h, params) => {
                            return h('Poptip', {
                                props: {
                                    trigger: 'hover',
                                    title: '拒绝列表',
                                    placement: 'bottom'
                                }
                            }, [
                                h('Tag', params.row.deny.length),
                                h('div', {
                                    slot: 'content'
                                }, [
                                    h('ul', params.row.deny.map(item => {
                                        return h('li', {
                                            style: {
                                                textAlign: 'left',
                                                padding: '0px'
                                            }
                                        }, item);
                                    }))
                                ])
                            ]);
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
                                            this.handleReset('formValidate');
                                            this.optionType = 'edit';
                                            this.optionTypeName = '编辑';
                                            this.id = params.row.id;
                                            this.formValidate.name = params.row.name;
                                            this.formValidate.description = params.row.description;
                                            this.formValidate.productId = params.row.product_id;
                                            this.formValidate.allow = params.row.allow.join('\n');
                                            this.formValidate.deny = params.row.deny.join('\n');
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
                                            size: 'small'
                                        }
                                    }, '删除')
                                ])
                            ]);
                        }
                    }
                ],
                // 表单验证
                formValidate: {
                    name: '',
                    description: '',
                    productId: '',
                    allow: '',
                    deny: ''
                },
                ruleValidate: {
                    name: [
                        { required: true, message: 'ACL名不能为空', trigger: 'blur' }
                    ],
                    description: [
                        { required: true, message: '描述不能为空', trigger: 'blur' }
                    ],
                    productId: [
                        { required: true, message: '产品线不能为空', trigger: 'change' }
                    ]
                }
            };
        },
        methods: {
            getProductEvent: function (productData, productId) {
                this.productData = productData;
                this.productId = productId;
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
            }
        }
    };
</script>