<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    欢迎使用
                </p>
                <div class="form-con">
                    <Tabs v-model="tab">
                        <TabPane label="登录" name="login">
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
                                            <Icon :size="16" type="locked"></Icon>
                                        </span>
                                    </Input>
                                </FormItem>
                                <FormItem>
                                    <Button @click="handleSubmit" type="primary" long>登录</Button>
                                </FormItem>
                            </Form>
                        </TabPane>
                        <TabPane label="注册" name="register">
                            <Form ref="registerForm" :model="registerForm" :rules="registerRules">
                                <FormItem prop="userName">
                                    <Input v-model="registerForm.userName" placeholder="输入用户名">
                                        <span slot="prepend">
                                            <Icon :size="16" type="person"></Icon>
                                        </span>
                                    </Input>
                                </FormItem>
                                 <FormItem prop="mail">
                                     <Input v-model="registerForm.mail" placeholder="输入你的邮箱">
                                        <span slot="prepend">
                                            <Icon :size="16" type="email"></Icon>
                                        </span>
                                     </Input>
                                </FormItem>
                                <FormItem prop="password">
                                    <Input type="password" v-model="registerForm.password" placeholder="请输入密码，至少6位字符" >
                                        <span slot="prepend">
                                            <Icon :size="16" type="locked"></Icon>
                                        </span>
                                    </Input>
                                </FormItem>
                                <FormItem prop="rePassword">
                                    <Input type="password" v-model="registerForm.rePassword" placeholder="请再次输入新密码" >
                                        <span slot="prepend">
                                            <Icon :size="16" type="unlocked"></Icon>
                                        </span>
                                    </Input>
                                </FormItem>
                                <FormItem>
                                    <Button @click="handleRegister" type="primary" long>注册</Button>
                                </FormItem>
                            </Form>
                        </TabPane>
                    </Tabs>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import Cookies from 'js-cookie';
import jsEncrypt from 'jsencrypt/bin/jsencrypt';
export default {
    data () {
        const valideRePassword = (rule, value, callback) => {
            if (value !== this.registerForm.password) {
                callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        };
        return {
            token: '',
            publicKey: this.RSA(),
            tab: 'login',
            form: {
                userName: '',
                password: ''
            },
            rules: {
                userName: [
                    { required: true, message: '用户名不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'blur' }
                ]
            },
            registerForm: {
                userName: '',
                password: '',
                mail: ''
            },
            registerRules: {
                userName: [
                    { required: true, message: '用户名不能为空', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, message: '请至少输入6个字符', trigger: 'blur' }
                ],
                rePassword: [
                    { required: true, message: '请再次输入密码', trigger: 'blur' },
                    { validator: valideRePassword, trigger: 'blur' }
                ],
                mail: [
                    { required: true, message: '邮箱不能为空', trigger: 'blur' },
                    { type: 'email', message: '无效的邮箱格式', trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    // 使用rsa对密码进行加密
                    let jse = new jsEncrypt();
                    jse.setPublicKey(this.publicKey);
                    let passwordRsa = jse.encrypt(this.form.password);
                    this.$store.commit('setAvator', 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3448484253,3685836170&fm=27&gp=0.jpg');
                    let postData = {
                        'username': this.form.userName,
                        'password': passwordRsa
                    };
                    this.axios.post(this.Global.serverSrc + 'login', postData).then(
                        res => {
                            if (res.data['status'] === true) {
                                let token = res.data['data'];
                                Cookies.set('user', this.form.userName);
                                // 后端返回过期时间,单位秒 转换成天
                                let expireDays = Object.values(token)[0][1] / 60 / 60 / 24;
                                Cookies.set(Object.keys(token)[0], Object.values(token)[0][0], { expires: expireDays });
                                Cookies.set('tag', Object.keys(token)[0]);
                                Cookies.set('access', 0);
                                this.$router.push({
                                    name: 'home_index'
                                });
                            } else {
                                this.nError('登录失败:', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nError('登录失败:', errInfo);
                        });
                }
            });
        },
        handleRegister () {
            this.$refs.registerForm.validate((valid) => {
                if (valid) {
                    // 使用rsa对密码进行加密
                    let jse = new jsEncrypt();
                    jse.setPublicKey(this.publicKey);
                    let passwordRsa = jse.encrypt(this.registerForm.password);
                    let postData = {
                        'username': this.registerForm.userName,
                        'password': passwordRsa,
                        'mail': this.registerForm.mail
                    };
                    this.axios.post(this.Global.serverSrc + 'user/register', postData).then(
                        res => {
                            if (res.data['status'] === true) {
                                this.$Message.success('注册成功！');
                                this.tab = 'login';
                                this.$refs['registerForm'].resetFields();
                            } else {
                                this.nError('注册失败:', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nError('注册失败:', errInfo);
                        });
                }
            });
        },
        // 重新定义错误消息
        nError (title, info) {
            this.$Notice.error({
                title: title,
                desc: info,
                duration: 10
            });
        },
        // 获取rsa 公钥
        RSA () {
            this.axios.get(this.Global.serverSrc + 'rsa').then(
                res => {
                    if (res.data['status'] === true) {
                        this.publicKey = res.data['data'];
                    } else {
                        this.nError('加密失败:', res.data['message']);
                    }
                },
                err => {
                    let errInfo = '';
                    try {
                        errInfo = err.response.data['message'];
                    } catch (error) {
                        errInfo = err;
                    }
                    this.nError('加密失败:', errInfo);
                });
        }
    }
};
</script>
