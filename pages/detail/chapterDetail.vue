<template>
	<view class="chapter-detail">
		<view class="chapter-content"  v-html="content">
			
		</view>
		<button type="default" @click="preClick">上一章</button>
		<button type="default" @click="nextClick">下一章</button>
	</view>
</template>

<script>
	import {
		getChapterDetail
	} from '@/api/index.js'
	export default {
		data() {
			return {
				novelId: '10_10229',
				chapterId: '5007972.html',
				content: "",
				// 上一张id
				preChapterId: "",
				// 下一章id
				nextChapterId: ""
			}
		},
		onLoad(option) {
			// this.novelId = option.novelId 
			// this.chapterId = option.chapterId 
			
			this.getChapterDetail()
		},
		methods: {
			getChapterDetail() {
				getChapterDetail(this.novelId, this.chapterId).then(res => {
					// 去掉换行
					let cleanStr = res.replace(/[\r\n]/g, "")
					// 拿到content
					let content = cleanStr.match('<div id="content".+?</div>')
					
					let bottom =  cleanStr.match(/<div class="bottom".+?<\/div>/)
					console.log(bottom)
					
					
					this.preChapterId = bottom.match(/<a href="(.+?)".+?上一章<\/a>/)
					this.nextChapterId = bottom.match(/<a href="(.+?)".+?下一章<\/a>/)
					console.log(this.preChapterId)
					console.log(this.nextChapterId)
					
					this.content = content[0]
					
				})
			}
		}
	}
</script>

<style>
	.chapter-detail {
		padding: 0 20rpx;
	}
</style>
