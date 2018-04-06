<style lang="less">
    @import '../../styles/common.less';
    @import './components/table.less';
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
                                    <li v-for="(c, i) in tableColumns" v-if="i > 0" :key="i">
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
                        <Table :border="showBorder" :loading="loading" :data="tableData" :columns="tableColumns"  stripe ref="table"></Table>
                        <div style="margin:10px 0px 10px 10px;overflow: hidden">
                            <div style="float: right;">
                                <Page :total="pageCount" :current="pageCurrent" :page-size="pageSize" show-total show-elevator @on-change="changePage"></Page>
                            </div>
                        </div>
                    </Row>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
    export const nCopy = function (data) {
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
                tableColumns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: 'User',
                        key: 'username',
                        sortable: true
                    },
                    {
                        title: 'Product',
                        key: 'product',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', params.row.product.map(item => { return item.name; }));
                        }
                    },
                    {
                        title: 'Role',
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
                        title: 'Groups',
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
                        title: 'Action',
                        key: 'action',
                        width: 150,
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
                                }, 'View'),
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.remove(params.index, params.row.id);
                                        }
                                    }
                                }, 'Delete')
                            ]);
                        }
                    }
                ]
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
        computed: {
            nColumnsExcept () {
                return this.nColExcept || this.nLocalColExcept;
            }
        },
        watch: {
            nData () {
                this.nInit();
            },
            currentPage () {
                this.getPageData();
            },
            nSortData () {
                this.getPageData();
            }
        },
        methods: {
            tableList () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/user').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.tableData = res.data['users']['user'];
                            this.pageCount = res.data['users']['user'].length;
                        } else {
                            this.nerror('Get User Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Get User Failure', err); });
            },
            productList () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['products']['product'];
                        } else {
                            this.nerror('Get Product Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Get Product Failure', err); });
            },
            success (info) {
                this.$Message.success(info);
            },
            warning (info) {
                this.$Message.warning(info);
            },
            error (info) {
                this.$Message.error(info);
            },
            nsuccess (title, info) {
                this.$Notice.success({
                    title: title,
                    desc: info,
                    duration: 10
                });
            },
            nwarning (title, info) {
                this.$Notice.warning({
                    title: title,
                    desc: info,
                    duration: 10
                });
            },
            nerror (title, info) {
                this.$Notice.error({
                    title: title,
                    desc: info,
                    duration: 10
                });
            },
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
            changePage () {
                this.tableData = this.tableList();
            },
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
            remove (index, id) {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.delete('http://192.168.44.128:5000/saltshaker/api/v1.0/user/' + id).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.tableData.splice(index, 1);
                            this.success('Delete Success');
                        } else {
                            this.nerror('Delete Failure', res.data['message']);
                        }
                    },
                    err => { this.nerror('Delete Failure', err); });
            },
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
                        columns: this.tableColumns.filter((col, index) => index < 4),
                        data: this.tableData.filter((data, index) => index < 4)
                    });
                }
            },
            nInit () {
                if (this.selectFlag()) {
                    this.tableData.unshift({
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
                    for (let v of this.tableColumns) {
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
                console.log(searchVal)
                console.log(this.nData)
                let data = nCopy(this.nData);
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
                        for (let i in this.tableColumns) {
                            let key = this.tableColumns[i].key;
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
                let data = nCopy(this.tableData);
                this.tableData = data.splice((this.pageCurrent - 1) * this.pageSize, this.pageSize);
            }
        },
        created () {
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