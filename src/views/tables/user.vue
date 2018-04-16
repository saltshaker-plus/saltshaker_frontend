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
                        <Select style="width:200px">
                            <Option v-for="item in productData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                        </Select>
                        <div style="float: right;" >
                            <Button type="primary" >创建用户</Button>
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
                        </div>
                        <!--
                        <Button type="primary" size="large" @click="exportData(2)"><Icon type="ios-download-outline"></Icon> Export sorting and filtered data</Button>
                        <Button type="primary" size="large" @click="exportData(3)"><Icon type="ios-download-outline"></Icon> Export custom data</Button>
                        -->
                        <br>
                        <Table :border="showBorder" :loading="loading" :data="tableData" :columns="filterColumns"  stripe ref="table"></Table>
                        <div style="margin:10px 0px 10px 10px;overflow: hidden">
                            <div style="float: right;">
                                <Page :total="pageCount" :current="pageCurrent" :page-size="pageSize" show-total show-elevator @on-change="changePage"></Page>
                                <!--<Page :total="nFilterData.length" :current="nPage.current" :page-size="nPage.size" @on-change="changePage" show-total ></Page>-->
                            </div>
                        </div>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Modal
            v-model="delModal"
            title="删除确认"
            width=300>
            <p style="text-align:center">确认删除 <b>{{delName}}</b> 吗？</p>
            <div slot="footer">
                <Button type="error" size="large" long @click="del">删除</Button>
            </div>
        </Modal>
        <Modal v-model="formView" title="编辑">
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
                loading: false,
                // 删除数据
                delModal: false,
                delId: '',
                delIndex: '',
                delName: '',
                // 编辑数据
                formView: false,
                userInfo: {
                    product: [],
                    groups: [],
                    role: this.roleList(),
                    alc: this.alcList()
                },
                nColumns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
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
                        width: 170,
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
                                            this.show(params.index);
                                        }
                                    }
                                }, '详情'),
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
                                            this.delId = params.row.id;
                                            this.delIndex = params.index;
                                            this.delName = params.row.username;
                                        }
                                    }
                                }, '编辑'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.delModal = true;
                                            this.delId = params.row.id;
                                            this.delIndex = params.index;
                                            this.delName = params.row.username;
                                        }
                                    }
                                }, '删除')
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
        props: {
            nSelected: {
                type: Array
            },
            nColExcept: {
                type: Array
            },
            nData: {
                type: Array,
                require: true
            }
        },
        watch: {
            nData () {
                this.nInit();
            }
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
            tableList () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get(this.Global.serverSrc + 'user').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.pageCount = res.data['data'].length;
                            this.tableData = res.data['data'];
                        } else {
                            this.nerror('Get User Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Get User Failure', err.response.data['message']); });
            },
            productList () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            this.userInfo.product = res.data['data'];
                        } else {
                            this.nerror('Get User Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Get Product Failure', err.response.data['message']); });
            },
            roleList () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get(this.Global.serverSrc + 'role').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.userInfo.role = res.data['data'];
                        } else {
                            this.nerror('Get User Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Get Role Failure', err.response.data['message']); });
            },
            alcList () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get(this.Global.serverSrc + 'acl').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.userInfo.acl = res.data['data'];
                        } else {
                            this.nerror('Get User Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Get ACL Failure', err.response.data['message']); });
            },
            groupList (productId) {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get(this.Global.serverSrc + 'groups?product_id=' + productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.userInfo.groups = res.data['data'];
                        } else {
                            this.nerror('Get User Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Get Group Failure', err.response.data['message']); });
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
                let list = []
                list = this.tableData.splice(0, this.pageCount);
                this.tableData = list.splice((page - 1) * this.pageSize, this.pageSize);
            },
            // 显示行信息
            show (index) {
                this.$Modal.info({
                    title: 'User Info',
                    content: `Username：${this.tableData[index].username}<br>
                              Product：${this.tableData[index].product.map(item => { return item.name; })}<br>
                              Role：${this.tableData[index].role.map(item => { return item.name; })}<br>
                              ACL：${this.tableData[index].acl.map(item => { return item.name; })}<br>
                              Groups：${this.tableData[index].groups.map(item => { return item.name; })}`
                });
            },
            // 删除数据
            del () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.delete(this.Global.serverSrc + 'user/' + this.delId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.tableData.splice(this.delIndex, 1);
                            this.$Message.success('删除成功！');
                        } else {
                            this.nerror('Delete Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Delete Failure', err); });
                this.delModal = false;
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
            nInit () {
                if (this.selectFlag()) {
                    this.nColumns.unshift({
                        title: '',
                        key: 'checked',
                        width: 60,
                        render: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    value: this.nSelected.indexOf(params.row.index) >= 0
                                },
                                on: {
                                    'on-change': (value) => {
                                        if (value) {
                                            this.nSelected.push(params.row.index);
                                        } else {
                                            let i = this.nSelected.indexOf(params.row.index);
                                            if (i >= 0) {
                                                this.nSelected.splice(i, 1);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
                this.pageCurrent = 1;
                this.getPageData();
            },
            selectFlag () {
                if (this.nSelected) {
                    for (let v of this.nColumns) {
                        if (v.key === 'checked') {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            },
            search () {
                this.pageCurrent = 1;
                this.getPageData();
            },
            getFilterData () {
                let searchVal = this.nSearchVal;
                let data = nCopy(this.tableData);
                if (this.nSortData) {
                    let key = this.nSortData.key;
                    let order = this.nSortData.order;
                    if (this.nSortData.order === 'normal') {
                        this.nSortData = null;
                    } else {
                        let func = sortString(key, order);
                        data.sort(func);
                    }
                }
                if (this.nSearchVal) {
                    let ret = [];
                    data.map(x => {
                        for (let i in this.nColumns) {
                            let key = this.nColumns[i].key;
                            if (x[key] && (x[key] + '').indexOf(searchVal) >= 0) {
                                ret.push(x);
                                break;
                            }
                        }
                    });
                    return ret;
                }
                return data;
            },
            getPageData () {
                this.tableData = this.getFilterData();
                let data = this.tableData;
                this.tableData = data.splice((this.pageCurrent - 1) * this.pageSize, this.pageSize);
            },
            // 表单提交及重置
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.$Message.success('成功！');
                    } else {
                        this.$Message.error('请检查表单数据！');
                    }
                });
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            }
        },
        created () {
            this.tableList();
            this.nInit();
        }
    };
</script>
<style scoped>
.hr-margin{
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>