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
                            <Button type="primary" @click="add('formValidate')">创建角色</Button>
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
                            </div>
                        </div>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Modal v-model="formView" title="编辑">
            <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                <FormItem label="角色名" prop="name">
                    <Input v-model="formValidate.name" placeholder="输入用户名"></Input>
                </FormItem>
                <FormItem label="描述" prop="description">
                    <Input v-model="formValidate.description" placeholder="输入描述"></Input>
                </FormItem>
                <FormItem label="标识" prop="tag">
                    <Input v-model="formValidate.tag" placeholder="输入标识"></Input>
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
                nColumns: [
                    {
                        title: '角色名',
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
                        title: '标识',
                        key: 'tag',
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
                    tag: ''
                },
                ruleValidate: {
                    name: [
                        { required: true, message: '角色名不能为空', trigger: 'blur' }
                    ],
                    description: [
                        { required: true, message: '描述不能为空', trigger: 'blur' }
                    ],
                    tag: [
                        { required: true, message: '标识不能为空', trigger: 'blur' }

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
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/role').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.pageCount = res.data['roles']['role'].length;
                            this.tableData = res.data['roles']['role'];
                        } else {
                            this.nerror('Get Role Failure', res.data['message']);
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
                        this.nerror('Get Role Failure', errInfo);
                        this.loading = false;
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
                list = this.tableData.splice(0, this.pageCount);
                this.tableData = list.splice((page - 1) * this.pageSize, this.pageSize);
            },
            // 删除数据
            del () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.delete('http://192.168.44.128:5000/saltshaker/api/v1.0/role/' + this.delId).then(
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
                        // 编辑
                        if (this.optionType === 'edit') {
                            this.axios.put('http://192.168.44.128:5000/saltshaker/api/v1.0/role/' + this.id,
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
                            this.axios.post('http://192.168.44.128:5000/saltshaker/api/v1.0/role',
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
        },
    };
</script>
<style scoped>
.hr-margin{
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>