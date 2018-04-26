<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎登录
                </p>
                <div class="form-con">
                    <Form ref="loginForm" :model="form" :rules="rules">
                        <FormItem prop="userName">
                            <Input v-model="form.userName" placeholder="请输入用户名">
                                <span slot="prepend">
                                    <Icon :size="16" type="person"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem prop="password">
                            <Input type="password" v-model="form.password" placeholder="请输入密码">
                                <span slot="prepend">
                                    <Icon :size="14" type="locked"></Icon>
                                </span>
                            </Input>
                        </FormItem>
                        <FormItem>
                            <Button @click="handleSubmit" type="primary" long>登录</Button>
                        </FormItem>
                    </Form>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import Cookies from 'js-cookie';
export default {
    data () {
        return {
            token: '',
            form: {
                userName: '',
                password: ''
            },
            rules: {
                userName: [
                    { required: true, message: '账号不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    this.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                    let postData = {
                        'username': this.form.userName,
                        'password': this.form.password
                    };
                    this.axios.post(this.Global.serverSrc + 'login', postData).then(
                        res => {
                            if (res.data['status'] === true) {
                                let token = res.data['data'];
                                Cookies.set('user', this.form.userName);
                                // 后端返回过期时间,单位秒 转换成天
                                let expireDays = Object.values(token)[0][1] / 60 / 60 / 24;
                                Cookies.set(Object.keys(token)[0], Object.values(token)[0][0], { expires: expireDays });
                                Cookies.set('access', 0);
                                this.$router.push({
                                    name: 'home_index'
                                });
                            } else {
                                this.nerror('登录失败:', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nerror('登录失败:', errInfo);
                        });
                }
            });
        },
        // 重新定义错误消息
        nerror (title, info) {
            this.$Notice.error({
                title: title,
                desc: info,
                duration: 10
            });
        }
    }
};
</script>
