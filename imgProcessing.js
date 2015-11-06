// 获取标签和设置变量
var imgFile = document.getElementById("imgFile"),
	imgWindow = document.getElementById("imgWindow"),
	canvas = document.getElementById("canvas"),
	context = canvas.getContext("2d"),
	imgData = null,
	reader = new FileReader(),
	btn = document.getElementById("btn");

// 读取上传的图片
// 考虑使用单例模型
imgFile.addEventListener("change", function(){		
	reader.onload = function(){			
		imgWindow.src = reader.result;
		if(imgWindow.width > 100 || imgWindow.height > 100){
			return;
		}
	}
	reader.readAsDataURL(this.files[0]);
});
imgWindow.onload = function(){
	canvas.width = imgWindow.width;
	canvas.height = imgWindow.height;
	context.drawImage(imgWindow, 0, 0);
	imgData = context.getImageData(0, 0, imgWindow.width, imgWindow.height);	
	// 处理按钮
	var imgObj = new ImgDataObj();
	imgObj.saveImgData(imgData);
	// console.log(imgObj);
	btn.addEventListener("click", function(){
		ImgProcessor.negateColor(imgObj);
		imgData = imgObj.transImgData(context);
		context.putImageData(imgData, 0, 0);
	}, false);	
	// imgObj.trans2Mat();	
}


// 创建ImgDataObj存放获取了RGBA的值的对象
function ImgDataObj(){
	var red = [],
		green = [],
		blue = [],
		alpha = [];
	this.rgba = [red, green, blue, alpha];	
	this.length = 0;
	this.width = 0;
	this.height = 0;
}
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
		var temp = arr2Mat(this.rgba.red, this.width, this.height);
		
	}
}
ImgProcessor = {
	// 翻转图像
	reverseImg : function(ImgDataObj){			
			for(var i = 0; i < 3; i ++){
				ImgDataObj.rgba[i].reverse();
			}
			// this.alpha.reverse();			
		},
	negateColor : function(ImgDataObj){
			// 颜色取反
			var negation = function (arr){
				var i = 0;
				for(;i < arr.length; i ++){
					arr[i] = 255 - arr[i];
				}				
			}
			for(var i = 0; i < 3; i ++){
				negation(ImgDataObj.rgba[i]);
			}
			// negation(ImgDataObj.rgba.red);
			// negation(ImgDataObj.rgba.green);
			// negation(ImgDataObj.rgba.blue);
		}
}
function arr2Mat(arr, width, height){
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
	var i , j
		arr = Array();
	for(i = 0; i < mat.height; i ++){				
		for(j = 0; j < mat.width; j ++){
			arr[i * mat.width + j] = mat[i][j];
		}
	}
	return arr;
}
function log(exp){
	console.log(exp);
}