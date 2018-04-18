<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService"></common-table>
    </div>
</template>

<script>
    import CommonTable from '../common-components/table/table.vue';
    export default {
        components: {
            CommonTable
        },
        data () {
            return {
                apiService: 'log',
                cColumns: [
                    {
                        title: '用户',
                        key: 'user',
                        sortable: true
                    },
                    {
                        title: 'ID',
                        key: 'id',
                        sortable: true
                    },
                    {
                        title: '操作对象',
                        key: 'action_object',
                        sortable: true
                    },
                    {
                        title: '操作类型',
                        key: 'action_type',
                        sortable: true
                    },
                    {
                        title: '时间',
                        key: 'time',
                        sortable: true
                    }
                ]
            };
        }
    };
</script>