let vender = {};

vender.nError = function (title, info) {
    this.$Notice.error({
        title: title,
        // 替换<>避免被解析为html标签
        desc: info.toString().replace(/<|>/g, ''),
        duration: 10
    });
};

export default vender;
