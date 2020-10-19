<template>
	<view :style="`backgroundColor: ${bgColors[bgColorIndex].color}`" class="chapter-detail">
		<!-- 点击显示菜单 -->
		<view class="menu-area" @click="showMenu">
		</view>
		
		<view v-if="content" class="chapter-content" :style="`fontSize: ${fontSize}rpx`" v-html="content">
		</view>
		<view class="chapter-bottom">
			<view @click="preClick" v-if="!isFirstChapter">上一章</view>
			<view @click="nextClick" v-if="!isLastChapter">下一章</view>
		</view>
		<uni-drawer @change="drawerChange" ref="catelogDrawer" mode="right" :width="250">
			<scroll-view :style="`backgroundColor: ${bgColors[bgColorIndex].color};fontSize: ${fontSize}rpx`" scroll-y="" class="catelog-views">
				<view class="uni-title" v-for="(category, index) in catelogList" :key="index" @click="catelogClick(category)">{{ category.name }}</view>
			</scroll-view>
		</uni-drawer>
		<uni-popup ref="popup" type="bottom">
			<view class="bottom-setting-area">
				<view class="font-setting">
					<view class="font-setting-title">
						字体大小
					</view>
					<view class="font-setting-buttons">
						<uni-number-box :min="10" :max="100" :value="fontSize" @change="fontSizeChange"></uni-number-box>
						<view class="font-setting-button" @click="fontSizeChange(10)">
							最小
						</view>
						<view class="font-setting-button" @click="fontSizeChange(40)">
							默认
						</view>
						<view class="font-setting-button" @click="fontSizeChange(100)">
							最大
						</view>
					</view>
				</view>
				<view class="font-setting">
					<view class="font-setting-title">
						背景颜色
					</view>
					<view class="bgcolor-buttons">
						<view v-for="(bgcolor, index) in bgColors" class="bgcolor-demo bgcolor1" :class="{'active': bgColorIndex == index}"
						 :style="`backgroundColor: ${bgcolor.color}`" @click="bgColorChange(index)" :key="index">
							{{ bgcolor.name }}
						</view>

					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import uniNumberBox from "@/components/uni-number-box/uni-number-box.vue"
	import uniDrawer from "@/components/uni-drawer/uni-drawer.vue"
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import {
		getChapterDetail,
		getChapter
	} from '@/api/index.js'
	import {
		formatDate
	} from '@/util.js'
	export default {
		components: {
			uniDrawer,
			uniPopup,
			uniNumberBox
		},
		data() {
			return {
				// 抽屉打开了吗
				isDrawerOpen: false,
				novelId: '',
				chapterId: '',
				content: "",
				// 上一张id
				preChapterId: "",
				// 下一章id
				nextChapterId: "",
				// 是不是第一章  是的话就不显示上一章
				isFirstChapter: true,
				// 是否最后一章
				isLastChapter: true,
				// 目录
				catelogList: [],
				fontSize: uni.getStorageSync('fontSize') || 40,
				bgColorIndex: uni.getStorageSync('bgColorIndex') || 0,
				bgColors: [{
					color: 'rgb(247,247,247)',
					name: '磨砂白'
				}, {
					color: 'rgb(249,241,230)',
					name: '麻布色'
				}, {
					color: 'rgb(208,229,212)',
					name: '护眼绿'
				}, {
					color: 'rgb(255,227,226)',
					name: '贵妃粉'
				}, {
					color: 'rgb(200,176,128)',
					name: '羊皮纸'
				}]
			}
		},

		// 右上角目录被点击时
		onNavigationBarButtonTap(button) {
			// 如果当前是打开状态 就关闭
			if (this.isDrawerOpen) {
				this.$refs['catelogDrawer'].close()
			} else {
				this.$refs['catelogDrawer'].open()
			}
		},
		onPullDownRefresh() {
			this.getChapterDetail()
		},
		onLoad(option) {
			this.novelId = option.novelId
			this.chapterId = option.chapterId
			this.getChapterDetail()
			
			// 访问频率控制 刚刚才访问了内容  过两秒再请求
			setTimeout(() => {
				this.getCatelogList()
			}, 3000)
		},
		methods: {
			bgColorChange(colorIndex) {
				this.bgColorIndex = colorIndex
				uni.setStorageSync('bgColorIndex', colorIndex)
			},
			fontSizeChange(fontSize) {
				this.fontSize = fontSize
				uni.setStorageSync('fontSize', fontSize)
			},
			showMenu() {
				this.$refs['popup'].open()
			},
			drawerChange(isOpen) {
				this.isDrawerOpen = isOpen
			},
			getCatelogList() {
				// 拿目录
				getChapter(this.novelId).then(res => {
					let clearString = res.replace(/[\r\n]/g, "")
					// 获取所有章节的div
					let chapterList = clearString.match(/<div id="list".+?<\/div>/)[0]
					// 获取单个div
					let ddList = chapterList.match(/<dd.+?>(.+?)<\/dd>/g)
					this.catelogList = ddList.map(dd => {
						return {
							name: dd.match(/title="(.+?)">/)[1],
							id: dd.match(/href="(.+?)"/)[1]
						}
					})
				})
			},
			catelogClick(category) {
				this.chapterId = category.id
				this.$refs['catelogDrawer'].close()
				this.getChapterDetail()
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
					uni.setNavigationBarTitle({
						title: readtitle
					})
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
				}).catch(e => {
					uni.showToast({
						title: '加载失败，请刷新',
						icon: 'none'
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
		min-height: 100vh;

		.menu-area {
			position: fixed;
			width: 80%;
			height: 80%;
			margin-left: 10%;
			margin-top: 10%;
			background: transparent;
		}

		.chapter-content {
			margin-bottom: 100rpx;
		}

		.chapter-bottom {
			padding: 20rpx;
			display: flex;
			justify-content: space-between;
			color: blue;
		}

		.catelog-views {
			height: 100%;
			padding: 0 20rpx;
			font-size: 36rpx;
		}

		.bottom-setting-area {
			background: #fff;
			height: 400rpx;
			padding: 20rpx;

			.font-setting {
				&-title {
					border-bottom: 1px solid #eee;
					height: 60rpx;
					margin-bottom: 20rpx;
				}

				&-buttons {
					display: flex;
					justify-content: space-around;

					.font-setting-button {
						width: 80rpx;
						height: 80rpx;
						font-size: 30rpx;
						background: #eee;
						border-radius: 50%;
						text-align: center;
						line-height: 80rpx;
					}
				}
			}

			.bgcolor-buttons {
				display: flex;
				justify-content: space-around;

				.bgcolor-demo {
					box-sizing: border-box;
					width: 100rpx;
					height: 100rpx;
					font-size: 30rpx;
					background: #eee;
					border-radius: 50%;
					text-align: center;
					line-height: 100rpx;

					&.active {
						border: 2rpx solid #222;
					}
				}
			}
		}
	}
</style>
