export default function customError (title, info) {
    this.$Notice.error({
        title: title,
        desc: info,
        duration: 10
    });
}