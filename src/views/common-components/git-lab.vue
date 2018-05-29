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
                            <Card dis-hover>
                                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="46">
                                    <FormItem label="文件" prop="fileDir">
                                        <Input v-model="formValidate.fileDir" :disabled="inputDisabled"></Input>
                                    </FormItem>
                                    <FormItem label="内容" prop="code">
                                        <Tabs v-model="tab" :style="[h]">
                                            <TabPane  label="从文本输入框创建" name="text">
                                                <MonacoEditor
                                                    height="500"
                                                    width="100%"
                                                    language="yaml"
                                                    srcPath="dist"
                                                    :code="fileContent"
                                                    :options="options"
                                                    :highlighted="highlightLines"
                                                    :changeThrottle="100"
                                                    theme="vs-dark"
                                                    @mounted="onMounted"
                                                    @codeChange="onCodeChange"
                                                    ref="vscode"
                                                    >
                                                </MonacoEditor>
                                                <br>
                                                <Button type="primary" @click="handleCreate('formValidate')" :disabled="createDisabled">创建</Button>
                                                <Button type="primary" @click="handleEdit('formValidate')" :disabled="editDisabled">更新</Button>
                                                <Poptip
                                                    confirm
                                                    :title="title"
                                                    @on-popper-show="PopperShow()"
                                                    @on-ok="handleDelete('formValidate')">
                                                    <Button type="error" :disabled="deleteDisabled">删除</Button>
                                                </Poptip>
                                            </TabPane>
                                            <TabPane label="封装SLS" disabled name="sls">
                                            </TabPane>
                                            <TabPane label="从文件创建" name="upload" :disabled="uploadDisabled">
                                                <div style="padding: 1px">
                                                <Upload
                                                    multiple
                                                    type="drag"
                                                    :action="action"
                                                    :data="uploadParameter"
                                                    :with-credentials="true"
                                                    :on-success="UploadSuccess"
                                                    :on-error="UploadError">
                                                    <div style="padding: 10px 0px">
                                                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                                        <p>点击或者拖拽上传</p>
                                                    </div>
                                                </Upload>
                                                    </div>
                                            </TabPane>
                                        </Tabs>
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
    import MonacoEditor from 'vue-monaco-editor';
    export default {
        components: {
            MonacoEditor
        },
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
                deleteDisabled: true,
                editDisabled: true,
                createDisabled: false,
                inputDisabled: false,
                uploadDisabled: false,
                fileContent: '',
                path: '',
                filePath: [''],
                code: '',
                options: {
                    selectOnLineNumbers: false,
                    // 启用该编辑器将安装一个时间间隔来检查其容器dom节点大小是否已更改,启用此功能可能会对性能造成严重影响
                    automaticLayout: true
                },
                highlightLines: [
                    {
                        number: 0,
                        class: 'primary-highlighted-line'
                    },
                    {
                        number: 0,
                        class: 'secondary-highlighted-line'
                    }
                ],
                formValidate: {
                    path: '',
                    fileDir: '',
                    code: ''
                },
                ruleValidate: {
                    path: [
                        { required: true, message: '请输选择要执行的SLS', trigger: 'blur' }
                    ],
                    fileDir: [
                        { required: true, message: '请出入文件名或者文件路径', trigger: 'blur' }
                    ]
                },
                title: '',
                tab: 'text',
                h: {
                    height: '620px'
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
        computed: {
            // 文件上传附带的额外参数
            uploadParameter: function () {
                let postData = {
                    'path': this.formValidate.fileDir,
                    'project_type': this.projectType,
                    'branch': this.branchName,
                    'action': 'upload'
                };
                return postData;
            },
            // 上传的地址
            action: function () {
                return this.Global.serverSrc + 'gitlab/upload?product_id=' + this.productId;
            }
        },
        watch: {
            // 监控产品线变化
            productId () {
                this.branch();
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
                // 重新加载 MonacoEditor
                this.reload();
            },
            filePath () {
                if (this.filePath.length !== 0) {
                    if (this.filePath[0].type !== 'tree') {
                        this.deleteDisabled = false;
                        this.editDisabled = false;
                        this.createDisabled = true;
                        this.inputDisabled = true;
                        this.uploadDisabled = true;
                    } else {
                        this.deleteDisabled = true;
                        this.editDisabled = true;
                        this.createDisabled = false;
                        this.inputDisabled = false;
                        this.uploadDisabled = false;
                        this.code = '';
                        this.fileContent = '';
                    }
                } else {
                    this.deleteDisabled = true;
                    this.editDisabled = true;
                    this.createDisabled = false;
                    this.inputDisabled = false;
                    this.uploadDisabled = false;
                }
            },
            tab () {
                if (this.tab === 'text') {
                    this.h.height = '620px';
                } else if (this.tab === 'sls') {
                    this.h.height = '320px';
                }
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
                if (filePath.length !== 0) {
                    this.formValidate.fileDir = filePath[0].path;
                }
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
                // fileListPath为异步方法,等待300ms
                setTimeout(() => {
                    callback(this.fileListPathData);
                }, 300);
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
            },
            handleEdit () {
                let postData = {
                    'path': this.path,
                    'project_type': this.projectType,
                    'branch': this.branchName,
                    'action': 'update',
                    'content': this.code
                };
                this.axios.post(this.Global.serverSrc + 'gitlab/commit?product_id=' + this.productId, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.result = res.data['data'];
                            this.edit = false;
                            this.$Message.success('修改成功！');
                            // 调用hook进行更新
                            this.handleHook();
                            // this.fileList();
                        } else {
                            this.nError('Modify Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Modify Failure', errInfo);
                    });
            },
            PopperShow () {
                this.title = '你确定删除 ' + this.formValidate.fileDir + ' 这个文件吗?';
            },
            handleDelete () {
                let postData = {
                    'path': this.formValidate.fileDir,
                    'project_type': this.projectType,
                    'branch': this.branchName,
                    'action': 'delete'
                };
                this.axios.post(this.Global.serverSrc + 'gitlab/commit?product_id=' + this.productId, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.result = res.data['data'];
                            this.edit = false;
                            this.$Message.success('删除成功！');
                            // 刷新gitlab file list
                            this.fileList();
                            this.filePath = [];
                            this.formValidate.fileDir = '';
                            this.fileContent = '';
                        } else {
                            this.nError('Delete Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Delete Failure', errInfo);
                    });
            },
            handleCreate (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        let postData = {
                            'path': this.formValidate.fileDir,
                            'project_type': this.projectType,
                            'branch': this.branchName,
                            'action': 'create',
                            'content': this.code
                        };
                        this.axios.post(this.Global.serverSrc + 'gitlab/commit?product_id=' + this.productId, postData).then(
                            res => {
                                if (res.data['status'] === true) {
                                    this.result = res.data['data'];
                                    this.edit = false;
                                    this.$Message.success('创建成功！');
                                    // 刷新gitlab file list
                                    this.fileList();
                                    this.filePath = [];
                                    this.formValidate.fileDir = '';
                                    this.reload();
                                } else {
                                    this.nError('Create Failure', res.data['message']);
                                }
                            },
                            err => {
                                let errInfo = '';
                                try {
                                    errInfo = err.response.data['message'];
                                } catch (error) {
                                    errInfo = err;
                                }
                                this.nError('Create Failure', errInfo);
                            });
                    } else {
                        this.$Message.error('请检查表单数据！');
                    }
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
                this.code = this.editor.getValue();
            },
            // 重载编辑框
            reload () {
                clearTimeout(time);
                let time = setTimeout(() => {
                    this.$refs.vscode.destroyMonaco();
                    this.$refs.vscode.createMonaco();
                }, 1);
            },
            // 上传成功
            UploadSuccess () {
                this.$Message.success('上传成功！');
                this.fileList();
            },
            // 上传失败
            UploadError () {
                this.nError('Upload Failure', 'The file path is incorrect or file formats are not supported');
            },
            // 表单重置
            handleReset (name) {
                this.$refs[name].resetFields();
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