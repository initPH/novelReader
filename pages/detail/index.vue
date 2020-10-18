<template>
	<view class="chapters">
		<view class="chapter" v-for="(chapter, index) in chapters" :key="index" @click="toRead(chapter.id)">
			{{ chapter.name }}
		</view>
	</view>
</template>

<script>
	import {
		getChapter
	} from '@/api/index.js'
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
		data() {
			return {
				novelId: "",
				chapters: []
			}
		},
		methods: {
			getChapters() {
				getChapter(this.novelId).then(res => {
					let clearString = res.replace(/[\r\n]/g, "")
					// 获取所有章节的div
					let chapterList = clearString.match(/<div id="list".+?<\/div>/)[0]
					// 获取单个div
					let ddList = chapterList.match(/<dd.+?>(.+?)<\/dd>/g)
					this.chapters = ddList.map(dd => {
						return {
							name: dd.match(/title="(.+?)">/)[1],
							id: dd.match(/href="(.+?)"/)[1]
						}
					})
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
