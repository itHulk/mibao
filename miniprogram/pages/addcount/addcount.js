//index.js
const util = require('../../utils/util.js')
const app = getApp()
const db = wx.cloud.database()
let arrfilePath = [],//页面图片列表
	getcouldurl = [],
	allobj,//返回的所有数据
	changeList=[],
	oldNum = [],//保留原图的下标
	oldimgurl = [],//保留原图的地址
	allobjimgList = [],//新创建出来的保留原图的详情
	imgidList = [], //只有图片id
	newimgidList = [], 
	urlList = [],
	upimgNum = 0,
	yearMouth = util.navtime((new Date()).valueOf());
Page({
	data: {
		imgList: [],
		isdel: false,
		locationname: '无',
		isnanfang: false,
		textvalue: '',
		istest: true,
		StatusBar: app.globalData.StatusBar, //系统给的值
		CustomBar: app.globalData.CustomBar, //小程序头部的值 
		isBarShow: true,
		isSunbit: false, //判断是否处于刚刚点击上传
		isRes: false, //判断为修改内容页面
		firstImg:'' //封面图
	},
	onLoad: function(e) {
		if (e.resid) {
			//点击编辑进入页面
			this.setData({
				isRes: true
			})
			//获取页面内容
			this.getresInfo(e.resid)
		}
		this.setData({
			istest: app.globalData.isTest
		})
	},
	onUnload: function() {
		//页面卸载清空数据
		this.setData({
			imgList: [],
			isdel: false,
			locationname: '无',
			isnanfang: false,
			textvalue: '',
			firstImg:''
		})
		arrfilePath = []//页面图片列表
		getcouldurl = []
			allobj = []//返回的所有数据
			changeList=[]
			oldNum=[]//保留原图的下标
			oldimgurl=[]//保留原图的地址
			allobjimgList=[]//新创建出来的保留原图的详情
			newimgidList=[];
			urlList = [];//上传到服务器之后的列表
			upimgNum = 0; //上传的图片的计数器
	},
	//点击修改进入页面，加载内容
	getresInfo: function(id) {
		let that = this
		db.collection(app.globalData.collection).where({
				_id: id
			}).orderBy('progress', 'desc')
			.get({
				success: function(res) {
					that.changeresData(res.data[0].obj)
					allobj = res.data[0];//返回的所有数据
					// console.log('返回值', res.data[0])
				}
			})

	},
	//从后台取回来的数据进行转换
	changeresData: function(newobj) {
		// console.log('服务器返回的值',newobj);
		let newarrlist = [];//新建
		for (let i = 0; i < newobj.imgList.length; i++) {
			newarrlist.push(newobj.imgList[i].tempFileURL)
		}
		this.setData({
			textvalue: newobj.textValue,
			locationname: newobj.addName,
			isnanfang: newobj.isNanfang,
			imgList: newarrlist//赋值给页面
		})
		arrfilePath = newarrlist;//赋值给页面
		imgidList = newobj.imgidList;//imgid表单

	},
	// 选择图片
	chooseImg: function() {
		this.hidedel()
		let that = this
		wx.chooseImage({
			count: 9,
			sizeType: ['original', 'compressed'],
			sourceType: ['album'],
			success: function(res) {
				arrfilePath = arrfilePath.concat(res.tempFilePaths)
				that.setData({
					imgList: arrfilePath
				})
				// console.log('选择后图片列表', that.data.imgList)
			},
			fail: e => {
				console.error(e)
			}
		})
	},

	doupImg: function() {
		upimgNum++; //计数器 
		wx.showToast({
			title: '正在上传第'+upimgNum+'张照片',
			icon: 'loading',
			mask:true,
			duration:600000
		})
		let that = this;
		let timestamp = (new Date()).valueOf();
		// console.log(arrfilePath.length,upimgNum)
		console.log('上传服务器之前的图片链接',arrfilePath);		
		if(arrfilePath.length>=upimgNum){
			// console.log(arrfilePath.length,upimgNum)
			let filePath = arrfilePath[upimgNum-1];
			let httpstr = filePath.slice(0, 5);
			if(upimgNum==1){
				this.isoldImg(arrfilePath[0]);
			}
			if (httpstr == 'https') {
				urlList.push(arrfilePath[upimgNum-1]);
				// 增加判断是否最后一个
				// console.log(urlList.length , arrfilePath.length)
				if (urlList.length == arrfilePath.length) {
					// console.log('临时地址换成云ID', urlList) //云ID ["cloud://jingchu-1d00o.6a69-jingchu-1d00o-1259566091/1565846764556.jpg"]
					this.getCouldurl(urlList);
				}else{
					this.doupImg();
				}
			} else {
				let cloudPath = yearMouth+'/'+String(timestamp) + String(upimgNum-1) + arrfilePath[upimgNum-1].match(/\.[^.]+?$/)[0];
				wx.cloud.uploadFile({
					cloudPath,
					filePath,
					success: res => {
						urlList.push(res.fileID)
						// console.log(res.fileID,'res.fileID');
						//云ID ["cloud://jingchu-1d00o.6a69-jingchu-1d00o-1259566091/1565846764556.jpg"]
						// 增加判断是否最后一个，必须放在回调中
						// console.log(urlList,'urlList');
						// console.log(urlList.length , arrfilePath.length)
						if (urlList.length == arrfilePath.length) {
							// console.log('临时地址换成云ID', urlList) 
							this.getCouldurl(urlList)
						}else{
							this.doupImg();
						}
					},
					fail: e => {
						wx.showToast({
							icon: 'none',
							title: '图片上传失败',
						})
						return
					}
				})
			}
		}
	},

	isoldImg(src){
		let that = this;
		console.log(src.indexOf('https'))
		if(src.indexOf('https')>-1){
			wx.downloadFile({
			  url: src, //仅为示例，并非真实的资源
			  success (res) {
				  console.log('下载的图',res)
			    // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
			    if (res.statusCode === 200) {
				  that.upfirstImg(res.tempFilePath);
			    }
			  }
			})
		}else{
			that.upfirstImg(src);
		}
	},

	upfirstImg(src){
		let that=this;
		console.log('进入图片压缩',src)
		let timestamp = (new Date()).valueOf();
		let cloudPath = 'firstimg/'+yearMouth+'/'+timestamp + 'firstimg' + arrfilePath[0].match(/\.[^.]+?$/)[0];
		wx.compressImage({
		  src, // 图片路径
		  quality: 40, // 压缩质量
		  success:function(res){
			  console.log('封面图',res);
			  wx.cloud.uploadFile({
			  	cloudPath,
			  	filePath:res.tempFilePath,
			  	success: res => {
			  		console.log(res.fileID,'封面图的res.fileID');
					that.setData({
						firstImg: res.fileID
					})
			  	},
			  	fail: e => {
			  		wx.showToast({
			  			icon: 'none',
			  			title: '图片上传失败',
			  		})
			  		return
			  	},
			  	complete: () => {
			  		wx.hideLoading()
			  	}
			  })
		  },
		  fail:function(res){
			  console.log(res,'压缩错误')
		  }
		})
	},
	
	//获取返回的云图片id换图片的https地址
	getCouldurl: function(list) {
		console.log('临时地址换成云ID只有id地址与https地址',list)
		for(let i=0; i<list.length; i++){
			let filePath = list[i];
			let httpstr = filePath.slice(0, 5);
			if (httpstr == 'https') {
				oldNum.push(i);
				oldimgurl.push(list[i]);//不需要换地址的
			}else{
				changeList.push(list[i]);//需要进行换地址的图片
			}
			if(i == list.length-1){	
				//将原来图的云ID换成图的详情
				if(oldimgurl.length>0){
					//判断有没有之前的图片
					for(let e=0; e<oldimgurl.length; e++){
						for(let m=0; m<allobj.obj.imgList.length; m++){
							if(oldimgurl[e] == allobj.obj.imgList[m].tempFileURL){
								// 保留下来原图的详细信息
								newimgidList.push(allobj.obj.imgList[m].fileID);
								allobjimgList.push(allobj.obj.imgList[m]);
								
							}
						}
					}
				}
				console.log('保留下来原图的详细信息',allobjimgList)
				console.log('需要转化的数据',changeList)
				this.getTempFileURL(changeList);
				
				
			}
		}
		
		
	},
	//获取返回的云图片id换图片的https地址
	getTempFileURL:function(List){
		let that=this;
		newimgidList=newimgidList.concat(List)
		console.log('接受到的转化数据',List)
	    if(List.length>0){
			console.log('有需要转化的')
			wx.cloud.getTempFileURL({
				fileList: List,
				success: res => {
					getcouldurl = res.fileList;//返回新图片有详细信息
					// console.log('返回的新图片详细信息', getcouldurl)
					// console.log('判断是否为修更新状态', that.data.isRes)
					if(that.data.isRes){
						//判断是否为更新
						// console.log('确认为修改页面')
						if(oldNum.length<1){
							// console.log('没保留原图')
							that.resDoc(getcouldurl);
						}else{
							// console.log('保留原图')
							for(let i=0; i <oldNum.length; i++){					
								getcouldurl.splice(oldNum[i],0,allobjimgList[i]);
								
							}
							console.log('将原图与新图信息合并',getcouldurl)
							that.resDoc(getcouldurl);
							
						}
					}else{
					
						if (getcouldurl.length == changeList.length) {
							
							that.addcount(changeList)
						}else{
							console.log('id换取链接时出错')
						}
					}
				},
				fail: err => {
					// handle error
				}
			})
		}else{
			console.log('没上传新图')
			console.log('保留原图')
			for(let i=0; i <oldNum.length; i++){					
				getcouldurl.splice(oldNum[i],0,allobjimgList[i]);			
			}
			console.log('将原图与新图信息合并',getcouldurl)
			that.resDoc(getcouldurl);
		}
	},
	
	//保存
	addcount: function(idList) {
		let that = this;
		this.hidedel()
		let creatData = util.timestampToTime((new Date()).valueOf())
		let creatMd = creatData.slice(5)
		let startYear = parseInt(creatData.slice(0, 4))
		let nafmsg = ''
		let dataType = 0
		if (creatMd == '06/09') {
			let n = startYear - 2018;
			nafmsg = n + '周年结婚纪念日';
			dataType = 1;
		} else if (creatMd == '12/02') {
			let mage = startYear - 1990;
			nafmsg = '超人妈妈' + mage + '岁生日';
			dataType = 2;
		} else if (creatMd == '03/25') {
			let bage = startYear - 1989;
			nafmsg = '奶爸' + bage + '岁生日';
			dataType = 3;
		} else if (creatMd == '0/23') {
			let xage = startYear - 2019;
			nafmsg = '南方' + xage + '岁生日';
			dataType = 4
		} else if (creatMd == '01/01') {
			nafmsg = '新年快乐!';
			dataType = 4
		} else if (creatMd == '12/25') {
			nafmsg = '圣诞快乐';
			dataType = 4;
		}

		let navtime = util.navtime((new Date()).valueOf());
		let obj = {
			textValue: this.data.textvalue,
			addName: this.data.locationname,
			isNanfang: this.data.isnanfang,
			imgList: getcouldurl, //有图片完成信息
			timesTamp: (new Date()).valueOf(),
			nfAge: nafmsg.length > 0 ? nafmsg : util.yearMouth(1558541220),
			creatData,
			navtime,
			userInfo: app.globalData.userInfo,
			imgidList:idList, //只有图片id不启用
			dataType,
			firstImg:this.data.firstImg
		}
		const db = wx.cloud.database();
		console.log('提交的数据',obj);
		db.collection('navDate').where({
			navtime: navtime // 填入当前用户 openid
		}).get().then(res => {
			console.log(res.data)
			let timedata = res.data
			if (timedata.length < 1) {
				db.collection('navDate').add({
					data: {
						navtime: navtime
					},
					success: res => {
						console.log(res)
					},
					fail: err => {
						console.log(err)
					}
				})
			}
		})



		db.collection(app.globalData.collection).add({
			data: {
				obj
			},
			success: res => {
				wx.showToast({
					title: '保存成功！',
				})
				that.setData({
					isSunbit: false
				})
				var pages = getCurrentPages(); // 当前页面
				var beforePage = pages[pages.length - 2]; // 前一个页面
				wx.navigateBack({
					success: function() {
						beforePage.onLoad(); // 执行前一个页面的onLoad方法
					}
				});
				// wx.redirectTo({
				//  url: '../list/list'
				// })
			},
			fail: err => {
				console.log(err)
				wx.showToast({
					icon: 'none',
					title: '保存数据库失败！'
				})
			}
		})

		console.log('obj', obj)
	},

	//更新一条数据

	resDoc: function(geturl) {
		console.log('修改的')
		let that=this;
		let obj = {
			textValue: this.data.textvalue,
			addName: this.data.locationname,
			isNanfang: this.data.isnanfang,
			imgList: geturl, //有图片完成信息
			imgidList:newimgidList, //只有图片id
			timesTamp: allobj.obj.timesTamp,
			nfAge:allobj.obj.nfAge,
			creatData:allobj.obj.creatData,
			navtime:allobj.obj.navtime,
			userInfo: allobj.obj.userInfo,	
			dataType:allobj.obj.dataType,
			firstImg:this.data.firstImg
		}
		console.log('最后提交数据',obj)
		wx.hideLoading()
		db.collection(app.globalData.collection).doc(allobj._id).update({
			// data 传入需要局部更新的数据
			data: {
				obj
			},
			success: res => {
				wx.showToast({
					title: '保存成功！',
				})
				that.setData({
					isSunbit: false
				})
				wx.reLaunch({
				 url: '../list/list'
				})
			},
			fail: err => {
				console.log(err)
				wx.showToast({
					icon: 'none',
					title: '保存数据库失败！'
				})
			}
		})
	},
	//删除图片
	delimg: function(e) {
		let index = e.currentTarget.dataset.index
		let arr = this.data.imgList
		arr.splice(index, 1);
		this.setData({
			imgList: arr
		})
		arrfilePath = arr;
		this.hidedel()
	},
	showdel: function() {
		this.setData({
			isdel: true
		})
	},
	hidedel: function() {
		this.setData({
			isdel: false
		})
	},
	//选择地理位置
	chooseLocation: function() {
		this.hidedel()
		let that = this
		wx.chooseLocation({
			success(res) {
				console.log('地图位置', res.name)
				that.setData({
					locationname: res.name
				})
			}
		})
	},
	//选择是否为南方 的照片
	seltype: function() {
		this.hidedel()
		this.setData({
			isnanfang: !this.data.isnanfang
		})
	},

	bindKeyInput: function(e) {
		this.hidedel()
		let value = e.detail.value;
		this.setData({
			textvalue: e.detail.value
		})
	},
	//点击保存
	sunbit: function() {
		let value = this.data.textvalue;
		let photo = this.data.imgList;
		if (value.length < 1) {
			wx.showToast({
				title: '你确定不想吐槽下么？',
				icon: 'none'
			})
			return
		}
		if (photo.length < 1) {
			wx.showToast({
				title: '你还没有上传靓照',
				icon: 'none'
			})
			return
		}
		if (!this.data.isSunbit) {
			// if (this.data.isRes) {
				//为修改逻辑
			// 	console.log('修改')
			// 	this.doupImg()
			// } else {
				//天剑逻辑
				this.doupImg()

			// }
			this.setData({ //防止连续点击
				isSunbit: true
			})

		}

	},

	backPrv: function() {
		wx.navigateBack({
			delta: 1
		})
	},
	// toBack返回上一页
	toBack: function(e) {
		wx.navigateBack({
			delta: 1
		})
	}


})
