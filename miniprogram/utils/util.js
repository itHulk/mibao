import _config from './configs'


const timestampToTime = (timestamp) => {
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '/';
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/';
        var D = date.getDate()< 10 ? '0'+date.getDate():date.getDate();
        var h = date.getHours() + ':';
        var m = date.getMinutes() + '';
        var s = date.getSeconds();
        return Y+M+D;
}
const navtime = (timestamp) => {
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear();
        var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
        return Y+''+M;
}
const yearMouth=(startTime)=>{
	// let startTime=1558541220
	let endTime= Math.floor((new Date()).valueOf()/1000)
	let day=(endTime-startTime)/86400
	let mouth =Math.floor(day/30.4)
	let reday =Math.floor(day%30.4)
	let remouth =Math.floor((day/30.4)%12)
	let year=Math.floor(day/365.25)
	if(year==0){
		if(reday==0){
			return mouth+'个月'
		}else{
			return mouth+'个月'+reday+'天'
		}
		
	}else {
		if(remouth==0){
			return year+'岁'
		}else{
			return year+'岁'+remouth+'月'
		}
		
	}
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

const rnd=(n,m)=>{  
    return parseInt(Math.random()*(m-n)+n);
}
//字符串切割
const strcut = str => {

	if (str.length > 10) {
		var ss = str.slice(0, 10)
		var str = ss + '...'
	}
	return str;
}

// 将秒转格式、阉割掉了小时
const	timeToFormat=(times)=>{
    var result = '00:00';
    var hour,minute,second
    if (times > 0) {
      hour = Math.floor(times / 3600);
      if (hour < 10) {
        hour = "0"+hour;
      }
      minute = Math.floor((times - 3600 * hour) / 60);
      if (minute < 10) {
        minute = "0"+minute;
      }

      second = Math.floor((times - 3600 * hour - 60 * minute) % 60);
      if (second < 10) {
        second = "0"+second;
      }
      // result = hour+':'+minute+':'+second;
			result = minute+':'+second;
    }
    return result;  
  }
	
	
//数组重新排序
const  sortId=(a,b)=>{  
		return a.id-b.id  
}

const	numtoMsg=(value) =>{
		var num=parseInt(value)
		var n=''
		if(num < 10000){
			n=num
		}else
		if(num > 9999 && num < 100000000){								
			n = (num/10000).toFixed(1)+'万'
		}else
		if(num > 99999999){
			n = (num/100000000).toFixed(1)+'亿'
		}
		return n
	}

//小程序跳转
const ToMiniProgram=(appid,path)=>{
		wx.navigateToMiniProgram({
			appId:appid,
			path: path,
			extraData: {
				foo: 'bar'
			},
			envVersion: 'release',
			success(res) {
				// 打开成功
				      // develop	开发版
      // trial	体验版
      // release	正式版
			}
		})		
	}

/**
 * 微信的接口请求方法
 * @param baseUrl   接口地址
 * @param param     接口传参
 * @param cb        回调
 */
const wxRequest = (baseUrl,param,method,cb) => {
    wx.request({
        url: baseUrl ? `${_config.baseUrl}${baseUrl}` : '',
        data: param ? param : {},
        method: method,
        header: {
            'content-type': method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded' // 默认值
        },
        success (res) {
            cb(res.data)
        },
        fail (err) {
            console.log(err)
        }
    })
};
/**
 * 弹框
 * @param obj
 * @param cb
 */
const wxShowToast = (obj,cb) => {
    wx.showToast({
        title: obj.msg,
        icon: obj.icon,
        success: (res) => {
            cb(res)
        },
        duration: obj.duration ? obj.duration : 2000
    })
};

const wlError=()=>{
	wx.showToast({
		title: '网络错误',
		icon: 'none',
		duration: 2000
	})
}
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// const formatNumber = n => {
//   n = n.toString()
//   return n[1] ? n : '0' + n
// }
const wishtxt = str => {
	if(typeof(str) !='undefined'){
		var arr=str.split("/132");
		var str1=arr.join('/0')
		return str1;
	}
	
}


module.exports = {
	numtoMsg:numtoMsg,
	wxShowToast: wxShowToast,
	strcut: strcut,
	timeToFormat:timeToFormat,
	sortId:sortId,
	wxRequest:wxRequest,
	rnd:rnd,
	wlError:wlError,
	timestampToTime:timestampToTime,
	yearMouth:yearMouth,
	navtime:navtime,
	  // formatTime,
	wishtxt
}
