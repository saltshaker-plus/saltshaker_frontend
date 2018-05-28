<template>
    <div>
        <git-lab
                :apiService="apiService"
                :projectType="projectType"
                :slsURI = "slsURI"
                :productShow="true"
                ref="childrenMethods">
        </git-lab>
    </div>
</template>

<script>
    import GitLab from '../common-components/git-lab.vue';
    export default {
        components: {
            GitLab
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