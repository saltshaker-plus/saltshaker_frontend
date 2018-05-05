<template>
    <div>
        <execute
                :apiService="apiService"
                :productShow="true"
                ref="childrenMethods">
        </execute>
    </div>
</template>

<script>
    import Execute from '../common-components/execute/execute.vue';
    export default {
        components: {
            Execute
        },
        data () {
            return {
                apiService: 'execute/shell'
            };
        }
    };
</script>