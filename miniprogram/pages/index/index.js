//index.js
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    avatarUrl: '',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
		passData:'',
		islogin:false,
		isFirst:false,
		isTest:true,
  },

  onLoad: function() {
		let that=this
		wx.getSetting({
		  success: res => {
		    if (res.authSetting['scope.userInfo']) {
					// console.log('已经授权')
		      wx.getUserInfo({
		        success: res => {								
		          that.setData({
								islogin:true,
		            avatarUrl: res.userInfo.avatarUrl,
		            userInfo: res.userInfo
		          })					
							app.globalData.userInfo = res.userInfo
              // console.log('getbaseData')
							this.getbaseData()
							this.onGetOpenid()
		        }
		      })
		    }else{
          this.getbaseData()
        }
		  }
		})	
  },


  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
				logged:true,
				islogin:true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
			app.globalData.userInfo =e.detail.userInfo
			this.getbaseData()
			this.onGetOpenid()
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        // console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid  
				db.collection('homeId').where({
					_openid:res.result.openid 
				}).get({
					success: function(res) {	
						// let data = res.data 
						// if(data.length<1){
						// 	app.globalData.isFirst=true
						// }else{
						// 	app.globalData.isFirst=false
						// 	wx.redirectTo({
						// 		url: '../list/list'
						// 	})
						// 	// return false
						// }
					}
				})	
      },
      fail: err => {
      }
    })
  },
	
	getbaseData:function(){
    
		let  that=this
		db.collection('baseData').where({
		}).get({
			success: function(res) {	
	
        let data = res.data
				app.globalData.isTest=data[0].isTest
				app.globalData.md5=data[0].password
				app.globalData.touxiang=data[0].istouxiang
				that.setData({
				  isTest:data[0].isTest
				})
				if(app.globalData.isTest){
					app.globalData.collection='testData'					
						wx.redirectTo({
						  url: '../list/list'
						})
				}else{
					app.globalData.collection='listData'
				}
			},
			fail :function(res) {	
				console.log(res)
			},
		})
	},
	bindKeyInput:function(e){
		let value=e.detail.value	
		this.setData({
				passData: e.detail.value
		})
		if(value.length=='8'){
			this.userlogin()
		}
	},
	userlogin:function(){
    console.log(this.data.passData,'this.data.passData');
		console.log(app.globalData.md5,'app.globalData.md5');
		if(this.data.passData == app.globalData.md5){
			db.collection('homeId').add({
			  data: {
			    openId: app.globalData.openid
			  },
			  success: res => {	   
			    wx.showToast({
			      title: '登录成功！',
						icon:'success'
			    })
					setTimeout(function(){
						wx.redirectTo({
						  url: '../list/list'
						})
					},1000)
					
			    // console.log('homeID', res._id)
			  },
			  fail: err => {
			    wx.showToast({
			      icon:'none',
			      title: '网络错误'
			    })
			  
			  }
			})
		}else{
			wx.showToast({
				title:"您好像记错日子了吧",
				icon: 'none'
			})
		}
		
	},



})
