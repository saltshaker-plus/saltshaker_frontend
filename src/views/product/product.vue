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
                        <div style="float: right;" >
                            <Button type="primary" @click="add('formValidate')">创建产品</Button>
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
            <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="125">
                <FormItem label="产品线名" prop="name">
                    <Input v-model="formValidate.name" placeholder="输入用户名"></Input>
                </FormItem>
                <FormItem label="描述" prop="description">
                    <Input v-model="formValidate.description" placeholder="输入描述"></Input>
                </FormItem>
                <FormItem label="Master ID" prop="salt_master_id">
                    <Input v-model="formValidate.salt_master_id" placeholder="输入Master ID"></Input>
                </FormItem>
                <FormItem label="Master API 地址" prop="salt_master_url">
                    <Input v-model="formValidate.salt_master_url" placeholder="输入Master API 地址"></Input>
                </FormItem>
                <FormItem label="Master API 用户名" prop="salt_master_user">
                    <Input v-model="formValidate.salt_master_user" placeholder="输入Master API 用户名"></Input>
                </FormItem>
                <FormItem label="Master API 密码" prop="salt_master_password">
                    <Input v-model="formValidate.salt_master_password" placeholder="输入Master API 密码"></Input>
                </FormItem>
                <FormItem label="文件服务器">
                    <RadioGroup v-model="formValidate.file_server">
                        <Radio label="gitfs">GitLab</Radio>
                        <Radio label="rsync">Rsync</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem v-if="this.formValidate.file_server === 'gitfs'" label="GitLab 地址" prop="gitlab_url">
                    <Input v-model="formValidate.gitlab_url" placeholder="输入GitLab 地址"></Input>
                </FormItem>
                <FormItem v-if="this.formValidate.file_server === 'gitfs'" label="GitLab API 版本" prop="api_version">
                    <Input v-model="formValidate.api_version" placeholder="输入GitLab API 版本"></Input>
                </FormItem>
                <FormItem v-if="this.formValidate.file_server === 'gitfs'" label="GitLab Token" prop="private_token">
                    <Input v-model="formValidate.private_token" placeholder="输入GitLab Token"></Input>
                </FormItem>
                <FormItem v-if="this.formValidate.file_server === 'gitfs'" label="GitLab State 项目" prop="state_project">
                    <Input v-model="formValidate.state_project" placeholder="输入GitLab State 项目"></Input>
                </FormItem>
                <FormItem v-if="this.formValidate.file_server === 'gitfs'" label="GitLab Pillar 项目" prop="pillar_project">
                    <Input v-model="formValidate.pillar_project" placeholder="输入GitLab Pillar 项目"></Input>
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
                id: '',
                optionType: '',
                nColumns: [
                    {
                        title: '产品线',
                        key: 'name',
                        sortable: true
                    },
                    {
                        title: '描述',
                        key: 'description',
                        sortable: true
                    },
                    {
                        title: 'Master ID',
                        key: 'salt_master_id',
                        sortable: true
                    },
                    {
                        title: 'Master API 地址',
                        key: 'salt_master_url',
                        sortable: true
                    },
                    {
                        title: 'Master API 用户名',
                        key: 'salt_master_user',
                        sortable: true
                    },
                    {
                        title: '文件服务器',
                        key: 'file_server',
                        sortable: true
                    },
                    {
                        title: 'GitLab 地址',
                        key: 'gitlab_url',
                        sortable: true
                    },
                    {
                        title: 'GitLab API 版本',
                        key: 'api_version',
                        sortable: true
                    },
                    {
                        title: 'GitLab Token',
                        key: 'private_token',
                        sortable: true
                    },
                    {
                        title: 'GitLab State 项目',
                        key: 'state_project',
                        sortable: true
                    },
                    {
                        title: 'GitLab Pillar 项目',
                        key: 'pillar_project',
                        sortable: true
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
                                            this.id = params.row.id;
                                            this.formValidate = params.row;
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
                    description: '',
                    salt_master_id: '',
                    salt_master_url: '',
                    salt_master_user: '',
                    salt_master_password: '',
                    file_server: 'gitfs',
                    gitlab_url: '',
                    api_version: '',
                    private_token: '',
                    state_project: '',
                    pillar_project: '',
                    oauth_token: '',
                    http_password: '',
                    http_username: '',
                    password: '',
                    email: ''
                },
                ruleValidate: {
                    name: [
                        { required: true, message: '产品线名不能为空', trigger: 'blur' }
                    ],
                    description: [
                        { required: true, message: '描述不能为空', trigger: 'blur' }
                    ],
                    salt_master_id: [
                        { required: true, message: 'Master ID不能为空', trigger: 'blur' }
                    ],
                    salt_master_url: [
                        { required: true, message: 'Master API 地址不能为空', trigger: 'blur' }
                    ],
                    salt_master_user: [
                        { required: true, message: 'Master API 用户名不能为空', trigger: 'blur' }
                    ],
                    salt_master_password: [
                        { required: true, message: 'Master API 密码不能为空', trigger: 'blur' }
                    ],
                    gitlab_url: [
                        { required: true, message: 'GitLab 地址不能为空', trigger: 'blur' }
                    ],
                    api_version: [
                        { required: true, message: 'GitLab API 版本不能为空', trigger: 'blur' }
                    ],
                    private_token: [
                        { required: true, message: 'GitLab Token不能为空', trigger: 'blur' }
                    ],
                    state_project: [
                        { required: true, message: 'GitLab State 项目不能为空', trigger: 'blur' }
                    ],
                    pillar_project: [
                        { required: true, message: 'GitLab Pillar 项目不能为空', trigger: 'blur' }
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
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.pageCount = res.data['products']['product'].length;
                            this.tableData = res.data['products']['product'];
                        } else {
                            this.nerror('Get User Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Get User Failure', err.response.data['message']); });
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
                let list = [];
                list = this.tableData.splice(0, this.pageCount);
                this.tableData = list.splice((page - 1) * this.pageSize, this.pageSize);
            },
            // 删除数据
            del () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.delete('http://192.168.44.128:5000/saltshaker/api/v1.0/product/' + this.delId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.tableData.splice(this.delIndex, 1);
                            this.$Message.success('删除成功！');
                            this.tableList();
                        } else {
                            this.nerror('Delete Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Delete Failure', err); });
                this.delModal = false;
            },
            add (name) {
                this.$refs[name].resetFields();
                this.optionType = 'add';
                this.formView = true;
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
                        this.axios.defaults.withCredentials = true; // 带着cookie
                        if (this.formValidate.file_server === 'rsync') {
                            this.formValidate.gitlab_url = '';
                            this.formValidate.api_version = '';
                            this.formValidate.private_token = '';
                            this.formValidate.state_project = '';
                            this.formValidate.pillar_project = '';
                        };
                        // 编辑
                        if (this.optionType === 'edit') {
                            this.axios.put('http://192.168.44.128:5000/saltshaker/api/v1.0/product/' + this.id,
                                this.formValidate).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nerror('Edit User Failure', res.data['message']);
                                    }
                                },
                                err => { this.nerror('Edit User Failure', err.response.data['message']); });
                        } else {
                            // 添加
                            this.axios.post('http://192.168.44.128:5000/saltshaker/api/v1.0/product',
                                this.formValidate).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nerror('Add User Failure', res.data['message']);
                                    }
                                },
                                err => { this.nerror('Add User Failure', err.response.data['message']); });
                        }
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