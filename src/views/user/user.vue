<style lang="less">
    @import '../../styles/common.less';
    @import '../common-components/table/table.less';
</style>

<template>
    <div>
        <Row class="margin-top-10">
            <Col span="24">
                <Card>
                    <Row :gutter="10">
                        <div style="float: right;">
                            <Button type="primary" @click="add('formValidate')">创建用户</Button>
                            <Button type="primary" @click="refresh()">刷新</Button>
                          </div>
                    </Row>
                    <Row>
                        <hr class="hr-margin" color="#e3e8ee" size="0.5">
                    </Row>
                    <Row :gutter="10">
                        <div style="float: right;">
                            <Input v-model.trim="nSearchVal" @on-change="search">
                                <Button slot="append" icon="ios-search"></Button>
                            </Input>
                        </div>
                        <div style="margin-bottom: -10px;">
                            <Button type="primary" @click="exportData(1)">导出数据</Button>
                            <Poptip placement="bottom-start">
                                <Button type="primary">自定义列</Button>
                                <div slot="content">
                                  <ul>
                                    <li v-for="(c, i) in nColumns" v-if="i > 0" :key="i">
                                      <Checkbox :value="nColumnsExcept.indexOf(c.key) === -1" @on-change="columnsExcept(c.key)">{{ c.title }}</Checkbox>
                                    </li>
                                  </ul>
                                </div>
                            </Poptip>
                            <Dropdown>
                                <Button type="primary">
                                    显示条数
                                    <Icon type="arrow-down-b"></Icon>
                                </Button>
                                <DropdownMenu slot="list">
                                    <DropdownItem>
                                        <div @click="customPage(5)">5</div>
                                    </DropdownItem>
                                    <DropdownItem>
                                        <div @click="customPage(10)">10</div>
                                    </DropdownItem>
                                    <DropdownItem>
                                        <div @click="customPage(50)">50</div>
                                    </DropdownItem>
                                    <DropdownItem>
                                        <div @click="customPage(100)">100</div>
                                    </DropdownItem>
                                    <DropdownItem divided>
                                        <div @click="customPage(pageCount)">全部</div>
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                        <br>
                        <Table :border="showBorder" :loading="loading" :data="tableData" :columns="filterColumns"  stripe ref="table"></Table>
                        <div style="margin:10px 0px 10px 10px;overflow: hidden">
                            <div style="float: right;">
                                <Page :total="pageCount" :current="pageCurrent" :page-size="pageSize" show-total show-elevator @on-change="changePage"></Page>
                            </div>
                        </div>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Modal v-model="formView" :title="optionTypeName">
            <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                <FormItem label="用户名" prop="name">
                    <Input v-model="formValidate.name" placeholder="输入用户名"></Input>
                </FormItem>
                <FormItem label="产品线" prop="product">
                    <CheckboxGroup v-model="formValidate.product">
                        <Checkbox v-for="item in userInfo.product" :key="item.id" :label="item.name" @click="groupList(item.id)"></Checkbox>
                    </CheckboxGroup>
                </FormItem>
                <FormItem label="组">
                    <CheckboxGroup v-model="formValidate.groups">
                         <Checkbox v-for="item in userInfo.groups" :key="item.id" :label="item.name"></Checkbox>
                    </CheckboxGroup>
                </FormItem>
                <FormItem label="角色">
                    <CheckboxGroup v-model="formValidate.role">
                        <Checkbox v-for="item in userInfo.role" :key="item.id" :label="item.name"></Checkbox>
                    </CheckboxGroup>
                </FormItem>
                <FormItem label="ACL">
                    <CheckboxGroup v-model="formValidate.acl">
                        <Checkbox v-for="item in userInfo.acl" :key="item.id" :label="item.name"></Checkbox>
                    </CheckboxGroup>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="ghost" @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>
                <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    function nCopy (data) {
        return JSON.parse(JSON.stringify(data));
    };
    function sortString (key, order) {
        return function (a, b) {
            var v1 = a[key];
            var v2 = b[key];
            if (order === 'desc') {
                return v1 < v2 ? 1 : -1;
            } else {
                return v1 > v2 ? 1 : -1;
            }
        };
    };
    export default {
        data () {
            return {
                nLocalColExcept: [],
                productData: this.productList(),
                tableData: this.tableList(),
                pageSize: 10,
                pageCurrent: 1,
                pageCount: this.pageCount,
                nSearchVal: '',
                showBorder: true,
                loading: true,
                // 删除数据
                delModal: false,
                delId: '',
                delIndex: '',
                delName: '',
                // 编辑数据
                formView: false,
                id: '',
                optionType: '',
                optionTypeName: '',
                nData: [],
                userInfo: {
                    product: [],
                    groups: [],
                    role: this.roleList(),
                    alc: this.alcList()
                },
                nColumns: [
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
                            return h('div', params.row.product.map(item => { return item.name; }));
                        }
                    },
                    {
                        title: '角色',
                        key: 'role',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', params.row.role.map(item => { return item.name; }));
                        }
                    },
                    {
                        title: 'ACL',
                        key: 'acl',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', params.row.acl.map(item => { return item.name + ','; }));
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
                                    h('ul', this.tableData[params.index].groups.map(item => {
                                        return h('li', {
                                            style: {
                                                textAlign: 'center',
                                                padding: '4px'
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
                                            this.formValidate = params.row;
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
                    name: '',
                    product: [],
                    groups: [],
                    role: [],
                    alc: []
                },
                ruleValidate: {
                    name: [
                        { required: true, message: '用户名不能为空', trigger: 'blur' }
                    ],
                    product: [
                        { required: true, type: 'array', min: 1, message: '至少选择一项', trigger: 'change' }
                    ]
                }
            };
        },
        computed: {
            nColumnsExcept () {
                return this.nColExcept || this.nLocalColExcept;
            },
            // 过滤列
            filterColumns () {
                return this.nColumns.filter(x => {
                    return this.nColumnsExcept.indexOf(x.key) === -1;
                });
            }
        },
        methods: {
            // 更改显示条数
            customPage (num) {
                this.pageSize = num;
                let list = [];
                list = nCopy(this.nData);
                list.splice(this.pageSize, this.pageCount);
                this.tableData = list;
                // 初始化到第一页
                this.pageCurrent = 1;
            },
            tableList () {
                this.axios.get(this.Global.serverSrc + 'user').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.tableData = res.data['data'];
                            this.pageCount = this.tableData.length;
                            this.nData = nCopy(this.tableData);
                            this.tableData.splice(this.pageSize, this.pageCount);
                        } else {
                            this.nerror('Get User Failure', res.data['message']);
                        };
                        this.loading = false;
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nerror('Get User Failure', errInfo);
                        this.loading = false;
                    });
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
            alcList (productId) {
                this.axios.get(this.Global.serverSrc + 'acl?product_id=' + productId).then(
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
                        this.nerror('Get ALC Failure', errInfo);
                    });
            },
            groupList (productId) {
                this.axios.get(this.Global.serverSrc + 'groups?product_id=' + productId).then(
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
            // 重新定义错误消息
            nerror (title, info) {
                this.$Notice.error({
                    title: title,
                    desc: info,
                    duration: 10
                });
            },
            // 刷新表格数据
            refresh () {
                this.loading = true;
                this.tableList();
            },
            columnsExcept (key) {
                let index = this.nColumnsExcept.indexOf(key);
                if (index === -1) {
                    this.nColumnsExcept.push(key);
                } else {
                    this.nColumnsExcept.splice(index, 1);
                }
            },
            changePage (page) {
                let list = [];
                list = nCopy(this.nData);
                this.pageCurrent = page;
                this.tableData = list.splice((page - 1) * this.pageSize, this.pageSize);
            },
            add (name) {
                this.$refs[name].resetFields();
                this.optionType = 'add';
                this.optionTypeName = '添加';
                this.formView = true;
            },
            // 删除数据
            del () {
                this.axios.delete(this.Global.serverSrc + 'user/' + this.delId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.tableData.splice(this.delIndex, 1);
                            this.$Message.success('删除成功！');
                            this.tableList();
                        } else {
                            this.nerror('Delete Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nerror('Delete Failure', errInfo);
                    });
            },
            // 导出表格数据
            exportData (type) {
                if (type === 1) {
                    this.$refs.table.exportCsv({
                        filename: 'The original data',
                        data: this.nData
                    });
                } else if (type === 2) {
                    this.$refs.table.exportCsv({
                        filename: 'Sorting and filtering data',
                        original: false
                    });
                } else if (type === 3) {
                    this.$refs.table.exportCsv({
                        filename: 'Custom data',
                        columns: this.nColumns.filter((col, index) => index < 4),
                        data: this.tableData.filter((data, index) => index < 4)
                    });
                }
            },
            search () {
                this.pageCurrent = 1;
                this.getPageData();
            },
            // 表单提交及重置
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        // 编辑
                        if (this.optionType === 'edit') {
                            this.axios.put(this.Global.serverSrc + 'user/' + this.id,
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
                            this.axios.post(this.Global.serverSrc + 'user',
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
            handleReset (name) {
                this.$refs[name].resetFields();
            }
        }
    };
</script>
<style scoped>
.hr-margin{
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>