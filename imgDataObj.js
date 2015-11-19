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
		// if(this.flagAM === "matrix"){
		// 	this.trans2Arr();
		// }
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
			ImgDataObj.rgba[i].reverse();
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
			var tempWidth = ImgDataObj.rgba[i].width,
				tempHeight = ImgDataObj.rgba[i].height;
			ImgDataObj.rgba[i] = relief(ImgDataObj.rgba[i], ImgDataObj.width, ImgDataObj.height);
			ImgDataObj.rgba[i].width = tempWidth;
			ImgDataObj.rgba[i].height = tempHeight;
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
				// if(tempMat[i][j] < 0){
				// 	tempMat[i][j] = 0;
				// }
			}
		}
	}
	return tempMat;
}

// 方便测试输出的函数
function log(exp){
	console.log(exp);
}