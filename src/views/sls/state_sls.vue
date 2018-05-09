<template>
    <div>
        <common-s-l-s
                :apiService="apiService"
                :projectType="projectType"
                :slsURI = "slsURI"
                :productShow="true"
                ref="childrenMethods">
        </common-s-l-s>
    </div>
</template>

<script>
    import CommonSLS from '../common-components/sls/sls-manage.vue';
    export default {
        components: {
            CommonSLS
        },
        data () {
            return {
                apiService: 'gitlab',
                projectType: 'state_project',
                slsURI: 'execute/sls'
            };
        }
    };
</script>