<style lang="less">
    @import '../../styles/common.less';
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
                            <slot name="create"></slot>
                            <slot name="downMenu"></slot>
                            <Button type="primary" @click="refresh()">刷新</Button>
                        </div>
                    </Row>
                    <Row>
                        <hr class="hr-margin" color="#e3e8ee" size="0.5">
                    </Row>
                    <Row :gutter="5">
                        <Col span="6">
                            <Card dis-hover :padding="5">
                                <div style="margin-bottom: -10px;">
                                <Select v-model="branchName">
                                    <Option v-for="item in branchData" :value="item" :key="item">{{ item }}</Option>
                                </Select>
                                </div>
                                <br>
                                <Tree :data="fileTree" :load-data="loadData" @on-select-change="handleContent"></Tree>
                            </Card>
                        </Col>
                        <Col span="18">
                            <slot name="right"></slot>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    </div>
</template>

<script>
    export default {
        name: 'GitLab',
        data () {
            return {
                productData: this.productList(),
                productId: '',
                productStateProject: '',
                branchData: [],
                branchName: '',
                fileTreeData: [],
                fileTree: [],
                fileListPathData: [],
                // 编辑
                edit: false,
                editDisabled: true,
                fileContent: '',
                path: '',
                filePath: [''],
                apiHistory: '',
                formValidate: {
                    command: '',
                    target: []
                },
                ruleValidate: {
                    command: [
                        { required: true, message: '请输选择要执行的SLS', trigger: 'blur' }
                    ],
                    target: [
                        { required: true, type: 'array', message: '请勾选主机或者分组', trigger: 'change' }
                    ]
                }
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
            },
            slsURI: {
                type: String,
                required: true
            }
        },
        watch: {
            // 监控产品线变化
            productId () {
                this.branch();
                this.getProduct();
            },
            branchName () {
                if (this.branchName !== '') {
                    // 获取第一级GitLab数据
                    this.fileList();
                } else {
                    this.fileTreeData = [];
                    this.fileTree = [];
                    this.fileListPathData = [];
                    this.path = '';
                }
            },
            fileContent () {
                if (this.fileContent !== '') {
                    this.editDisabled = false;
                }
                this.getFileContent();
            },
            filePath () {
                this.getFilePath();
            }
        },
        methods: {
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            if (this.productData.length > 0) {
                                this.productId = this.productData[0].id;
                                this.productStateProject = this.productData[0].state_project;
                            }
                        } else {
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
                        this.nError('Get Product Failure', errInfo);
                    });
            },
            branch () {
                this.branchData = [];
                this.branchName = '';
                this.fileTree = [];
                this.fileContent = '';
                this.axios.get(this.Global.serverSrc + this.apiService + '/branch?product_id=' + this.productId + '&project_type=' + this.projectType).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.branchData = res.data['data'];
                            this.branchName = this.branchData[0];
                        } else {
                            this.nError('Get Branch Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Get Branch Failure', errInfo);
                    });
            },
            fileList () {
                this.fileContent = '';
                this.path = '';
                this.axios.get(this.Global.serverSrc + this.apiService + '/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=/&branch=' + this.branchName).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.fileTree = res.data['data'];
                        } else {
                            this.fileTree = [];
                            this.nError('Get File Tree Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.fileTree = [];
                        this.nError('Get File Tree Failure', errInfo);
                    });
            },
            // 传入path获取gitlab对应数据
            fileListPath (path) {
                this.fileContent = '';
                this.axios.get(this.Global.serverSrc + this.apiService + '/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=' + path + '&branch=' + this.branchName).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.fileListPathData = res.data['data'];
                        } else {
                            this.fileListPathData = [];
                            this.nError('Get File Tree Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.fileListPathData = [];
                        this.nError('Get File Tree Failure', errInfo);
                    });
            },
            handleContent (filePath) {
                this.filePath = filePath;
                console.log(filePath[0])
                if (filePath.length !== 0 && filePath[0]['type'] !== 'tree') {
                    this.fileContent = '';
                    this.path = filePath[0]['path'];
                    this.axios.get(this.Global.serverSrc + this.apiService + '/content?product_id=' + this.productId + '&project_type=' + this.projectType + '&branch=' + this.branchName + '&path=' + this.path).then(
                        res => {
                            if (res.data['status'] === true) {
                                this.fileContent = res.data['data'];
                            } else {
                                this.nError('Get File Content Failure', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nError('Get File Content Failure', errInfo);
                        });
                }
            },
            // 展开树型结构获取gitlab数据
            loadData (item, callback) {
                this.fileListPath(item['path']);
                // fileListPath为异步方法,等待500ms
                setTimeout(() => {
                    callback(this.fileListPathData);
                }, 500);
            },
            // 重新定义错误消息
            nError (title, info) {
                this.$Notice.error({
                    title: title,
                    desc: info,
                    duration: 10
                });
            },
            refresh () {
                this.fileList();
                // 调用hook进行更新
                this.handleHook();
                this.editDisabled = true;
            },
            handleCancel () {
                // 取消编辑后再请求一次文件内容,以便恢复文件内容
                // 暂时关闭
                // this.handleContent(this.filePath);
                this.edit = false;
            },
            handleEdit () {
                this.edit = true;
                this.code = this.fileContent;
            },
            handleCommit () {
                let postData = {
                    'path': this.path,
                    'project_type': this.projectType,
                    'branch': this.branchName,
                    'action': 'update',
                    'content': this.fileContent
                };
                this.axios.post(this.Global.serverSrc + 'gitlab/commit?product_id=' + this.productId, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.result = res.data['data'];
                            this.edit = false;
                            this.$Message.success('成功！');
                            // 调用hook进行更新
                            this.handleHook();
                        } else {
                            this.nError('Commit Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Commit Failure', errInfo);
                    });
            },
            handleHook () {
                let postData = {
                    'tag': 'gitfs/update'
                };
                this.axios.post(this.Global.serverSrc + 'hook?product_id=' + this.productId, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.result = res.data['data'];
                        } else {
                            this.nError('Web Hook Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Web Hook Failure', errInfo);
                    });
            },
            onMounted (editor) {
                this.editor = editor;
            },
            onCodeChange (editor) {
                console.log(this.editor.getValue());
            },
            // 传递给父组件
            getFileContent () {
                this.$emit('getFileContentEvent', this.fileContent);
            },
            getFilePath () {
                this.$emit('getFilePathEvent', this.filePath);
            },
            getProduct () {
                this.$emit('getProductEvent', this.productData, this.productId);
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