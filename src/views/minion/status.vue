<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" :productShow="true" ref="childrenMethods"></common-table>
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
                apiService: 'minions/status',
                showInfo: false,
                minion: [],
                tmp: '',
                // 删除数据
                delId: '',
                delIndex: '',
                result: '',
                cColumns: [
                    {
                        title: 'Minion',
                        key: 'minions_id',
                        sortable: true
                    },
                    {
                        title: '状态',
                        key: 'status',
                        sortable: true,
                        render: (h, params) => {
                            let tagColor = 'green';
                            if (params.row.status === 'down') {
                                tagColor = 'red';
                            }
                            return h('div', [
                                h('Tag', {
                                    props: {
                                        'color': tagColor
                                    }
                                }, params.row.status)
                            ]);
                        }
                    }
                ]
            };
        }
    };
</script>