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
                        <Select style="width:200px" v-model="productId">
                            <Option v-for="item in productData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                        </Select>
                        <div style="float: right;" >
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
                tableData: [],
                productData: this.productList(),
                productId: '',
                pageSize: 10,
                pageCurrent: 1,
                pageCount: this.pageCount,
                nSearchVal: '',
                showBorder: true,
                loading: true,
                nColumns: [
                    {
                        title: '用户',
                        key: 'user',
                        sortable: true
                    },
                    {
                        title: '产品线',
                        key: 'product_id',
                        sortable: true
                    },
                    {
                        title: 'ID',
                        key: 'id',
                        sortable: true
                    },
                    {
                        title: '操作对象',
                        key: 'action_object',
                        sortable: true
                    },
                    {
                        title: '操作类型',
                        key: 'action_type',
                        sortable: true
                    },
                    {
                        title: '时间',
                        key: 'time',
                        sortable: true
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
        watch: {
            nData () {
                this.nInit();
            },
            // 监控产品线变化
            productId () {
                this.loading = true;
                this.tableList();
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
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/log?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.pageCount = res.data['audit_logs']['audit_log'].length;
                            this.tableData = res.data['audit_logs']['audit_log'];
                        } else {
                            this.nerror('Get Failure', res.data['message']);
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
                        this.nerror('Get Log Failure', errInfo);
                        this.loading = false;
                    });
            },
            productList () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['products']['product'];
                            this.productId = this.productData[0].id;
                        } else {
                            this.nerror('Get Product Failure', res.data['message']);
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