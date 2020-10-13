<template>
	<view class="chapter-detail">
		<!-- <button type="default" @click="readClick">开始阅读</button> -->
		<!-- <audio src="http://tsn.baidu.com/text2audio?tex=hahaha哈哈彭浩&tok=24.1c40f2229f357978894c1d3cfa5c795b.2592000.1605194692.282335-22816144&cuid=sjhdgdgas1d21as2d1as21d&ctp=1&lan=zh&spd=5&pit=5&vol=5&per=0"controls></audio> -->
		<view class="chapter-content" v-html="content">
		</view>
		<button type="primary" @click="nextClick" v-if="!isLastChapter">下一章</button>
		<button type="primary" @click="preClick" v-if="!isFirstChapter">上一章</button>
	</view>
</template>

<script>
	import {
		getChapterDetail
	} from '@/api/index.js'
	import {
		formatDate
	} from '@/util.js'
	export default {
		data() {
			return {
				novelId: '',
				chapterId: '',
				content: "",
				// 上一张id
				preChapterId: "",
				// 下一章id
				nextChapterId: "",
				// 是不是第一章  是的话就不显示上一章
				isFirstChapter: false,
				// 是否最后一章
				isLastChapter: false,
				isReading: false,
			}
		},
		onPullDownRefresh() {
			this.getChapterDetail()
		},
		onLoad(option) {
			this.novelId = option.novelId
			this.chapterId = option.chapterId
			this.getChapterDetail()
		},
		methods: {
			readClick() {
				this.isReading = true
				uni.request({
					url: "https://openapi.baidu.com/oauth/2.0/token",
					data: {
						grant_type: "client_credentials",
						client_id: 'G3LquLUs6y0XG008Xkvyby9U',
						client_secret: "5sK30XAGzOb3FhxqyuBRDAAIlXOGdGUA"
					},
					success: (res) => {
						let token = res.data.access_token
						uni.request({
							url: 'http://tsn.baidu.com/text2audio',
							method: "post",
							data: {
								tex: "pppp哈哈",
								tok: token,
								cuid: 'sjhdgdgas1d21as2d1as21d',
								ctp: 1,
								lan: 'zh',
								spd: 5,
								pit: 5,
								vol: 5,
								per: 0
							},
							header: {
								"content-type": "application/x-www-form-urlencoded"
							},
							success: (res) => {
								let blob = new Blob([res.data], {type: "audio/mp3"})
								let url = URL.createObjectURL(blob)
								const innerAudioContext = uni.createInnerAudioContext();
								innerAudioContext.autoplay = true;
								innerAudioContext.src = url;
								innerAudioContext.onPlay(() => {
									console.log('开始播放');
								});
								innerAudioContext.onError((aaa) => {
									console.log(aaa)
								});
							}
						})
					}
				})
				// 5L2g5aW95ZGA
			},
			preClick() {
				this.chapterId = this.preChapterId
				this.getChapterDetail()
			},
			nextClick() {
				this.chapterId = this.nextChapterId
				this.getChapterDetail()
			},
			getChapterDetail() {
				getChapterDetail(this.novelId, this.chapterId).then(res => {
					// 获取到数据 停止下拉刷新
					uni.stopPullDownRefresh()

					// 去掉换行
					let cleanStr = res.replace(/[\r\n]/g, "")
					// 拿到content
					let content = cleanStr.match('<div id="content".+?</div>')
					this.content = content[0]

					// 拿书名 
					let booktitle = cleanStr.match(/var booktitle = "(.+?)";/)[1]
					// 章节名字
					let readtitle = cleanStr.match(/var readtitle = "(.+?)";/)[1]
					// 保存阅读记录
					this.saveReadLog(booktitle, readtitle)


					// 设置上一页 下一页
					let bottom = cleanStr.match(/<div class="bottem".+?下一章<\/a>/)[0]
					// 匹配到 下一页的url  章节id是 url最后一部分
					let preUrl = bottom.match(/投推荐票.+?<a href="(.+?)".+?上一章<\/a>/)[1]
					let nextUrl = bottom.match(/章节目录.+?<a href="(.+?)".+?下一章<\/a>/)[1]
					if (preUrl) {
						this.isFirstChapter = preUrl.indexOf('.html') == -1
						this.preChapterId = preUrl.split('/').slice(-1)[0]
					}
					if (nextUrl) {
						this.isLastChapter = nextUrl.indexOf('.html') == -1
						this.nextChapterId = nextUrl.split('/').slice(-1)[0]
					}

					// 滚动到顶部
					uni.pageScrollTo({
						scrollTop: 0,
						duration: 0
					})
				})
			},
			saveReadLog(booktitle, readtitle) {
				// 存下看过的小说id和章节
				let historyList = uni.getStorageSync('historyList') || []
				// historyList.findIndex((history) => history.novelId == this.novelId )
				// 当前的小说记录存在本地了吗
				let currentNovelInStorage = false
				for (let history of historyList) {
					if (history.novelId == this.novelId) {
						currentNovelInStorage = true
						history.chapterId = this.chapterId
						history.readtitle = readtitle
						history.updateTime = formatDate(new Date().getTime())
					}
				}
				if (!currentNovelInStorage) {
					historyList.push({
						novelId: this.novelId,
						chapterId: this.chapterId,
						booktitle,
						readtitle,
						updateTime: formatDate(new Date().getTime())
					})
				}
				uni.setStorageSync('historyList', historyList.sort(function(x, y) {
					return new Date(y.updateTime).getTime() - new Date(x.updateTime).getTime()
				}))
			}
		}
	}
</script>

<style lang="less">
	.chapter-detail {
		padding: 0 20rpx 100rpx;

		.chapter-content {
			margin-bottom: 100rpx;
		}
	}
</style>
