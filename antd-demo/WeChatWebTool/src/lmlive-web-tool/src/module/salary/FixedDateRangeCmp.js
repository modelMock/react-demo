/**
 * 信息相关的几个都有 15/30天时间范围的查询，将共有的部分抽取出来
 */
import { Component } from 'react';
import { DateUtil, FORMAT_PATTERNS } from '../../commons/utils/DateUtil';

/**
 * 几个组件共用的部分.都有一个DateRange,并且都是 15，30 天.
 * 都有时间范围按钮点击之后自动修改条件查询的事件相应.
 */
export default class FixedDateRangeCmp extends Component {

	constructor( props ) {
		super( props )
		this.dateRangeConfigValue = this.configDateRange();
		let { theFirstDaysDiff, theSecondDaysDiff } = this.dateRangeConfigValue.diffs
		let [ fifteenDaysAgo, thirtyDayAgo ] = DateUtil.rangeWithDaysDiff( theFirstDaysDiff, theSecondDaysDiff )
		// Object.assign(this,{fifteenDaysAgo,thirtyDayAgo})
		this.fifteenDaysAgo = fifteenDaysAgo    //这样从后面的代码能跳转过来
		this.thirtyDayAgo = thirtyDayAgo
		this.firstRangeButtonType = "#49a9ee";    //第一个按钮(最近15天)的样式
		this.secondRangeButtonType = "";          //第一个按钮(最近30天)的样式
	}

	/**
	 * 对dateRange的配置，
	 * 包括
	 * 时间范围(多少天，比如15天，30天 。。。)
	 * 时间范围的两个值作为参数传给后台时候的 名称
	 * @returns {{names: {start: string, end: string}, diffs: {theFirstDaysDiff: number, theSecondDaysDiff: number}}}
	 */
	configDateRange() {
		let [ start, end ] = this.getDateRangeFieldNames()
		let [ theFirstDaysDiff, theSecondDaysDiff ] = [ 15, 30 ]
		return {
			names: { start, end },//在表单里的 fieldName
			diffs: { theFirstDaysDiff, theSecondDaysDiff }//前后两个时间举例今天的时间差
		}
	}

	/**
	 * 额外的需要添加到表单里的数据,比如有个地方需要而外加上 {target:"GUILD"}
	 * @param values 偷个懒，把原先的表单值给传进来
	 * @returns {{}}
	 */
	getExtraFormValues(values) {//
		return {}
	}

	/**
	 * 时间范围的两个字段的参数 ,继承这个类的children各自根据后台参数名称修改，默认为 'startDate', 'endDate'
	 * @returns {[string,string]}
	 */
	getDateRangeFieldNames() {//
		return [ 'startDate', 'endDate' ];
	}

	/**
	 * 查询最近15天,30天内的数据,固定的时间范围,处理两个时间范围的按钮的点击事件.
	 * @param beforeDay
	 */
	queryWithFixedRange = ( beforeDay ) => {
		this.props.form.resetFields( [ "data" ] )  //此时时间范围已经被重置了,获取表单的参数的时候不会出问题
		let value = this.extractedFormValue()
		value[this.getDateRangeFieldNames()[0]] = DateUtil.formatDate(beforeDay)
		this.props.onSearch( value );
		let clickedTheFirstBtn = beforeDay == this.fifteenDaysAgo;//判断是 15/30 天 者两个按钮哪个被点击了，从而改变对应的样式
		//设置按钮样式
		if ( clickedTheFirstBtn ) {
			this.firstRangeButtonType = "#49a9ee";
			this.secondRangeButtonType = "";
		} else {
			this.firstRangeButtonType = "";
			this.secondRangeButtonType = "#49a9ee";
		}
		this.setState( {
			beforeDay,
			btnStyle: clickedTheFirstBtn
		} )
	}

	/**
	 * 抽取表单的值,
	 * @returns {Object | *}
	 */
	extractedFormValue() {
		let value = this.props.form.getFieldsValue();
		let dateRange = value[ 'data' ];
		if ( dateRange && dateRange.length > 0 ) {
			dateRange[ 0 ] && (value[ this.dateRangeConfigValue.names.start ] = DateUtil.formatAsStartOfDay( dateRange[ 0 ] ));
			dateRange[ 1 ] && (value[ this.dateRangeConfigValue.names.end ] = DateUtil.formatAsEndOfDay( dateRange[ 1 ] ));
		}
		delete value[ 'data' ];
		let extraValue = this.getExtraFormValues(value)
		if ( !!extraValue ) {
			Object.assign( value, extraValue )
		}
		return value;
	}
}