<template>
    <div>
        <common-table
                :cColumns="cColumns"
                :apiService="apiService"
                @getProductEvent="getProductEvent"
                ref="childrenMethods"
                :productShow="true">
            <Button slot="create" type="primary" @click="add('formValidate')">创建Job</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName" width="600px">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="65">
                    <FormItem label="Job名" prop="name">
                        <Input v-model="formValidate.name" placeholder="输入Job名"></Input>
                    </FormItem>
                    <FormItem label="描述" prop="description">
                        <Input v-model="formValidate.description" placeholder="输入描述"></Input>
                    </FormItem>
                    <FormItem label="目标" prop="target">
                        <Select v-model="formValidate.target" multiple>
                            <Option v-for="item in targetData" :value="item.id" :key="item.id" placeholder="选择目标">{{ item.name }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="并行数" prop="concurrent">
                        <InputNumber :min="0" v-model="formValidate.concurrent"></InputNumber>
                    </FormItem>
                    <FormItem label="周期">
                        <RadioGroup v-model="formValidate.period">
                            <Radio label="once">一次</Radio>
                            <Radio label="period">周期性</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="时间">
                        <Row>
                            <Col span="9">
                                <FormItem prop="date">
                                    <DatePicker type="date" :options="optionsDate" placeholder="Select date" v-model="formValidate.date"></DatePicker>
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
                    <FormItem label="类型">
                        <RadioGroup v-model="formValidate.type">
                            <span @click="handleSLS()"><Radio label="sls">SLS</Radio></span>
                            <span @click="handleShell()"><Radio label="shell">Shell</Radio></span>
                            <!--<span @click="handleModule()"><Radio label="module">Module</Radio></span>-->
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="SLS" prop="sls" v-if="slsShow">
                        <Input v-model="formValidate.sls" disabled placeholder="点击下面树型结构获取SLS文件"></Input>
                    </FormItem>
                    <FormItem label="Git分支" prop="" v-if="slsShow">
                        <Select v-model="branchName">
                            <Option v-for="item in branchData" :value="item" :key="item">{{ item }}</Option>
                        </Select>
                        <Tree :data="fileTree" :load-data="loadData" @on-select-change="handleContent"></Tree>
                    </FormItem>
                    <FormItem label="Shell" prop="shell" v-if="shellShow">
                        <MonacoEditor
                            height="400"
                            whith="100%"
                            language="yaml"
                            srcPath="dist"
                            :code="formValidate.shell"
                            :options="options"
                            :highlighted="highlightLines"
                            :changeThrottle="100"
                            theme="vs-dark"
                            @mounted="onMounted"
                            @codeChange="onCodeChange"
                            ref="vscode"
                            >
                        </MonacoEditor>
                    </FormItem>
                    <!--<FormItem label="Module" prop="module" v-if="moduleShow">-->
                        <!--<Select v-model="branchName">-->
                            <!--<Option v-for="item in branchData" :value="item" :key="item">{{ item }}</Option>-->
                        <!--</Select>-->
                        <!--<Tree :data="fileTree" :load-data="loadData" @on-select-change="handleContent"></Tree>-->
                    <!--</FormItem>-->
                </Form>
                <div slot="footer">
                    <!--<Button type="ghost" @click="handleReset('formValidate')" style="margin-left: 8px">重置</Button>-->
                    <Button type="text" @click="handleCancel()" style="margin-left: 8px">取消</Button>
                    <!--<Button type="text" @click="previous()" style="margin-left: 8px" v-show="previousShow">上一步</Button>-->
                    <!--<Button type="primary" @click="next()">下一步</Button>-->
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
                apiService: 'period',
                productData: [],
                productId: '',
                // 删除数据
                delId: '',
                delIndex: '',
                // 编辑数据
                formView: false,
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
                slsShow: true,
                shellShow: false,
                moduleShow: false,
                // 关闭清理定时刷新
                timer: null,
                cColumns: [
                    {
                        title: 'Job 名',
                        key: 'name',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', [
                                h('Tooltip', {
                                    props: {
                                        content: params.row.id,
                                        transfer: true,
                                        placement: 'top-start'
                                    }
                                }, params.row.name)
                            ]);
                        }
                    },
                    {
                        title: '描述',
                        key: 'description',
                        sortable: true
                    },
                    {
                        title: '目标',
                        key: 'target',
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.target.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item.name);
                            })
                            );
                        }
                    },
                    {
                        title: '类型',
                        key: 'type',
                        sortable: true
                    },
                    {
                        title: '周期',
                        key: 'period',
                        sortable: true
                    },
                    {
                        title: '创建时间',
                        key: 'timestamp'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        sortable: true,
                        render: (h, params) => {
                            let tagColor = 'green';
                            if (params.row.status.id === 0) {
                                tagColor = 'red';
                            }
                            return h('div', [
                                h('Tag', {
                                    props: {
                                        'color': tagColor
                                    }
                                }, params.row.status.name)
                            ]);
                        }
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 260,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.formView = true;
                                            this.optionType = 'edit';
                                            this.optionTypeName = '编辑';
                                            this.id = params.row.id;
                                            this.formValidate.name = params.row.name;
                                            this.formValidate.description = params.row.description;
                                            this.formValidate.date = params.row.date;
                                            this.formValidate.time = params.row.time;
                                            this.formValidate.period = params.row.period;
                                            this.formValidate.concurrent = params.row.concurrent;
                                            this.formValidate.type = params.row.type;
                                            if (params.row.type === 'sls') {
                                                this.handleSLS();
                                            } else {
                                                this.handleShell();
                                                this.reload();
                                            }
                                            this.formValidate.sls = params.row.sls;
                                            this.formValidate.shell = params.row.shell;
                                            this.formValidate.target = params.row.target.map(item => {
                                                return item.id;
                                            });
                                            this.formView = true;
                                        }
                                    }
                                }, '编辑'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: '确定要删除 ' + params.row.name + ' 吗?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.id;
                                            this.delIndex = params.index;
                                            this.del();
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            size: 'small'
                                        }
                                    }, '删除')
                                ]),
                                h('Button', {
                                    props: {
                                        type: 'default',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.optionType = 'edit';
                                            this.optionTypeName = '编辑';
                                            this.id = params.row.id;
                                            this.formValidate = params.row;
                                        }
                                    }
                                }, '暂停'),
                                h('Button', {
                                    props: {
                                        type: 'default',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.id = params.row.id;
                                            this.handleReopen();
                                        }
                                    }
                                }, '重开'),
                                h('Button', {
                                    props: {
                                        type: 'default',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            let query = {id: params.row.id};
                                            this.$router.push({
                                                name: 'task',
                                                query: query
                                            });
                                        }
                                    }
                                }, '详情')
                            ]);
                        }
                    }
                ],
                optionsDate: {
                    disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
                },
                // 表单验证
                formValidate: {
                    name: '',
                    description: '',
                    target: [],
                    sls: '',
                    shell: '',
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
                        { required: true, type: 'string', message: 'State SLS 不能为空', trigger: 'blur' }
                    ],
                    date: [
                        { required: true, type: 'date', message: '请选择日期', trigger: 'change' }
                    ],
                    time: [
                        { required: true, type: 'string', message: '请选择时间', trigger: 'change' }
                    ],
                    shell: [
                        { required: true, type: 'string', message: 'Shell 代码不能为空', trigger: 'blur' }
                    ]
                },
                options: {
                    selectOnLineNumbers: false,
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
            nError (title, info) {
                this.$refs.childrenMethods.nError(title, info);
            },
            // 添加展示
            add (name) {
                this.handleReset(name);
                this.optionType = 'add';
                this.optionTypeName = '创建';
                this.formView = true;
            },
            handleCancel () {
                this.formView = false;
            },
            // 表单提
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        // 编辑
                        if (this.optionType === 'edit') {
                            this.axios.put(this.Global.serverSrc + 'period/' + this.id + '?product_id=' + this.productId,
                                this.formValidate).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nError('Edit Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nError('Edit Failure', errInfo);
                                });
                        } else {
                            // 添加
                            this.axios.post(this.Global.serverSrc + 'period?product_id=' + this.productId,
                                this.formValidate).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('成功！');
                                        this.tableList();
                                    } else {
                                        this.nError('Add Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nError('Add Failure', errInfo);
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
                            this.nError('Get Info Failure', res.data['message']);
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
                                this.nError('Get Info Failure', errInfo);
                            }
                        } catch (error) {
                            errInfo = err;
                            this.nError('Get Info Failure', errInfo);
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
                this.axios.get(this.Global.serverSrc + 'gitlab/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=/&branch=' + this.branchName).then(
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
            handleReopen () {
                this.axios.put(this.Global.serverSrc + 'period/reopen/' + this.id + '?product_id=' + this.productId,
                    this.formValidate).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('成功！');
                        } else {
                            this.nError('Reopen Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Reopen Failure', errInfo);
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
                if (filePath.length !== 0 && filePath[0]['type'] !== 'tree') {
                    this.filePath = filePath[0]['path'];
                    this.formValidate.sls = filePath[0]['path'];
                } else {
                    this.formValidate.sls = '';
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
            handleSLS () {
                this.slsShow = true;
                this.shellShow = false;
                this.moduleShow = false;
            },
            handleShell () {
                this.slsShow = false;
                this.shellShow = true;
                this.moduleShow = false;
            },
            handleModule () {
                this.slsShow = false;
                this.shellShow = false;
                this.moduleShow = true;
            },
            onMounted (editor) {
                this.editor = editor;
            },
            onCodeChange (editor) {
                this.formValidate.shell = this.editor.getValue();
            },
            // 重载编辑框
            reload () {
                clearTimeout(time);
                let time = setTimeout(() => {
                    this.$refs.vscode.destroyMonaco();
                    this.$refs.vscode.createMonaco();
                }, 1);
            }
        },
        // 定时刷新
        mounted () {
            this.timer = setInterval(this.$refs.childrenMethods.tableList, 5000);
        },
        // 关闭销毁
        beforeDestroy () {
            clearInterval(this.timer);
        }
    };
</script>