import React from 'react';
import webUtils from './webUtils';

const FN = {
  getFormatTime(text){
    if(!text) return 0;
    if(text < 60) {
      return `${text}秒`
    } else if(text < 3600) {
      const minus = Math.floor(text/60);
      return `${minus}分${text - minus*60}秒`
    } else {
      const hours = Math.floor(text/3600);
      const minus = Math.floor( (text - hours*3600)/60 )
      const seconds = text - hours*3600 - minus*60
      return `${hours}小时${minus}分${seconds}秒`
    }
  },
  // 小时直接转
  getFormatHoursFromHour(text){
    return text ? `${text}小时` : '0小时'
  },
  // 天直接转
  getFormatDaysFromDay(text){
    return text ? `${text}天` : '0天'
  },
  // 分转元
  getFormatCentToYuan(cent){
    return cent ? `${cent/100}元` : '0元'
  },
  // 分转元，后面不带元，保留 小数点后两位
  getFormatCentToYuan2(cent){
    return cent ? `${this.centsToDecimal2(cent)}` : '0元'
  },
  // 分转元,保留两位小数，超过截取，默认为传入的参数为 整数型数字
	centsToDecimal2(cents){
		if (isNaN(cents)) {
			return null;
		}
		let asFloat = Math.round(cents/100).toFixed(2);//保留两位小数点，四舍五入
		let asString = asFloat.toString();
		let indexOfPoint = asString.indexOf('.');
		if (indexOfPoint < 0) {
			indexOfPoint = asString.length;
			asString += '.';
		}
		while (asString.length <= indexOfPoint + 2) {
			asString += '0';
		}
		return asString;
	},
  // 元
  getFormatYuan(yuan){
    return yuan ? `${yuan}元` : '0元'
  },
  // 百分转换  直接加%
  getFormatPercentOff(text){
    return text ? `${text}%` : '0%'
  },
  // 百分转换  需要*100
  getFormatPercent(text){
    return text ? `${text*100}%` : '0%'
  },
  recordToValueJson(record) {
    if(!record) return null;
    const obj = {};
    for(let [key, value] of Object.entries(record)){
      if(typeof value === 'number'){
        obj[key] = {value: String(value)}
      } else {
        obj[key] = {value}
      }
    }
    return obj
  },
  fullPictureUrl(picId, width=50, height=50){
    if(!picId) return null;
    const fullPicUrl = webUtils.fullPictureUrl(picId);
    return <a href={fullPicUrl} target="_blank"><img width={width} height={height} src={fullPicUrl} alt="" /></a>
  },
	//代码如下所示：
	convertCurrency( money ) {
		//汉字的数字
		const cnNums = new Array( '零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖' );
		//基本单位
		const monetaryUnit = new Array( '', '拾', '佰', '仟' );
		//对应整数部分扩展单位
		const cnIntUnits = new Array( '', '万', '亿', '兆' );
		//对应小数部分单位
		const cnDecUnits = new Array( '角', '分', '毫', '厘' );
		//整数金额时后面跟的字符
		const cnInteger = '整';
		//整型完以后的单位
		const cnIntLast = '圆';
		//最大处理的数字
		const maxNum = 999999999999999.9999;
		//金额整数部分
		let integerNum;
		//金额小数部分
		let decimalNum;
		//输出的中文金额字符串
		let chineseStr = '';
		//分离金额后用的数组，预定义
		let parts;
		if ( money == '' ) {
			return '';
		}
		money = parseFloat( money );
		if ( money >= maxNum ) {
			//超出最大处理数字
			return '';
		}
		if ( money == 0 ) {
			chineseStr = cnNums[ 0 ] + cnIntLast + cnInteger;
			return chineseStr;
		}
		//转换为字符串
		money = money.toString();
		if ( money.indexOf( '.' ) == -1 ) {
			integerNum = money;
			decimalNum = '';
		} else {
			parts = money.split( '.' );
			integerNum = parts[ 0 ];
			decimalNum = parts[ 1 ].substr( 0, 4 );
		}
		//获取整型部分转换
		if ( parseInt( integerNum, 10 ) > 0 ) {
			let zeroCount = 0;
			let IntLen = integerNum.length;
			for ( let i = 0; i < IntLen; i++ ) {
				let n = integerNum.substr( i, 1 );
				let p = IntLen - i - 1;
				let q = p / 4;
				let m = p % 4;
				if ( n == '0' ) {
					zeroCount++;
				} else {
					if ( zeroCount > 0 ) {
						chineseStr += cnNums[ 0 ];
					}
					//归零
					zeroCount = 0;
					chineseStr += cnNums[ parseInt( n ) ] + monetaryUnit[ m ];
				}
				if ( m == 0 && zeroCount < 4 ) {
					chineseStr += cnIntUnits[ q ];
				}
			}
			chineseStr += cnIntLast;
		}
		//小数部分
		if ( decimalNum != '' ) {
			let decLen = decimalNum.length;
			for ( let i = 0; i < decLen; i++ ) {
				let n = decimalNum.substr( i, 1 );
				if ( n != '0' ) {
					chineseStr += cnNums[ Number( n ) ] + cnDecUnits[ i ];
				}
			}
		}
		if ( chineseStr == '' ) {
			chineseStr += cnNums[ 0 ] + cnIntLast + cnInteger;
		} else if ( decimalNum == '' ) {
			chineseStr += cnInteger;
		}
		return chineseStr;
	}
}
export default FN;