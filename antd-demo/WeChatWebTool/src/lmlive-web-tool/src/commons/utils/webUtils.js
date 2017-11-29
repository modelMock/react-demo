import {Modal} from 'antd';

// 图片CDN
const IMG_CDN_URL =  "http://cdn.51lm.tv/";

const __tipTpls = (success, content, duration=3000) => {
  if(window.tipModal){
    window.tipModal.destroy()
    window.tipModal = null
  }
  window.tipModal = success ? Modal.success({ title: '成功提示', content })
    : Modal.error({ title: '错误提示', content });
  if(duration > 0) {
    setTimeout(()=>{ window.tipModal.destroy(); }, duration)
  }
};

const __tipTplsAndOkBtn = (success, content, onOk=function(){}) => {
  if(window.tipTplModal){
    window.tipTplModal.destroy()
    window.tipTplModal = null
  }
  window.tipTplModal = success ? Modal.success({ title: '成功提示', content, onOk })
    : Modal.error({ title: '错误提示', content, onOk });
};

const buttonResListMap = {};

// 上传图片枚举
const OSSUploadFolderName = {
  // 主播头像
  HeadingPic: "anchorimg/",
  // 封面
  ProgramPic: "program/",
  // 礼物
  Gift: "gift/",
  // 物品(礼物打标签小图标、守护图标等)
  Goods: "goods/",
  // 动画
  Animation: "animation/",
  // 广告条上传目录
  ConfigPic: "config/",
  // 公会上传目录
  GuildPic: "guild/"
}

//noinspection JSValidateTypes
const FN = {
  // 是否调试模式
  getDebugMode: function() {
    return process.env.NODE_ENV == 'development';
  },
  /**
   * 获取上传图片所属目录
   * @method getUploadFolderName 上传图片类型，对应目录名称
   * @return {String} 上传成功图片路径
   */
  getUploadFolderName: function(key) {
    return OSSUploadFolderName[key]
  },
  /**
   * 成功提示框(默认提示框2秒后自动关闭，若不需要自动关闭，设置duratiuon=0)
   * @type {String} 提示文本
   */
  alertSuccess: __tipTpls.bind(this, true),
  alertSuccessCallback: __tipTplsAndOkBtn.bind(this, true),
  /**
   * 错误提示框
   * @type {String} 提示文本
   */
  alertFailure: __tipTpls.bind(this, false),
  alertFailureCallback: __tipTplsAndOkBtn.bind(this, false),
  /**
   * 确认提示框
   * @type {String} 提示文本
   */
  confirm: function(fn=function(){}, content="确认提交吗？", title="提示") {
    Modal.confirm({
      title,
      content,
      onOk: function() {
        fn.call(this);
      }
    });
  },
  // 格式化图片URL
  fullPictureUrl: function(picName){
    if(!picName || picName.length === 0){
      return null
    }
    return IMG_CDN_URL + picName
  },
  // 设置每个资源界面按钮权限集合
  setButtonResMap: function(resId, buttonResList) {
    if(!buttonResListMap[resId]) {
      buttonResListMap[resId] = buttonResList;
    }
  },
  // 获取每个资源界面按钮权限集合
  getButtonResByResId: function(resId) {
    return buttonResListMap[resId];
  },
  delAppCookies: function() {

  }
}

export default FN;
