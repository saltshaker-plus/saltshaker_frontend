<template>
    <div>
        <div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
        <Checkbox
                :indeterminate="indeterminate"
                :value="checkAll"
                @click.prevent.native="handleCheckAll">全选</Checkbox>
        </div>
        <CheckboxGroup v-model="checkAllGroup" @on-change="checkAllGroupChange">
            <Checkbox label="香蕉"></Checkbox>
            <Checkbox label="苹果"></Checkbox>
            <Checkbox label="西瓜"></Checkbox>
            <CheckboxGroup v-model="checkAllGroup1" @on-change="checkAllGroupChange">
            <Checkbox label="西瓜A" @click.native="handleTest"></Checkbox>
            </CheckboxGroup>
        </CheckboxGroup>

        {{checkAllGroup}}
        {{checkAllGroup1}}
    </div>
</template>
<script>
    export default {
        data () {
            return {
                indeterminate: false,
                checkAll: false,
                checkAllGroup: [],
                checkAllGroup1: []
            }
        },
        methods: {
            handleCheckAll () {
                if (this.indeterminate) {
                    this.checkAll = false;
                } else {
                    this.checkAll = !this.checkAll;
                }
                this.indeterminate = false;

                if (this.checkAll) {
                    this.checkAllGroup = ['香蕉', '苹果', '西瓜'];
                } else {
                    this.checkAllGroup = [];
                }
            },
            checkAllGroupChange (data) {
                if (data.length === 3) {
                    this.indeterminate = false;
                    this.checkAll = true;
                } else if (data.length > 0) {
                    this.indeterminate = true;
                    this.checkAll = false;
                } else {
                    this.indeterminate = false;
                    this.checkAll = false;
                }
            },
            handleTest (event, a) {
                console.log(event)
                console.log(a)
                console.log('ddddddddddddddd')
            }
        }
    }
</script>