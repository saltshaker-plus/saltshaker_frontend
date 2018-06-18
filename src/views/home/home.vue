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
                                <visite-volume></visite-volume>
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
                            :end-val="count.createUser"
                            iconType="android-apps"
                            color="#2d8cf0"
                            intro-text="Minion总数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="visit_count"
                            :end-val="count.visit"
                            iconType="ios-eye"
                            color="#64d572"
                            :iconSize="50"
                            intro-text="今日浏览量"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="collection_count"
                            :end-val="count.collection"
                            iconType="upload"
                            color="#ffd572"
                            intro-text="事件总数"
                        ></infor-card>
                    </Col>
                    <Col :xs="24" :sm="12" :md="6" :style="{marginBottom: '10px'}">
                        <infor-card
                            id-name="transfer_count"
                            :end-val="count.transfer"
                            iconType="shuffle"
                            color="#f25e43"
                            intro-text="今日服务调用量"
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
            <Col :md="24" :lg="12" :style="{marginTop: '10px'}">
                <Card dis-hover>
                    <p slot="title" class="card-title">
                        <Icon type="android-map"></Icon>
                        上周每日来访量统计
                    </p>
                    <div class="data-source-row">
                        <visite-volume></visite-volume>
                    </div>
                </Card>
            </Col>
            <Col :md="24" :lg="12" :style="{marginTop: '10px'}">
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
                        <grains-pie :productId="productId" :item="item" :itemName="itemName"></grains-pie>
                    </div>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
import grainsPie from './components/grainsPie.vue';
import visiteVolume from './components/visiteVolume.vue';
import countUp from './components/countUp.vue';
import inforCard from './components/inforCard.vue';
import jobDataTable from './components/jobDataTable.vue';

export default {
    name: 'home',
    components: {
        grainsPie,
        visiteVolume,
        countUp,
        inforCard,
        jobDataTable
    },
    data () {
        return {
            count: {
                createUser: 496,
                visit: 3264,
                collection: 24389305,
                transfer: 39503498
            },
            productData: this.productList(),
            productId: '',
            item: 'os',
            itemName: '操作系统版本'
        };
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
