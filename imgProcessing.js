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
	btnRotate = document.getElementById("rotation");
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
	// 处理按钮
	var imgObj = new ImgDataObj();
	imgObj.saveImgData(imgData);
	btnColorNegation.addEventListener("click", function(){
		ImgProcessor.negateColor(imgObj);
		imgData = imgObj.transImgData(context);
		
		context.putImageData(imgData, 0, 0);

		// context.scale(2, 2);
		// context.drawImage(imgWindow, -50, -50);	
	}, false);		
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
	btnHorMirror.addEventListener("click", function(){
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.translate(canvas.width/2, canvas.height/2);
		context.scale(-1, 1);
		context.translate(-canvas.width/2, -canvas.height/2);
		context.drawImage(imgWindow, 0, 0);
	}, false);
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
	}
}
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
function scaleUp(cxt){
	
}
function log(exp){
	console.log(exp);
}