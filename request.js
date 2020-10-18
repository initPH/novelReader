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
	loadCount--
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
			timeout: 500,
			success(res) {
				resolve(res.data)
			},
			fail(e) {
				console.log(e)
				reject(e)
			},
			complete() {
				hideLoading()
			}
		})
	})
}
