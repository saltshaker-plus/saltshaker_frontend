<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <Col span="24">
                <Row>
                    <Col span="24">
                        <Card dis-hover>
                            <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="47">
                                <FormItem label="目标" prop="target">
                                    <CheckboxGroup v-model="formValidate.target">
                                        <Table size="small" width="100%" height="215" border :columns="columnsTarget" :data="targetData"></Table>
                                    </CheckboxGroup>
                                </FormItem>
                                <slot name="command"></slot>
                                <FormItem>
                                    <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
                                    <Button type="ghost" @click="handleReset('formValidate')">重置</Button>
                                    <slot name="commitButton"></slot>
                                    <div style="float: right">
                                        <Poptip placement="top-end" width="700">
                                            <Button type="ghost" @click="handleHistory">历史命令</Button>
                                            <div class="api" slot="content">
                                                <div style="padding-bottom: 5px">
                                                    <Input v-model="searchConName" icon="search" @on-change="handleSearch" placeholder="请输入历史命令" style="width: 200px" />
                                                </div>
                                                <Table size="small" width="100%" height="190" border :columns="columnsHistory" :data="historyData"></Table>
                                            </div>
                                         </Poptip>
                                    </div>
                                </FormItem>
                                <FormItem label="结果">
                                    <Spin size="large" fix v-if="spinShow"></Spin>
                                    <Alert :type="summaryType">
                                        <ul>
                                            <li>
                                                总数： {{result.total}}
                                            </li>
                                            <li>
                                                成功： {{result.succeed}}
                                            </li>
                                            <li>
                                                失败： {{result.failure}}
                                            </li>
                                            <li>
                                                失败主机： {{result.failure_minion}}
                                            </li>
                                            <li>
                                                命令： {{result.command}}
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
            </Col>
        </Row>
    </div>
</template>

<script>
    export default {
        name: 'commonExecute',
        data () {
            return {
                productData: this.productList(),
                // 执行命令的返回数据
                result: '',
                searchConName: '',
                formValidate: {
                    command: '',
                    target: []
                },
                // 默认不显示结果信息
                resultShow: false,
                // 摘要信息样式
                summaryType: 'success',
                // 等待返回结果
                spinShow: false,
                // 全选
                target: [],
                ruleValidate: {
                    command: [
                        { required: true, message: '请输选择要执行的SLS', trigger: 'blur' }
                    ],
                    target: [
                        { required: true, type: 'array', message: '请勾选主机或者分组', trigger: 'change' }
                    ]
                },
                columnsTarget: [
                    {
                        title: '分组',
                        key: 'name',
                        width: 145,
                        render: (h, params) => {
                            return h('CheckboxGroup', [
                                h('Checkbox', {
                                    props: {
                                        label: params.row.name
                                    },
                                    nativeOn: {
                                        click: () => {
                                            // 点击已经勾选的组,去除勾选的组及对应的minion
                                            if (this.formValidate.target.includes(params.row.name)) {
                                                this.formValidate.target.splice(this.formValidate.target.indexOf(params.row.name), 1);
                                                // 索引位置变化,采用逆向循环,达到数组去掉另一个数组元素的目的
                                                for (let i = this.formValidate.target.length - 1; i >= 0; i--) {
                                                    for (let m = params.row.minion.length - 1; m >= 0; m--) {
                                                        if (this.formValidate.target[i] === params.row.minion[m]) {
                                                            this.formValidate.target.splice(i, 1);
                                                        }
                                                    }
                                                }
                                            } else {
                                                // 点击没有勾选的组,勾选上组及对应的minion
                                                this.formValidate.target.push(params.row.name);
                                                this.formValidate.target = this.formValidate.target.concat(params.row.minion);
                                            }
                                        }
                                    }
                                }, params.row.name)
                            ]);
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
                        key: 'command'
                    },
                    {
                        title: '用户',
                        key: 'username',
                        width: 180
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
            productId: {
                type: String,
                required: true
            },
            slsCommand: {
                type: String,
                required: true
            },
            slsURI: {
                type: String,
                required: true
            }
        },
        watch: {
            // 监控产品线变化
            productId () {
                // 重新获取分组信息
                this.getGroups();
                // 清除命令表单数据
                this.formValidate.command = '';
                // 清除目标表单数据
                this.formValidate.target = [];
                // 清除结果信息
                this.resultShow = false;
                // 清除摘要信息
                this.result = '';
                // 停止loading
                this.spinShow = false;
                // 重新获取历史命令
                this.getHistory();
                // 清除搜索的内容
                this.searchConName = '';
            },
            // 监听sls文件名变化
            slsCommand () {
                this.formValidate.command = this.slsCommand;
                // 清除结果信息
                this.resultShow = false;
                // 清除摘要信息
                this.result = '';
            }
        },
        methods: {
            // 获取用户所拥有的产品线
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            if (this.productData.length > 0) {
                                this.productId = this.productData[0].id;
                            }
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
            // 处理选择的minion
            handleTarget () {
                // 去重
                this.target = [...new Set(this.formValidate.target)];
                // 获取所有的组名
                let group = this.targetData.map(item => {
                    return item['name'];
                });
                // 去除minion里面的组名
                for (let i = this.target.length - 1; i >= 0; i--) {
                    for (let m = group.length - 1; m >= 0; m--) {
                        if (this.target[i] === group[m]) {
                            this.target.splice(i, 1);
                        }
                    }
                }
            },
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.spinShow = true;
                        this.handleTarget();
                        let postData = {
                            'minion_id': this.target,
                            'sls': this.formValidate.command
                        };
                        this.axios.post(this.Global.serverSrc + this.slsURI + '?product_id=' + this.productId, postData).then(
                            res => {
                                if (res.data['status'] === true) {
                                    this.result = res.data['data'];
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
                                    this.resultShow = false;
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
                                this.resultShow = false;
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
                this.axios.get(this.Global.serverSrc + 'history?type=sls&product_id=' + this.productId).then(
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
                this.axios.get(this.Global.serverSrc + 'execute/groups?product_id=' + this.productId).then(
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