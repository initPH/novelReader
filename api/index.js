import request from '@/request.js'

// 搜索小说
export const searchNovel = (data) => {
	return request({
		url: 'http://www.biquge.info/modules/article/search.php',
		method: 'get',
		data
	})
}

// 获取小说章节
export const getChapter = (novelId) => {
	return request({
		url: `http://www.biquge.info/${novelId}/`,
		method: 'get'
	})
}

// 获取章节详情
export const getChapterDetail = (novelId,chaperId) => {
	return request({
		url: `http://www.biquge.info/${novelId}/${chaperId}`,
		method: 'get'
	})
}
