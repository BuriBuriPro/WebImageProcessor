var template = null;
// 创建ImgDataObj存放获取了RGBA的值的对象
function ImgDataObj(){
	// 用数组存放RGBA，方便处理
	var red = [],
		green = [],
		blue = [],
		alpha = [];
	this.rgba = [red, green, blue, alpha];
	this.length = 0;
	this.width = 0;
	this.height = 0;
}

// 存储canvas中图像数据的对象的一些公有方法
ImgDataObj.prototype = {
	constructor : ImgDataObj,
	saveImgData : function(imgData){
		// 存放获取的图像的数据
		var i = 0, j = 0;
		for(; j < imgData.data.length; i ++, j += 4){
			this.rgba[0][i] = imgData.data[j];
			this.rgba[1][i] = imgData.data[j + 1];
			this.rgba[2][i] = imgData.data[j + 2];
			this.rgba[3][i] = imgData.data[j + 3];
		}			
		this.length = imgData.data.length / 4;
		this.width = imgData.width;
		this.height = imgData.height;
		return this;
	},
	trans2ImgData : function(cxt){
		// 把获取的图像数据转化为ImageData对象
		var i = 0, j = 0,
			tempImgData = cxt.createImageData(this.width, this.height);	
		for(; j < this.length; j++){
			tempImgData.data[i ++] = this.rgba[0][j];
			tempImgData.data[i ++] = this.rgba[1][j];
			tempImgData.data[i ++] = this.rgba[2][j];
			tempImgData.data[i ++] = this.rgba[3][j];
		}
		return tempImgData;
	},
	trans2Img : function(){
		// 把canvas转换成img
		var newImg = new Image();
		newImg.src = canvas.toDataURL("image/png");
		return newImg;
	}
}

// 处理图像的工具对象
ImgProcessor = {
	mirrorEffect : function(can, cxt, imgData, imgObj, dir){
		// 图片镜像
		// 可选择水平镜像或垂直镜像
			if(dir === "hor"){
				cxt.scale(-1, 1);				
				cxt.drawImage(can, -can.width, 0);
				cxt.scale(-1, 1)
			} else if(dir === "ver"){
				cxt.scale(1, -1);
				cxt.drawImage(can, 0, -can.height);
				cxt.scale(1, -1);
			}
			imgData = context.getImageData(0, 0, can.width, can.height);
			imgObj.saveImgData(imgData);
	},
	invertColor : function(ImgDataObj){
		// 取反色
		function invert(arr){
		// 取反
			var i = 0;
			for(;i < arr.length; i ++){
				arr[i] = 255 - arr[i];
				}				
		}
		for(var i = 0; i < 3; i ++){
			invert(ImgDataObj.rgba[i]);
		}
	},
	greyEffect : function(ImgDataObj){
		// 灰度化
		// 加权平均法处理rgb
		for(var i = 0; i < ImgDataObj.length; i ++){
			var greyValue = 0;		
			greyValue = 0.3 * ImgDataObj.rgba[0][i]
					    + 0.59 * ImgDataObj.rgba[1][i]
					    + 0.11 * ImgDataObj.rgba[2][i];
			ImgDataObj.rgba[0][i] = greyValue;
			ImgDataObj.rgba[1][i] = greyValue;
			ImgDataObj.rgba[2][i] = greyValue;
		}
	},
	oldEffect : function(ImgDataObj){
		// 老照片效果				
		for(var i = 0; i < ImgDataObj.length; i ++){
			var value = 0;		
			value = 0.393 * ImgDataObj.rgba[0][i]
				    + 0.769 * ImgDataObj.rgba[1][i]
				    + 0.189 * ImgDataObj.rgba[2][i];
			ImgDataObj.rgba[0][i] = value;

			value = 0.349 * ImgDataObj.rgba[0][i]
					    + 0.686 * ImgDataObj.rgba[1][i]
					    + 0.168 * ImgDataObj.rgba[2][i];
			ImgDataObj.rgba[1][i] = value;

			value = 0.272 * ImgDataObj.rgba[0][i]
					    + 0.534 * ImgDataObj.rgba[1][i]
					    + 0.131 * ImgDataObj.rgba[2][i];
			ImgDataObj.rgba[2][i] = value;
		}
	},
	fogEffect : function(ImgDataObj, range){
		// 雾化效果	
		var ran = 0,
			tempArr1 = [],
			tempArr2 = [],
			tempArr3 = [];
		for(var i = 0; i < ImgDataObj.length; i ++){
			ran = Math.floor(range * Math.random()) * Math.floor(3 * Math.random() - 1);
			if(i + ran >= 0 && i + ran < ImgDataObj.length){
				tempArr1[i] = ImgDataObj.rgba[0][i + ran];			
				tempArr2[i] = ImgDataObj.rgba[1][i + ran];
				tempArr3[i] = ImgDataObj.rgba[2][i + ran];
			} else{
				tempArr1[i] = ImgDataObj.rgba[0][ImgDataObj.length - 1];
				tempArr1[i] = ImgDataObj.rgba[1][ImgDataObj.length - 1];
				tempArr1[i] = ImgDataObj.rgba[2][ImgDataObj.length - 1];
			}
		}
		ImgDataObj.rgba[0] = tempArr1;
		ImgDataObj.rgba[1] = tempArr2;
		ImgDataObj.rgba[2] = tempArr3;
	},
	mosaicEffect : function(ImgDataObj, val){
		// 马赛克效果
		var resR = Array(ImgDataObj.length),
			resG = Array(ImgDataObj.length),
			resB = Array(ImgDataObj.length),
			w = ImgDataObj.width,
			h = ImgDataObj.height,
			nebW = val;
		function mosaic(arr, neb, randNum, width, x, y){
			var res = neb[randNum];
			for(var m = x - Math.floor(nebW / 2); m < Math.floor(nebW / 2) + x + 1; m ++){
				for(var n = y - Math.floor(nebW / 2); n < Math.floor(nebW / 2) + y + 1; n ++){
					arr[m * width + n] = res;
				}
			}
		}
		for(var i = Math.floor(nebW / 2); i < h - Math.floor(nebW / 2); i += Math.floor(nebW / 2)){
			for(var j = Math.floor(nebW / 2); j < w - Math.floor(nebW / 2); j += Math.floor(nebW / 2)){			
				var randNum = Math.floor((nebW * nebW - 1) * Math.random());				
				neb = neighbor(ImgDataObj.rgba[0], ImgDataObj.width, ImgDataObj.height, nebW, i, j);
				mosaic(resR, neb, randNum, w, i, j);
				neb = neighbor(ImgDataObj.rgba[1], ImgDataObj.width, ImgDataObj.height, nebW, i, j);
				mosaic(resG, neb, randNum, w, i, j);
				neb = neighbor(ImgDataObj.rgba[2], ImgDataObj.width, ImgDataObj.height, nebW, i, j);
				mosaic(resB, neb, randNum, w, i, j);				
			}
		}		
		ImgDataObj.rgba[0] = resR;
		ImgDataObj.rgba[1] = resG;
		ImgDataObj.rgba[2] = resB;
	},
	reliefEffect : function(ImgDataObj, value){
		// 浮雕效果
		template = [1, 0, 0, 0, -1, 0, 0, 0, 0];
		function relief(){
			var neb = arguments[0],
				res = 0;
			for(var n = 0; n < 9; n ++){
				res += neb[n] * template[n];
			}			
			return res * value + 128;
		}
		ImgDataObj.rgba[0] = templateCal(ImgDataObj.rgba[0], template, ImgDataObj.width, ImgDataObj.height, 3, relief);
		ImgDataObj.rgba[1] = ImgDataObj.rgba[0];
		ImgDataObj.rgba[2] = ImgDataObj.rgba[0];
		template = null;
	},
	avgFilterEffect : function(ImgDataObj, value){
		// 均值滤波
		function avg(){
			// 求均值
			var neb = arguments[0];
			var res = 0;
			var len = value * value;
			for(var n = 0; n < len; n ++){
				res += neb[n]; 
			}				
			return res / 9;
		}
		for(var k = 0; k < 3; k ++){
			ImgDataObj.rgba[k] = templateCal(ImgDataObj.rgba[k], null, ImgDataObj.width, ImgDataObj.height, value, avg);
		}
	},	
	medFilterEffect : function(ImgDataObj, value){
		// 中值滤波			
		function med(){
			// 求中值
			var neb = arguments[0];
			neb.sort(function(a, b){
				return a - b;
			});	
			var midNum = (neb.length + 1) / 2 - 1;
			return neb[midNum];
		}
		for(var k = 0; k < 3; k ++){
			ImgDataObj.rgba[k] = templateCal(ImgDataObj.rgba[k], null, ImgDataObj.width, ImgDataObj.height, value, med);
		}	
	},
	laplaceEffect : function(ImgDataObj){
		// 拉普拉斯锐化	
		template = [0, -1, 0, -1, 5, -1, 0, -1, 0];
		function laplace(){
			var neb = arguments[0],
				res = 0;
			for(var n = 0; n < 9; n ++){
				res += neb[n] * template[n]
			}
			return res;
		}
		for(var k = 0; k < 3; k ++){
			ImgDataObj.rgba[k] = templateCal(ImgDataObj.rgba[k], template, ImgDataObj.width, ImgDataObj.height, 3, laplace);
		}
		template = null
	},
	blurEffect : function(ImgDataObj){
		// 高斯模糊
		template = [0.062467, 0.125, 0.062467, 0.125, 0.250131, 0.125, 0.062467, 0.125, 0.062467];		
		function guass(){
			var neb = arguments[0],
				res = 0;
			for(var n = 0; n < 9; n ++){
				res += neb[n] * template[n]
			}
			return res;
		}
		for(var k = 0; k < 3; k ++){
			ImgDataObj.rgba[k] = templateCal(ImgDataObj.rgba[k], template, ImgDataObj.width, ImgDataObj.height, 3, guass);
		}
		template = null;
	},
	sketchEffect : function(ImgDataObj1, ImgDataObj2){		
		for(var i = 0; i < 3; i ++){
			ImgDataObj1.rgba[i] = colorOverlay(ImgDataObj1.rgba[i], ImgDataObj2.rgba[i], "doge");
		}
	},
	turboEffect : function(ImgDataObj1, ImgDataObj2){
		for(var i = 0; i < 3; i ++){
			ImgDataObj1.rgba[i] = colorOverlay(ImgDataObj1.rgba[i], ImgDataObj2.rgba[i], "overlay");
		}
	},
	lightEffect : function(ImgDataObj, pos, val){
		// 添加光照
		var width = ImgDataObj.width,
			height = ImgDataObj.height;
			rad = Math.min(pos.x, width - pos.x, pos.y, height - pos.y),
			rat = 0,
			a = 0,
			b = 0;
		for(var k = 0; k < 3; k ++){
			for(var i = Math.round(pos.y) - rad; i < Math.round(pos.y) + rad; i ++){
				for(var j = Math.round(pos.x) - rad; j < Math.round(pos.x) + rad; j ++){
					a = Math.abs(j - pos.x);
					b = Math.abs(i - pos.y);
					rat = (a*a + b*b) / (rad * rad);					
					if(rat < 1){
						ImgDataObj.rgba[k][i * width + j] += (1 - rat) * val; 
					}
				}
			}
		}
	}
}

// 矩阵卷积运算/模板运算
// 传入数组，模板，数组宽，数组高，模板宽，模板高，要用的算法
function templateCal(arr, template, arrW, arrH, tempeW, fun){				
	var result = Array();
	var pos = 0;
	var neb = [];
	for(var i = 0; i < arrH; i ++){
		for(var j = 0; j < arrW; j ++){
			// 不处理边缘
			if(i < Math.floor(tempeW / 2) || i > arrH - Math.floor(tempeW / 2) - 1 || j < Math.floor(tempeW / 2) || j > arrW - Math.floor(tempeW / 2) - 1){
				result[i * arrW + j] = arr[i * arrW + j];
			} else{
				// 非边缘部分
				// 按模板的宽高获取邻域
				neb = neighbor(arr, arrW, arrH, tempeW, i, j);
				result[i * arrW + j] = Math.round(fun(neb));
			}
		}
	}
	return result;
}
// 获取邻域的操作
function neighbor(arr, arrW, arrH, tempeW, x, y){
	var neb = Array(tempeW * tempeW);
	var n = 0;
	var pos2 = 0;
	for(var i2 = x - Math.floor(tempeW / 2); i2 < Math.floor(tempeW / 2) + x + 1; i2 ++){
		for(var j2 = y - Math.floor(tempeW / 2); j2 < Math.floor(tempeW / 2) + y + 1; j2 ++){
			pos2 = i2 * arrW + j2;
			neb[n ++] = arr[pos2];				
		}
	}		
	return neb;
}
function colorOverlay(arr1, arr2, mode){
	var resArr = Array(arr1.length);
	switch (mode) {
		case "doge" :
			for(var i = 0; i < arr1.length; i ++){
				resArr[i] =Math.min(arr1[i] + (arr1[i] * arr2[i]) / (255 - arr2[i]) , 230);
			}
			break;
		case "overlay" : 
			for(var i = 0; i < arr1.length; i ++){
				resArr[i] =Math.min(arr1[i] * arr1[i] / arr2[i], 255);
			}
			break;
	}
	return resArr;
}

function log(exp){
	console.log(exp);
}
