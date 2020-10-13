export default ({
	url,
	data,
	method = 'get'
}) => {
	return new Promise((resolve, reject) => {
		// if (method.toLowerCase() == 'get') {
		// 	data = {...data, '_t': new Date().getTime()}
		// }
		uni.request({
			url,
			data,
			method,
			success(res) {
				resolve(res.data)
			},
			fail(res) {
				reject(res)
			}
		})
	})
}
