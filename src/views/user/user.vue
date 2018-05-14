<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" :productShow="false" ref="childrenMethods">
            <Button slot="create" type="primary" @click="add('formValidate')">创建用户</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName" width="650px">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                    <FormItem label="用户名" prop="username">
                        <Input v-model="formValidate.username" placeholder="输入用户名"></Input>
                    </FormItem>
                    <FormItem label="邮箱" prop="mail">
                        <Input v-model="formValidate.mail" placeholder="输入你的邮箱"></Input>
                    </FormItem>
                    <FormItem label="角色" prop="role">
                        <CheckboxGroup v-model="formValidate.role">
                            <Checkbox v-for="item in userInfo.role" :key="item.id" :label="item.id">{{item.name}}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem label="产品线" prop="product">
                        <CheckboxGroup v-model="formValidate.product">
                            <Checkbox v-for="item in userInfo.product" :key="item.id" :label="item.id" @click.prevent.native="handleCheckProduct(item.id)">{{item.name}}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem label="组" prop="groups">
                        <Transfer
                            :data="originGroup"
                            :target-keys="targetGroup"
                            :list-style="listStyleGroup"
                            :render-format="rendersGroup"
                            :titles = "titlesGroup"
                            filterable
                            @on-change="handleChangeGroup">
                        </Transfer>
                    </FormItem>
                    <FormItem label="ACL" prop="acl">
                        <Transfer
                            :data="originACL"
                            :target-keys="targetACL"
                            :list-style="listStyleACL"
                            :render-format="rendersACL"
                            :titles = "titlesACL"
                            filterable
                            @on-change="handleChangeACL">
                        </Transfer>
                        <CheckboxGroup v-model="formValidate.acl">
                            <Checkbox v-for="item in userInfo.acl" :key="item.id" :label="item.id">{{item.name}}</Checkbox>
                        </CheckboxGroup>
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
                        title: '邮箱',
                        key: 'mail',
                        sortable: true
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
                                            this.formValidate.mail = params.row.mail;
                                            this.originGroup = [];
                                            this.originACL = [];
                                            this.formValidate.product = params.row.product.map(item => {
                                                this.getOriginGroup(item.id);
                                                this.getOriginACL(item.id);
                                                return item.id;
                                            });
                                            this.formValidate.role = params.row.role.map(item => { return item.id; });
                                            this.targetGroup = params.row.groups.map(item => { return item.id; });
                                            this.targetACL = params.row.acl.map(item => { return item.id; });
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
                    mail: '',
                    product: []
                },
                ruleValidate: {
                    username: [
                        { required: true, message: '用户名不能为空', trigger: 'blur' }
                    ],
                    mail: [
                        { required: true, message: '邮箱不能为空', trigger: 'blur' },
                        { type: 'email', message: '无效的邮箱格式', trigger: 'blur' }
                    ],
                    product: [
                        { required: true, type: 'array', min: 1, message: '至少选择一项', trigger: 'change' }
                    ]
                },
                // 穿梭框
                originGroup: [],
                targetGroup: [],
                titlesGroup: ['待加分组', '当前分组'],
                listStyleGroup: {
                    width: '250px',
                    height: '200px'
                },
                originACL: [],
                targetACL: [],
                titlesACL: ['待加ACL', '当前ACL'],
                listStyleACL: {
                    width: '250px',
                    height: '200px'
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
            nError (title, info) {
                this.$refs.childrenMethods.nError(title, info);
            },
            // 添加展示
            add (name) {
                this.handleReset(name);
                this.optionType = 'add';
                this.optionTypeName = '添加';
                this.formView = true;
                this.originGroup = [];
                this.targetGroup = [];
                this.originACL = [];
                this.targetACL = [];
            },
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            this.userInfo.product = res.data['data'];
                        } else {
                            this.nError('Get User Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Get Product Failure', errInfo);
                    });
            },
            roleList () {
                this.axios.get(this.Global.serverSrc + 'role').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.userInfo.role = res.data['data'];
                        } else {
                            this.nError('Get Role Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Get Role Failure', errInfo);
                    });
            },
            // 表单提
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        // 编辑
                        let postData = {
                            username: this.formValidate.username,
                            mail: this.formValidate.mail,
                            product: this.formValidate.product,
                            role: this.formValidate.role,
                            groups: this.targetGroup,
                            acl: this.targetACL
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
            // 穿梭框获取对应产品线的组信息
            getOriginGroup (product) {
                this.axios.get(this.Global.serverSrc + 'groups?product_id=' + product).then(
                    res => {
                        if (res.data['status'] === true) {
                            for (var i = 0; i < res.data['data'].length; i++) {
                                this.originGroup.push({
                                    key: res.data['data'][i]['id'],
                                    label: res.data['data'][i]['name'],
                                    // 用于删除对应产品线的组
                                    product: product
                                });
                            }
                        } else {
                            this.nError('Get Info Failure', res.data['message']);
                        };
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                            if (err.response.status === 404) {
                                this.originGroup = [];
                            } else {
                                this.nError('Get Info Failure', errInfo);
                            }
                        } catch (error) {
                            errInfo = err;
                            this.nError('Get Info Failure', errInfo);
                        }
                    });
            },
            // 穿梭框获取对应产品线的ACL信息
            getOriginACL (product) {
                this.axios.get(this.Global.serverSrc + 'acl?product_id=' + product).then(
                    res => {
                        if (res.data['status'] === true) {
                            for (var i = 0; i < res.data['data'].length; i++) {
                                this.originACL.push({
                                    key: res.data['data'][i]['id'],
                                    label: res.data['data'][i]['name'],
                                    product: product
                                });
                            }
                        } else {
                            this.nError('Get ACL Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Get ACL Failure', errInfo);
                    });
            },
            // 处理穿梭框
            handleChangeGroup (newTargetGroup) {
                this.targetGroup = newTargetGroup;
            },
            rendersGroup (item) {
                return item.label;
            },
            handleChangeACL (newTargetACL) {
                this.targetACL = newTargetACL;
            },
            rendersACL (item) {
                return item.label;
            },
            // 选择不同产品线时候,对应的组 ACL 跟着变化
            handleCheckProduct (product) {
                // 去除勾选
                if (this.formValidate.product.includes(product)) {
                    this.formValidate.product.splice(this.formValidate.product.indexOf(product), 1);
                    // 组的操作
                    for (let i = this.originGroup.length - 1; i >= 0; i--) {
                        if (this.originGroup[i]['product'] === product) {
                            // 右边组删除
                            if (this.targetGroup.includes(this.originGroup[i]['key'])) {
                                this.targetGroup.splice(this.targetGroup.indexOf(this.originGroup[i]['key']), 1);
                            }
                            // 左边组删除
                            this.originGroup.splice(i, 1);
                        }
                    }
                    // ACL的操作
                    for (let i = this.originACL.length - 1; i >= 0; i--) {
                        if (this.originACL[i]['product'] === product) {
                            // 右边ACL删除
                            if (this.targetACL.includes(this.originACL[i]['key'])) {
                                this.targetACL.splice(this.targetACL.indexOf(this.originACL[i]['key']), 1);
                            }
                            // 左边ACL删除
                            this.originACL.splice(i, 1);
                        }
                    }
                } else {
                    this.formValidate.product.push(product);
                    this.getOriginGroup(product);
                    this.getOriginACL(product);
                }
            }
        }
    };
</script>