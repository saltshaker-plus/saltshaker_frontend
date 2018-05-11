<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <div>
        <Row class="margin-top-10">
            <Col span="24">
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
        name: 'CommonSLS',
        data () {
            return {
                code: '',
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
        methods: {
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
            onMounted (editor) {
                this.editor = editor;
            },
            onCodeChange (editor) {
                console.log(this.editor.getValue());
            }
        }
    };
</script>
