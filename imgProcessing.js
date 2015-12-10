// 获取标签
var uploadImgBtn = getElem("uploadImgBtn"),
	imgWindow = getElem("imgWindow"),
	canvas = getElem("canvas"),
	coordinate = getElem("coordinate"),
	panel = getElem("panel"),
	theScreen = getElem("screen");

// 设置常用变量
var context = canvas.getContext("2d"),
	canvasWidth = 0,
	canvasHeight = 0,
	oriWidth = 0,
	oriHeight = 0,
	imgData = null,
	reader = new FileReader(),
	imgObj = new ImgDataObj(),
	savedImg = new Image(),
	backupImgData = null,
	flags = {
		// 点击位置记录
		insertPos : null,
		// 增加光源标志
		lightFlag : false,
		// 插入文字标志
		textFlag : false,
		// 插入图片标志
		insertFlag : false,
		// 截取标志
		cutFlag : false
	},
	// 记录截图点
	poss = [],
	// 判断处理响应中
	dealingFlag = false,
	// 判断是否已经加载过图片
	loadFlag = false;

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
	turboImg = getElem("btnTurbo"),
	sharpenImg = getElem("btnSharpen"),
	tipCoor = getElem("tipCoor"),
	tipCondition = getElem("tipCondition"),
	tipControl = getElem("tipControl"),
	paintImg = getElem("btnPaint"),
	savePoint = getElem("btnSave"),
	cutImg = getElem("btnCut"),
	avgImg = getElem("btnAVG"),
	mask = getElem("mask");

uploadImgBtn.addEventListener("change", function(){
	// 读取并设置所选图片的URL
	reader.onload = function(){			
		imgWindow.src = reader.result;		
		// 清空文件路径，实现重复选择图片
		uploadImgBtn.value = "";
		clearFlag();
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
	oriWidth = canvas.width;
	oriHeight = canvas.height;
	document.body.scrollTop = 0;
	// 适配页面
	panel.height = "100%";
	document.body.width = "100%";
	document.body.height = "100%";
	theScreen.style.height = "100%";
	theScreen.style.width = "100%";
	clearFlag();
	// 添加按键事件
	if(!loadFlag){
		// 判断是否已经读取过图片,避免重复绑定事件
		// canvas操作
		loadFlag = true;
		// 在画布上移动时显示坐标
		canvas.addEventListener("mousemove", function(e){	
			var pos = getPos(canvas, e);		
			tipCoor.innerHTML = "&nbsp&nbsp坐&nbsp标: (" + pos.x.toFixed(0) + "," + pos.y.toFixed(0) + ")";
		});
		// 清除坐标
		canvas.addEventListener("mouseout", function(){
			tipCoor.innerHTML = "";
		});		
		// 水平镜像及垂直镜像
		horMirror.addEventListener("click", function(){
			dealing(horMirror, function(){
				ImgProcessor.mirrorEffect(canvas, context, imgData, imgObj, "hor");
			});			
		});
		verMirror.addEventListener("click", function(){			
			dealing(verMirror, function(){
				ImgProcessor.mirrorEffect(canvas, context, imgData, imgObj, "ver");
			});			
		});
		compress.addEventListener("click", function(){
			// 压缩图片
			dealing(compress, function(){				
				clearFlag();
				var value = window.prompt("请输入想要压缩的程度，范围在0.0——1.0之间，默认为1.0。数值越小压缩程度越大。");
				if(value != null){
					value = Math.max(parseFloat(value) || 1.0, 0);
					var comData = canvas.toDataURL("image/jpeg", value).replace("image/png", "image/octet-stream");		
					window.location.href=comData;
				}		
			});
		});
		cutImg.addEventListener("click", function(){
			// 截取图像的操作
			dealing(cutImg, function(){
				if(!flags.cutFlag){
					clearFlag();
					poss = [];
					tipControl.innerHTML = "请选择第一个点";
					tipControl.style.display = "block";				
					flags.cutFlag = true;
					// 适配页面
					panel.height = "100%";
					document.body.width = "100%";
					document.body.height = "100%";
					theScreen.style.height = "100%";
					theScreen.style.width = "100%";
				}
			})
		});
		canvas.addEventListener("click", function(e){
			// 截取图片点的记录
			if(flags.cutFlag){
				if(!poss[0]){
					poss[0] = getPos(canvas, e).x;
					poss[1] = getPos(canvas, e).y;
					tipControl.innerHTML = "请选择第二个点";
				} else{
					// 还要判断第一个点和第二个点哪个大					
					poss[2] = getPos(canvas, e).x - poss[0];
					poss[3]	= getPos(canvas, e).y - poss[1];	
					if(poss[2] < 0){						
						poss[2] = Math.abs(poss[2]);
						poss[0] = Math.max(poss[0] - poss[2], 0);
					}
					if(poss[3] < 0){						
						poss[3] = Math.abs(poss[3]);
						poss[1] = Math.max(poss[1] - poss[3], 0);
					}
					dealing(cutImg, function(){
						if(window.confirm("确定截图的位置了吗？")){
							var cutImgData = context.getImageData(poss[0], poss[1], poss[2], poss[3]);
							context.clearRect(0, 0, canvas.width, canvas.height);
							canvas.width = poss[2];
							canvas.height = poss[3];
							context.putImageData(cutImgData, 0, 0);
							imgObj.saveImgData(context.getImageData(0, 0, canvas.width, canvas.height));
							tipControl.style.display = "none";
							if(window.confirm("是否要把预览区换成截图？")){
								imgWindow.src = imgObj.trans2Img().src;
							}
							flags.cutFlag = false;
						}
					})	
				}
			}
		});
		savePoint.addEventListener("click", function(){
			// 保存当前操作
			dealing(savePoint, function(){
				clearFlag();
				if(window.confirm("确定保存当前操作")){
					backupImgData = imgObj.trans2ImgData(context);
					oriWidth = canvas.width;
					oriHeight = canvas.height;					
				}
			});
		})		
		recover.addEventListener("click", function(){
			// 还原
			dealing(recover, function(){
				clearFlag();
				if(window.confirm("确定还原吗？")){
					imgObj.saveImgData(backupImgData);
					canvas.width = oriWidth;
					canvas.height = oriHeight;
					context.putImageData(backupImgData, 0, 0)
				}
			});			
		});	

		// 像素的操作
		invertion.addEventListener("click", function(){
			// 取反色
			dealing(invertion, function(){
				clearFlag();
				ImgProcessor.invertColor(imgObj);
				updataCanvas();
			});			
		});
		greyImg.addEventListener("click", function(){
			// 灰度化
			dealing(greyImg, function(){
				clearFlag();
				ImgProcessor.greyEffect(imgObj);
				updataCanvas();	
			});			
		});		
		oldImg.addEventListener("click", function(){
			// 老照片风格
			dealing(oldImg, function(){
				clearFlag();
				ImgProcessor.oldEffect(imgObj);
				updataCanvas();
			});
		});	
		fogImg.addEventListener("click", function(){
			// 雾化效果
			dealing(fogImg, function(){
				clearFlag();
				var input = window.prompt("请输入想要雾化的程度，范围在1-10");
				if(input != null){
					input = parseInt(input);
					var range = Math.min(input * 5 || 5, 50);
					ImgProcessor.fogEffect(imgObj, range);		
					updataCanvas();
				}	
			});				
		});
		mosaicImg.addEventListener("click", function(){
			// 马赛克效果
			dealing(mosaicImg, function(){
				clearFlag();
				var value = window.prompt("请输入马赛克化的程度，范围在1-10");
				if(value != null){
					value = Math.min(parseInt(value) * 5 || 5, 50);
					ImgProcessor.mosaicEffect(imgObj, value);
					updataCanvas();	
				}			
			});
		});	
		// 模板运算
		reliefImg.addEventListener("click", function(){
			// 浮雕效果
			dealing(reliefImg, function(){
				clearFlag();
				var value = window.prompt("请输入浮雕化程度，范围在1-5");
				if(value != null){
					value = Math.min(parseInt(value) || 1, 5);
					ImgProcessor.greyEffect(imgObj);
					ImgProcessor.reliefEffect(imgObj, value);
					updataCanvas();
				}
			});
		});
		avgImg.addEventListener("click", function(){
			// 均值滤波
			dealing(avgImg, function(){
				clearFlag();
				var value = window.prompt("请输入滤波程度, 范围在1-5");
				if(value != null){
					value = Math.min(parseInt(value) * 3 || 3, 15);
					if(value % 2 == 0)
						value ++;
					ImgProcessor.avgFilterEffect(imgObj, value);
					updataCanvas();
				}
			})
		})
		medFilt.addEventListener("click", function(){
			// 中值滤波效果
			dealing(medFilt, function(){
				clearFlag();
				var value = window.prompt("请输入滤波程度，范围在1-5");
				if(value != null){
					value = Math.min(parseInt(value) * 3 || 3, 15);
					if(value % 2 == 0)
						value ++;
					ImgProcessor.medFilterEffect(imgObj, value);
					updataCanvas();			
				}
			});
		});	
		blurImg.addEventListener("click", function(){
			// 高斯模糊/毛玻璃效果
			dealing(blurImg, function(){
				clearFlag();
				var times = window.prompt("请输入模糊程度，范围在1-5");
				if(times != null){
					times = Math.min(parseInt(times) || 1, 5);
					for(var i = 0; i < times; i ++){
						ImgProcessor.blurEffect(imgObj, times);
						updataCanvas();
					}
				}
			});			
		});	
		paintImg.addEventListener("click", function(){
			//油画风格
			dealing(paintImg, function(){
				clearFlag();
				ImgProcessor.fogEffect(imgObj, 5);
				ImgProcessor.medFilterEffect(imgObj, 3);
				updataCanvas();
			});			
		});	
		sharpenImg.addEventListener("click", function(){
			// 锐化效果——拉普拉斯锐化
			dealing(sharpenImg, function(){
				clearFlag();
				ImgProcessor.laplaceEffect(imgObj);
				updataCanvas();		
			});
		});
		// 图层叠加
		sketchImg.addEventListener("click", function(){
			// 素描效果
			dealing(sketchImg, function(){
				clearFlag();
				var copyImgObj = new ImgDataObj();
				ImgProcessor.greyEffect(imgObj);
				copyImgObj.saveImgData(imgObj.trans2ImgData(context));
				ImgProcessor.invertColor(copyImgObj);
				ImgProcessor.laplaceEffect(imgObj);
				ImgProcessor.blurEffect(copyImgObj);
				ImgProcessor.sketchEffect(imgObj, copyImgObj);
				updataCanvas();
			});
		});		
		turboImg.addEventListener("click", function(){
			// 颜色增艳
			// 可能不适合多次处理
			dealing(turboImg, function(){
				clearFlag();
				var backupImgObj = new ImgDataObj();
				backupImgObj.saveImgData(imgObj.trans2ImgData(context));
				ImgProcessor.greyEffect(backupImgObj);
				ImgProcessor.turboEffect(imgObj, backupImgObj);
				updataCanvas();
			});				
		});
		// 添加操作		
		// 添加光源
		lightImg.addEventListener("click", function(){			
			dealing(lightImg, function(){
				clearFlag();
				flags.lightFlag = true;			
				tipControl.innerHTML = "请在画布中选择添加光照的中心";
				tipControl.style.display = "block";				
			});
		});
		canvas.addEventListener("click", function(e){
			if(flags.lightFlag){
				dealing(lightImg, function(){
					flags.insertPos = getPos(canvas, e);
					tipControl.style.display = "none";	
					var value = window.prompt("请输入添加光照的程度");				
					if(value != null){
						value = Math.min(parseInt(value) || 0, 255);
						ImgProcessor.lightEffect(imgObj, flags.insertPos, value);
						updataCanvas();
						flags.lightFlag = false;
					}	
				});					
			}
		});
		// 添加文字效果	
		addText.addEventListener("click", function(){
			dealing(addText, function(){				
				clearFlag();
				flags.textFlag = true;
				tipControl.innerHTML = "请在画布中点击想要添加文字的地方";
				tipControl.style.display = "block";
			});
		});		
		canvas.addEventListener("click", function(e){
			if(flags.textFlag){
				dealing(addText, function(){
					tipControl.style.display = "none";
					var pos = getPos(canvas, e);			
					var word = window.prompt("请输入想要输入的文字");
					if(word != null){
						var color = window.prompt("请输入想要使用的颜色的RGB值，中间用空格隔开。格式如:255 255 255");
						if(color != null){
							color = deci2Hex(color);
							var size = window.prompt("请输入想要设置的文字大小");
							if(size != null){
								word = word || "";
								color = "#" + (color || "000");
								size = parseInt(size) || canvas.width / 10;
								context.font = size + "px TimesNR";
								context.fillStyle = color;
								context.fillText(word, pos.x, pos.y);
								imgData = context.getImageData(0, 0, canvas.width, canvas.height);
								imgObj.saveImgData(imgData);
								flags.textFlag = false;
							}
						}
					}
				});						
			}		
		});
		// 插入图片
		insertPre.addEventListener("click", function(){
			dealing(insertPre, function(){
				changeBtnStyle(insertPre, "add");
				clearFlag();				
				flags.insertFlag = true;
				tipControl.innerHTML = "请在画布中点击想要插入图片的位置";
				tipControl.style.display = "block";
			});			
		});
		canvas.addEventListener("click", function(e){
			if(flags.insertFlag){
				tipControl.style.display = "none";
				tipControl.innerHTML = "在左边点击上传插入的图片";
				tipControl.style.display = "block";
				insertL.style.display = "block";
				flags.insertPos = getPos(canvas, e);	
			}
		});
		insert.addEventListener("click", function(e){
			if(!flags.insertPos){
				// 如果没有点击canvas获取坐标，就不允许上传图片
				e.preventDefault();
			} else{
				insert.addEventListener("change", function(){
					// 读取并插入上传的图片
					reader.onload = function(){				
						var tempImg = new Image();
						tempImg.src = reader.result;
						insert.value = "";							
						var dw = window.prompt("想要插入图片的宽度"),
							dh = window.prompt("想要插入图片的高度");
						if(dw != null && dh != null){
							dw = Math.min(parseInt(dw) || 50, tempImg.width);
							dh = Math.min(parseInt(dh) || 50, tempImg.height);							
							context.drawImage(tempImg, flags.insertPos.x, flags.insertPos.y, dw, dh);
							flags.insertPos = null;
							flags.insertFlag = false;
							insertL.style.display = "none";							
						}
					};
					if(this.value){
						reader.readAsDataURL(this.files[0]);
						tipControl.style.display = "none";
					}				
				});		
			}	
		});
	}
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
// 处理时弹出遮罩层和提示
function dealing(btn, fun){
	if(dealingFlag){
		return;
	}
	dealingFlag = true;
	tipCondition.style.display = "block";
	mask.style.display = "block";
	changeBtnStyle(btn, "add");
	setTimeout(function(){
		fun();				
		tipCondition.style.display = "none";
		mask.style.display = "none";			
		setTimeout(function(){
			dealingFlag = false;
		}, 100);
		changeBtnStyle(btn, "remove");
	}, 100)	
}
// 字符串10进制转16进制
function deci2Hex(exp){
	var temp = exp.split(" ", 3);
	for(var i = 0; i < 3; i ++){
		temp[i] =  Math.min((parseInt(temp[i]) || 000), 255).toString(16);
	}
	return temp.join("");
}
// 清除标志
function clearFlag(){
	flags.insertPos = null;
	flags.lightFlag = false;
	flags.textFlag = false;
	flags.insertFlag = false;
	cutFlag = false;
	insertL.style.display = "none";
	tipControl.innerHTML = "";
	tipControl.style.display = "none";
}
// 清除按钮样式
function changeBtnStyle(btn, status){
	if(status == "add"){
		btn.style.color = "#fff";
		btn.style.backgroundColor = "#555";	
	}
	if(status == "remove"){
		btn.style.color = "#000";
		btn.style.backgroundColor = "#EEE";
	}
}
// 方便测试输出的函数
function log(exp){
	console.log(exp);
}
