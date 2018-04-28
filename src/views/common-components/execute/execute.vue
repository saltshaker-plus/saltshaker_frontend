<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <div>
        <Row class="margin-top-10">
            <Col span="24">
                <Card dis-hover>
                    <Row>
                        <Select style="width:200px" v-model="productId" v-show="productShow">
                            <Option v-for="item in productData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                        </Select>
                        <div style="float: right;" >
                            <Button type="primary" @click="refresh()">刷新</Button>
                        </div>
                    </Row>
                    <Row>
                        <hr class="hr-margin" color="#e3e8ee" size="0.5">
                    </Row>
                    <Row>
                        <Col span="24">
                            <Card dis-hover>
                                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="47">
                                    <FormItem label="目标" prop="target">
                                        <Table size="small" width="100%" height="324" border :columns="columnsTarget" :data="targetData" stripe></Table>
                                    </FormItem>
                                    <FormItem label="命令" prop="command">
                                        <Input v-model="formValidate.command" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="输入shell命令"></Input>
                                    </FormItem>
                                    <FormItem>
                                        <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
                                        <Button type="ghost" @click="handleReset('formValidate')">重置</Button>
                                        <div style="float: right">
                                            <Input v-model="search" placeholder="Enter something..." icon="ios-search" style="width: 200px">
                                                <Button slot="append" icon="ios-search"></Button>
                                            </Input>
                                        </div>
                                        <div style="float: right">
                                            <Button type="ghost" @click="handleHistory" style="margin-right: 3px">历史</Button>
                                        </div>
                                    </FormItem>
                                    <FormItem label="历史" prop="history" v-show="historyShow">
                                        <Table size="small" width="100%" height="220" border :columns="columnsHistory" :data="historyData" stripe></Table>
                                    </FormItem>
                                    <FormItem label="结果">
                                        <Alert :type="summaryType" v-if="summaryShow">
                                            <ul>
                                                <li>
                                                    总数: {{result.total}}
                                                </li>
                                                <li>
                                                    成功: {{result.succeed}}
                                                </li>
                                                <li>
                                                    失败: {{result.failure}}
                                                </li>
                                                <li>
                                                    失败主机: {{result.failure_minion}}
                                                </li>
                                                <li>
                                                    命令: {{result.command}}
                                                </li>
                                            </ul>
                                        </Alert>
                                        <highlight-code lang="yaml" style="overflow:auto" v-if="true" v-for="(item , minion) in result.result">
Minion: {{minion}}
{{item}}
                                        </highlight-code>
                                    </FormItem>
                                </Form>
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
                search: '',
                result: '',
                formValidate: {
                    command: '',
                    target: ''
                },
                summaryShow: false,
                summaryType: 'success',
                historyShow: false,
                ruleValidate: {
                    command: [
                        { required: true, message: '请输入命令', trigger: 'blur' }
                    ],
                    target: [
                        { required: true, message: '请勾选主机或者分组', trigger: 'blur' }
                    ]
                },
                columnsTarget: [
                    {
                        title: '分组',
                        key: 'name',
                        width: 180,
                        render: (h, params) => {
                            return h('Checkbox', {
                                style: {
                                    padding: '0px'
                                }
                            }, params.row.name);
                        }
                    },
                    {
                        title: '主机',
                        key: 'minion',
                        render: (h, params) => {
                            return h('CheckboxGroup', params.row.minion.map(item => {
                                return h('Checkbox', {
                                    style: {
                                        padding: '0px'
                                    }
                                }, item);
                            })
                            );
                        }
                    }
                ],
                targetData: [],
                columnsHistory: [
                    {
                        title: '命令',
                        key: 'command'
                    },
                    {
                        title: '用户',
                        key: 'username',
                        width: 180,
                    },
                    {
                        title: '时间',
                        key: 'time',
                        width: 160
                    }
                ],
                historyData: []
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
            apiHistory: {
                type: String,
                required: true
            }
        },
        watch: {
            // 监控产品线变化
            productId () {
                this.historyShow = false;
                this.getGroups();
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
            // 重新定义错误消息
            nerror (title, info) {
                this.$Notice.error({
                    title: title,
                    desc: info,
                    duration: 10
                });
            },
            refresh () {
                this.productList();
            },
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (true) {
                        let postData = {
                            'minion_id': ['10.55.30.22', '10.55.30.23'],
                            'command': this.formValidate.command
                        };
                        this.axios.post(this.Global.serverSrc + this.apiService + '?product_id=' + this.productId, postData).then(
                            res => {
                                if (res.data['status'] === true) {
                                    this.result = res.data['data'];
                                    this.summaryShow = true;
                                    // 有错误后显示不同的颜色
                                    if (this.result['failure'] !== '0') {
                                        this.summaryType = 'error';
                                    } else {
                                        this.summaryType = 'success';
                                    }
                                } else {
                                    this.result = '';
                                    this.summaryShow = false;
                                    this.nerror('Execute Failure', res.data['message']);
                                }
                            },
                            err => {
                                let errInfo = '';
                                try {
                                    errInfo = err.response.data['message'];
                                } catch (error) {
                                    errInfo = err;
                                }
                                this.result = '';
                                this.summaryShow = false;
                                this.nerror('Execute Failure', errInfo);
                            });
                    } else {
                        this.$Message.error('请检查表单数据！');
                    }
                });
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            handleHistory () {
                if (this.historyShow === true) {
                    this.historyShow = false;
                } else {
                    this.getHistory();
                    this.historyShow = true;
                }
            },
            getHistory () {
                this.axios.get(this.Global.serverSrc + this.apiHistory + '?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.historyData = res.data['data'];
                        } else {
                            this.nerror('Get Info Failure', res.data['message']);
                        }
                        ;
                        this.loading = false;
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                            if (err.response.status === 404) {
                                this.historyData = [];
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
            getGroups () {
                this.axios.get(this.Global.serverSrc + 'groups' + '?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.targetData = res.data['data'];
                        } else {
                            this.nerror('Get Info Failure', res.data['message']);
                        }
                        ;
                        this.loading = false;
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                            if (err.response.status === 404) {
                                this.targetData = [];
                            } else {
                                this.nerror('Get Info Failure', errInfo);
                            }
                        } catch (error) {
                            errInfo = err;
                            this.nerror('Get Info Failure', errInfo);
                        }
                        this.loading = false;
                    });
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