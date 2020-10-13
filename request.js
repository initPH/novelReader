export default ({
	url,
	data,
	method = 'get'
}) => {
	uni.showLoading({
	})
	return new Promise((resolve, reject) => {
		uni.request({
			url,
			data,
			method,
			timeout: 10000,
			success(res) {
				resolve(res.data)
			},
			fail(res) {
				reject(res)
			},
			complete() {
				uni.hideLoading()
			}
		})
	})
}
