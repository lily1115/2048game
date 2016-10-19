var board=new Array(),
	score=0,
	hasConficted=new Array();//碰撞记录（目的是实现每一次移动一个格子只能实现一次相加）注意理解这里的实现过程 很巧妙

//触控初始值
var	start_x=null,
	start_y=null,
	end_x=null,
	end_y=null;

$(document).ready(
	function()
	{
		prepareForMobile();
		newgame();
	}
);

function prepareForMobile()
{
	// 如果页面宽度大于500px，我们就要求载入固定值（不再自适应）
	if( documentWidth > 500 )
	{
		gridContainerWidth=500;//大方格的大小
		cellSpace=20; //间距
		cellSideLength=100;//每个小方格的大小
	}

	$("#grid-container").css('width',gridContainerWidth-2*cellSpace);
	$("#grid-container").css('height',gridContainerWidth-2*cellSpace);
	$("#grid-container").css('padding',cellSpace);
	$("#grid-container").css('border-radius',0.02*gridContainerWidth);

	$('.grid-cell').css('width',cellSideLength);
	$('.grid-cell').css('height',cellSideLength);
	$('.grid-cell').css('border-radius',0.02*cellSideLength);
}

function newgame()
{
	//  reset the game
	score=0;
	updatScore(score);
	init();
	// random a number
	generateOneNumber();
	generateOneNumber();
}

function init()
{
	for(var i=0;i<4;i++)
	{
		for(var j=0;j<4;j++)
		{
			var gridCell=$("#grid-cell-"+i+"-"+j);
			gridCell.css("top",getPosTop(i,j) );
			gridCell.css("left",getPosLeft(i,j));
		}
	}

	for(var i=0;i<4;i++)
	{
		board[i]=new Array();
		hasConficted[i]=new Array();
		for(var j=0;j<4;j++)
		{
			board[i][j]=0;
			hasConficted[i][j]=false;
		}
	}

	upDateBoarView();
}

function upDateBoarView()
{
	$(".number-cell").remove();
	for(var i=0;i<4;i++)
	{
		for(var j=0;j<4;j++)
		{
			$("#grid-container").append('<div class="number-cell" id="number-cell-'+i+'-'+j+'"></div>');//注意这里的结构
			var theNumberCell=$('#number-cell-'+i+'-'+j);
			if(board[i][j]==0)
			{
				theNumberCell.css('width','0px');
				theNumberCell.css('height','0px');
				theNumberCell.css('top',getPosTop(i,j)+cellSideLength/2);//加50 是让不可见的board 在小格子中间位置（有利于动画生成的美感）
				theNumberCell.css('left',getPosLeft(i,j)+cellSideLength/2);
			}else{
				theNumberCell.css('width',cellSideLength);
				theNumberCell.css('height',cellSideLength);
				theNumberCell.css('top',getPosTop(i,j));
				theNumberCell.css('left',getPosLeft(i,j));
				theNumberCell.css('background-color',getNumberBackgroundColor(board[i][j]) );
				theNumberCell.css('color',getNumberColor(board[i][j]) );
				theNumberCell.text(board[i][j]);
			}
			hasConficted[i][j]=false;
		}
	}
	$('.number-cell').css('line-height',cellSideLength+'px');
	$('.number-cell').css('font-size',0.6*cellSideLength+'px');
}


function generateOneNumber()
{
	// 判断有没有空间来生成新的数字
	if( !noSpace(board) )
	{
		return false;
	}
	// 随机一个位置的坐标
	var randX=parseInt(Math.floor(Math.random()*4)),
		randY=parseInt(Math.floor(Math.random()*4)),
		times=0;
	//限制循环次数，提高性能
	while(times<50)
	{
		if(board[randX][randY]==0)
		{
			break;
		}
		randX=parseInt(Math.floor(Math.random()*4));
		randY=parseInt(Math.floor(Math.random()*4));
		times++;
	}
	//当循环50次还不能找到空位置时，通过遍历找一个出来
	if( times==50 )
	{
		for( var i=0; i<4 ;i++ )
		{
			for( var j=0; j<4; j++ )
			{
				if( board[i][j]==0 )
				{
					randX=i;
					randY=j;
				}
			}
		}
	}	
	//随机生成2、4
	var randNumber= Math.random() <0.5 ? 2 : 4 ;

	// 在随机的位置显示随机的数字
	board[randX][randY]=randNumber;
	// 增加动画效果
	showNumberWithAnimation(randX,randY,randNumber);

	return true;
}


$(document).keydown( function(event)
	{

		switch(event.keyCode)//注意keyCode大小写
		{
			case 37://left
				//阻止上下左右键的默认事件（即上下左右移动滚动条）
				event.preventDefault();
				if(moveLeft())
				{
					setTimeout(generateOneNumber,210);
					setTimeout(isGameOver,300);
				}
				break;
			case 38://up
				event.preventDefault();
				if(moveUp())
				{
					setTimeout(generateOneNumber,210);
					setTimeout(isGameOver,300);
				}
				break;
			case 39://right
				event.preventDefault();
				if(moveRight())
				{
					setTimeout(generateOneNumber,210);
					setTimeout(isGameOver,300);
				}
				break;	
			case 40://down
				event.preventDefault();
				if(moveDown())
				{
					setTimeout(generateOneNumber,210);
					setTimeout(isGameOver,300);
				}
				break;
			default:
				break;	 		
		}
	}
);

// //添加触摸事件，捕捉触摸事件中的数据
// document.addEventListener('touchstart',function(event)
// {
// 	start_x=event.touches[0].pageX;
// 	start_y=event.touches[0].pageY;//touches是一个数组，储存了触摸中多点触控的数据
// });

// //安卓在有阻止事件执行时（即上面阻止键盘的默认事件），会影响touch事件的执行，这里是一个解决办法
 //document.addEventListener('touchmove',function(event){
// 	event.preventDefault();
 //});

// document.addEventListener('touchend',function(event){
// 	end_x=event.changedTouches[0].pageX;
// 	end_y=event.changedTouches[0].pageY;
// 	//判断移动方向
// 	var result_x=end_x-start_y,
// 		result_y=end_y-start_y;

// 	//排除无意义的滑动
// 	if( Math.abs(result_x) < 0.2*documentWidth && Math.abs(result_y) < 0.2*documentWidth )
// 	{
// 		return;
// 	}	
		
// 	if( Math.abs(result_x) >= Math.abs(result_y) )
// 	{
// 		//X轴移动
// 		if( result_x>0 )
// 		{
// 			//move right
// 			if( moveRight() )
// 			{
// 				setTimeout(generateOneNumber,210);
// 				setTimeout(isGameOver,300);
// 			}
// 		}else{
// 			//move lefy
// 			if(moveLeft())
// 			{
// 				setTimeout(generateOneNumber,210);
// 				setTimeout(isGameOver,300);
// 			}
// 		}
// 	}else{
// 		//Y轴移动
// 		if( result_y>0 )
// 		{
// 			//move down 注意通常程序里的坐标系Y轴正方向是向下的
// 			if(moveDown())
// 			{
// 				setTimeout(generateOneNumber,210);
// 				setTimeout(isGameOver,300);
// 			}
// 		}else{
// 			//move up
// 			if(moveUp())
// 			{
// 				setTimeout(generateOneNumber,210);
// 				setTimeout(isGameOver,300);
// 			}
// 		}
// 	}
// });

document.addEventListener('touchstart',function(event)
{
    start_x = event.touches[0].pageX;
    start_y = event.touches[0].pageY;
});
//这里是阻止浏览器滑动的上下滚动的默认事件
document.addEventListener('touchmove',function(event){
 	event.preventDefault();
});
document.addEventListener('touchend',function(event)
{
    end_x = event.changedTouches[0].pageX;
    end_y = event.changedTouches[0].pageY;

    var result_x = end_x - start_x;
    var result_y = end_y - start_y;

    if( Math.abs( result_x ) < 0.3*documentWidth && Math.abs( result_y ) < 0.3*documentWidth )
    {
        return;
    }

    if( Math.abs( result_x ) >= Math.abs( result_y ) ){

        if( result_x > 0 )
        {
            //move right
            if( moveRight() )
            {
                setTimeout("generateOneNumber()",210);
                setTimeout("isGameOver()",300);
            }
        }else{
            //move left
            if( moveLeft() )
            {
                setTimeout("generateOneNumber()",210);
                setTimeout("isGameOver()",300);
            }
        }
    }else{
        if( result_y > 0 )
        {
            //move down
            if( moveDown() ){
                setTimeout("generateOneNumber()",210);
                setTimeout("isGameOver()",300);
            }
        }else{
            //move up
            if( moveUp() )
            {
                setTimeout("generateOneNumber()",210);
                setTimeout("isGameOver()",300);
            }
        }
    }
});


function isGameOver()
{
	if( !noSpace(board) && noSame(board) ) //没有空间和没有相同数字可以相加
	{
		gameOver();
	}
}

function gameOver()
{
	alert("GameOver!");
}

//这里的移动过程需要理解开始移动时的判定条件，尤其是noBlockCheckLR()和noBlockCheckUD()函数中参数的意义，理解这个非常重要
function moveLeft()
{
	//先判断能不能移动
	if( !canMoveLeft( board ) )
	{
		return false;
	}
	//开始移动
	for(var i=0 ; i<4 ; i++ )
	{
		for( var j=1 ; j<4 ; j++ )
		{
			if( board[i][j]!=0 )
			{
				for( var k=0 ; k<j ; k++ )
				{
					if( board[i][k]==0 && noBlcokCheckLR( i,k,j,board ) )
					{
						//move
						showMoveAnimation(i,j,i,k);
						board[i][k]=board[i][j];
						board[i][j]=0;
						break;
					}else if( board[i][k]==board[i][j] && noBlcokCheckLR(i,k,j,board) && !hasConficted[i][k] ){
						//move
						showMoveAnimation(i,j,i,k);
						//add
						board[i][k]+=board[i][j];
						board[i][j]=0;
						//add score 增加分数
						score+=board[i][k];
						updatScore(score);
						hasConficted[i][k]=true;
						break;
					}
				}
			}
		}
	}
	//再次对数据刷新
	setTimeout(upDateBoarView,200);
	return true;
}

function moveRight()
{
	if( !canMoveRight(board) )
	{
		return false;
	}
	for( var i=0 ; i<4 ; i++ )
	{
		for( var j = 2 ; j >= 0 ; j -- )
		{
			if( board[i][j]!=0 )
			{
				for( var k=3 ; k>j ; k-- )
				{
					if( board[i][k]==0 && noBlcokCheckLR(i,j,k,board) )
					{
						//move
						showMoveAnimation(i,j,i,k);
						board[i][k]=board[i][j];
						board[i][j]=0;
						break;
					}else if( board[i][k]==board[i][j] && noBlcokCheckLR(i,j,k,board) && !hasConficted[i][k] ){
						//move
						showMoveAnimation(i,j,i,k);
						//add
						board[i][k]*=2;
						board[i][j]=0;
						score+=board[i][k];
						updatScore(score);
						hasConficted[i][k]=true;
						break;
					}
				}
			}
		}
	}
	setTimeout(upDateBoarView,200);
	return true;
}

function moveUp()
{
	if( !canMoveUp(board) )
	{
		return false;
	}
	for( var j = 0 ; j < 4 ; j ++ )
	{
		for( var i = 1 ; i < 4 ; i ++ )
		{
			if( board[i][j]!=0 )
			{
				for( var k=0; k<i; k++ )
				{
					if( board[k][j]==0 && noBlcokCheckUD( k,i,j,board) )
					{
						showMoveAnimation(i,j,k,j);
						board[k][j]=board[i][j];
						board[i][j]=0;
						break;
					}else if( board[k][j]==board[i][j] && noBlcokCheckUD(k,i,j,board) && !hasConficted[k][j] ){
						showMoveAnimation(i,j,k,j);
						board[k][j]+=board[i][j];
						board[i][j]=0;
						score+=board[k][j];
						updatScore(score);
						hasConficted[k][j]=true;
						break;
					}
				}
			}
		}
	}
	setTimeout(upDateBoarView,200);
	return true;
}


function moveDown()
{
	if(!canMoveDown(board))
	{
		return false;
	}
	for( var j = 0 ; j < 4 ; j ++ )
	{
		for( var i = 2 ; i >= 0 ; i -- )
		{
			if(board[i][j]!=0)
			{
				for(var k=3;k>i;k--)
				{
					if( board[k][j]==0 && noBlcokCheckUD( i,k,j,board ) )
					{
						//move
						showMoveAnimation(i,j,k,j);
						board[k][j]=board[i][j];
						board[i][j]=0;
						break;
					}else if( board[k][j]==board[i][j] && noBlcokCheckUD(i,k,j,board) && !hasConficted[k][j] ){
						showMoveAnimation(i,j,k,j);
						board[k][j]+=board[i][j];
						board[i][j]=0;
						score+=board[k][j];
						updatScore(score);
						hasConficted[k][j]=true;
						break;
					}
				}
			}
		}
	}
	setTimeout(upDateBoarView,200);
	return true;
}