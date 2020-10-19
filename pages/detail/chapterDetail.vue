<template>
	<view :style="`backgroundColor: ${bgColors[bgColorIndex].color}`" class="chapter-detail">
		<!-- 点击显示菜单 -->

		<view class="menu-area" @click="showMenu">
		</view>

		<view v-if="content" class="chapter-content" :style="`fontSize: ${fontSize}rpx`" v-html="content">
		</view>
		<view class="chapter-bottom">
			<view @click="preClick" v-if="preChapterId.indexOf('.html') != -1">上一章</view>
			<view @click="nextClick" v-if="nextChapterId.indexOf('.html') != -1">下一章</view>
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
				<!-- <view class="font-setting">
					<view class="font-setting-title">
						阅读设置
					</view>
					{{ readingState }}
					<button type="default" v-if="readingState == 'notStart'" @click="startPlay">
						开始阅读
					</button>
					<button v-else-if="readingState = 'pause'" type="default" @click="continuePlay">
						继续阅读
					</button>
					<button v-else-if="readingState = 'reading'" type="primary" @click="pausePlay">
						阅读中...
					</button>
				</view> -->
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
	import {
		mapState
	} from 'vuex'
	// 解析html用的
	const cheerio = require('cheerio')

	export default {
		components: {
			uniDrawer,
			uniPopup,
			uniNumberBox
		},
		onHide() {
			if (this.reading) {
				this.play.stopSpeaking()
			}
		},
		data() {
			return {
				readingState: 'notStart',
				// 抽屉打开了吗
				isDrawerOpen: false,
				novelId: '',
				chapterId: '',
				content: "",
				// 上一张id
				preChapterId: "",
				// 下一章id
				nextChapterId: "",
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
				}],
				play: ""
			}
		},
		computed: {
			...mapState(['source'])
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
			changeEnCode(str) {
				let res = []
				for (let i = 0; i < str.length; i++) {
					// 这个不是正常的encodeUnicode 颠倒了大小端的位置
					res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-2) + ("00" + str.charCodeAt(i).toString(16)).slice(-4, -2)
				}
				let strCode = "\\u" + res.join("\\u")
				strCode = strCode.replace(/\\/g, "%")
				return unescape(strCode)
			},
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
				let data = {
					novelId: this.novelId,
					source: this.source
				}
				// 拿目录
				getChapter(data).then(res => {
					let $ = cheerio.load(res, {
						_useHtmlParser2: true
					});
					let temp = []
					if (this.source == '笔趣阁') {
						$('#list dl dd a').each((key, value) => {
							temp.push({
								name: value.attribs.title,
								id: value.attribs.href
							})
						})
					} else if (this.source == '笔趣宝') {
						$('#list dl dd a').each((key, value) => {
							temp.push({
								name: value.children[0].data,
								id: value.attribs.href
							})
						})
					}
					this.catelogList = temp
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
				let data = {
					novelId: this.novelId,
					chapterId: this.chapterId,
					source: this.source
				}
				getChapterDetail(data).then(res => {
					// // 去掉换行
					let cleanStr = res.replace(/[\r\n]/g, "")
					let booktitle = ""
					let readtitle = ""
					if (this.source == '笔趣阁') {
						this.content = cleanStr.match('<div id="content".+?</div>')[0]
						// 拿书名
						booktitle = cleanStr.match(/var booktitle = "(.+?)";/)[1]
						// 章节名字
						readtitle = cleanStr.match(/var readtitle = "(.+?)";/)[1]
						uni.setNavigationBarTitle({
							title: readtitle
						})
						// 上一章
						this.preChapterId = cleanStr.match(/var preview_page = "(.+?)";/)[1]
						// 下一章
						this.nextChapterId = cleanStr.match(/var next_page = "(.+?)";/)[1]
					} else if (this.source == '笔趣宝') {
						let title = cleanStr.match(/<title>(.+?)<\/title>/)[1]
						// 第九章 祖龙孙女_洪荒星辰道_笔趣阁
						// 小说名字
						booktitle = title.split('_')[1]
						//章节名字
						readtitle = title.split('_')[0]
						uni.setNavigationBarTitle({
							title: readtitle
						})

						this.content = cleanStr.match('<div id="content".+?</div>')[0]
						// 上一章
						this.preChapterId = cleanStr.match(/var prevpage="(.+?)"/)[1]
						// 下一章
						this.nextChapterId = cleanStr.match(/var nextpage="(.+?)"/)[1]
					}
					this.saveReadLog(booktitle, readtitle)

					// 滚动到顶部
					uni.pageScrollTo({
						scrollTop: 0,
						duration: 0
					})
				}).catch(e => {
					console.log(e)
					uni.showToast({
						title: '加载失败，请刷新',
						icon: 'none'
					})
				})
			},
			saveReadLog(booktitle, readtitle) {
				// 存下看过的小说id和章节
				let historyList = uni.getStorageSync('historyList') || []
				// 当前的小说记录存在本地了吗
				let currentNovelInStorage = false
				for (let index in historyList) {
					let history = historyList[index]
					if (history.novelId == this.novelId) {
						currentNovelInStorage = true
						history.chapterId = this.chapterId
						history.readtitle = readtitle
						history.updateTime = formatDate(new Date().getTime())
						history.source = this.source || '笔趣阁'
						let first = historyList.splice(index, 1)[0]
						historyList.unshift(first)
						break
					}
				}
				if (!currentNovelInStorage) {
					historyList.unshift({
						novelId: this.novelId,
						chapterId: this.chapterId,
						booktitle,
						readtitle,
						updateTime: formatDate(new Date().getTime()),
						source: this.source || '笔趣阁'
					})
				}
				uni.setStorageSync('historyList', historyList)
			},
			// 设置阅播放器
			// startPlay() {
			// 	let $ = cheerio.load(this.content, {
			// 		_useHtmlParser2: true
			// 	});
			// 	const cleanText = $("#content").text()
			// 	// 播放器还没初始化   就初始化播放器
			// 	var main = plus.android.runtimeMainActivity();

			// 	var SpeechUtility = plus.android.importClass('com.iflytek.cloud.SpeechUtility');

			// 	SpeechUtility.createUtility(main, "appid=53feacdd");

			// 	var SynthesizerPlayer = plus.android.importClass('com.iflytek.cloud.SpeechSynthesizer');

			// 	this.play = SynthesizerPlayer.createSynthesizer(main, null);
			// 	// 还没开始读
			// 	var receiver;
			// 	receiver = plus.android.implements('com.iflytek.cloud.SynthesizerListener', {
			// 		onEvent: function(eventType, arg1, arg2, obj) {
			// 			console.log("onEvent");
			// 		},
			// 		onSpeakBegin: function() {
			// 			console.log("开始阅读");
			// 		},
			// 		onSpeakPaused: function() {
			// 			console.log(" 暂停播放 ");
			// 		},
			// 		onSpeakResumed: function() {
			// 			console.log("继续播放");
			// 		},
			// 		// onBufferProgress: function(percent, beginPos, endPos, info) {
			// 		// 	console.log("合成进度" + percent);
			// 		// },
			// 		// onSpeakProgress: function(percent, beginPos, endPos) {
			// 		// 	console.log("播放进度" + percent);
			// 		// },
			// 		onCompleted: function(error) {
			// 			console.log("播放完毕");
			// 		}
			// 	});
			// 	this.readingState = 'reading'
			// 	// this.play.startSpeaking(this.changeEnCode(cleanText), receiver);
			// },
			// continuePlay() {
			// 	this.readingState = 'reading'
			// 	this.play.resumeSpeaking();
			// },
			// pausePlay() {
			// 	this.readingState = 'pause'
			// 	this.play.pauseSpeaking()
			// }
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
			height: 50%;
			margin-left: 10%;
			margin-top: 20%;
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
			// height: 600rpx;
			padding: 20rpx;
			padding-bottom: 50rpx;

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
