<template>
    <div>
        <common-s-l-s
                :apiService="apiService"
                :apiHistory="apiHistory"
                :productShow="true"
                ref="childrenMethods">
        </common-s-l-s>
    </div>
</template>

<script>
    import CommonSLS from '../common-components/execute/execute.vue';
    export default {
        components: {
            CommonSLS
        },
        data () {
            return {
                apiService: 'execute/shell',
                apiHistory: 'shell/history'
            };
        }
    };
</script>