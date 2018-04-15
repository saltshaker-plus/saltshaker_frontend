<template>
    <Dropdown>
        <Button type="primary">
            显示条数
            <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
            <DropdownItem>
                <div @click="customPage(5)">5</div>
            </DropdownItem>
            <DropdownItem>
                <div @click="customPage(10)">10</div>
            </DropdownItem>
            <DropdownItem>
                <div @click="customPage(50)">50</div>
            </DropdownItem>
            <DropdownItem>
                <div @click="customPage(100)">100</div>
            </DropdownItem>
            <DropdownItem divided>
                <div @click="customPage(pageCount)">全部</div>
            </DropdownItem>
        </DropdownMenu>
    </Dropdown>
</template>

<script>
    export default {
        name: 'NumPage'
    };
</script>
