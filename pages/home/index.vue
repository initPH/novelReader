<template>
	<view class="home">

		<view class="read-historys">
			<view class="read-historys-title">
				阅读历史
			</view>
			<view class="" v-if="historyList.length  == 0">
				暂无阅读历史
			</view>
			<uni-swipe-action v-else>
				<uni-swipe-action-item v-for="(history, index) in historyList">
					<template v-slot:right>
						<view class="slide-delete" @click="deleteHistory(index)">删除</view>
					</template>
					<view class="read-history" :key="index">

						<view class="read-history-pic">
							<!-- {{ history }} -->
							<image v-if="history.source == '笔趣阁'" class="book-pic" :src="`http://www.biquge.info/files/article/image/${history.novelId.split('_')[0]}/${history.novelId.split('_')[1]}/${history.novelId.split('_')[1]}s.jpg`"></image>
							<image v-else-if="history.source == '笔趣宝'" class="book-pic" :src="`https://www.biqubao.com/cover/${history.novelId.slice(0, history.novelId.length - 3)}/${history.novelId}/${history.novelId}s.jpg`"></image>
						</view>
						<view class="read-history-detail">
							<view class="full-row">
								{{ history.booktitle }}
							</view>
							<view class="full-row">
								{{ history.readtitle }}
							</view>
							<view class="full-row">
								{{ history.updateTime || '-' }}
							</view>
							<button @click="containueRead(history)" type="primary" class="continue-read">继续阅读</button>
						</view>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
		</view>
	</view>
</template>

<script>
	import uniSwipeAction from '@/components/uni-swipe-action/uni-swipe-action.vue'
	import uniSwipeActionItem from '@/components/uni-swipe-action-item/uni-swipe-action-item.vue'
	import {
		mapMutations
	} from 'vuex'
	export default {
		components: {
			uniSwipeAction,
			uniSwipeActionItem
		},
		data() {
			return {
				historyList: []
			}
		},
		onShow() {
			this.historyList =
				uni.getStorageSync(
					'historyList') || []
		},
		methods: {
			...mapMutations(
				['SET_SOURCE']),
			deleteHistory(
				index) {
				uni.showModal({
					title: '确定删除？',
					success: (
						res) => {
						if (res.confirm) {
							this.historyList
								.splice(
									index,
									1)
							uni.setStorageSync(
								'historyList',
								this.historyList
							)
						}
					}
				})
			},
			containueRead(
				history) {
				this.SET_SOURCE(
					history.source ||
					'笔趣阁')
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
				border-bottom: 2rpx dashed #aaa;
			}

			.slide-delete {
				width: 150rpx;
				background: #f20000;
				margin: 20rpx 0;
				display: flex;
				justify-content: center;
				align-items: center;
				color: #fff;
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
					// flex-grow: 0;
					align-content: space-around;

					.full-row {
						width: 100%;
					}
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
