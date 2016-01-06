/**
 * 1增加缓存区2增加分批加载3增加heatmap覆盖层
 * 
 */
(function(){
	//制定一系列工具函数
	var util = {
		//检查变量是否定义
		isDef:function(val){
			return val !== void 0;
		},
		//检查是否支持canvas
		getCtx:function(canvas){
			var canvas = document.querySelector('#'+canvas);
			var getctx = canvas.getContext('2d');
			if(!getctx){
				console.error('浏览器不支持canvas');
			}
			return getctx;
		},
		//创建canvas上下文
		createCanvasContext2D:function(w,h){
			var mcanvas = document.createElement('canvas');
			mcanvas.width = w;
			mcanvas.height = h;
			var context = mcanvas.getContext('2d');
			return context;
		},
		//获取外联样式
		getClass:function(obj,name){
			var rslt;
			if(obj.currentStyle){
				rslt = obj.currentStyle[name];			 //IE下获取非行间样式
			}else{
				rslt = getComputedStyle(obj,false)[name];//FF、Chorme下获取费行间样式
			}
			if(rslt.length===0){
				return 0;
			}else{
				return Number(rslt.slice(0,-2));
			}
		},
		//获取echarts中的绘图区域的宽高以及offset（专为处理echarts而生）,参数myEcharts实例
		getEchartsExtent:function(myChart){			
			/*zr*/
			var zr = myChart._zr;
			var w_zr = zr.getWidth();
			var h_zr = zr.getHeight();
			/*grid*/
			var grid = myChart._option.grid;
			var g_x = grid.x;
			var g_x2 = grid.x2;
			var g_y = grid.y;
			var g_y2 = grid.y2;
			var borderWidth = grid.borderWidth;
			/*dom*/
			var dom = myChart.dom;
			var dom_clientW =dom.clientWidth;
			var dom_clientH = dom.clientHeight;
			var padding_dom = dom.style.padding.slice(0,-2)*1;
			var h_dom = dom.style.height.slice(0,-2)*1;
			/*padding*/
			var padding = util.getClass(dom,'padding');
			/*offset*/
			var left = padding+g_x;
			var top = g_y+padding;
			var width = grid.width?grid.width:(w_zr-g_x2-g_x);
			var height = grid.height?grid.height:(h_zr-g_y-g_y2);
			/*chartMax*/
			var chartMax = myChart.component.yAxis._axisList[0]._max;
			var chartMaxX = myChart.component.xAxis._axisList[0]._max;
			var chartMin = myChart.component.yAxis._axisList[0]._min;
			var chartMinX = myChart.component.xAxis._axisList[0]._min;
			return {
				top:top,				 //覆盖层上边距
				left:left+2,			 //覆盖层的左边距
				width:width+borderWidth, //覆盖层的宽度
				height:height,           //覆盖层的高度
				chartMax:chartMax,       //图表中y的最大值
				chartMaxX:chartMaxX,	 //图表中x的最大值
				chartMin:chartMin,		 //图表中y的最小值
				chartMinX:chartMinX      //图表中x的最小值
			}

		},
		//创建一个canvas位置宽度高度offset都需要指定，与已知应该进行叠加，返回值应该是id
		//param:obj{top,left,width,height,参考物id,数据}
		createOverLayCanvas:function(obj,originid,data){
			/**/
			var max_min = this.getDataM(data);
			xMax = max_min.xMax;
			xMin = max_min.xMin;
			yMax = max_min.yMax;
			yMin = max_min.yMin;
			/**/
			var id = 'heatMap'+this.getTimes();
			var top = obj.top;
			var left = obj.left;
			var width = obj.width*(xMax)/(obj.chartMaxX);
			var height = obj.height*(yMax)/(obj.chartMax);
			var originId = originid;
			var canvas = this.createCanvasContext2D(width,height).canvas;
			canvas.id = id;
			//处理参考物的位置
			var originDom = document.querySelector('#'+originId);
			var offset_left = originDom.offsetLeft;
			var offset_top = originDom.offsetTop;
			//确定目标物的左，上
			var offsetLeft = offset_left+left;
			var offsetTop = offset_top+top+Math.floor((obj.chartMax-yMax)*((obj.height)/obj.chartMax))+3;
			console.log((obj.chartMax-yMax)*((obj.height)/obj.chartMax))
			//创建一个button按钮，用于暂时的切换
			var btn = document.createElement('button');
			btn.innerHTML = '热力图';
			var btnCssText = 'position:absolute;width:'+60+'px;height:'+30+'px;top:'+(height+offset_top+offsetTop-30)+'px;left:'+(obj.width+offset_left+offsetLeft)+'px;';
			btnCssText +='background-color:#48b;color:#fff;border-radius:50%;cursor:pointer;border:0;outline:none;';
			btn.style.cssText = btnCssText;
			this.appendChildDom(btn,document.body);			
			this.addEvent(btn,'click',function(e){
				var display = canvas.style.display;
				if(display=='none'){
					canvas.style.display = '';
				}else{
					canvas.style.display ='none';
				}
			})
			
			//设置样式
			var cssText = 'position:absolute;width:'+width+'px;height:'+height+'px;top:'+offsetTop+'px;left:'+offsetLeft+'px;';
			canvas.style.cssText = cssText;
			document.body.appendChild(canvas);
			return id;
		},
		//向已知dom后添加新元素
		appendChildDom:function(domChild,domParent){
			domParent.appendChild(domChild);
		},
		//获取数据最值
		getDataM:function(orign_data){
			var xMax,xMin,yMax,yMin,data=[];
			this.each(orign_data,function(k,v){
				var obj = {};
				obj.x = v.x;
				obj.y = v.y; 	
				obj.count = v.count;
				[].push.call(data,obj);
				if(k==0){
					xMax = v.x;
					xMin = v.x;
					yMax = v.x;
					yMin = v.x;
				}else{
					xMax = xMax > v.x ? xMax : v.x;
					yMax = yMax > v.y ? yMax : v.y;
					xMin = xMin < v.x ? xMin : v.x;
					yMin = yMin < v.y ? yMin : v.y;
				}
			});
			return {
				xMax : xMax,
				xMin : xMin,
				yMax : yMax,
				yMin : yMin,
				data : data
			}
		},
		//格式化已知数据{x,y,count},宽度,高度chartmax
		formatData:function(originData,width,height,chartMaxX,chartMaxY,chartMinX,chartMinY){
			var originData = originData;			
			var exportData = [];
			var xMax,xMin,yMax,yMin;
			var max_min = this.getDataM(originData);
			xMax = max_min.xMax;
			xMin = max_min.xMin;
			yMax = max_min.yMax;
			yMin = max_min.yMin;
			var data = max_min.data;
			var spanMaxY,spanMaxX,spanX,spanY;
			console.log('widthX:'+width)
			this.each(data,function(k,v){
				//坐标转换 公式： （value-min）*(width_px/差值-max-min)
				spanX = xMax-xMin; //差值
				spanY = yMax-yMin; //差值
				console.log(height+' spanY :'+spanY +' yMax'+yMax)
				spanMaxY = height-yMax; //总高度与值最大值的差值 
				spanMaxX = width-xMax; //总宽度与值最大值的差值 
				var obj = {};
				v.y = yMax -v.y; //y值取补值
				obj.x = Math.round((v.x - xMin)*(width/(chartMaxX-chartMinX))); //width取相对值 XXXXXXXXXX
				obj.y = Math.round((v.y - yMin)*((height)/(chartMaxY-chartMinY)));//height取相对值
				obj.count = v.count;
				[].push.call(exportData,obj);
			})
			return {
				data:exportData,
				offsetTOP:spanMaxY,
				offsetLEFT:spanMaxX
			};

		},
		/*each*/
		each:function(data,callback){
			for(var i =0,len=data.length;i<len;i++){
				callback.call(data[i],i,data[i]);
			}
		},
		/*
		*分批执行
		*params：需要处理的data，执行函数fn，延缓执行函数fnAfter，个数，时间
	 	*/
		timeCheck:function(data,fn,fnAfter,count,time){
			var obj,t;
			var len = data.length;
			var start = function(){
				for(var i =0 ;i<Math.min(count||1,len);i++){
					var obj = data.shift();
					fn(obj);
				}
			};
			return function(){				
				t = setInterval(function(){
					if(data.length ==0){
						clearInterval(t);						
						console.log('1');						
						return fnAfter();
					}else{
						start();
					}
					
				},time||100)
			}();
		},
		//创建与已知canvas大小相同的上下文,参数已知canvas上下文
		cloneCanvas:function(ctx){
			var canvasBefore = ctx.canvas;
			var width = canvasBefore.clientWidth;
			var height = canvasBefore.clientHeight;
			var canvasCtx = this.createCanvasContext2D(width,height);
			return canvasCtx;
		},
		//获取当前时间
		getTimes:function(){
			return new Date().getTime();
		},
		//绑定事件
		addEvent:function(elem,type,handler){
			var addEvent;
			if(window.addEventListener){
				addEvent = function(elem,type,handler){
					elem.addEventListener(type,handler,false);
				}				
			}else if(window.attachEvent){
				addEvent=function(elem,type,handler){
					elem.attachEvent('on'+type,handler);
				}
			}else{
				addEvent = function(elem,type,handler){
					elem['on'+type] = handler;
				}
			}
			addEvent(elem,type,handler);
		}		
	};
	Function.prototype.after = function(afterfn){
	    var _self = this;           				//保存原函数的引用
	    return function(){          				//返回包含了原函数和新函数的“代理”函数
	        var ret = _self.apply(this,arguments); //执行原函数
	        afterfn.apply(this,arguments);       	//执行新函数
	        return ret;                     		//并返回原函数的执行结果并且保证this不被劫持
	    }
	}
	//mHeatMap构造函数
	var mHeatMap = function(options){
		this._self = this;
		// this.util = util;//用于以后提供工具函数库（目前可以不需要这行代码）
		var options =  util.isDef(options)?options:{};
		this.version = '0.0.1';
		this.gradient = util.isDef(options.gradient) ? 
						options.gradient : 
						['#00f', '#0ff', '#0f0', '#ff0', '#f00'];
		this.distance = util.isDef(options.distance) ? 
						options.distance : 
						250000;
		this.shadowBlur = util.isDef(options.shadowBlur) ? 
						options.shadowBlur : 
						10;
		this.radius = util.isDef(options.radius) ? 
						options.radius : 
						5;
		this.canvasID = options.id;
		this.gradient_ = null;
		this.context = null;
		this.contextCache = null;
		if(!util.isDef(options.id)){
			console.error('请设置canvas ID');
			return false;
		}
		this.data = util.isDef(options.data)?options.data:null;
		this.initialize(options);		
	}

	//初始化heatmap
	mHeatMap.prototype.initialize = function(options){
		this.setContext(this.canvasID);
		this.setGradient_();
		this.createCircle(this.contextCache,this.data);
		// this.createHeatMap(this)();  //这种模式加载是为了留着之后分批加载
	};
	//设置上下文
	mHeatMap.prototype.setContext = function(id){
		this.context = util.getCtx(id);
		//同时创建相应缓存
		this.contextCache = util.cloneCanvas(this.context);
	};
	//生成面板data
	mHeatMap.prototype.setGradient_ = function(){
		this.gradient_ = this.createGradient(this.gradient);
	};
	//导出imagedataurl
	mHeatMap.prototype.getImageDataCache = function(){
		var context = this.contextCache;
		var canvas = context.canvas;
		var data = context.getImageData(0,0,canvas.width,canvas.height);
		return data;
	};
	////生成热力图
	mHeatMap.prototype.createHeatMap = function(that){
		return function(){	
			console.log('2');
			var _this = that._self;
			var context = _this.contextCache;
			var canvas = context.canvas;
			var gradient_ = _this.gradient_;
			var image = _this.getImageDataCache();
			var view8 = image.data;
			console.log(view8.length);
			var i, ii, alpha;		
			for (i = 0, ii = view8.length; i < ii; i += 4) {
				alpha = view8[i + 3] * 4;
				if (alpha) {
					view8[i] = gradient_[alpha];
					view8[i + 1] = gradient_[alpha + 1];
					view8[i + 2] = gradient_[alpha + 2];
				}							
			}
			_this.context.putImageData(image, 0, 0);
		}
		
	}
	//创建颜色面板
	mHeatMap.prototype.createGradient = function(colors){
		var width = 1;
		var height = 256;
		var context = util.createCanvasContext2D(width,height);
		var mcanvas = context.canvas;
		var gradient = context.createLinearGradient(0,0,width,height);
		var step = 1/(colors.length-1);
		for(var i =0,ll = colors.length;i<ll;i++){
			gradient.addColorStop(i*step,colors[i]);
		}
		context.fillStyle = gradient;
		context.fillRect(0,0,width,height);
		// document.body.appendChild(mcanvas);
		return context.getImageData(0,0,width,height).data;
	};
	//创建小圆圈
	mHeatMap.prototype.createCircle = function(ctx,data){
		var context = ctx;
		if(!context){
			console.error('请先获取上下文');
		}
		var tem = this.distance;
		var that = this;
		//以下代码采用分批加载方式
		util.timeCheck(data,function(e){
			var x = e['x'];
			var y = e['y'];
			var r = e['count'];			
			context.beginPath();
			context.arc(x-tem,y-tem,that.radius,0,2*Math.PI,true);
			context.fillStyle = 'rgba(200,100,20,0.5)';
			context.shadowOffsetX = context.shadowOffsetY = tem;
			context.shadowBlur = that.shadowBlur;	
			context.shadowColor='#000';
			context.closePath();
			context.fill();
		},that.createHeatMap(that),1000,10);
		console.log('3')
		//以下方式才用直接加载不进行分批加载
		// for(var i =0,j=data.length;i<j;i++){
		// 	var x = data[i]['x'];
		// 	var y = data[i]['y'];
		// 	var r = data[i]['count'];			
		// 	context.beginPath();
		// 	context.arc(x-tem,y-tem,this.radius,0,2*Math.PI,true);
		// 	context.fillStyle = 'rgba(200,100,20,0.5)';
		// 	context.shadowOffsetX = context.shadowOffsetY = tem;
		// 	context.shadowBlur = this.shadowBlur;	
		// 	context.shadowColor='#000';
		// 	context.closePath();
		// 	context.fill();
		// }
		// that.createHeatMap(that)();
	};
	mHeatMap.util = util;
	return window.mHeatMap = mHeatMap;
}())
