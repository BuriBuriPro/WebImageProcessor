// 获取标签
var uploadImgBtn = getElem("uploadImgBtn"),
	imgWindow = getElem("imgWindow"),
	canvas = getElem("canvas"),
	coordinate = getElem("coordinate");

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
	lightFlag = false;

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
	sharpenImg = getElem("btnSharpen");

uploadImgBtn.addEventListener("change", function(){
	// 读取并显示上传的图片
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
	imgObj.saveImgData(imgData);
	backupImgData = imgData;
	// 显示坐标
	canvas.addEventListener("mousemove", function(e){
		var pos = getPos(canvas, e);
		coordinate.innerHTML = "坐标: (" + pos.x.toFixed(0) + "," + pos.y.toFixed(0) + ")";
	});
	// 清除坐标
	canvas.addEventListener("mouseout", function(e){
		coordinate.innerHTML = "";
	});
	// 添加按键功能
	invertion.addEventListener("click", function(){
		ImgProcessor.invertColor(imgObj);
		updataCanvas();
	});
	reliefImg.addEventListener("click", function(){
		ImgProcessor.greyEffect(imgObj);
		ImgProcessor.reliefEffect(imgObj);
		updataCanvas();
	});
	fogImg.addEventListener("click", function(){
		ImgProcessor.fogEffect(imgObj);
		updataCanvas();
	});
	blurImg.addEventListener("click", function(){
		ImgProcessor.blurEffect(imgObj);
		updataCanvas();
	});
	horMirror.addEventListener("click", function(){
		ImgProcessor.reverseImg(imgObj);
		updataCanvas();
	});
	greyImg.addEventListener("click", function(){
		ImgProcessor.greyEffect(imgObj);
		updataCanvas();
	});
	recover.addEventListener("click", function(){
		imgObj.saveImgData(backupImgData);
		updataCanvas();
	});
	compress.addEventListener("click", function(){
		var value = window.prompt("请输入想要压缩的程度，范围在0.0——1.0之间") || 1;		
		var comData = canvas.toDataURL("image/jpeg", parseFloat(value)).replace("image/png", "image/octet-stream");		
		window.location.href=comData;
	});
	medFilt.addEventListener("click", function(){
		ImgProcessor.medFilterEffect(imgObj);
		updataCanvas();
	});
	addText.addEventListener("click", function(){
		textFlag = true;
	});
	canvas.addEventListener("click", function(e){
		if(textFlag){
			var pos = getPos(canvas, e);
			var word = window.prompt("请输入想要输入的文字") || "";
			context.fillStyle = "red";
			context.fillText(word, pos.x, pos.y);
			imgData = context.getImageData(0, 0, imgWindow.width, imgWindow.height);
			imgObj.saveImgData(imgData);
			textFlag = false;
		}		
	});
	horMirror.addEventListener("click", function(){
		ImgProcessor.MirrorImg(canvas, context, imgWindow, imgData, imgObj, "hor");
	});
	verMirror.addEventListener("click", function(){
		ImgProcessor.MirrorImg(canvas, context, imgWindow, imgData, imgObj, "ver");
	});
	insertPre.addEventListener("click", function(){
		insertL.style.cssText = "display: block;";
		insertFlag = true;
		// var insertPos = null;
		alert("请在画布上点击选择想要插入图片的位置")
		canvas.addEventListener("click", function(e){
			if(insertFlag){
				insertPos = getPos(canvas, e);	
				alert("在左边点击上传插入的图片");	
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
				// imgWindow.src = reader.result;		
				var tempImg = new Image();
				tempImg.src = reader.result;
				context.drawImage(tempImg, insertPos.x, insertPos.y);
				insertPos = null;
				insertFlag = false;
			};
			reader.readAsDataURL(this.files[0]);
			});		
		}		
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
		var backupImgObj = new ImgDataObj();
		ImgProcessor.greyEffect(imgObj);
		backupImgObj.saveImgData(imgObj.trans2ImgData(context));
		ImgProcessor.invertColor(backupImgObj);
		ImgProcessor.blurEffect(backupImgObj);
		ImgProcessor.sketchEffect(imgObj, backupImgObj);
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
		var backupImgObj = new ImgDataObj();
		backupImgObj.saveImgData(imgObj.trans2ImgData(context));
		ImgProcessor.greyEffect(backupImgObj);		
		// ImgProcessor.invertColor(backupImgObj);
		// ImgProcessor.blurEffect(backupImgObj);
		ImgProcessor.HDREffect(imgObj, backupImgObj);
		// ImgProcessor.sketchEffect(backupImgObj, imgObj);
		updataCanvas();
	});
	sharpenImg.addEventListener("click", function(){
		ImgProcessor.laplaceEffect(imgObj);
		updataCanvas();
	});
}

// 兼容浏览器的添加事件对象

// 便于获取标签
function getElem(tagID){
	var temp = null;
	temp = document.getElementById(tagID);
	return temp
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