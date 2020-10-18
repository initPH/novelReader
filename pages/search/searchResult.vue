<template>
	<view class="search-result">
		<view class="" v-if="searchResult.length == 0">
			暂无记录
		</view>
		<view @click="toRead(record)" class="record" v-for="(record, index) in searchResult" :key="index">
			{{ index + 1 }} - {{ record.novelName }}
		</view>
	</view>
</template>

<script>
	import {
		searchNovel
	} from '@/api/index.js';
	export default {
		onLoad(option) {
			let keyword = option.keyword
			this.getSearchResult(keyword)
		},
		data() {
			return {
				searchResult: []
			}
		},
		methods: {
			toRead(novel) {
				const novelId = novel.novelId
				const novelName = novel.novelName
				uni.navigateTo({
					url: `/pages/detail/index?novelId=${novelId}&novelName=${novelName}`
				})
			},
			getSearchResult(keyword) {
				searchNovel({
					searchkey: keyword
				}).then(res => {
					// 替换掉换行
					let cleanStr = res.replace(/[\r\n]/g, "")
					let trPat = /<tr>.+?<\/tr>/g
					// 每一行就是一条搜索出来的记录
					let trList = cleanStr.match(trPat)
					this.searchResult = trList.map(tr => {
						let tdPat = /<td.+?<\/td>/g
						let tdList = tr.match(tdPat)
						return {
							novelName: tdList[0].match(/<td.+?><a.+?>(.+?)<\/a>/)[1],
							novelId: tdList[0].match(/href="\/(.+?)\/"/)[1],
						}
					})
				});
			}
		}
	}
</script>

<style lang="less">
	.search-result {
		padding: 0 20rpx 20rpx;
		.record {
			line-height: 50rpx;
			margin-bottom: 20rpx;
		}
	}
</style>
