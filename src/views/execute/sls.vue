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
                            <Button type="primary" @click="refresh()">刷新</Button>
                          </div>
                    </Row>
                    <Row :gutter="10">
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
                                <Select>
                                    <Option v-for="item in branchData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                                </Select>
                                </div>
                                <br>
                                <Tree :data="data3" :load-data="loadData"></Tree>
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
        data () {
            return {
                productData: this.product(),
                data3: [
                    {
                        title: 'parent',
                        loading: false,
                        children: []
                    }
                ]
            };
        },
        methods: {
            product () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['products']['product'];
                        } else {
                            this.nerror('Get Product Failure', res.data['message']);
                        }
                    },
                    err => {
                        this.nerror('Get Product Failure', err);
                    });
            },
            branch () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/gitlab/branch?').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.branchData = res.data['branchs']['branch'];
                        } else {
                            this.nerror('Get Branch Failure', res.data['message']);
                        }
                    },
                    err => {
                        this.nerror('Get Branch Failure', err);
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