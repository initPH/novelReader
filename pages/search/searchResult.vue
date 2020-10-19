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
	import { mapState } from 'vuex'
	import {
		searchNovel
	} from '@/api/index.js';
	// 解析html用的
	const cheerio = require('cheerio')

	export default {
		onLoad(option) {
			let keyword = option.keyword || '洪荒星辰道'
			this.getSearchResult(keyword)
		},
		data() {
			return {
				searchResult: []
			}
		},
		computed: {
			...mapState(['source'])
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
					keyword,
					source: this.source
				}).then(res => {
					let $ = cheerio.load(res, {
						_useHtmlParser2: true
					});
					if (this.source == '笔趣阁') {
						$('.grid tr td:nth-child(1) a').each((key, value) => {
							this.searchResult.push({
								novelName: value.children[0].data,
								novelId: value.attribs.href.split('/')[1]
							})
						})
					} else if(this.source == '笔趣宝') {
						$('a.result-game-item-title-link').each((key, value) => {
							this.searchResult.push({
								novelName: value.attribs.title,
								novelId: value.attribs.href.split('/')[2]
							})
						})
					}
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
