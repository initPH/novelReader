<template>
	<view class="novel-reader-home">
		<input class="novel-search-input" type="text" value="" placeholder="请输入书名" @confirm="getSearchList" v-model="keyWord"
		 confirm-type="search" maxlength="20" :auto-focus="true" />
		<view class="search-result">
			<view @click="toRead(record.novelId)" class="record" v-for="(record, index) in searchResult" :key="index">
				{{ record.novelName }}
				({{ record.novelId }})
			</view>
		</view>
	</view>
</template>

<script>
	import {
		searchNovel
	} from '@/api/index.js';
	export default {
		data() {
			return {
				keyWord: '斗破苍穹',
				searchResult: []
			};
		},
		onLoad() {
		},
		onShow() {

			this.getSearchList()
		},
		methods: {
			toRead(novelId) {
				uni.navigateTo({
					url: '/pages/detail/index?novelId='+ novelId
				})
			},
			getSearchList() {
				if (this.keyWord) {
					searchNovel({
						searchkey: this.keyWord
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
	};
</script>

<style lang="less">
	.novel-reader-home {
		padding: 15rpx;

		.novel-search-input {
			background: #eee;
			border-radius: 20rpx;
			height: 60rpx;
			padding-left: 20rpx;
		}
		.record {
			line-height: 50rpx;
		}
	}
</style>
