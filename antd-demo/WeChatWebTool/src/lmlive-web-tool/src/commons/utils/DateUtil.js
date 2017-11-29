import moment from 'moment';

/**
 * 几个固定的格式
 * @type {{}}
 */
export const FORMAT_PATTERNS = {
	/**
	 * 仅仅格式化 年月日.
	 */
	YMD: 'YYYY-MM-DD',
	/**
	 * 年月日，时分秒都有的格式。按照中国的24小时计时习惯.
	 */
	FULL_FORMAT: 'YYYY-MM-DD HH:mm:ss',
	/**
	 * 目标时间当天的开始，时分秒都为0
	 */
	FULL_FORMAT_START_OF_DAY: 'YYYY-MM-DD 00:00:00',
	/**
	 * 目标时间当天的最后一秒,下一秒将会是新的一天
	 */
	FULL_FORMAT_END_OF_DAY: 'YYYY-MM-DD 23:59:59',//
}
/**
 * 处理时间的小工具
 */
export const DateUtil = {

	/**
	 * 格式化时间
	 * @param date
	 * @param format
	 * @returns {*} 不做过多的校验。如果时间为null，返回空字符串
	 */
	formatDate( date, format = FORMAT_PATTERNS.FULL_FORMAT ) {
		if ( !date ) return ''
		return date.format( format )
	},
	/**
	 * 返回当前时间，并且值保留年月日
	 * @returns {*|moment.Moment}
	 */
	nowAsYmd() {
		return moment( new Date(), FORMAT_PATTERNS.YMD );
	},
	/**
	 * 以当前时间为基准生成一个时间的范围.
	 * @param theFirstDaysDiff      开始时间跟当前时间的 天数差
	 * @param theSecondDaysDiff     结束时间跟当前时间的 天数差
	 * @returns {[null,null]}       以数组返回，可以使用解构函数接收
	 */
	rangeWithDaysDiff( theFirstDaysDiff, theSecondDaysDiff ) {
		const d1 = moment( moment().subtract( theFirstDaysDiff, 'days' ), FORMAT_PATTERNS.FULL_FORMAT_START_OF_DAY );
		const d2 = moment( moment().subtract( theSecondDaysDiff, 'days' ), FORMAT_PATTERNS.FULL_FORMAT_END_OF_DAY );
		return [ d1, d2 ]
	},
	/**
	 * 将时间格式化为 YYYY-MM-DD 00:00:00 的格式
	 * @param date  要格式化的时间
	 * @returns {*} #formatDate
	 */
	formatAsStartOfDay( date ) {
		return this.formatDate( date, FORMAT_PATTERNS.FULL_FORMAT_START_OF_DAY )
	},
	/**
	 * 将时间格式化当前的最后一秒  比如 年-月-日 23:59:59
	 * @param date
	 * @returns {*}
	 */
	formatAsEndOfDay( date ) {
		return this.formatDate( date, FORMAT_PATTERNS.FULL_FORMAT_END_OF_DAY )
	},
	/**
	 * 根据传入的时间判断这个时间所处的帐期,比如 2017-08-01 xxxxx  所处的帐期是 201708-1
	 * @param date
	 * @returns {*}
	 */
	whichBillPeriod( date ) {
		if(!date) return null;
		let BILL_SN_FORMAT = 'YYYYMM'
		let time = moment(date)
		let paymentDay = time.get( 'date' );//日
		let currentBillNumber = Math.floor( paymentDay / 10 ) + 1;//当前日期是处于第几个帐期
		currentBillNumber = currentBillNumber>3 ? 3 : currentBillNumber // 30 /31好的时候会出现 第四个 帐期，需要单独处理
		return `${this.formatDate(time,BILL_SN_FORMAT)}-${currentBillNumber}`
	},
	/**
	 * 公会奖惩  ，奖励，惩罚只能选择 上个月3帐和本月第三帐期 ，暂扣是四个帐期都可以
	 *
	 * 主播只有两个帐期，当前的帐期和上一个帐期
	 *
	 * @param isGuild   是否是公会相关的操作
	 * @param isTemporarySeizure  是否是暂扣.奖励，惩罚只能选择 上个月3帐和本月第三帐期 ，暂扣是四个帐期都可以
	 * @returns {*}
	 */
	getAccountData( isGuild, isTemporarySeizure ) {
		let now = moment();//当前时间
		let BILL_SN_FORMAT = 'YYYYMM'

		let allThreeCycleNums = [ 1, 2, 3 ];//一共有的三个帐期
		let result = []
		if ( isGuild ) {//公会需要的，可能会是四个，也可能是两个
			now.add( -1, 'month' )//跳回上个月
			result.push( `${this.formatDate( now, BILL_SN_FORMAT )}-3` ) //上个月第三期,后面在加上本月的三期
			now.add( 1, 'month' )
			let prefix = this.formatDate( now, BILL_SN_FORMAT )
			//过滤一下，如果是 暂扣，则不过滤,否则只保留 第三帐期 . 最后拼接成字符串
			return result.concat( allThreeCycleNums.filter( num => !isTemporarySeizure || num == 3 ).map( num => `${prefix}-${num}` ) )
		}

		//主播需要的，只需要两个
		let paymentDay = now.get( 'date' );//日
		let currentBillNumber = Math.ceil( paymentDay / 10 );//当前日期是处于第几个帐期

		let theFirstCycleOfMonth = currentBillNumber == 1;//当前时间是本月第一个帐期
		if ( theFirstCycleOfMonth ) {
			now.add( -1, 'month' )//跳回上个月
			result.push( `${this.formatDate( now, BILL_SN_FORMAT )}-3` )
			now.add( 1, 'month' )//然后回到本月
		}
		let prefix = this.formatDate( now, BILL_SN_FORMAT )

		return result.concat( allThreeCycleNums.filter( num => currentBillNumber == num || currentBillNumber - num == 1 ).map( num => `${prefix}-${num}` ) )
	}

}

