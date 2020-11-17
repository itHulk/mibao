//index.js
const util = require('../../utils/util.js')
const app = getApp()
const db = wx.cloud.database()
let pageNum = 0
Page({
	data: {
		countList: [],
		leftarr: [],
		rightarr: [],
		isBottom: false,
		timeList: [], //时间导航
		istest: true,
		showNavbox: 'hidenavBox',
		StatusBar: app.globalData.StatusBar,
		CustomBar: app.globalData.CustomBar,
		isBarShow: true,
		Custom: app.globalData.Custom,
		hasUserInfo: false,
		canIUse: wx.canIUse('button.open-type.getUserInfo'),
		TabCur: 1,
		scrollLeft: 0
	},
	onLoad: function() {

		wx.showToast({
			title: "疯狂加载中...",
			icon: 'loading'
		})
		pageNum = 0
		this.getList()
		this.setData({
			istest: app.globalData.isTest,
			isBottom: false
		})


	},
	onShow: function() {

	},
	//页面滑动到底部
	scrolltolower(e){
		console.log('到底了')
		console.log(this.data.isBottom)
		if (!this.data.isBottom) {
			pageNum++
			// console.log(pageNum)
			this.getPagelist(pageNum)
		}
	},
	onPullDownRefresh() {
		console.log('下拉刷新')
		wx.showNavigationBarLoading() //在标题栏中显示加载
		wx.setBackgroundTextStyle({
			textStyle: 'dark' // 下拉背景字体、loading 图的样式为dark
		})
		pageNum = 0
		this.getList()
		this.setData({
			isBottom: false
		})
		wx.hideNavigationBarLoading();
		// 停止下拉动作
		wx.stopPullDownRefresh();
	},
	navindex: function() {
		this.setData({
			isBottom: false
		})
		pageNum = 0
		this.getList()
		this.hideModal()
	},

	getList: function() {
		let that = this

		db.collection(app.globalData.collection)
			.orderBy('obj.timesTamp', 'desc')
			.limit(6)
			.get().then((res) => {
				let oldarr = res.data;
				let leftarr = [];
				let rightarr = [];
				for (let i = 0; i < oldarr.length; i++) {
					if (i % 2 == 0) {
						leftarr.push(oldarr[i])
					} else {
						rightarr.push(oldarr[i])
					}
				}
				that.setData({
					leftarr: leftarr,
					rightarr: rightarr
				})
				wx.hideToast()
			})
			.catch(console.error)

	},
	getPagelist: function(n) {
		let that = this
		let pagecurr = 6 * n
		db.collection(app.globalData.collection)
			.orderBy('obj.timesTamp', 'desc')
			.skip(pagecurr)
			.limit(6)
			.get().then((res) => {
				let oldarr = res.data
				let leftarr = that.data.leftarr
				let rightarr = that.data.rightarr
				for (let i = 0; i < oldarr.length; i++) {
					if (i % 2 == 0) {
						leftarr.push(oldarr[i])
					} else {
						rightarr.push(oldarr[i])
					}
				}
				that.setData({
					leftarr: leftarr,
					rightarr: rightarr
				})
				if (oldarr.length < 6) {
					that.setData({
						isBottom: true
					})
				}
			})
			.catch(console.error)
	},


	showNav: function(e) {
		let that = this
		if (this.data.showNavbox == 'navBox') {
			that.setData({
				showNavbox: 'hidenavBox'
			})
		} else {
			db.collection('navDate').where({}).get({
				success: function(res) {
          let resdata=res.data;
					that.setData({
						showNavbox: 'navBox',
            timeList: resdata.reverse()
					})
					// console.log(res.data)
				},
				fail: function(res) {
					console.log(res)
				},
			})
		}

	},
	gettimeList: function(e) {
		console.log(e.currentTarget.dataset.time)
		let that = this
		db.collection(app.globalData.collection).where({
				'obj.navtime': e.currentTarget.dataset.time
			}).orderBy('obj.timesTamp', 'desc')
			.get({
				success: function(res) {
					that.setData({
						leftarr: [],
						rightarr: []
					})
					let oldarr = res.data
					let leftarr = that.data.leftarr
					let rightarr = that.data.rightarr
					for (let i = 0; i < oldarr.length; i++) {
						if (i % 2 == 0) {
							leftarr.push(oldarr[i])
						} else {
							rightarr.push(oldarr[i])
						}
					}
					that.setData({
						leftarr: leftarr,
						rightarr: rightarr
					})
					if (oldarr.length > 6) {
						that.setData({
							isBottom: true
						})
					} else {
						that.setData({
							isBottom: false
						})
					}
					that.hideModal()

				}

			})
	},
	toDetails: function(e) {
		console.log()
		wx.navigateTo({
			url: `../details/details?id=${e.currentTarget.dataset.id}`
		})
	},
	addcount: function() {
		wx.navigateTo({
			url: '../addcount/addcount'
		})
	},
	//用户分享操作		-----------------------------------------------
	onShareAppMessage: function(res) {
		return {
			title: `米宝小帅哥`,
			path: `/pages/index/index`,
			imageUrl: `../../images/life.png`,
		}
	},
	//滑动触底
	onReachBottom: function(e) {
		console.log('到底了')
		console.log(this.data.isBottom)
		if (!this.data.isBottom) {
			pageNum++
			console.log(pageNum)
			this.getPagelist(pageNum)
		}
	},
	// onPageScroll(e) {
	// 	if (this.data.showNavbox != 'hidenavBox') {
	// 		this.setData({
	// 			showNavbox: 'hidenavBox',
	// 		})
	// 	}
	// },
	showModal(e) {
		this.showNav();
		this.setData({
			modalName: e.currentTarget.dataset.target
		})
	},
	hideModal(e) {
		this.setData({
			modalName: null
		})
	},

})
