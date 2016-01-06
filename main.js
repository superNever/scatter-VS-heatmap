var init = (function(){

	//随机生成一系列的坐标
	var llArr = [],dataArr=[];		
	for(var i =0 ;i<5000;i++){
		var obj  ={};
		obj.x = 413*Math.random();
		obj.y = 814*Math.random();
		obj.count = 10*Math.random();
		dataArr.push([obj.x,obj.y]);
		llArr.push(obj);
	}
	// var heat = new mHeatMap({id:'heatmap',data:''});
	//以下代码仅用于对于测试，真正插件使用不存在以下代码，
	//该代码用echarts中scatter代替
	// var ctx1 = heat.util.getCtx('heatmap1');
	// createCircle1(ctx1,llArr);
	// function createCircle1(ctx,data){
	// 	var context = ctx;
	// 	// context.globalCompositeOperation = 'lighter';
	// 	if(!context){
	// 		console.error('请先获取上下文');
	// 	}
	// 	for(var i =0,j=data.length;i<j;i++){
	// 		var x = data[i]['x'];
	// 		var y = data[i]['y'];
	// 		var r = data[i]['count'];
	// 		var tem = 25000;
	// 		context.beginPath();
	// 		context.arc(x,y,5,0,2*Math.PI,true);
	// 		context.fillStyle = 'rgba(200,100,20,0.5)';
	// 		context.shadowBlur = 15;	
	// 		context.closePath();
	// 		context.fill();
	// 	}
	// }

	//以下代码用于生成scatter图
	myChart = echarts.init(document.querySelector('#echarts'));
	var option = {
			    title : {
			        // text: '男性女性身高体重分布',
			        // subtext: '抽样调查来自: Heinz  2003'
			    },
			    tooltip : {
			        trigger: 'axis',
			        showDelay : 0,
			        axisPointer:{
			            show: true,
			            type : 'cross',
			            lineStyle: {
			                type : 'dashed',
			                width : 1
			            }
			        }
			    },
			    // legend: {
			    //     data:['XXX']
			    // },
			    // toolbox: {
			    //     show : true,
			    //     feature : {
			    //         mark : {show: true},
			    //         dataZoom : {show: true},
			    //         dataView : {show: true, readOnly: false},
			    //         restore : {show: true},
			    //         saveAsImage : {show: true}
			    //     }
			    // },
			    xAxis : [
			        {
			            type : 'value',
			            scale:true,
			            axisLabel : {
			                formatter: '{value}'
			            }
			        }
			    ],
			    yAxis : [
			        {
			            type : 'value',
			            scale:true,
			            axisLabel : {
			                formatter: '{value}'
			            }
			        }
			    ],
			    series : [
			        {
			            name:'XXX',
			            type:'scatter',
			            data: dataArr
			        }
			    ]
			};                 
	myChart.setOption(option);

	//以下代码用于生成匹配的热力图
	var extent = mHeatMap.util.getEchartsExtent(myChart);
	//创建新的覆盖层
	var newCanvasId = mHeatMap.util.createOverLayCanvas(extent,'echarts',llArr);
	//格式化数据
	var exportData = mHeatMap.util.formatData(llArr,extent.width,extent.height,extent.chartMaxX,extent.chartMax,extent.chartMinX,extent.chartMin);
	//展示数据
	var heat1 = new mHeatMap({id:newCanvasId,data:exportData.data});
})
