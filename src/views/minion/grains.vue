<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" :productShow="true"></common-table>
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
                apiService: 'minions/grains',
                showInfo: false,
                result: '',
                cColumns: [
                    {
                        title: 'ID',
                        key: 'id',
                        sortable: true,
                        width: 110,
                        fixed: 'left'
                    },
                    {
                        title: 'OS',
                        key: 'os',
                        sortable: true,
                        width: 140,
                        render: (h, params) => {
                            return h('div', params.row.os + ' ' + params.row.osrelease);
                        }
                    },
                    {
                        title: 'fqdn',
                        key: 'fqdn',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: 'ipv4',
                        key: 'ipv4',
                        width: 110,
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.ipv4.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item);
                            })
                            );
                        }
                    },
                    {
                        title: 'CPU',
                        key: 'num_cpus',
                        width: 80,
                        sortable: true
                    },
                    {
                        title: 'GPU',
                        key: 'num_gpus',
                        width: 80,
                        sortable: true
                    },
                    {
                        title: 'cpu_model',
                        key: 'cpu_model',
                        width: 190,
                        sortable: true
                    },
                    {
                        title: 'mem_total',
                        key: 'mem_total',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'productname',
                        key: 'productname',
                        width: 110,
                        sortable: true,
                        render: (h, params) => {
                            return h('div', params.row.manufacturer + ' ' + params.row.productname);
                        }
                    },
                    {
                        title: 'saltversion',
                        key: 'saltversion',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'kernelrelease',
                        key: 'kernelrelease',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'biosversion',
                        key: 'biosversion',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'serialnumber',
                        key: 'serialnumber',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'uuid',
                        key: 'uuid',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: 'hwaddr_interfaces',
                        key: 'hwaddr_interfaces',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'biosreleasedate',
                        key: 'biosreleasedate',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'cpuarch',
                        key: 'cpuarch',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'locale_info',
                        key: 'locale_info',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'gpus',
                        key: 'gpus',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'machine_id',
                        key: 'machine_id',
                        width: 110,
                        sortable: true
                    },
                ]
            };
        },
        methods: {
            // 2018-04-18T12:51:59.321743 to yyyy-mm-dd hh:mm:ss
            convertTime (time) {
                let dt = new Date(time);
                dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
                let date = dt.toISOString().slice(0, -5).replace(/[T]/g, ' ');
                return date;
            }
        }
    };
</script>