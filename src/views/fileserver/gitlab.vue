<template>
    <div>
        <git-lab
                :apiService="apiService"
                :projectType="projectType"
                :slsURI = "slsURI"
                :productShow="true"
                ref="childrenMethods"
                @getFileContentEvent="getFileContentEvent"
                @getFilePathEvent="getFilePathEvent">
           <div slot="right">
                <Card dis-hover>
                    <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="58">
                        <FormItem label="路径" prop="target">
                            <CheckboxGroup v-model="formValidate.target">
                                 {{filePath[0].path}}
                            </CheckboxGroup>
                        </FormItem>
                        <FormItem label="文件名" prop="target">
                            <CheckboxGroup v-model="formValidate.target">
                                 <Input placeholder="输入文件名"></Input>
                            </CheckboxGroup>
                        </FormItem>
                        <FormItem label="内容" prop="target">
                            <CheckboxGroup v-model="formValidate.target">
                                  <Tabs>
                            <TabPane label="从文本输入框创建">
                                <MonacoEditor
                                    height="400"
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
                            </TabPane>
                            <TabPane label="封装SLS">
                                <Upload
                                    multiple
                                    type="drag"
                                    action="//jsonplaceholder.typicode.com/posts/">
                                    <div style="padding: 20px 0">
                                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                        <p>点击或者拖拽上传</p>
                                    </div>
                                </Upload>
                            </TabPane>
                            <TabPane label="从文件创建">
                                <Upload
                                    multiple
                                    type="drag"
                                    action="//jsonplaceholder.typicode.com/posts/">
                                    <div style="padding: 20px 0">
                                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                        <p>点击或者拖拽上传</p>
                                    </div>
                                </Upload>
                            </TabPane>
                        </Tabs>
                            </CheckboxGroup>
                        </FormItem>
                        <FormItem>
                            <Button type="primary" @click="handleSubmit('formValidate')">提交</Button>
                            <Button type="ghost" @click="handleReset('formValidate')">重置</Button>
                        </FormItem>
                    </Form>
                </Card>
           </div>
        </git-lab>
    </div>
</template>

<script>
    import GitLab from '../common-components/git-lab.vue';
    import MonacoEditor from 'vue-monaco-editor';
    export default {
        components: {
            GitLab,
            MonacoEditor
        },
        data () {
            return {
                apiService: 'gitlab',
                projectType: 'state_project',
                slsURI: 'execute/sls',
                fileContent: '',
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
        methods: {
            getFileContentEvent: function (fileContent) {
                this.fileContent = fileContent;
                this.reload();
            },
            getFilePathEvent: function (filePath) {
                this.filePath = filePath;
            },
            onMounted (editor) {
                this.editor = editor;
            },
            onCodeChange (editor) {
                console.log(this.editor.getValue());
            },
            // 重载编辑框
            reload () {
                clearTimeout(time);
                let time = setTimeout(() => {
                    this.$refs.vscode.destroyMonaco();
                    this.$refs.vscode.createMonaco();
                }, 1);
            }
        }
    };
</script>