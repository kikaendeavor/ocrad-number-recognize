(function(){
	"use strict"
	var os_name = null;

	mui.init({
		statusBarBackground: "#f00",
		swipeBack: true, //启用右滑关闭功能
		//监听回退和菜单键
		keyEventBind: {
			backbutton: true,	//默认true，即启用监听
			menubutton: true 	//默认true，即启用监听
		}
	});

	mui.plusReady(function(){
		os_name = plus.os.name.toLowerCase();
		// 设置屏幕亮度
		plus.screen.setBrightness(0.5);

		//仅支持竖屏显示
		plus.screen.lockOrientation("portrait-primary");
		mui(".btn-start").on("tap", "#btn-start-rec", function(){
			captureImage();
		});
	});

	// 拍照
	function captureImage(){
		var cmr = plus.camera.getCamera();
		//字符串数组，摄像头支持的拍照分辨率
		var res = cmr.supportedImageResolutions;
		var res_set = getResolution(res);
		//字符串数组，摄像头支持的拍照文件格式
		var fmt = cmr.supportedImageFormats;
		//alert("分辨率: "+res+"-----照片格式: "+fmt);

		document.getElementById("number-result").innerText = "识别中..."+res_set;
		cmr.captureImage(
			function(path){
				//拍照成功
				plus.device.beep(1);
				//压缩图片
				plus.zip.compressImage({
					src: path,
					dst: path,
					overwrite: true,
					quality: 10	/*1~100,默认压缩比是50%*/
				},function() {
					//将相对路劲转为绝对路径
					path = plus.io.convertLocalFileSystemURL(path);
					//alert(path);

					var img = new Image();
					img.src = path;
					document.getElementById("number-result").appendChild(img);

					img.onload = function(){
						OCRAD(img, {
							numeric: true
						}, function(result){
							document.getElementById("number-result").innerText = result;
							//console.log("识别结果："+result);
							//拨号
							//plus.device.dial(result, true);
						});
					}
				},function(error) {
					mui.alert("压缩错误，请重试！" + error.message);
				});
			},
			function( error ) {
				mui.alert( "图像采集失败: " + error.message);
			},
			{resolution:res_set,format:fmt[0]}
		);
	}

	function getResolution(resolutions){
		var perfect_resolution = null;
		for(var i = 0; i < resolutions.length; i++){
			var resolution = resolutions[i].split("*");
			if(resolution[0] <= 320){
				perfect_resolution = resolutions[i];
				break;
			}
		}

		if(!perfect_resolution){
			perfect_resolution = resolutions[resolutions.length - 1];
		}

		return perfect_resolution;
	}

	//首页返回键处理
	//处理逻辑：1秒内，连续两次按返回键，则退出应用；
	var first = null;
	mui.back = function() {
		/*if (showMenu) {
			closeMenu();
		} else {*/
			//首次按键，提示‘再按一次退出应用’
			if (!first) {
				first = new Date().getTime();
				mui.toast('再按一次退出应用');
				setTimeout(function() {
					first = null;
				}, 1000);
			} else {
				if (new Date().getTime() - first < 1000) {
					plus.runtime.quit();
				}
			}
		//}
	};
})(window);
