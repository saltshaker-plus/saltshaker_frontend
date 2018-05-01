<template>
    <div>
        <execute
                :apiService="apiService"
                :apiHistory="apiHistory"
                :productShow="true"
                ref="childrenMethods">
        </execute>
    </div>
</template>

<script>
    import Execute from '../common-components/sls/sls.vue';
    export default {
        components: {
            Execute
        },
        data () {
            return {
                apiService: 'execute/shell',
                apiHistory: 'shell/history'
            };
        }
    };
</script>