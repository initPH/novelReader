<template>
	<view class="chapters">
		<view class="chapter" v-for="(chapter, index) in chapters" :key="index" @click="toRead(chapter.id)">
			{{ chapter.chapter }}
		</view>
	</view>
</template>

<script>
	import {
		getChapter
	} from '@/api/index.js'
	import {
		mapState
	} from 'vuex'
	// 解析html用的
	const cheerio = require('cheerio')
	export default {
		onLoad(option) {
			this.novelId = option.novelId
			this.getChapters()
			if (option.novelName) {
				uni.setNavigationBarTitle({
					title: option.novelName
				})
			}
		},
		onPullDownRefresh() {
			this.getChapters()
		},
		data() {
			return {
				novelId: "",
				chapters: []
			}
		},
		computed: {
			...mapState(['source'])
		},
		// 右上角目录被点击时
		onNavigationBarButtonTap(button) {
			this.chapters.reverse()
		},
		methods: {
			getChapters() {
				let data = {
					novelId: this.novelId,
					source: this.source
				}
				getChapter(data).then(res => {
					uni.stopPullDownRefresh()
					let $ = cheerio.load(res, {
						_useHtmlParser2: true
					});
					let temp = []
					if (this.source == '笔趣阁') {
						$('#list dl dd a').each((key, value) => {
							temp.push({
								chapter: value.attribs.title,
								id: value.attribs.href
							})
						})
					} else if (this.source == '笔趣宝') {
						$('#list dl dd a').each((key, value) => {
							temp.push({
								chapter: value.children[0].data,
								id: value.attribs.href
							})
						})
					}
					this.chapters = temp
				}).catch(e => {
					uni.stopPullDownRefresh()
				})
			},
			toRead(chaperId) {
				uni.navigateTo({
					url: `/pages/detail/chapterDetail?novelId=${this.novelId}&chapterId=${chaperId}`
				})
			}
		}
	}
</script>

<style lang="less">
	.chapters {
		padding: 10rpx;

		.chapter {
			line-height: 50rpx;
		}
	}
</style>
