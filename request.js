let loadCount = 0
const showLoading = () => {
	if (loadCount == 0) {
		uni.showLoading({
			title: '加载中...'
		})
	}
	loadCount++
}
const hideLoading = () => {
	if (loadCount > 0) {
		loadCount--
	}
	if (loadCount == 0) {
		uni.hideLoading()
	}
}

export default ({
	url,
	data,
	method = 'get'
}) => {
	showLoading()
	return new Promise((resolve, reject) => {
		uni.request({
			url,
			data,
			method,
			timeout: 20000,
			success(res) {
				resolve(res.data)
			},
			fail(e) {
				reject(e)
			},
			complete() {
				hideLoading()
			}
		})
	})
}
