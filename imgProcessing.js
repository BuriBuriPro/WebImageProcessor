// 获取标签和设置变量
var imgFile = document.getElementById("imgFile"),
	imgWindow = document.getElementById("imgWindow"),
	canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	imgData = null,
	reader = new FileReader(),
	btnColorNegation = document.getElementById("btnColorNegation"),
	btnHorMirror = document.getElementById("btnHorMirror"),
	btnVerMirror = document.getElementById("btnVerMirror"),
	btnRelief = document.getElementById("btnRelief");
	btnRotate = document.getElementById("rotation");

var canvasWidth = 0,
	canvasHeight = 0;
const PI = Math.PI;

// 读取上传的图片
// 考虑使用单例模型
imgFile.addEventListener("change", function(){		
	reader.onload = function(){			
		imgWindow.src = reader.result;
	}
	reader.readAsDataURL(this.files[0]);
});
imgWindow.onload = function(){
	canvas.width = imgWindow.width;
	canvas.height = imgWindow.height;
	context.drawImage(imgWindow, 0, 0);
	imgData = context.getImageData(0, 0, imgWindow.width, imgWindow.height);	

	// 颜色取反
	var imgObj = new ImgDataObj();
	imgObj.saveImgData(imgData);
	btnColorNegation.addEventListener("click", function(){
		ImgProcessor.negateColor(imgObj);
		imgData = imgObj.transImgData(context);
		log(imgData.data)
		context.putImageData(imgData, 0, 0);

		// context.scale(2, 2);
		// context.drawImage(imgWindow, -50, -50);	
		imgData = context.getImageData(0, 0, imgWindow.width, imgWindow.height);
		log(imgData.data)
		imgObj.saveImgData(imgData);
		// log(imgObj.)
	}, false);	


	// 旋转图片(未完成！！)
	btnRotate.children[1].addEventListener("click", function(){
		var deg = btnRotate.children[0].value;
		if(!deg){
			alert("请先输入旋转的度数");
		}
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.translate(canvas.width/2, canvas.height/2);
		context.rotate(deg * PI / 180);
		context.translate(-canvas.width/2, -canvas.height/2);

		context.drawImage(imgWindow, 0, 0);
		// canvas.style.transform = "rotate(" + deg + "deg)";
	}, false);

	// 水平翻转图片
	btnHorMirror.addEventListener("click", function(){
		var tep = imgObj.trans2Img();
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.translate(canvas.width/2, canvas.height/2);
		context.scale(-1, 1);
		context.translate(-canvas.width/2, -canvas.height/2);
		
		// log(imgData);
		context.drawImage(tep, 0, 0);
		imgData = context.getImageData(0, 0, imgWindow.width, imgWindow.height);
		imgObj.saveImgData(imgData);	
	}, false);

	// 垂直翻转图片
	btnVerMirror.addEventListener("click", function(){
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.translate(canvas.width/2, canvas.height/2);
		context.scale(1, -1);
		context.translate(-canvas.width/2, -canvas.height/2);
		context.drawImage(imgWindow, 0, 0);
	}, false);

	canvas.addEventListener("dblclick", function(e){
		// 放大缩小功能
	}, false);
	// 浮雕
	btnRelief.addEventListener("click", function(e){
		ImgProcessor.reliefEffect(imgObj);
		imgData = imgObj.transImgData(context);
		context.putImageData(imgData, imgWindow.width, imgWindow.height);
	}, false)
}
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
	transImgData : function(cxt){
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
	// 翻转图像
	reverseImg : function(ImgDataObj){	
		if(this.flagAM === "mat"){
			ImgDataObj.trans2Arr();
		}		
		for(var i = 0; i < 3; i ++){
			ImgDataObj.rgba[i].reverse();
		}		
	},
	negateColor : function(ImgDataObj){
		if(this.flagAM === "mat"){
			ImgDataObj.trans2Arr();
		}
		// 颜色取反
		var negation = function (arr){
			var i = 0;
			for(;i < arr.length; i ++){
				arr[i] = 255 - arr[i];
			}				
		}
		for(var i = 0; i < 3; i ++){
			negation(ImgDataObj.rgba[i]	);
		}
	},
	reliefEffect : function(ImgDataObj){
		// 浮雕效果
		var tempArr = Array(3);
		if(this.flagAM === "arr"){
			ImgDataObj.trans2Mat();
		}
		for(var i = 0; i < 3; i ++){
			tempArr[i] = relief(ImgDataObj.rgba[i], ImgDataObj.rgba[i].width, ImgDataObj.rgba[i].height);
			tempArr[i].width = ImgDataObj.rgba[i].width;
			tempArr[i].height = ImgDataObj.rgba[i].height;
			tempArr[i] = mat2Arr(tempArr);
		}
		// ImgDataObj.trans2Arr();
		for(var i = 0; i < 3; i ++){
			ImgDataObj.rgba[i] = tempArr.splice(0);
		}
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
function scaleUp(cxt){
	// 实现放大的函数
	
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
				tempMat[i][j] = mat[i][j] - mat[i+1][j+1];
			}
		}
	}
	return tempMat;
}


// 兼容浏览器的添加事件对象


// 方便测试输出的函数
function log(exp){
	console.log(exp);
}