<template>
    <div>
        <common-s-l-s
                :apiService="apiService"
                :projectType="projectType"
                :productShow="true"
                ref="childrenMethods">
        </common-s-l-s>
    </div>
</template>

<script>
    import CommonSLS from '../common-components/sls/sls.vue';
    export default {
        components: {
            CommonSLS
        },
        data () {
            return {
                apiService: 'gitlab',
                projectType: 'state_project'
            };
        }
    };
</script>