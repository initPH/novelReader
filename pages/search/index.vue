<template>
	<view class="novel-reader-home">
		<input class="novel-search-input" type="text" value="" placeholder="请输入书名" @confirm="searchConfirm" v-model="keyword"
		 confirm-type="search" maxlength="20" :auto-focus="true" />
		<view class="search-history">
			<view class="search-history-title">
				搜索历史
			</view>
			<view class="history-keywords">
				<view @click="historyClick(history)" class="history-keyword" v-for="(history, index) in searchHistorys" :key="index">
					{{ history }}
					<icon @click.stop="deleteHistory(history, index)" class="delete-icon" type="clear" :size="20" />
				</view>
			</view>
		</view>

	</view>
</template>

<script>
	export default {
		data() {
			return {
				keyword: '',
				searchHistorys: uni.getStorageSync('searchHistorys') || []
			};
		},
		methods: {
			historyClick(history) {
				this.keyword = history
				this.searchConfirm()
			},
			deleteHistory(history, index) {
				uni.showModal({
					title: `确定删除历史："${history}"?`,
					success: ({
						confirm
					}) => {
						if (confirm) {
							this.searchHistorys.splice(index, 1)
							uni.setStorageSync('searchHistorys', this.searchHistorys)
						}
					}
				})
			},

			searchConfirm() {
				if (this.keyword) {
					let historyIndex = this.searchHistorys.indexOf(this.keyword)
					// 如果当前搜索的词 在历史里面
					if (historyIndex != -1) {
						this.searchHistorys.splice(historyIndex, 1)
					}
					this.searchHistorys.unshift(this.keyword)
					uni.setStorageSync('searchHistorys', this.searchHistorys)

					uni.navigateTo({
						url: `/pages/search/searchResult?keyword=${this.keyword}`
					})
				}
			}
		}
	};
</script>

<style lang="less">
	.novel-reader-home {
		padding: 15rpx;

		.search-history {
			padding: 20rpx;

			.search-history-title {
				border-bottom: 1px solid #aaa;
			}

			.history-keywords {
				display: flex;
				margin: 20rpx 0;
				flex-wrap: wrap;

				.history-keyword {
					margin: 10rpx;
					background: rgb(242, 242, 242);
					padding: 10rpx;
					border-radius: 30rpx;
					font-size: 32rpx;
					display: flex;
					align-items: center;

					.delete-icon {
						margin-left: 20rpx;
					}
				}
			}
		}

		.novel-search-input {
			background: #eee;
			border-radius: 20rpx;
			height: 60rpx;
			padding-left: 20rpx;
		}


	}
</style>
