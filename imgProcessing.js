// 获取标签
var uploadImgBtn = getElem("uploadImgBtn"),
	imgWindow = getElem("imgWindow"),
	canvas = getElem("canvas"),
	coordinate = getElem("coordinate"),
	panel = getElem("panel");

// 设置常用变量
const PI = Math.PI;
var context = canvas.getContext("2d"),
	canvasWidth = 300,
	canvasHeight = 300,
	imgData = null,
	reader = new FileReader(),
	imgObj = new ImgDataObj(),
	savedImg = new Image(),
	backupImgData = null,
	textFlag = false,
	insertFlag = false,
	insertPos = null,
	lightFlag = false,
	dealingFlag = false,
	vividFlag = false;

// 获取按键
var invertion = getElem("btnInvert"),
	reliefImg = getElem("btnRelief"),
	fogImg = getElem("btnFog"),
	blurImg = getElem("btnBlur"),
	horMirror = getElem("btnHorMirror"),
	greyImg = getElem("btnGrey"),
	recover = getElem("btnRecover"),
	compress = getElem("btnCompress"),
	medFilt = getElem("btnMedFilt"),
	addText = getElem("btnAddText"),
	horMirror = getElem("btnHorMirror"),
	verMirror = getElem("btnVerMirror"),
	rotate = getElem("btnRotate"),	
	insert = getElem("btnInsert"),
	insertL = getElem("insertL"),
	insertPre = getElem("btnInsertPre"),
	mosaicImg = getElem("btnMosaic"),
	oldImg = getElem("btnOld"),
	sketchImg = getElem("btnSketch"),
	lightImg = getElem("btnLight"),
	hdrImg = getElem("btnHDR"),
	sharpenImg = getElem("btnSharpen"),
	tipCoor = getElem("tipCoor"),
	tipCondition = getElem("tipCondition"),
	tipControl = getElem("tipControl");

uploadImgBtn.addEventListener("change", function(){
	// 读取并设置所选图片的URL
	reader.onload = function(){			
		imgWindow.src = reader.result;		
	}
	// 判断确实选择图片才读取文件
	if(this.value){
		reader.readAsDataURL(this.files[0]);		
	}
});

imgWindow.onload = function(){
	// 图片选择成功后
	canvas.width = imgWindow.width;
	canvas.height = imgWindow.height;
	// 在预览窗口展示
	context.drawImage(imgWindow, 0, 0);
	// 获取图像数据，
	imgData = context.getImageData(0, 0, imgWindow.width, imgWindow.height);		
	imgObj.saveImgData(imgData);
	backupImgData = imgData;
	document.body.scrollTop = 0;
	// 显示坐标
	canvas.addEventListener("mousemove", function(e){	
		var pos = getPos(canvas, e);		
		tipCoor.innerHTML = "&nbsp&nbsp坐&nbsp标: (" + pos.x.toFixed(0) + "," + pos.y.toFixed(0) + ")";
	});
	// 清除坐标
	canvas.addEventListener("mouseout", function(){
		tipCoor.innerHTML = "";
	});
	// 添加按键功能
	invertion.addEventListener("click", function(){
		// 取反色
		ImgProcessor.invertColor(imgObj);
		updataCanvas();
	});	
	reliefImg.addEventListener("click", function(){
		// 浮雕效果
		ImgProcessor.greyEffect(imgObj);
		ImgProcessor.reliefEffect(imgObj);
		updataCanvas();
	});
	fogImg.addEventListener("click", function(){
		// 雾化效果
		ImgProcessor.fogEffect(imgObj);
		updataCanvas();
	});
	blurImg.addEventListener("click", function(){
		// 高斯模糊/毛玻璃效果
		tipCondition.style.display = "block";
		ImgProcessor.blurEffect(imgObj);
		updataCanvas();
	});
	horMirror.addEventListener("click", function(){
		// 水平镜像
		ImgProcessor.reverseImg(imgObj);
		updataCanvas();
	});
	greyImg.addEventListener("click", function(){
		// 灰度化
		ImgProcessor.greyEffect(imgObj);
		updataCanvas();
	});
	recover.addEventListener("click", function(){
		// 还原
		imgObj.saveImgData(backupImgData);
		context.putImageData(backupImgData, 0, 0)
	});
	compress.addEventListener("click", function(){
		// 压缩图片
		var value = window.prompt("请输入想要压缩的程度，范围在0.0——1.0之间") || 1;		
		var comData = canvas.toDataURL("image/jpeg", parseFloat(value)).replace("image/png", "image/octet-stream");		
		window.location.href=comData;
	});
	medFilt.addEventListener("click", function(){
		// 中值滤波效果
		tipCondition.style.display = "block";
		ImgProcessor.medFilterEffect(imgObj);
		updataCanvas();		
	});
	addText.addEventListener("click", function(){
		// 添加文字效果
		textFlag = true;
		tipControl.innerHTML = "请在画布中点击想要添加文字的地方";
		tipControl.style.display = "block";
	});
	// 插入图片、文字的操作
	canvas.addEventListener("click", function(e){
		if(textFlag){
			tipControl.style.display = "none";
			var pos = getPos(canvas, e);
			var word = window.prompt("请输入想要输入的文字") || "";
			var color = "#" + (window.prompt("请输入想要使用的颜色的RGB值") || "000");
			var size = (window.prompt("请输入想要设置的文字大小") || canvasWidth / 10) + "px";
			context.font = size + " TimesNR";
			context.fillStyle = color;
			context.fillText(word, pos.x, pos.y);
			imgData = context.getImageData(0, 0, imgWindow.width, imgWindow.height);
			imgObj.saveImgData(imgData);
			textFlag = false;
		}		
	});
	insertPre.addEventListener("click", function(){
		insertL.style.display = "block";
		insertFlag = true;
		tipControl.innerHTML = "请在画布中点击想要插入图片的位置";
		tipControl.style.display = "block";
		canvas.addEventListener("click", function(e){
			if(insertFlag){
				tipControl.style.display = "none";
				tipControl.innerHTML = "在左边点击上传插入的图片";
				tipControl.style.display = "block";
				insertPos = getPos(canvas, e);	
				// alert("在左边点击上传插入的图片");	
			}
		});
	});	
	insert.addEventListener("click", function(e){	
		if(!insertPos){
			e.preventDefault();
		} else{
			insert.addEventListener("change", function(){
				// 读取并插入上传的图片
				reader.onload = function(){				
					var tempImg = new Image();
					tempImg.src = reader.result;
					context.drawImage(tempImg, insertPos.x, insertPos.y);
					insertPos = null;
					insertFlag = false;
					insertL.style.display = "none";
				};
				if(this.value){
					reader.readAsDataURL(this.files[0]);
					tipControl.style.display = "none";
				}				
			});		
		}		
	});

	// canvas, context层次的操作
	// 水平镜像及垂直镜像
	horMirror.addEventListener("click", function(){
		ImgProcessor.MirrorImg(canvas, context, imgWindow, imgData, imgObj, "hor");
	});
	verMirror.addEventListener("click", function(){
		ImgProcessor.MirrorImg(canvas, context, imgWindow, imgData, imgObj, "ver");
	});
	
	
	mosaicImg.addEventListener("click", function(){
		ImgProcessor.mosaicEffect(imgObj);
		updataCanvas();
	});
	oldImg.addEventListener("click", function(){
		ImgProcessor.oldEffect(imgObj);
		updataCanvas();
	});
	sketchImg.addEventListener("click", function(){
		var copyImgObj = new ImgDataObj();
		ImgProcessor.greyEffect(imgObj);
		// ImgProcessor.laplaceEffect(imgObj);
		copyImgObj.saveImgData(imgObj.trans2ImgData(context));
		ImgProcessor.invertColor(copyImgObj);
		ImgProcessor.laplaceEffect(imgObj);
		ImgProcessor.blurEffect(copyImgObj);
		ImgProcessor.sketchEffect(imgObj, copyImgObj);
		updataCanvas();
	});
	lightImg.addEventListener("click", function(){
		lightFlag = true;
		canvas.addEventListener("click", function(e){
			if(lightFlag){
				insertPos = getPos(canvas, e);	
				var value = parseInt(window.prompt("请输入添加光照的程度"));
				ImgProcessor.lightEffect(imgObj, insertPos, value);
				updataCanvas();
				lightFlag = false;
			}
		});
	});
	hdrImg.addEventListener("click", function(){
		if(!vividFlag){
			// 不适合多次处理
			var backupImgObj = new ImgDataObj();
			backupImgObj.saveImgData(imgObj.trans2ImgData(context));
			ImgProcessor.greyEffect(backupImgObj);
			// var times = Math.min(parseInt(window.prompt("请输入处理的程度，范围在1 - 5")) || 1, 5);
			// for(var i = 0; i < times; i++){
			ImgProcessor.HDREffect(imgObj, backupImgObj);
			// }
			updataCanvas();

			vividFlag = true;
		}
	});
	sharpenImg.addEventListener("click", function(){
		// ImgProcessor.medFilterEffect(imgObj);
		ImgProcessor.laplaceEffect(imgObj);
		updataCanvas();
	});
}
// 设置工具盘panel随页面滚动而滚动
window.onscroll = function(){
	var scrollTop = document.body.scrollTop,
		scrollLeft = document.body.scrollLeft;	

	panel.style.top = scrollTop + "px";
	panel.style.left = scrollLeft + "px";
}
// 便于获取标签
function getElem(tagID){
	var temp = null;
	temp = document.getElementById(tagID);
	return temp;
}
// 更新canvas的函数
function updataCanvas(){
	imgData = imgObj.trans2ImgData(context);
	context.putImageData(imgData, 0, 0)
}
// 获取canvas坐标的函数
function getPos(can, e){
	var rect = canvas.getBoundingClientRect(),
		pos = null;
	return pos = {
		x : e.clientX - rect.left + 1,
		y : e.clientY - rect.top
	};
}

// 方便测试输出的函数
function log(exp){
	console.log(exp);
}