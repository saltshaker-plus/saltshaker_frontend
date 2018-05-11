<template>
    <div>
        <common-table
                :cColumns="cColumns"
                :apiService="apiService"
                @getProductEvent="getProductEvent"
                :productShow="true">
            <Button slot="create" type="primary" @click="add('formValidate')">创建Job</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName" width="600px">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                    <FormItem>
                        <Steps :current="current">
                            <Step title="基本配置"></Step>
                            <Step title="SLS配置"></Step>
                            <Step title="配置成功"></Step>
                        </Steps>
                    </FormItem>
                    <div v-show="first">
                        <FormItem label="Job名" prop="name">
                            <Input v-model="formValidate.name" placeholder="输入Job名"></Input>
                        </FormItem>
                        <FormItem label="描述" prop="description">
                            <Input v-model="formValidate.description" placeholder="输入描述"></Input>
                        </FormItem>
                        <FormItem label="目标" prop="target">
                            <Select v-model="formValidate.target" multiple >
                                <Option v-for="item in targetData" :value="item.id" :key="item.id" placeholder="选择目标">{{ item.name }}</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="并行数" prop="concurrent">
                            <InputNumber :min="0" v-model="formValidate.concurrent"></InputNumber>
                        </FormItem>
                        <FormItem label="周期">
                            <RadioGroup v-model="formValidate.period">
                                <Radio label="oneTime">一次</Radio>
                                <Radio label="period">周期性</Radio>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="时间">
                            <Row>
                                <Col span="9">
                                    <FormItem prop="date">
                                        <DatePicker type="date" placeholder="Select date" v-model="formValidate.date"></DatePicker>
                                    </FormItem>
                                </Col>
                                <Col span="2" style="text-align: center">-</Col>
                                <Col span="13">
                                    <FormItem prop="time">
                                        <TimePicker type="time" placeholder="Select time" v-model="formValidate.time"></TimePicker>
                                    </FormItem>
                                </Col>
                            </Row>
                        </FormItem>
                    </div>
                    <div v-show="second">
                        <FormItem label="类型">
                            <RadioGroup v-model="formValidate.type">
                                <span @click="handleSLS()"><Radio label="sls">SLS</Radio></span>
                                <span @click="handleShell()"><Radio label="shell">Shell</Radio></span>
                                <span @click="handleModule()"><Radio label="module">Module</Radio></span>
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="SLS" prop="sls" v-show="sls">
                            <Select v-model="branchName">
                                <Option v-for="item in branchData" :value="item" :key="item">{{ item }}</Option>
                            </Select>
                            <Tree :data="fileTree" :load-data="loadData" @on-select-change="handleContent"></Tree>
                        </FormItem>
                        <FormItem label="Shell" prop="shell" v-show="shell">
                            <MonacoEditor
                                height="600"
                                language="typescript"
                                srcPath="dist"
                                :code="code"
                                :options="options"
                                :highlighted="highlightLines"
                                :changeThrottle="500"
                                theme="vs-dark"
                                @mounted="onMounted"
                                @codeChange="onCodeChange"
                                >
                            </MonacoEditor>
                        </FormItem>
                        <FormItem label="Module" prop="module" v-show="module">
                            <Select v-model="branchName">
                                <Option v-for="item in branchData" :value="item" :key="item">{{ item }}</Option>
                            </Select>
                            <Tree :data="fileTree" :load-data="loadData" @on-select-change="handleContent"></Tree>
                        </FormItem>
                    </div>
                </Form>
                <div slot="footer">
                    <!--<Button type="ghost" @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>-->
                    <Button type="text" @click="previous()" style="margin-left: 8px" v-show="previousShow">上一步</Button>
                    <Button type="primary" @click="next()">下一步</Button>
                    <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
                </div>
            </Modal>
        </common-table>
</div>

</template>

<script>
    import CommonTable from '../common-components/table/table.vue';
    import MonacoEditor from 'vue-monaco-editor';
    export default {
        components: {
            CommonTable,
            MonacoEditor
        },
        data () {
            return {
                apiService: 'job',
                productData: [],
                productId: '',
                // 删除数据
                delId: '',
                delIndex: '',
                // 编辑数据
                formView: false,
                first: false,
                second: false,
                previousShow: false,
                id: '',
                optionType: '',
                optionTypeName: '',
                targetData: [],
                productStateProject: '',
                branchData: [],
                branchName: '',
                fileTreeData: [],
                fileTree: [],
                fileListPathData: [],
                projectType: 'state_project',
                filePath: '',
                path: '',
                current: 0,
                sls: true,
                shell: false,
                module: false,
                cColumns: [
                    {
                        title: 'Job ID',
                        key: 'id',
                        sortable: true,
                        width: 195,
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.showInfo = true;
                                            this.result = params.row.return;
                                        }
                                    }
                                }, params.row.jid)
                            ]);
                        }
                    },
                    {
                        title: 'Job',
                        key: 'name',
                        sortable: true
                    },
                    {
                        title: '描述',
                        key: 'description',
                        sortable: true
                    },
                    {
                        title: '目标',
                        key: 'target',
                        sortable: true
                    },
                    {
                        title: 'SLS',
                        key: 'sls',
                        sortable: true
                    },
                    {
                        title: '并行数',
                        key: 'concurrent',
                        sortable: true,
                        render: (h, params) => {
                            return this.convertTime(params.row._stamp);
                        }
                    }
                ],
                // 表单验证
                formValidate: {
                    name: '',
                    description: '',
                    target: [],
                    sls: '',
                    concurrent: 0,
                    period: 'period',
                    type: 'sls'
                },
                ruleValidate: {
                    name: [
                        { required: true, message: 'Job名不能为空', trigger: 'blur' }
                    ],
                    description: [
                        { required: true, message: '描述不能为空', trigger: 'blur' }
                    ],
                    target: [
                        { required: true, type: 'array', min: 1, message: '请选择目标', trigger: 'change' }
                    ],
                    sls: [
                        { required: true, message: 'State SLS 不能为空', trigger: 'blur' }
                    ],
                    date: [
                        { required: true, type: 'date', message: '请选择日期', trigger: 'change' }
                    ],
                    time: [
                        { required: true, type: 'string', message: '请选择时间', trigger: 'change' }
                    ]
                },
                code: 'ggggggg',
                options: {
                    selectOnLineNumbers: false
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
                ]
            };
        },
        watch: {
            // 监控产品线变化
            productId () {
                // 重新获取分组信息
                this.getGroups();
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
            }
        },
        methods: {
            // 2018-04-18T12:51:59.321743 to yyyy-mm-dd hh:mm:ss
            convertTime (time) {
                let dt = new Date(time);
                dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
                let date = dt.toISOString().slice(0, -5).replace(/[T]/g, ' ');
                return date;
            },
            getProductEvent: function (productData, productId) {
                this.productData = productData;
                this.productId = productId;
            },
            // 调用子组件进行删除
            del () {
                this.$refs.childrenMethods.del(this.delId);
            },
            // 调用子组件进行数据刷新
            tableList () {
                this.$refs.childrenMethods.tableList();
            },
            // 调用子组件消息通知
            nerror (title, info) {
                this.$refs.childrenMethods.nerror(title, info);
            },
            // 添加展示
            add (name) {
                this.handleReset(name);
                this.optionType = 'add';
                this.optionTypeName = '添加';
                this.formView = true;
                this.first = true;
                this.second = false;
                this.previousShow = false;
            },
            // 表单提
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        if (this.formValidate.file_server === 'rsync') {
                            this.formValidate.gitlab_url = '';
                            this.formValidate.api_version = '';
                            this.formValidate.private_token = '';
                            this.formValidate.state_project = '';
                            this.formValidate.pillar_project = '';
                        };
                        // 编辑
                        if (this.optionType === 'edit') {
                            this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id,
                                this.formValidate).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nerror('Edit Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nerror('Edit Failure', errInfo);
                                });
                        } else {
                            // 添加
                            this.axios.post(this.Global.serverSrc + this.apiService,
                                this.formValidate).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nerror('Add Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nerror('Add Failure', errInfo);
                                });
                        }
                    } else {
                        this.$Message.error('请检查表单数据！');
                    }
                });
            },
            handleReset (name) {
                this.$refs[name].resetFields();
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
            branch () {
                this.branchData = [];
                this.branchName = '';
                this.fileTree = [];
                this.fileContent = '';
                this.axios.get(this.Global.serverSrc + 'gitlab/branch?product_id=' + this.productId + '&project_type=' + this.projectType).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.branchData = res.data['data'];
                            this.branchName = this.branchData[0];
                        } else {
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
                        this.nerror('Get Branch Failure', errInfo);
                    });
            },
            fileList () {
                this.fileContent = '';
                this.path = '';
                this.axios.get(this.Global.serverSrc + 'gitlab/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=/&branch=' + this.branchName).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.fileTree = res.data['data'];
                        } else {
                            this.fileTree = [];
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
                        this.fileTree = [];
                        this.nerror('Get File Tree Failure', errInfo);
                    });
            },
            // 传入path获取gitlab对应数据
            fileListPath (path) {
                this.fileContent = '';
                this.axios.get(this.Global.serverSrc + 'gitlab/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=' + path + '&branch=' + this.branchName).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.fileListPathData = res.data['data'];
                        } else {
                            this.fileListPathData = [];
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
                        this.fileListPathData = [];
                        this.nerror('Get File Tree Failure', errInfo);
                    });
            },
            handleContent (filePath) {
                this.filePath = filePath;
                if (filePath.length !== 0 && filePath[0]['type'] !== 'tree') {
                    this.fileContent = '';
                    this.path = filePath[0]['path'];
                    this.axios.get(this.Global.serverSrc + this.apiService + '/content?product_id=' + this.productId + '&project_type=' + this.projectType + '&branch=' + this.branchName + '&path=' + this.path).then(
                        res => {
                            if (res.data['status'] === true) {
                                this.fileContent = res.data['data'];
                            } else {
                                this.nerror('Get File Content Failure', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nerror('Get File Content Failure', errInfo);
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
            next () {
                this.first = false;
                this.second = true;
                if (this.current !== 3) {
                    this.previousShow = true;
                    this.current += 1;
                }
            },
            previous () {
                this.first = true;
                this.second = false;
                this.previousShow = false;
                if (this.current !== 0) {
                    this.current -= 1;
                }
            },
            handleSLS () {
                this.sls = true;
                this.shell = false;
                this.module = false;
            },
            handleShell () {
                this.sls = false;
                this.shell = true;
                this.module = false;
            },
            handleModule () {
                this.sls = false;
                this.shell = false;
                this.module = true;
            },
            onMounted (editor) {
                this.editor = editor;
            },
            onCodeChange (editor) {
                console.log(this.editor.getValue());
            }
        }
    };
</script>