// 获取标签
var uploadImgBtn = getElem("uploadImgBtn"),
	imgWindow = getElem("imgWindow"),
	canvas = getElem("canvas");

// 设置常用变量
const PI = Math.PI;
var context = canvas.getContext("2d"),
	canvasWidth = 300,
	canvasHeight = 300,
	imgData = null,
	reader = new FileReader(),
	imgObj = new ImgDataObj();


// 获取按键
var invertion = getElem("btnInvert"),
	reliefImg = getElem("btnRelief");

uploadImgBtn.addEventListener("change", function(){
	// 读取并显示上传的图片
	reader.onload = function(){			
		imgWindow.src = reader.result;		
	}
	reader.readAsDataURL(this.files[0]);	
});

imgWindow.onload = function(){
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	context.drawImage(imgWindow, 0, 0);
	imgData = context.getImageData(0, 0, imgWindow.width, imgWindow.height);		
	imgObj.saveImgData(imgData);

	// 添加按键功能
	invertion.addEventListener("click", function(){
		log(imgObj.rgba[0])		
		ImgProcessor.invertColor(imgObj);
		imgData = imgObj.trans2ImgData(context);
		context.putImageData(imgData, 0, 0);
	});
	reliefImg.addEventListener("click", function(){
		ImgProcessor.reliefEffect(imgObj);
		imgData = imgObj.trans2ImgData(context);
		context.putImageData(imgData, 0, 0);
	})
}

// 兼容浏览器的添加事件对象

// 便于获取标签
function getElem(tagID){
	var temp = null;
	temp = document.getElementById(tagID);
	return temp
}

// 方便测试输出的函数
function log(exp){
	console.log(exp);
}
