<style lang="less">
    @import '../../../styles/common.less';
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
                        <Col span="6">
                            <Card>
                                <p slot="title">
                                    <Icon type="ios-toggle"></Icon>
                                    选择分支
                                </p>
                                <div style="margin-bottom: -10px;">
                                <Select v-model="branchName">
                                    <Option v-for="item in branchData" :value="item" :key="item">{{ item }}</Option>
                                </Select>
                                </div>
                                <br>
                                <Tree :data="fileTree" :load-data="loadData"></Tree>
                            </Card>
                        </Col>
                        <Col span="18">
                            <Card>
                                <p slot="title">
                                    <Icon type="document-text"></Icon>
                                    SLS内容
                                </p>
                                dfdfdfdfdfdfdfd
                            </Card>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
    export default {
        name: 'CommonSLS',
        data () {
            return {
                productData: this.productList(),
                productId: '',
                productStateProject: '',
                branchData: [],
                branchName: '',
                fileTreeData: [],
                fileTree: []
            };
        },
        props: {
            apiService: {
                type: String,
                required: true
            },
            productShow: {
                type: Boolean
            },
            projectType: {
                type: String,
                required: true
            }
        },
        watch: {
            // 监控产品线变化
            productId () {
                this.branch();
            },
            branchName () {
                if (this.branchName !== '') {
                    this.file();
                } else {
                    this.fileTreeData = [];
                    this.fileTree = [];
                }
            }
        },
        methods: {
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            this.productId = this.productData[0].id;
                            this.productStateProject = this.productData[0].state_project;
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
            branch () {
                this.axios.get(this.Global.serverSrc + this.apiService + '/branch?product_id=' + this.productId + '&project_type=' + this.projectType).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.branchData = res.data['data'];
                            this.branchName = this.branchData[0];
                        } else {
                            this.branchData = [];
                            this.branchName = '';
                            this.nerror('Get Branch Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.branchData = [];
                        this.branchName = '';
                        this.nerror('Get Branch Failure', errInfo);
                    });
            },
            file () {
                this.axios.get(this.Global.serverSrc + this.apiService + '/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=/&branch=' + this.branchName).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.fileTree = res.data['data'];
                            // this.branchName = this.branchData[0];
                        } else {
                            this.nerror('Get File Tree Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nerror('Get File Tree Failure', errInfo);
                    });
            },
            loadData (item, callback) {
                setTimeout(() => {
                    const data = [
                        {
                            title: 'children',
                            loading: false,
                            children: []
                        },
                        {
                            title: 'children',
                            loading: false,
                            children: []
                        }
                    ];
                    callback(data);
                }, 300);
            },
            // 重新定义错误消息
            nerror (title, info) {
                this.$Notice.error({
                    title: title,
                    desc: info,
                    duration: 10
                });
            },
            refresh () {
                this.product();
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