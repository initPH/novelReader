<template>
	<view class="home">

		<view class="read-historys">
			<view class="read-historys-title">
				阅读历史
			</view>
			<view class="read-history" v-for="(history, index) in historyList" :key="index">
				<view class="read-history-pic">
					<image class="book-pic"  :src="`http://www.biquge.info/files/article/image/${history.novelId.split('_')[0]}/${history.novelId.split('_')[1]}/${history.novelId.split('_')[1]}s.jpg`" mode=""></image>
				</view>
				<view class="read-history-detail">
					<view class="">
						{{ history.booktitle }}
					</view>
					<view class="">
						{{ history.readtitle }}
					</view>
					<view class="">
						{{ history.updateTime || '-' }}
					</view>
					<button @click="containueRead(history)" type="primary" class="continue-read">继续阅读</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				historyList: []
			}
		},
		onShow() {
			this.historyList = uni.getStorageSync('historyList') || []
		},
		methods: {
			containueRead(history) {
				uni.navigateTo({
					url: `/pages/detail/chapterDetail?novelId=${history.novelId}&chapterId=${history.chapterId}`
				})
			}
		}
	}
</script>

<style lang="less">
	.home {
		padding: 0 20rpx;

		.read-historys {
			font-size: 34rpx;

			&-title {
				font-size: 40rpx;
				border-bottom: 2rpx dashed #eee;
			}

			.read-history {
				margin: 20rpx;
				padding: 20rpx;
				min-height: 300rpx;
				// line-height: 200rpx;
				box-shadow: 0rpx 0rpx 20rpx #aaa;
				display: flex;
				
				&-pic {
					width: 250rpx;
					.book-pic {
						width: 250rpx;
						height: 100%;
					}
				}
				&-detail {
					padding: 0 20rpx;
					display: flex;
					flex-wrap: wrap;
					align-content: space-around;
				}
				.continue-read {
					line-height: 80rpx;
					width: 240rpx;
					height: 80rpx;
				}
			}
		}
	}
</style>
