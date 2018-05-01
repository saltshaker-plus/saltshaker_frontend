<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" :productShow="false" ref="childrenMethods">
            <Button slot="create" type="primary" @click="add('formValidate')">创建用户</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                    <FormItem label="用户名" prop="username">
                        <Input v-model="formValidate.username" placeholder="输入用户名"></Input>
                    </FormItem>
                    <FormItem label="密码" prop="password">
                        <Input  type="password"　v-model="formValidate.password" placeholder="密码"></Input>
                    </FormItem>
                    <FormItem label="产品线" prop="product">
                        <CheckboxGroup v-model="formValidate.product" @on-change="handleSelect">
                            <Checkbox v-for="item in userInfo.product" :key="item.id" :label="item.id">{{item.name}}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem label="组" prop="groups">
                        <CheckboxGroup v-model="formValidate.groups">
                             <Checkbox v-for="item in userInfo.groups" :key="item.id" :label="item.id">{{item.name}}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem label="角色" prop="role">
                        <CheckboxGroup v-model="formValidate.role">
                            <Checkbox v-for="item in userInfo.role" :key="item.id" :label="item.id">{{item.name}}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem label="ACL" prop="acl">
                        <CheckboxGroup v-model="formValidate.acl">
                            <Checkbox v-for="item in userInfo.acl" :key="item.id" :label="item.id">{{item.name}}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                </Form>
                <div slot="footer">
                    {{formValidate.product}}
                    {{formValidate.groups}}
                    {{formValidate.acl}}
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
                apiService: 'user',
                // 删除数据
                delId: '',
                delIndex: '',
                // 编辑数据
                formView: false,
                id: '',
                optionType: '',
                optionTypeName: '',
                readonly: true,
                productId: [],
                userInfo: {
                    product: this.productList(),
                    groups: [],
                    role: this.roleList(),
                    acl: []
                },
                userInfoAll: {
                    groups: [],
                    acl: []
                },
                cColumns: [
                    {
                        title: '用户',
                        key: 'username',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', [
                                h('Tooltip', {
                                    props: {
                                        content: params.row.id,
                                        transfer: true,
                                        placement: 'top-start'
                                    }
                                }, params.row.username)
                            ]);
                        }
                    },
                    {
                        title: '产品线',
                        key: 'product',
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.product.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item.name);
                            })
                            );
                        }
                    },
                    {
                        title: '角色',
                        key: 'role',
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.role.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item.name);
                            })
                            );
                        }
                    },
                    {
                        title: 'ACL',
                        key: 'acl',
                        sortable: true,
                        render: (h, params) => {
                            return h('Poptip', {
                                props: {
                                    trigger: 'hover',
                                    placement: 'bottom'
                                }
                            }, [
                                h('Tag', params.row.acl.length),
                                h('div', {
                                    slot: 'content'
                                }, [
                                    h('ul', params.row.acl.map(item => {
                                        return h('li', {
                                            style: {
                                                textAlign: 'center',
                                                padding: '0px'
                                            }
                                        }, item.name);
                                    }))
                                ])
                            ]);
                        }
                    },
                    {
                        title: '组',
                        key: 'groups',
                        sortable: true,
                        render: (h, params) => {
                            return h('Poptip', {
                                props: {
                                    trigger: 'hover',
                                    placement: 'bottom'
                                }
                            }, [
                                h('Tag', params.row.groups.length),
                                h('div', {
                                    slot: 'content'
                                }, [
                                    h('ul', params.row.groups.map(item => {
                                        return h('li', {
                                            style: {
                                                textAlign: 'center',
                                                padding: '0px'
                                            }
                                        }, item.name);
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
                                            this.optionType = 'edit';
                                            this.optionTypeName = '编辑';
                                            this.id = params.row.id;
                                            this.formValidate.username = params.row.username;
                                            this.formValidate.product = params.row.product.map(item => { return item.id; });
                                            this.formValidate.groups = params.row.groups.map(item => { return item.id; });
                                            this.formValidate.role = params.row.role.map(item => { return item.id; });
                                            this.formValidate.acl = params.row.acl.map(item => { return item.id; });
                                        }
                                    }
                                }, '编辑'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要删除 ' + params.row.username + ' 吗?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delModal = true;
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
                    username: '',
                    password: '',
                    product: [],
                    groups: [],
                    role: [],
                    acl: []
                },
                ruleValidate: {
                    username: [
                        { required: true, message: '用户名不能为空', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '密码不能为空', trigger: 'blur' }
                    ],
                    product: [
                        { required: true, type: 'array', min: 1, message: '至少选择一项', trigger: 'change' }
                    ]
                }
            };
        },
        methods: {
            // 调用子组件进行删除
            del () {
                this.$refs.childrenMethods.del(this.delId);
            },
            // 调用子组件进行数据刷新
            tableList () {
                this.$refs.childrenMethods.tableList();
            },
            // 调用子组件消息通知
            nerror (title, info) {
                this.$refs.childrenMethods.nerror(title, info);
            },
            // 添加展示
            add (name) {
                this.handleReset(name);
                this.optionType = 'add';
                this.optionTypeName = '添加';
                this.formView = true;
                this.userInfo.groups = [];
                this.userInfo.acl = [];
            },
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            this.userInfo.product = res.data['data'];
                        } else {
                            this.nerror('Get User Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nerror('Get Product Failure', errInfo);
                    });
            },
            roleList () {
                this.axios.get(this.Global.serverSrc + 'role').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.userInfo.role = res.data['data'];
                        } else {
                            this.nerror('Get Role Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nerror('Get Role Failure', errInfo);
                    });
            },
            aclList () {
                this.axios.get(this.Global.serverSrc + 'acl?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.userInfo.acl = res.data['data'];
                        } else {
                            this.nerror('Get ACL Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nerror('Get ACL Failure', errInfo);
                    });
            },
            groupList () {
                this.axios.get(this.Global.serverSrc + 'groups?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.userInfo.groups = res.data['data'];
                        } else {
                            this.nerror('Get Group Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nerror('Get Group Failure', errInfo);
                    });
            },
            // 表单提
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        // 编辑
                        if (this.optionType === 'edit') {
                            this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id,
                                this.formValidate).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nerror('Edit Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nerror('Edit Failure', errInfo);
                                });
                        } else {
                            // 添加
                            this.axios.post(this.Global.serverSrc + this.apiService,
                                this.formValidate).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nerror('Add Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nerror('Add Failure', errInfo);
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
            handleSelect (product) {
                //this.formValidate.groups =
                this.productId = product[0];
                this.groupList();
                this.aclList();
                //this.userInfoAll.groups = [];
//                for (var i = 0; i < product.length; i++) {
//                    this.productId = product[i];
//                    this.groupList();
//                    console.log(this.userInfo.groups)
//                    this.userInfoAll.groups = this.userInfo.groups
//                }
            }
        }
    };
</script>