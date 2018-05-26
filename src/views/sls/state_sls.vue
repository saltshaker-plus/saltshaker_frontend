<template>
    <div>
        <create-s-l-s
                :apiService="apiService"
                :projectType="projectType"
                :slsURI = "slsURI"
                :productShow="true"
                ref="childrenMethods">
        </create-s-l-s>
    </div>
</template>

<script>
    import CreateSLS from '../common-components/sls/sls-create.vue';
    export default {
        components: {
            CreateSLS
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