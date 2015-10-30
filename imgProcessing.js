window.onload = function(){
	// 获取标签和设置变量
	var imgFile = document.getElementById("imgFile"),
		imgWindow = document.getElementById("imgWindow"),
		canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		imgData = null,
		reader = new FileReader();

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
		
	}

	// 创建ImgDataObj存放获取了RGBA的值的对象
	function ImgDataObj(){		
		this.red = [];
		this.green = [];
		this.blue = [];
		this.alpha = [];
		this.length = 0;
	}
	ImgDataObj.prototype = {
		constructor : ImgDataObj,
		saveImgData : function(imgData){
			var i = 0, j = 0;
			for(; j < imgData.length; i ++, j += 4){
				this.red[i] = imgData.data[j];
				this.green[i] = imgData.data[j + 1];
				this.blue[i] = imgData.data[j + 2];
				this.alpha[i] = imgData.data[j + 3];
			}			
			this.length = imgData.length / 4;
		}
		transImgData : function(imgData){
			var i = 0, j = 0,
				tempImgData = createImageData(imgData);				
			for(; j < this.length; i += 4, j++){
				tempImgData.data.red[i] = this.red[j];
				tempImgData.data.green[i] = this.green[j];
				tempImgData.data.blue[i] = this.blue[j];
				tempImgData.data.alpha[i] = this.alpha[j];
			}
			return tempImgData;
		}
	}

	// function saveImgData(imgData){
	// 	// 保存图片数据为RGBA数组
	// 	var i = 0, j = 0;
	// 	var red = [], green = [], blue = [], alpha = [], imgDataObj = {};		
	// 	for(; i < imgData.data.length; i += 4, j ++){
	// 		red[j] = imgData.data[i];
	// 		green[j] = imgData.data[i + 1];
	// 		blue[j] = imgData.data[i + 2];
	// 		alpha[j] = imgData.data[i + 3];
	// 	}	
	// 	imgDataObj.red = red;
	// 	imgDataObj.green = green;
	// 	imgDataObj.blue = blue;
	// 	imgDataObj.alpha = alpha;
	// 	imgDataObj.length = imgData.data.length / 4;
	// 	return imgDataObj;
	// }

	// function setImg(imgDataObj){
	// 	// 设置canvas
	// 	var i = 0, j = 0;
	// 	var tempImgData= context.createImageData(imgData);
	// 	for(; i < imgDataObj.length; i += 4){
	// 		tempImgData[i] = imgDataObj.red[i];
	// 		tempImgData[i + 1] = imgDataObj.green[i];
	// 		tempImgData[i + 2] = imgDataObj.blue[i];
	// 		tempImgData[i + 3] = imgDataObj.alpha[i];
	// 	}
	// 	// var newimgData = context.createImageData(imgData);
	// 	context.putImageData(tempImgData, 0, 0);
	// }

	// function reverseImg(imgDataObj){	
	// 	// 翻转图像
	// 	var i = imgDataObj.length - 1, j = 0, tempImgDataObj = {};
	// 	tempImgDataObj.red = [];
	// 	tempImgDataObj.green = [];
	// 	tempImgDataObj.blue = [];
	// 	tempImgDataObj.alpha = [];
	// 	for(; i >= 0; i --, j ++){
	// 		tempImgDataObj.red[j] = imgDataObj.red[i];
	// 		tempImgDataObj.green[j] = imgDataObj.green[i];
	// 		tempImgDataObj.blue[j] = imgDataObj.red[i];
	// 		tempImgDataObj.alpha[j] = imgDataObj.blue[i];
	// 	}
	// 	tempImgDataObj.length = imgDataObj.length;
	// 	return tempImgDataObj;
	// }	


	// var mySingleton = (function(){
	// 		var instance = null;
	// 		function init(){
	// 			var imgFile = document.getElementById("imgFile"),
	// 				imgWindow = document.getElementById("imgWindow"),
	// 				canvas = document.getElementById("canvas"),
	// 				reader = new FileReader();
	// 			// 			
	// 			imgFile.addEventListener("change", function(){			
	// 				reader.onload = function(){			
	// 					imgWindow.src = reader.result;
	// 				}
	// 				reader.readAsDataURL(this.files[0]);			
	// 			});
	// 		}
				
	// 	return {
	// 		getImgInfo : function(){

	// 		},
	// 		imgWindow
	// 	}
	// })();
	// var single = mySingleton();
}

