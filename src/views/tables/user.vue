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
                        <div style="margin-bottom: -10px;">
                            <Button type="primary" @click="exportData(1)"><Icon type="ios-download-outline"></Icon> 导出原数据</Button>
                        </div>
                        <!--
                        <Button type="primary" size="large" @click="exportData(2)"><Icon type="ios-download-outline"></Icon> Export sorting and filtered data</Button>
                        <Button type="primary" size="large" @click="exportData(3)"><Icon type="ios-download-outline"></Icon> Export custom data</Button>
                        -->
                        <br>
                        <Table :border="showBorder" :loading="loading" :data="tableData1" :columns="tableColumns1" stripe ref="table"></Table>
                        <div style="margin:10px 0px 10px 10px;overflow: hidden">
                            <div style="float: right;">
                                <Page :total="20" :current="1" show-total show-elevator @on-change="changePage"></Page>
                            </div>
                        </div>
                    </Row>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                tableData1: this.mockTableData1(),
                showBorder: true,
                loading: false,
                tableColumns1: [
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
                        sortable: true
                    },
                    {
                        title: 'Role',
                        key: 'Role',
                        sortable: true
                    },
                    {
                        title: 'ACL',
                        key: 'acl',
                        sortable: true
                    },
                    {
                        title: 'Groups',
                        key: 'groups',
                        sortable: true
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
                                            this.show(params.index)
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
                                            this.remove(params.index)
                                        }
                                    }
                                }, 'Delete')
                            ]);
                        }
                    }
                ]
            }
        },
        methods: {
            mockTableData1 () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                let data = [];
                // let users;
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/user').then(res => {
                  let users = res.data['users']['user'];
//                  console.log(users);
//                  for (var i=0; i< users.length; i++){
//                    data.push(users[i])
//                  }
//                  return data
                  }, err => { console.log(err.data); });

                data.push({
                "id": "u-7a1eb74c33b911e8aa5f000c298454d8",
                "acl": [],
                "role": [
                    "r-9e3be2ca318f11e8ab56000c298454d8"
                ],
                "groups": "",
                "product": "",
                "username": "admin"
            },
            {
                "id": "u-3fb93c4a33bd11e8aa5f000c298454d8",
                "acl": [
                    "a-897e48cc31b811e8ab56000c298454d8"
                ],
                "role": [
                    "r-35d85a1a333311e8aa5f000c298454d8"
                ],
                "groups": [
                    "g-142120c8323411e8ab56000c298454d8",
                    "g-191b9cc0323411e8ab56000c298454d8"
                ],
                "product": "",
                "username": "jyp"
            })
                return data
            },
            formatDate (date) {
                const y = date.getFullYear();
                let m = date.getMonth() + 1;
                m = m < 10 ? '0' + m : m;
                let d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                return y + '-' + m + '-' + d;
            },
            changePage () {
                // The simulated data is changed directly here, and the actual usage scenario should fetch the data from the server
                this.tableData1 = this.mockTableData1();
            },
            show (index) {
                this.$Modal.info({
                    title: 'User Info',
                    content: `Name：${this.tableData1[index].name}<br>Portrayal：${this.tableData1[index].portrayal}<br>Sampling Time：${this.tableData1[index].time}<br>Updated Time：${this.tableData1[index].update}`
                })
            },
            remove (index) {
                this.tableData1.splice(index, 1);
            },
            exportData (type) {
                if (type === 1) {
                    this.$refs.table.exportCsv({
                        filename: 'The original data'
                    });
                } else if (type === 2) {
                    this.$refs.table.exportCsv({
                        filename: 'Sorting and filtering data',
                        original: false
                    });
                } else if (type === 3) {
                    this.$refs.table.exportCsv({
                        filename: 'Custom data',
                        columns: this.tableColumns1.filter((col, index) => index < 4),
                        data: this.tableData1.filter((data, index) => index < 4)
                    });
                }
            }
        }
    }
</script>
