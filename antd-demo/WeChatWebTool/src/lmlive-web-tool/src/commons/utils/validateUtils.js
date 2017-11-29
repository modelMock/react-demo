const FN = {
  // 验证银行卡号
  checkBankCardNum(rule, value, callback) {
    if(!value ||　/^\d{16}|\d{19}$/.test(value)) {
      callback();
    } else {
      callback("输入银行卡号格式不正确");
    }
  },
  // 验证身份证号码
  checkCertNum(rule, value, callback) {
    if (/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/.test(value)){
      callback();
    } else {
      callback("输入身份证号码格式不正确");
    }
  },
  // 验证手机号码
  checkMobile(rule, value, callback) {
    if (/^1[3|4|5|7|8]\d{9}$/.test(value)){
      callback();
    } else {
      callback("输入手机号码格式不正确");
    }
  },
  // 验证QQ号码
  checkQQ(rule, value, callback) {
    if(/^[1-9][0-9]{4,}$/.test(value)) {
      callback();
    } else {
      callback("输入QQ号格式不正确");
    }
  },
  // 验证微信号码
  checkWeixin(rule, value, callback) {
    if(!value || /^[a-zA-Z\d_]{5,}$/.test(value)) {
      callback();
    } else {
      callback("输入微信号格式不正确");
    }
  }
}
export default FN;