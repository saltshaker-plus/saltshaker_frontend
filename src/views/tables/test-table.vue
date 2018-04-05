<style lang="less">
    @import '../../styles/common.less';
    @import './components/table.less';
</style>

<template>
    <div>
        <Row class="margin-top-10">
            <p :total=ff>dddd{{ results }}</p>
        </Row>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                results: this.results,
                ff: this.aa()
            };
        },
        methods: {
            aa () {
                this.axios.defaults.withCredentials = true; // 带着cookie
                this.axios.get('http://192.168.44.128:5000/saltshaker/api/v1.0/user').then(res => { this.results = res.data['users']['user']; });
                this.ff = 100;
                // return this.results;
            }
        }
    };
</script>