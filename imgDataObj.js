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
	// 标记现在的RGBA是数组还是矩阵
	this.flagAM = "array";
	this.mirrorFlag = false;	
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
	trans2Mat : function(){
		// 把RGBA数据转换为矩阵
		if(this.flagAM === "matrix"){
			alert("目前已经是矩阵");
			return;
		}
		for(var i = 0; i < 4; i ++){
			this.rgba[i] = arr2Mat(this.rgba[i], this.width, this.height);
		}
		this.flagAM = "matrix";
	},
	trans2Arr : function(){
		// 把RGBA数据转为一位数组
		if(this.flagAM === "array"){
			alert("目前已经是数组");
			return;
		}		
		for(var i = 0; i < 4; i ++){
			this.rgba[i] = mat2Arr(this.rgba[i]);
		}					
		this.flagAM = "array";
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
	// 检测并转换数据格式
	checkNTrans : function(ImgDataObj, flag){
		if(flag != ImgDataObj.flagAM){
			if(flag == "array"){
				ImgDataObj.trans2Arr();
			} else if(flag == "matrix"){
				ImgDataObj.trans2Mat();
			}
		} else{}
	},
	// 翻转图像
	reverseImg : function(ImgDataObj){	
		this.checkNTrans(ImgDataObj, "array");	
		for(var i = 0; i < 3; i ++){
			// ImgDataObj.rgba[i].each(reverse();
		}		
	},
	invertColor : function(ImgDataObj){
		// 取反色
		this.checkNTrans(ImgDataObj, "array");
		for(var i = 0; i < 3; i ++){
			invert(ImgDataObj.rgba[i]);
		}
	},
	reliefEffect : function(ImgDataObj){
		// 浮雕效果
		this.checkNTrans(ImgDataObj, "matrix");		
		for(var i = 0; i < 3; i ++){			
			ImgDataObj.rgba[i] = relief(ImgDataObj.rgba[i], ImgDataObj.width, ImgDataObj.height);
			ImgDataObj.rgba[i].width = ImgDataObj.width;
			ImgDataObj.rgba[i].height = ImgDataObj.height;
		}
		this.checkNTrans(ImgDataObj, "array");
	},
	fogEffect : function(ImgDataObj){
		// 雾化效果
		this.checkNTrans(ImgDataObj, "array");	
		var ran = 0,
			tempArr1 = [],
			tempArr2 = [],
			tempArr3 = [];
		for(var i = 0; i < ImgDataObj.rgba[0].length; i ++){
			ran = Math.floor(10 * Math.random()) * Math.floor(3 * Math.random() - 1);
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
	blurEffect : function(ImgDataObj){
		// 高斯模糊
		this.checkNTrans(ImgDataObj, "matrix");
		for(var i = 0; i < 3; i ++){
			ImgDataObj.rgba[i] = blur(ImgDataObj.rgba[i], ImgDataObj.width, ImgDataObj.height);
			ImgDataObj.rgba[i].width = ImgDataObj.width;
			ImgDataObj.rgba[i].height = ImgDataObj.height;
		}		
		this.checkNTrans(ImgDataObj, "array");		
	},
	greyEffect : function(ImgDataObj){
		// 灰度化
		this.checkNTrans(ImgDataObj, "array");
		// 加权平均法处理rgb
		// var greyValue = Array(ImgDataObj.length);
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
	medFilterEffect : function(ImgDataObj){
		// 中值滤波
		this.checkNTrans(ImgDataObj, "array");
		for(var i = 0; i < 3; i ++){
			ImgDataObj.rgba[i] = medFilter(ImgDataObj.rgba[i], ImgDataObj.width, ImgDataObj.height);
		}
	},
	MirrorImg : function(can, cxt, img, imgData, imgObj, dir){
		// 图片镜像
		// 可选择水平镜像或垂直镜像	
		if(imgObj.mirrorFlag == false){
			imgObj.mirrorFlag = true;
			if(dir === "hor"){
				cxt.scale(-1, 1);				
				cxt.drawImage(can, -img.width, 0);
				cxt.scale(-1, 1)
			} else if(dir === "ver"){
				cxt.scale(1, -1);
				cxt.drawImage(can, 0, -img.height);
				cxt.scale(1, -1);
			}
			imgData = context.getImageData(0, 0, can.width, can.height);
			imgObj.saveImgData(imgData);
			imgObj.mirrorFlag = false;
		}
	},
	mosaicEffect : function(ImgDataObj){
		// 马赛克效果
		var resR = Array(ImgDataObj.rgba[0].length),
			resG = Array(ImgDataObj.rgba[0].length),
			resB = Array(ImgDataObj.rgba[0].length),
			width = ImgDataObj.width,
			height = ImgDataObj.height;
		var neighborArr = Array(9);
		for(var i = 1; i < height; i += 3){
			for(var j = 1; j < width; j += 3){
				var randNum = Math.floor(8 * Math.random());				
				neighborArr = neighbor(ImgDataObj.rgba[0], width, i, j);
				neighborCal(resR, neighborArr, randNum, width, i, j);

				neighborArr = neighbor(ImgDataObj.rgba[1], width, i, j);
				neighborCal(resG, neighborArr, randNum, width, i, j);

				neighborArr = neighbor(ImgDataObj.rgba[2], width, i, j);
				neighborCal(resB, neighborArr, randNum, width, i, j);				
			}
		}
		ImgDataObj.rgba[0] = resR;
		ImgDataObj.rgba[1] = resG;
		ImgDataObj.rgba[2] = resB;
	},
	oldEffect : function(ImgDataObj){
		// 老照片效果
		this.checkNTrans(ImgDataObj, "array");				
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
	sketchEffect : function(ImgDataObj1, ImgDataObj2){
		
		for(var i = 0; i < 3; i ++){
			ImgDataObj1.rgba[i] = colorDoge(ImgDataObj1.rgba[i], ImgDataObj2.rgba[i], -10);
		}
	},
	lightEffect : function(ImgDataObj, pos, val){
		var width = ImgDataObj.width,
			height = ImgDataObj.height;
			rad = Math.min(pos.x, width - pos.x, pos.y, height - pos.y),
			rat = 0,
			a = 0,
			b = 0;
		log(rad)
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
	},
	HDREffect : function(ImgDataObj1, ImgDataObj2){
		for(var i = 0; i < 3; i ++){
			ImgDataObj1.rgba[i] = colorDoge2(ImgDataObj1.rgba[i], ImgDataObj2.rgba[i], 0);
		}
	},
	laplaceEffect : function(ImgDataObj){
		this.checkNTrans(ImgDataObj, "matrix");
		for(var i = 0; i < 3; i ++){
			ImgDataObj.rgba[i] = laplace(ImgDataObj.rgba[i], ImgDataObj.width, ImgDataObj.height);
			ImgDataObj.rgba[i].width = ImgDataObj.width;
			ImgDataObj.rgba[i].height = ImgDataObj.height;
		}		
		this.checkNTrans(ImgDataObj, "array");		
	}
}

// 公有化方便计算的函数
function arr2Mat(arr, width, height){
	// 把数组转换成矩阵
	// 矩阵有宽高属性
			var i, j,
				mat = Array();			
			for(i = 0; i < height; i ++){
				mat[i] = Array();								
				for(j = 0; j < width; j ++){
					mat[i][j] = arr[i * width + j];
				}
			}
			mat.width = width;
			mat.height = height;
			return mat;
		}
function mat2Arr(mat){
	// 把矩阵转换成数组
	var i , j
		arr = Array();
	for(i = 0; i < mat.height; i ++){				
		for(j = 0; j < mat.width; j ++){
			arr[i * mat.width + j] = mat[i][j];
		}
	}
	return arr;
}
function invert(arr){
	// 取反
	var i = 0;
	for(;i < arr.length; i ++){
		arr[i] = 255 - arr[i];
	}				
}
function relief(mat, width, height){
	// 实现矩阵对角相减的函数
	var i, j;
	var tempMat = Array();
	for(i = 0; i < height; i ++){
		tempMat[i] = Array();
		for(j = 0; j < width; j ++){
			if(j == width - 1 || i == height - 1){
				tempMat[i][j] = mat[i][j];
			} else{				
				tempMat[i][j] = mat[i][j] - mat[i+1][j+1] + 128;
			}
		}
	}
	return tempMat;
}
function blur(mat, width, height){
	// σ=1.5时 高斯模板的权重
	var template = [0.0947, 0.118, 0.0947, 0.118, 0.1477, 0.118, 0.0947, 0.118, 0.0947];
	var tempMat = Array()
	// 不处理边缘
	for(var i = 0; i < height; i ++){
		tempMat[i] = Array();
		for(var j = 0; j < width; j ++){
			if(j == 0 || j == width - 1 || i == 0 || i == height - 1){
				tempMat[i][j] = mat[i][j];
			} else{
				tempMat[i][j] = mat[i - 1][j - 1] * template[0] + 
								mat[i - 1][j] * template[1] +
								mat[i - 1][j + 1] * template[2] +
								mat[i][j - 1] * template[3] +
								mat[i][j] * template[4] +
								mat[i][j + 1] * template[5] +
								mat[i + 1][j - 1] * template[6] +
								mat[i + 1][j] * template[7] +
								mat[i + 1][j + 1] * template[8];
			}
		}		
	}
	return tempMat;
}
function laplace(mat, width, height){
	var template = [0, -1, 0, -1, 4, -1, 0, -1, 0];
	var tempMat = Array()
	// 不处理边缘
	for(var i = 0; i < height; i ++){
		tempMat[i] = Array();
		for(var j = 0; j < width; j ++){
			if(j == 0 || j == width - 1 || i == 0 || i == height - 1){
				tempMat[i][j] = mat[i][j];
			} else{
				tempMat[i][j] = mat[i - 1][j - 1] * template[0] + 
								mat[i - 1][j] * template[1] +
								mat[i - 1][j + 1] * template[2] +
								mat[i][j - 1] * template[3] +
								mat[i][j] * template[4] +
								mat[i][j + 1] * template[5] +
								mat[i + 1][j - 1] * template[6] +
								mat[i + 1][j] * template[7] +
								mat[i + 1][j + 1] * template[8];
			}
		}		
	}
	return tempMat;
}
function medFilter(arr, width, height){	
	var tempArr = Array(9),
		res = Array(width * height);
	for(var i = 0; i < height; i ++){
		for(var j = 0; j < width; j ++){
			if(i == 0 || i == height - 1 || j == 0 || j == width - 1){
				// 不处理边缘
				res[i * width + j] = arr[i * width + j];
			} else{
				tempArr = neighbor(arr, width, i, j);
				tempArr.sort();
				res[i * width + j] = tempArr[4];
			}
		}
	}	
	return res;
}
function neighbor(arr, width, x, y){
    var tempArr = [];
    tempArr[0] = arr[(x - 1) * width + y - 1];
    tempArr[1] = arr[(x - 1) * width + y];
    tempArr[2] = arr[(x - 1) * width + y + 1];
    tempArr[3] = arr[x * width + y - 1];
    tempArr[4] = arr[x * width + y];
    tempArr[5] = arr[x * width + y + 1];
    tempArr[6] = arr[(x + 1) * width + y - 1];
    tempArr[7] = arr[(x + 1) * width + y];
    tempArr[8] = arr[(x + 1) * width + y + 1];
    return tempArr;
}
function neighborCal(arr, arr2, target, width, x, y){
	arr[(x - 1) * width + y - 1] = arr2[target];
	arr[(x - 1) * width + y] = arr2[target];
	arr[(x - 1) * width + y + 1] = arr2[target];
	arr[x * width + y - 1] = arr2[target];
	arr[x * width + y] = arr2[target];
	arr[x * width + y + 1] = arr2[target];
	arr[(x + 1) * width + y - 1] = arr2[target];
	arr[(x + 1) * width + y] = arr2[target];
	arr[(x + 1) * width + y + 1] = arr2[target];
}
function colorDoge(arr1, arr2, num){
	var resArr = Array(arr1.length);
	for(var i = 0; i < arr1.length; i ++){
		resArr[i] =Math.min(num + arr1[i] + (arr1[i] * arr2[i]) / (255 - arr2[i]) , 255);
	}
	return resArr;
}
function colorDoge2(arr1, arr2){
	var resArr = Array(arr1.length);
	for(var i = 0; i < arr1.length; i ++){
		resArr[i] =Math.min(arr1[i] * arr1[i] / arr2[i], 255);
	}
	return resArr;
}

function log(exp){
	console.log(exp);
}
