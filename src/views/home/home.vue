<style lang="less">
    @import "./home.less";
    @import "../../styles/common.less";
</style>
<template>
    <div class="home-main">
        <Row :gutter="10">
            <Col :md="24" :lg="8">
                <Row class-name="home-page-row1" :gutter="10">
                    <Col :md="12" :lg="24" :style="{marginBottom: '10px'}">
                        <Card dis-hover>
                            <Row>
                                <Select v-model="productId">
                                    <Option v-for="item in productData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                                </Select>
                            </Row>
                        </Card>
                    </Col>
                    <Col :md="12" :lg="24" :style="{marginBottom: '10px'}">
                        <Card dis-hover>
                            <p slot="title" class="card-title">
                                <Icon type="android-map"></Icon>
                                Minion 状态
                            </p>
                            <div class="data-source-row">
                                <minion-status :productId="productId"></minion-status>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Col>
            <Col :md="24" :lg="16">
                <Row :gutter="5">
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="user_created_count"
                            :end-val="count.minion"
                            iconType="android-apps"
                            color="#2d8cf0"
                            intro-text="Minion总数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="visit_count"
                            :end-val="count.period"
                            iconType="ios-eye"
                            color="#64d572"
                            :iconSize="50"
                            intro-text="活跃Job总数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="collection_count"
                            :end-val="count.event"
                            iconType="upload"
                            color="#ffd572"
                            intro-text="事件总数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="transfer_count"
                            :end-val="count.log"
                            iconType="shuffle"
                            color="#f25e43"
                            intro-text="日志总数"
                        ></infor-card>
                    </Col>
                </Row>
                <Row>
                    <Card :padding="0" dis-hover>
                        <p slot="title" class="card-title">
                            <Icon type="ios-stopwatch-outline"></Icon>
                            周期 Job
                        </p>
                        <div class="map-con">
                            <Col span="24">
                                <job-data-table height="288" :productId="productId" :style-obj="{margin: '5px 0 0 0px'}"></job-data-table>
                            </Col>
                        </div>
                    </Card>
                </Row>
            </Col>
        </Row>
        <Row :gutter="10">
            <Col :md="12" :lg="7" :style="{marginBottom: '10px'}">
                <Card :padding="0" dis-hover>
                    <p slot="title" class="card-title">
                        <Icon type="android-map"></Icon>
                        服务状态
                    </p>
                    <div class="service-status">
                        <Col span="24">
                            <service-status height="333" :productId="productId" :style-obj="{margin: '5px 0 0 0px'}"></service-status>
                        </Col>
                    </div>
                </Card>
            </Col>
            <Col :md="12" :lg="17" :style="{marginBottom: '10px'}">
                <Card dis-hover>
                    <p slot="title" class="card-title">
                        <Icon type="ios-pulse-strong"></Icon>
                        Grains 信息统计
                        <Dropdown style="float: right;" placement="bottom-end">
                            <a href="javascript:void(0)">
                                {{itemName}}
                                <Icon type="arrow-down-b"></Icon>
                            </a>
                            <DropdownMenu slot="list">
                                <DropdownItem>
                                    <div @click="changedItem('os', '操作系统版本')">操作系统版本</div>
                                </DropdownItem>
                                <DropdownItem>
                                    <div @click="changedItem('saltversion', 'Salt Minion版本')">Salt Minion版本</div>
                                </DropdownItem>
                                <DropdownItem>
                                    <div @click="changedItem('kernelrelease', '内核')">内核</div>
                                </DropdownItem>
                                <DropdownItem>
                                    <div @click="changedItem('manufacturer', '服务器品牌')">服务器品牌</div>
                                </DropdownItem>
                                <DropdownItem>
                                    <div @click="changedItem('productname', '服务器型号')">服务器型号</div>
                                </DropdownItem>
                                <DropdownItem>
                                    <div @click="changedItem('num_cpus', 'CPU数')">CPU数</div>
                                </DropdownItem>
                                <DropdownItem>
                                    <div @click="changedItem('cpu_model', 'CPU类型')">CPU类型</div>
                                </DropdownItem>
                                <DropdownItem>
                                    <div @click="changedItem('mem_total', '内存大小')">内存大小</div>
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </p>
                    <div class="data-source-row">
                        <grains-pie height="305" :productId="productId" :item="item" :itemName="itemName"></grains-pie>
                    </div>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
import grainsPie from './components/grainsPie.vue';
import minionStatus from './components/minionStatus.vue';
import inforCard from './components/inforCard.vue';
import jobDataTable from './components/jobDataTable.vue';
import serviceStatus from './components/serviceStatus.vue';

export default {
    name: 'home',
    components: {
        grainsPie,
        minionStatus,
        inforCard,
        jobDataTable,
        serviceStatus
    },
    data () {
        return {
            count: {
                minion: 0,
                period: 0,
                event: 0,
                log: 0
            },
            productData: this.productList(),
            productId: '',
            item: 'os',
            itemName: '操作系统版本'
        };
    },
    watch: {
        productId () {
            this.titleInfo();
        }
    },
    methods: {
        changedItem (item, itemName) {
            this.item = item;
            this.itemName = itemName;
        },
        productList () {
            this.axios.get(this.Global.serverSrc + 'product').then(
                res => {
                    if (res.data['status'] === true) {
                        this.productData = res.data['data'];
                        if (this.productData.length > 0) {
                            this.productId = this.productData[0].id;
                        } else {
                            this.loading = false;
                        }
                    } else {
                        this.loading = false;
                        this.nError('Get Product Failure', res.data['message']);
                    }
                },
                err => {
                    let errInfo = '';
                    try {
                        errInfo = err.response.data['message'];
                    } catch (error) {
                        errInfo = err;
                    }
                    this.loading = false;
                    this.nError('Get Product Failure', errInfo);
                });
        },
        titleInfo () {
            this.axios.get(this.Global.serverSrc + 'dashboard/title?product_id=' + this.productId).then(
                res => {
                    if (res.data['status'] === true) {
                        this.count = res.data['data'];
                    } else {
                        this.nError('Get Title Failure', res.data['message']);
                    }
                },
                err => {
                    let errInfo = '';
                    try {
                        errInfo = err.response.data['message'];
                    } catch (error) {
                        errInfo = err;
                    }
                    this.nError('Get Title Failure', errInfo);
                });
        },
        // 重新定义错误消息
        nError (title, info) {
            this.$Notice.error({
                title: title,
                // 替换<>避免被解析为html标签
                desc: info.toString().replace(/<|>/g, ''),
                duration: 10
            });
        }
    }
};
</script>
