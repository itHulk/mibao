//index.js
/* 
详情页面
*/
const util = require('../../utils/util.js')
const app = getApp()
const db = wx.cloud.database()
Page({
  data: {
		data:{},
		obj:{},
		imgNum:0,
		showdel:false,
		istest:true,
		StatusBar: app.globalData.StatusBar,
		CustomBar: app.globalData.CustomBar,
		isBarShow: true,
		focusBlur: 0, // 顶部封面图 - 模糊度
		focusOpacity: 1, // 顶部封面图 - 透明度
		barBg: false, // 顶部状态栏 - 背景色
  },

  onLoad: function(e) {
		console.log(app.globalData.openid,this.data.data)
		this.getcount(e.id)
		this.setData({
			imgNum:util.rnd(1,11),
			istest:app.globalData.isTest
		})
		
  },
    
	// 从数据库获取数据  
	getcount:function(id){
		let that=this
		db.collection(app.globalData.collection).doc(id).get({
			success: function(res) {
				console.log(res,'详情页获取的数据');
				that.setData({
					data:res.data,
					obj:res.data.obj
				})
				if(app.globalData.openid==res.data._openid){
					that.setData({
						showdel:true
					})
				}else{
					that.setData({
						showdel:false
					})
				}
			}
		})
	},
	// 点击图片放大
	previewImage:function(e){
		let newImgarr = this.data.obj.imgList;
		let urlarr = [];
		for(let i=0; i<newImgarr.length; i++){
			urlarr.push(newImgarr[i].tempFileURL);
		}
		wx.previewImage({
			current:e.currentTarget.dataset.url,
			urls: urlarr // 需要预览的图片http链接列表
		})
	},
	
	// 头部返回按钮
	backPrv:function(){
		wx.navigateBack({
			delta: 1
		})
	},
	
  // 监听页面滑动事件
  onPageScroll(e) {
    const px = 500 / 750 * wx.getSystemInfoSync().windowWidth;
    let scrollNum = parseFloat(e.scrollTop / px).toFixed(2);
    let focusBlur = parseInt(scrollNum * 30);
	// console.log(scrollNum)
    if (scrollNum < 0.7) {
      this.setData({
        focusBlur,
        barBg: false
      })
    } else {
      this.setData({
        barBg: true
      })
    }

  },
  	// toBack
	toBack: function (e) {
		console.log('toBack');
		wx.navigateBack({
			delta: 1
		})
	},
	
	// 删除图文
	delDoc:function(){
		let that=this
		wx.showModal({
			title: '提示',
			content: '是否删除该组图文？',
			success (res) {
				if (res.confirm) {
					db.collection(app.globalData.collection).doc(that.data.data._id).remove()
					.then(()=>{
						wx.showToast({
							title:'删除成功！',
							icon:'success'
						})
						setTimeout(function(){
							wx.redirectTo({
							  url: '../list/list'
							})
						},1000)
					})
					.catch(console.error)
					
					wx.cloud.deleteFile({
						fileList: that.data.obj.imgidList
					}).then(res => {
						// handle success
						console.log('删除数据库照片',res)
					}).catch(error => {
						// handle error
					})
				} else if (res.cancel) {
					
				}
			}
		})
	},
	
	// 编辑图文
	resDoc:function(){
		let that=this
			wx.showModal({
				title: '提示',
				content: '是否编辑该组图文？',
				success (res) {
					if (res.confirm) {
						wx.navigateTo({
							url: `../addcount/addcount?resid=${that.data.data._id}`
						})
					} else if (res.cancel) {
						
					}
				}
			})
		
	}


})
