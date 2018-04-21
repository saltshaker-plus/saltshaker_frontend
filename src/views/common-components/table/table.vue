<style lang="less">
    @import '../../../styles/common.less';
    @import '../../common-components/table/table.less';
</style>

<template>
    <div>
        <Row class="margin-top-10">
            <Col span="24">
                <Card>
                    <Row :gutter="10">
                        <Select style="width:200px" v-model="productId" v-show="productShow">
                            <Option v-for="item in productData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                        </Select>
                        <div style="float: right;" >
                            <slot name="create"></slot>
                            <slot name="downMenu"></slot>
                            <Button type="primary" @click="refresh()">刷新</Button>
                        </div>
                    </Row>
                    <Row>
                        <hr class="hr-margin" color="#e3e8ee" size="0.5">
                    </Row>
                    <Row :gutter="10">
                        <div style="float: right;">
                            <Input v-model.trim="nSearchVal" @on-change="handleSearch">
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
                        <div style="margin:10px 0px 10px 0px;overflow: hidden">
                            <slot name="selectAll"></slot>
                            <slot name="notSelectAll"></slot>
                            <slot name="accept"></slot>
                            <slot name="reject"></slot>
                            <slot name="delete"></slot>
                            <div style="float: right;">
                                <Page :total="pageCount" :current="pageCurrent" :page-size="pageSize" show-total show-elevator @on-change="changePage"></Page>
                            </div>
                        </div>
                    </Row>
                    <slot name="option"></slot>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
    function nCopy (data) {
        return JSON.parse(JSON.stringify(data));
    };
    export default {
        name: 'CommonTable',
        data () {
            return {
                nLocalColExcept: [],
                tableData: [],
                productData: this.productList(),
                productId: '',
                pageSize: 10,
                pageCurrent: 1,
                pageCount: this.pageCount,
                // 搜索
                nSearchVal: '',
                searchDate: [],
                showBorder: true,
                loading: true,
                nData: [],
                nColumns: this.cColumns
            };
        },
        props: {
            cColumns: {
                type: Array,
                required: true
            },
            apiService: {
                type: String,
                required: true
            },
            productShow: {
                type: Boolean
            }
        },
        watch: {
            // 监控产品线变化
            productId () {
                this.loading = true;
                this.pageCurrent = 1;
                this.pageSize = 10;
                this.tableList();
                // 产品线变化后传递产品线信息给父组件
                this.getProduct();
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
                this.axios.get(this.Global.serverSrc + this.apiService + '?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.tableData = res.data['data'];
                            this.pageCount = this.tableData.length;
                            this.nData = nCopy(this.tableData);
                            this.tableData.splice(this.pageSize, this.pageCount);
                            this.pageCurrent = 1;
                        } else {
                            this.nerror('Get Info Failure', res.data['message']);
                        };
                        this.loading = false;
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                            if (err.response.status === 404) {
                                this.tableData = [];
                            } else {
                                this.nerror('Get Info Failure', errInfo);
                            }
                        } catch (error) {
                            errInfo = err;
                            this.nerror('Get Info Failure', errInfo);
                        }
                        this.loading = false;
                    });
            },
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
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
                    // 替换<>避免被解析为html标签
                    desc: info.replace(/<|>/g, ''),
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
            search (data, argumentObj) {
                let res = data;
                let dataClone = data;
                for (let argu in argumentObj) {
                    if (argumentObj[argu].length > 0) {
                        res = dataClone.filter(d => {
                            return d[argu].indexOf(argumentObj[argu]) > -1;
                        });
                        dataClone = res;
                    }
                }
                return res;
            },
            handleSearch () {
                let tmpSearch = [];
                console.log(this.nData.length)
                tmpSearch = this.search(this.nData, {user: this.nSearchVal});
                if (this.nSearchVal !== null) {
                    this.searchDate = nCopy(tmpSearch);
                    this.pageCount = tmpSearch.length;
                    this.pageCurrent = 1;
                    tmpSearch.splice(this.pageSize, this.pageCount);
                    this.tableData = tmpSearch;
                }
            },
            // 删除数据
            del (id) {
                this.axios.delete(this.Global.serverSrc + this.apiService + '/' + id).then(
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
            // kill jid
            kill (id, minion) {
                let postData = {
                    'minion': minion
                };
                this.axios.post(this.Global.serverSrc + this.apiService + '?action=kill&jid=' + id + '&product_id=' + this.productId, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.tableData.splice(this.delIndex, 1);
                            this.$Message.success('Kill成功！');
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
            // 传递给父组件
            getProduct () {
                this.$emit('getProductEvent', this.productData, this.productId);
            },
            handleSelectAll (status) {
                this.$refs.selection.selectAll(status);
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