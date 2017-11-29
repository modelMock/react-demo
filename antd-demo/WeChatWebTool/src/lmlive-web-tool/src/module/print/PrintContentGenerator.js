import React, { Component } from 'react';
import './PringDialog.less'
import commonUtils from '../../commons/utils/commonUtils'

/**
 * 打印内容生成器
 */
class PrintContentGenerator {


	/**
	 * 根据需要的模板和数据内容生成数据
	 * @param printType	1:报销单，2:用款申请单
	 * @param printData
	 */
	generate = (printType = 1,printData)=>{
		switch (printType){
			case 1:
				return this.generateExpenseAccount(printData)
			case 2:
				return this.generateFoundsApply(printData)
		}
	}

	/**
	 * 生成用款申请单
	 * */
	generateFoundsApply = (printData)=>{
		const date = new Date()

		return (
			<div className={"founds-apply"} >
				{
					printData.map(eachItem => <div className={"doc-to-print-main"} >
						{/*<!--头部信息，标题和横线，以及票据填写日期-->*/}
						<div id="header" style={{marginTop:"57px"}}>
							{/*<!--中间这个空的span不能少了，不然就没了两段对齐的效果了-->*/}
							<div>
								<div className={"head-title"}>用款申请单<span></span></div>
								<div className={"line-under-title"}></div>
								<div className={"line-under-title"}></div>
							</div>
							{/*<!--票据的填写日期-->*/}
							<div className={"doc-print-date-time"}>
								<span style={{marginLeft: "240px"}}>申请日期</span>
								<span style={{marginLeft: 50,textAlign:'center'}}>{date.getFullYear()}</span>
								<span style={{marginLeft: 56}} >年</span>
								<span style={{marginLeft: 21}} >{date.getMonth() + 1}</span>
								<span style={{marginLeft: 21}}>月</span>
								<span style={{marginLeft: 21}}>{date.getDate()}</span>
								<span style={{marginLeft: 21}}>日</span>
							</div>
						</div>
						{/*<!--正文-->*/}
						<div className={"main-content"}>
							{/*<!--一共7行，第一行不均匀，以后刘行每行分两部分，没部分再有固定的比例分割-->*/}
							<div className={"each-row"}>
								<span className={"each-cell-border-title"} style={{"width": "83px"}}>用款用途</span>
								<span className={"each-cell-border-content"} style={{"width": "200px"}}>
						付款 {/*固定为付款*/}
					</span>
								<span className={"each-cell-border-title"} style={{"width": "72px"}}>用款方式</span>
								<span className={"each-cell-border-title"} style={{"width": "72px"}}>
						&nbsp;
					</span>
								<span className={"each-cell-border-title"} style={{"width": "72px"}}>货币币种</span>
								<span className={"each-cell-border-title"} style={{"border": "0"}}>&nbsp;</span>
							</div>

							<div className={"each-row"}>
								<span className={"each-cell-border-title"} style={{width: 83}}>用款金额</span>
								<span className={"each-cell-border-with-left-text"} style={{width: 320,paddingLeft:5}}>
									&nbsp;{`(大写) ${commonUtils.convertCurrency(eachItem.fee/100)}`}
								</span>
							<div className={"each-cell-border-with-left-text"} style={{border: 0}}>
									(小写)
								<div style={{textAlign:'right',display:'inline-block',float:'right'}}>
									{`￥${commonUtils.getFormatCentToYuan2(eachItem.fee)}`}
								</div>
							</div>
							</div>

							<div className={"each-row"}>
								<span className={"each-cell-border-title"} style={{width: 83}}>用款部门</span>
								<span className={"each-cell-border-content"} style={{width: 200}}>
							{/*用款部门 内容*/}
					</span>
								<span className={"each-cell-border-title"} style={{width: 90}}>账单编号</span>
								<span className={"each-cell-border-content"} style={{border:0}}>
						{/*账单编号的内容 */}  {eachItem.billSn}
					</span>
							</div>

							<div className={"each-row"}>
								<span className={"each-cell-border-title"} style={{width: 83}}>申请人</span>
								<span className={"each-cell-border-title"} style={{width: 200}} >

					</span>
								<span className={"each-cell-border-title"} style={{width: 90}}>公会帐期</span>
								<span className={"each-cell-border-content"} style={{border:0}}>
									{`${eachItem.guildName}(${eachItem.billDesc})`}
								</span>
							</div>

							<div className={"each-row"}>
								<span className={"each-cell-border-title"} style={{width: 83}} >部门负责人</span>
								<span className={"each-cell-border-title"} style={{width: 200}}></span>
								<span className={"each-cell-border-title"} style={{width: 90}} >收款单位全称</span>
								<span className={"each-cell-border-content"} style={{width: 200,border:0}}>{eachItem.accountName}</span>

							</div>

							<div className={"each-row"}>
								<span className={"each-cell-border-title"} style={{width: 83}} >财务签批</span>
								<span className={"each-cell-border-title"} style={{width: 200}}></span>
								<span className={"each-cell-border-title"} style={{width: 90}} >帐号</span>
								<span className={"each-cell-border-content"} style={{border:0}}>{eachItem.bankAccount}</span>

							</div>
							<div className="">
								<span className={"each-cell-border-title"} style={{width: 83}} >总经理</span>
								<span className={"each-cell-border-title"} style={{width: 200}}></span>
								<span className={"each-cell-border-title"} style={{width: 90}} >开户银行</span>
								<span className={"each-cell-border-content"} style={{border:0}}>
									{`${eachItem.branchName}`}
								</span>
							</div>
						</div>
					</div>
					)
				}
			</div>)
	}

	/**
	 * 报销的
	 * */
	generateExpenseAccount = (printData) =>{
		if ( !printData ) {
			return ''
		}
		const date = new Date()
		let pages = printData.pages||[];

		return (<div className={"expense-account"}>
			{
				pages.map(datas =>{
					let _four_rows_ = this._generateFourRows_( datas );
					//本页面内所有的金额综合，单位分，里面有为了渲染填充的空数据，先过滤掉,然后将费用求和,
					let totalMoneyOfThisPageInCent = datas.filter(it => it.fee).map(it => it.fee).reduce( (a,b) => a+b)
					// let normalRowHeight = 40;//普通单元格的高度
					let titleCellHeight = 30;//表头单元格的高度
					return (

						<div className="doc-to-print-main" >
							{/*<!--头部信息，标题和横线，以及票据填写日期-->*/}
							<div style={{marginTop: 80}}>
								{/*<!--中间这个空的span不能少了，不然就没了两段对齐的效果了-->*/}
								<div>
									<div className="head-title">报销单<span></span></div>
									<div className="line"></div>
								</div>
								{/*<!--票据的填写日期-->*/}
								<div className="doc-print-date-time" >
									<span style={{marginLeft:346}}>{date.getFullYear()}</span>
									<span style={{marginLeft:10}}>年</span>
									<span style={{marginLeft:10}}>{date.getMonth() +1}</span>
									<span style={{marginLeft:10}}>月</span>
									<span style={{marginLeft:10}}>{date.getDate()}</span>
									<span style={{marginLeft:10}}>日</span>
								</div>
							</div>
							{/*正文*/}
							<div className="main-content">
								{/*<!-- 发生日期的表头 -->*/}
								<div className="each-row" style={{height:60}}>
									{/*<!--发生日期-->*/}
									<div className="expense-time-title" style={{width:68}}>
										<div style={{width:68,height: titleCellHeight,borderBottom:'.5px solid black'}}>
                    <span className="each-cell-border-title" style={{width:68,height:titleCellHeight,border:0}} >
                        发生日期
                    </span>
										</div>
										<div style={{height:titleCellHeight}} >
											<span className="occured-time-item" style={{height:titleCellHeight}}>月</span>
											<span className="occured-time-item" style={{height:titleCellHeight,border:0}} >日</span>
										</div>

									</div>
									<span className="each-cell-border-title" style={{width:310,height:60}}  >&nbsp;报销内容&nbsp;</span>

									{/*"单据数量"四个字*/}
									<div className="expense-time-title" style={{width:68}}>
										<div style={{width:68,height:titleCellHeight}} >
                    <span className="each-cell-border-title" style={{width:68,height:titleCellHeight,border:0}}  >
                        &nbsp;单据&nbsp;
                    </span>
										</div>
										<div style={{width:68,height:titleCellHeight}} >
                    <span className="each-cell-border-title"  style={{width:68,height:titleCellHeight,border:0}} >
                        &nbsp;数量&nbsp;
                    </span>
										</div>
									</div> {/*"单据数量"四个字结束*/}

									{/*金额*/}
									<span className="each-cell-border-title" style={{width:151,height:60}} >
                			&nbsp;金额(元)&nbsp;
            			</span>

									<span className="each-cell-border-title" style={{width:87,height:60,border:0}} >&nbsp;备注&nbsp;</span>
								</div> {/*头部信息结束*/}

								{/*每一页有四行记录*/}
								{ _four_rows_ }
								{/*四行记录 over*/}

								{/*总额行,大写，小写*/}
								<div className="each-row" style={{border:0}}>
									<span className="money-total-label-and-content" style={{width:450}} >合计人民币(大写) {commonUtils.convertCurrency(totalMoneyOfThisPageInCent/100)} </span>

									<span className="money-total-label-and-content" style={{width:151,textAlign:'right'}} >
										￥{commonUtils.getFormatCentToYuan2(totalMoneyOfThisPageInCent)}
            </span>
									<span className="money-total-label-and-content" style={{width:87,border:0}} >&nbsp; </span>
								</div>

							</div> {/*正文table结束*/}

							{/*<!--底部，符合，出纳，报销人签字-->*/}
							<div className="" style={{width:680,marginTop:2,marginLeft:76}} >
								<span style={{width:'25%',textAlign:'center',display:'inline-block'}}>核准</span>
								<span style={{width:'30%',textAlign:'center',display:'inline-block'}} >审核</span>
								<span style={{width:'25%',textAlign:'center',display:'inline-block'}} >经办人</span>
								<span style={{width:'10%',textAlign:'center',display:'inline-block'}}></span>
							</div>
						</div>

					)
				})

			}
		</div>)
	}

	_generateFourRows_( datas ) {//渲染四行条目记录（实际每页只有四行）
		return datas.map( data => {
			let normalRowHeight = 40;
			return (
				<div className="each-row" style={{height: normalRowHeight}}>
					{/*<!--发生日期-->*/}
					<div className="expense-time-title" style={{width:68,height:normalRowHeight}}>
						<div style={{width:68,height:normalRowHeight}} >
							<span className="occured-time-item" style={{width:34}} >&nbsp;</span>
							<span className="occured-time-item" style={{border:0,width:34}} >&nbsp;</span>
						</div>

					</div>
					<span className="each-cell-border-content" style={{width:310,height:normalRowHeight, textAlign: 'center'}}  >&nbsp;{data.desc || ''}&nbsp;</span>

					{/*"单据数量"四个字*/}
					<div className="expense-time-title" style={{width:68,height:normalRowHeight}}>
						<div style={{width:68,height:normalRowHeight}} >
                    <span className="each-cell-border-content" style={{width:68,height:normalRowHeight,border:0, textAlign: 'center'}}  >
                        &nbsp;{data.fee ? 1 : ''}&nbsp;
                    </span>
						</div>
					</div> {/* 单据数量 */}

					{/*金额*/}

					<span className="each-cell-border-content" style={{width:151,height:normalRowHeight, textAlign: 'right'}} >
                {data.fee ? `${commonUtils.getFormatCentToYuan2( data.fee )}` : ''}
            </span>

					<span className="each-cell-border-content" style={{width:87,height:normalRowHeight,border:0}} >&nbsp;&nbsp;</span>
				</div>
			)
		} );
	}

	_generateFourRows_old( datas ) {//渲染四行条目记录（实际每页只有四行）
		return datas.map( data => {
			return (<div className="each-row" style={{ height: 30 }}>
					{/*<!--发生日期-->*/}
					<div className="expense-time-title" style={{ width: 70, height: 30 }}>
						<span className="occured-time-item" style={{ width: 34 }}> </span>
						<span className="occured-time-item" style={{ width: 34, border: 0 }}> </span>
					</div>

					<div className="expense-normal-item" style={{ width: 310 }}>
<span className="each-cell-border-content" style={{ width: 310, height: 30, border: 0 }}>
	{data.desc || ''}
</span>
					</div>
					<span className="cell-divider-hoz"></span> {/*分割线*/}

					{/*"单据数量"四个字*/}
					<div className="expense-normal-item" style={{ width: 68 }}>
						<div style={{ width: 68, height: 30 }}>
							<span className="each-cell-border-title" style={{ width: 68, height: 30, border: 0 }}>
							&nbsp;{data.fee ? 1 : ''}&nbsp;
							</span>
						</div>
					</div>
					{/*"单据数量"四个字结束*/}
					<span className="cell-divider-hoz"></span> {/*分割线*/}

					{/*金额*/}
					<span className="each-cell-border-content test-text-right" style={{ width: 151, height: 30, textAlign: 'right',backgroundColor:'red'}}>
							{data.fee ? `￥${commonUtils.getFormatCentToYuan( data.fee )}` : ''}  {/*金额*/}
					</span>
					<span className="cell-divider-hoz"></span> {/*分割线*/}

					<span className="each-cell-border-title" style={{ width: 87, height: 30, border: 0 }}>&nbsp;&nbsp;</span>
				</div>
			)
		} );
	}
}

export default new PrintContentGenerator()