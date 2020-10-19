import request from '@/request.js'

// 搜索小说
export const searchNovel = (data = {}) => {
	let postData = {}
	let url = ""
	if (data.source == '笔趣阁') {
		url = 'http://www.biquge.info/modules/article/search.php'
		postData = {
			searchkey: data.keyword
		}
	} else if (data.source == '笔趣宝') {
		url = 'https://www.biqubao.com/search.php'
		postData = {
			q: data.keyword
		}
	}
	return request({
		url,
		method: 'get',
		data: postData
	})
}

// 获取小说章节
export const getChapter = (data = {}) => {
	let postData = {}
	let url = ""
	if (data.source == '笔趣阁') {
		url = `http://www.biquge.info${data.novelId}`
	} else if (data.source == '笔趣宝') {
		url = `https://www.biqubao.com${data.novelId}`
	}
	return request({
		url,
		method: 'get'
	})
}

// 获取章节详情
export const getChapterDetail = (data = {}) => {
	console.log(data)
	let postData = {}
	let url = ""
	if (data.source == '笔趣阁') {
		url = `http://www.biquge.info${data.novelId}${data.chapterId}`
	} else if (data.source == '笔趣宝') {
		url = `https://www.biqubao.com${data.chapterId}`
	}
	return request({
		url,
		method: 'get'
	})
}
