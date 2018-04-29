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
                                        <CheckboxGroup v-model="formValidate.target">
                                            <Checkbox label="Eat"></Checkbox>
                                            <Checkbox label="Sleep"></Checkbox>
                                            <Checkbox label="Run"></Checkbox>
                                            <Checkbox label="Movie"></Checkbox>
                                            <Table size="small" width="100%" height="215" border :columns="columnsTarget" :data="targetData" stripe></Table>
                                        </CheckboxGroup>

                                    </FormItem>
                                    <FormItem label="命令" prop="command">
                                        {{formValidate.target}}
                                        <Input v-model="formValidate.command" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="输入shell命令"></Input>
                                    </FormItem>
                                    <FormItem>
                                        <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
                                        <Button type="ghost" @click="handleReset('formValidate')">重置</Button>
                                        <div style="float: right">
                                            <Poptip placement="top-end" width="700">
                                                <Button type="ghost" @click="handleHistory">历史命令</Button>
                                                <div class="api" slot="content">
                                                    <div style="padding-bottom: 5px">
                                                        <Input v-model="searchConName" icon="search" @on-change="handleSearch" placeholder="请输入历史命令" style="width: 200px" />
                                                    </div>
                                                    <Table size="small" width="100%" height="190" border :columns="columnsHistory" :data="historyData" stripe></Table>
                                                </div>
                                             </Poptip>
                                        </div>
                                    </FormItem>
                                    <FormItem label="历史" prop="history" v-show="historyShow">
                                        <Table size="small" width="100%" height="190" border :columns="columnsHistory" :data="historyData" stripe></Table>
                                    </FormItem>
                                    <FormItem label="结果">
                                        <Spin size="large" fix v-if="spinShow"></Spin>
                                        <Alert :type="summaryType" v-show="summaryShow">
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
                                        <highlight-code lang="yaml" v-show="resultShow" style="overflow:auto"　v-for="(item, minion) in result.result" :key="item.minion">
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
                // 执行命令的返回数据
                result: '',
                searchConName: '',
                formValidate: {
                    command: '',
                    target: []
                },
                // 默认不显示结果信息
                resultShow: false,
                // 默认不显示摘要信息
                summaryShow: false,
                // 摘要信息样式
                summaryType: 'success',
                // 默认不显示历史命令
                historyShow: false,
                // 等等返回结果
                spinShow: false,
                ruleValidate: {
                    command: [
                        { required: true, message: '请输入命令', trigger: 'blur' }
                    ],
                    target: [
                        { required: true, type: 'array', message: '请勾选主机或者分组', trigger: 'change' }
                    ]
                },
                columnsTarget: [
                    {
                        title: '分组',
                        key: 'name',
                        width: 180,
                        render: (h, params) => {
                            return h('Checkbox', {
                                props: {
                                    label: params.row.name,
                                    value: params.row.name
                                }
                            }, params.row.name);
                        }
                    },
                    {
                        title: '主机',
                        key: 'minion',
                        render: (h, params) => {
                            return h('div', params.row.minion.map(item => {
                                return h('Checkbox', {
                                    props: {
                                        label: item
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
                        key: 'command',
                        render: (h, params) => {
                            return h('div', {
                                on: {
                                    'dblclick': () => {
                                        // 双击历史命令填充到命令行表单
                                        this.formValidate.command = params.row.command;
                                    }
                                }
                            }, params.row.command);
                        }
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
                historyData: [],
                initHistoryData: []
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
                // 关闭历史命令框
                this.historyShow = false;
                // 重新获取分组信息
                this.getGroups();
                // 清除命令表单数据
                this.formValidate.command = '';
                // 清除摘要信息
                this.summaryShow = false;
                // 清除结果信息
                this.resultShow = false;
                // 停止loading
                this.spinShow = false;
                // 重新获取历史命令
                this.getHistory();
                // 清除搜索的内容
                this.searchConName = '';
            }
        },
        methods: {
            // 获取用户所拥有的产品线
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            this.productId = this.productData[0].id;
                            // 加载完产品线后加载历史命令
                            this.getHistory();
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
                this.getGroups();
                this.getHistory();
            },
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.spinShow = true;
                        let postData = {
                            'minion_id': this.formValidate.target,
                            'command': this.formValidate.command
                        };
                        this.axios.post(this.Global.serverSrc + this.apiService + '?product_id=' + this.productId, postData).then(
                            res => {
                                if (res.data['status'] === true) {
                                    this.result = res.data['data'];
                                    this.summaryShow = true;
                                    this.resultShow = true;
                                    this.spinShow = false;
                                    // 有错误后显示不同的颜色
                                    if (this.result['failure'] !== '0') {
                                        this.summaryType = 'error';
                                    } else {
                                        this.summaryType = 'success';
                                    }
                                } else {
                                    this.result = '';
                                    this.summaryShow = false;
                                    this.spinShow = false;
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
                                this.spinShow = false;
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
            getHistory () {
                this.axios.get(this.Global.serverSrc + this.apiHistory + '?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.historyData = res.data['data'];
                            this.initHistoryData = this.historyData;
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
                this.historyData = this.initHistoryData;
                this.historyData = this.search(this.historyData, {command: this.searchConName});
            },
            handleHistory () {
                this.searchConName = '';
                this.getHistory();
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