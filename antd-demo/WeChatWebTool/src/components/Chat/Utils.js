import React, {Component, PropTypes} from 'react';
import {Icon} from 'antd';
import classnames from 'classnames';

const IMAGE_SERVER_URL = "http://katule.img-cn-hangzhou.aliyuncs.com/";
export function imgPaddedPrefix(imgUrl) {
  if(!imgUrl) return '';
  if(imgUrl.indexOf("http://") == 0 || imgUrl.indexOf("https://") == 0) {
    return imgUrl;
  }
  return IMAGE_SERVER_URL + imgUrl;
}

export const EMOJI_SERVER_URL = "http://img.t.sinajs.cn/t3/style/images/common/face/emimage/#.png";

export const LINK = '0';  //链接消息
export const TXT = '1';   //文本消息
//服务器发过来的2、4都是图片链接，向服务器发送图片用2
export const IMG_DATA = '2';   //二进制图片
export const AUDIO = '3';     //语音消息
export const IMG_LINK = '4';   //图片链接
export const MONEY_MSG = '7';   //转账消息
export const RED_PACKET = '8';   //红包信息
export const RECALL_MSG = '9';   //撤回信息提示
export const TIME = '100';      //时间消息(2条消息之前插入的时间标记)
export const C_NOTICE = '10000';  //群公告

export const FROM_FRD = "0";    //微信好友消息
export const FROM_OPT = "1";    //运营号自己消息

export const CMD_HEARTBEAT = 0;   //回复心跳指令类型
export const CMD_HEARTBEAT_SERVER = 1;   //服务器回复心跳
export const CMD_SEND_SERVER = 2;   //服务器发给前台的聊天内容
export const CMD_FEEDBACK = 3;    //回复 当前好友正在聊天 指令类型
export const CMD_SEND = 4;        //回复好友消息指令类型
export const CMD_PLAY_AUDIO = 5;        //回复播放语音指令类型
export const CMD_GO_AWAY = 6;        //从在岗切换为离岗
export const CMD_COME_BACK = 7;        //从离岗切换为在岗
export const CMD_C_SEND_SERVER = 8;   //群消息：后台发送过来
export const CMD_C_SEND = 9;        //群消息：前台发给后台

export const HEARTBEAT_INTERVAL_TIME = 60000;  //发送心跳间隔时间：1分钟
export const LIMIT_MESSAGE_PAGE = 10; //聊天框中分页limit数量

// QQ所有的表情
export const QQFACES = [
  {title:"微笑", type:"qq", class:"qqface0"},
  {title:"撇嘴", type:"qq", class:"qqface1"},
  {title:"色", type:"qq", class:"qqface2"},
  {title:"发呆", type:"qq", class:"qqface3"},
  {title:"得意", type:"qq", class:"qqface4"},
  {title:"流泪", type:"qq", class:"qqface5"},
  {title:"害羞", type:"qq", class:"qqface6"},
  {title:"闭嘴", type:"qq", class:"qqface7"},
  {title:"睡", type:"qq", class:"qqface8"},
  {title:"大哭", type:"qq", class:"qqface9"},
  {title:"尴尬", type:"qq", class:"qqface10"},
  {title:"发怒", type:"qq", class:"qqface11"},
  {title:"调皮", type:"qq", class:"qqface12"},
  {title:"呲牙", type:"qq", class:"qqface13"},
  {title:"惊讶", type:"qq", class:"qqface14"},
  {title:"难过", type:"qq", class:"qqface15"},
  {title:"酷", type:"qq", class:"qqface16"},
  {title:"冷汗", type:"qq", class:"qqface17"},
  {title:"抓狂", type:"qq", class:"qqface18"},
  {title:"吐", type:"qq", class:"qqface19"},
  {title:"偷笑", type:"qq", class:"qqface20"},
  {title:"愉快", type:"qq", class:"qqface21"},
  {title:"白眼", type:"qq", class:"qqface22"},
  {title:"傲慢", type:"qq", class:"qqface23"},
  {title:"饥饿", type:"qq", class:"qqface24"},
  {title:"困", type:"qq", class:"qqface25"},
  {title:"惊恐", type:"qq", class:"qqface26"},
  {title:"流汗", type:"qq", class:"qqface27"},
  {title:"憨笑", type:"qq", class:"qqface28"},
  {title:"悠闲", type:"qq", class:"qqface29"},
  {title:"奋斗", type:"qq", class:"qqface30"},
  {title:"咒骂", type:"qq", class:"qqface31"},
  {title:"疑问", type:"qq", class:"qqface32"},
  {title:"嘘", type:"qq", class:"qqface33"},
  {title:"晕", type:"qq", class:"qqface34"},
  {title:"疯了", type:"qq", class:"qqface35"},
  {title:"衰", type:"qq", class:"qqface36"},
  {title:"骷髅", type:"qq", class:"qqface37"},
  {title:"敲打", type:"qq", class:"qqface38"},
  {title:"再见", type:"qq", class:"qqface39"},
  {title:"擦汗", type:"qq", class:"qqface40"},
  {title:"抠鼻", type:"qq", class:"qqface41"},
  {title:"鼓掌", type:"qq", class:"qqface42"},
  {title:"糗大了", type:"qq", class:"qqface43"},
  {title:"坏笑", type:"qq", class:"qqface44"},
  {title:"左哼哼", type:"qq", class:"qqface45"},
  {title:"右哼哼", type:"qq", class:"qqface46"},
  {title:"哈欠", type:"qq", class:"qqface47"},
  {title:"鄙视", type:"qq", class:"qqface48"},
  {title:"委屈", type:"qq", class:"qqface49"},
  {title:"快哭了", type:"qq", class:"qqface50"},
  {title:"阴险", type:"qq", class:"qqface51"},
  {title:"亲亲", type:"qq", class:"qqface52"},
  {title:"吓", type:"qq", class:"qqface53"},
  {title:"可怜", type:"qq", class:"qqface54"},
  {title:"菜刀", type:"qq", class:"qqface55"},
  {title:"西瓜", type:"qq", class:"qqface56"},
  {title:"啤酒", type:"qq", class:"qqface57"},
  {title:"篮球", type:"qq", class:"qqface58"},
  {title:"乒乓", type:"qq", class:"qqface59"},
  {title:"咖啡", type:"qq", class:"qqface60"},
  {title:"饭", type:"qq", class:"qqface61"},
  {title:"猪头", type:"qq", class:"qqface62"},
  {title:"玫瑰", type:"qq", class:"qqface63"},
  {title:"凋谢", type:"qq", class:"qqface64"},
  {title:"嘴唇", type:"qq", class:"qqface65"},
  {title:"爱心", type:"qq", class:"qqface66"},
  {title:"心碎", type:"qq", class:"qqface67"},
  {title:"蛋糕", type:"qq", class:"qqface68"},
  {title:"闪电", type:"qq", class:"qqface69"},
  {title:"炸弹", type:"qq", class:"qqface70"},
  {title:"刀", type:"qq", class:"qqface71"},
  {title:"足球", type:"qq", class:"qqface72"},
  {title:"瓢虫", type:"qq", class:"qqface73"},
  {title:"便便", type:"qq", class:"qqface74"},
  {title:"月亮", type:"qq", class:"qqface75"},
  {title:"太阳", type:"qq", class:"qqface76"},
  {title:"礼物", type:"qq", class:"qqface77"},
  {title:"拥抱", type:"qq", class:"qqface78"},
  {title:"强", type:"qq", class:"qqface79"},
  {title:"弱", type:"qq", class:"qqface80"},
  {title:"握手", type:"qq", class:"qqface81"},
  {title:"胜利", type:"qq", class:"qqface82"},
  {title:"抱拳", type:"qq", class:"qqface83"},
  {title:"勾引", type:"qq", class:"qqface84"},
  {title:"拳头", type:"qq", class:"qqface85"},
  {title:"差劲", type:"qq", class:"qqface86"},
  {title:"爱你", type:"qq", class:"qqface87"},
  {title:"NO", type:"qq", class:"qqface88"},
  {title:"OK", type:"qq", class:"qqface89"},
  {title:"爱情", type:"qq", class:"qqface90"},
  {title:"飞吻", type:"qq", class:"qqface91"},
  {title:"跳跳", type:"qq", class:"qqface92"},
  {title:"发抖", type:"qq", class:"qqface93"},
  {title:"怄火", type:"qq", class:"qqface94"},
  {title:"转圈", type:"qq", class:"qqface95"},
  {title:"磕头", type:"qq", class:"qqface96"},
  {title:"回头", type:"qq", class:"qqface97"},
  {title:"跳绳", type:"qq", class:"qqface98"},
  {title:"投降", type:"qq", class:"qqface99"},
  {title:"激动", type:"qq", class:"qqface100"},
  {title:"乱舞", type:"qq", class:"qqface101"},
  {title:"献吻", type:"qq", class:"qqface102"},
  {title:"左太极", type:"qq", class:"qqface103"},
  {title:"右太极", type:"qq", class:"qqface104"}
];

// emoji表情
export const EMOJIFACES = [
  {title:"笑脸", type:"emoji", class:"emoji0"},
  {title:"开心", type:"emoji", class:"emoji1"},
  {title:"大笑", type:"emoji", class:"emoji2"},
  {title:"热情", type:"emoji", class:"emoji3"},
  {title:"眨眼", type:"emoji", class:"emoji4"},
  {title:"色", type:"emoji", class:"emoji5"},
  {title:"接吻", type:"emoji", class:"emoji6"},
  {title:"亲吻", type:"emoji", class:"emoji7"},
  {title:"脸红", type:"emoji", class:"emoji8"},
  {title:"露齿笑", type:"emoji", class:"emoji9"},
  {title:"满意", type:"emoji", class:"emoji10"},
  {title:"戏弄", type:"emoji", class:"emoji11"},
  {title:"吐舌", type:"emoji", class:"emoji12"},
  {title:"无语", type:"emoji", class:"emoji13"},
  {title:"得意", type:"emoji", class:"emoji14"},
  {title:"汗", type:"emoji", class:"emoji15"},
  {title:"失望", type:"emoji", class:"emoji16"},
  {title:"低落", type:"emoji", class:"emoji17"},
  {title:"呸", type:"emoji", class:"emoji18"},
  {title:"焦虑", type:"emoji", class:"emoji19"},
  {title:"担心", type:"emoji", class:"emoji20"},
  {title:"震惊", type:"emoji", class:"emoji21"},
  {title:"悔恨", type:"emoji", class:"emoji22"},
  {title:"眼泪", type:"emoji", class:"emoji23"},
  {title:"哭", type:"emoji", class:"emoji24"},
  {title:"破涕为笑", type:"emoji", class:"emoji25"},
  {title:"晕", type:"emoji", class:"emoji26"},
  {title:"恐惧", type:"emoji", class:"emoji27"},
  {title:"心烦", type:"emoji", class:"emoji28"},
  {title:"生气", type:"emoji", class:"emoji29"},
  {title:"睡觉", type:"emoji", class:"emoji30"},
  {title:"生病", type:"emoji", class:"emoji31"},
  {title:"恶魔", type:"emoji", class:"emoji32"},
  {title:"外星人", type:"emoji", class:"emoji33"},
  {title:"心", type:"emoji", class:"emoji34"},
  {title:"心碎", type:"emoji", class:"emoji35"},
  {title:"丘比特", type:"emoji", class:"emoji36"},
  {title:"闪烁", type:"emoji", class:"emoji37"},
  {title:"星星", type:"emoji", class:"emoji38"},
  {title:"叹号", type:"emoji", class:"emoji39"},
  {title:"问号", type:"emoji", class:"emoji40"},
  {title:"睡着", type:"emoji", class:"emoji41"},
  {title:"水滴", type:"emoji", class:"emoji42"},
  {title:"音乐", type:"emoji", class:"emoji43"},
  {title:"火", type:"emoji", class:"emoji44"},
  {title:"便便", type:"emoji", class:"emoji45"},
  {title:"强", type:"emoji", class:"emoji46"},
  {title:"弱", type:"emoji", class:"emoji47"},
  {title:"拳头", type:"emoji", class:"emoji48"},
  {title:"胜利", type:"emoji", class:"emoji49"},
  {title:"上", type:"emoji", class:"emoji50"},
  {title:"下", type:"emoji", class:"emoji51"},
  {title:"右", type:"emoji", class:"emoji52"},
  {title:"左", type:"emoji", class:"emoji53"},
  {title:"第一", type:"emoji", class:"emoji54"},
  {title:"强壮", type:"emoji", class:"emoji55"},
  {title:"吻", type:"emoji", class:"emoji56"},
  {title:"热恋", type:"emoji", class:"emoji57"},
  {title:"男孩", type:"emoji", class:"emoji58"},
  {title:"女孩", type:"emoji", class:"emoji59"},
  {title:"女士", type:"emoji", class:"emoji60"},
  {title:"男士", type:"emoji", class:"emoji61"},
  {title:"天使", type:"emoji", class:"emoji62"},
  {title:"骷髅", type:"emoji", class:"emoji63"},
  {title:"红唇", type:"emoji", class:"emoji64"},
  {title:"太阳", type:"emoji", class:"emoji65"},
  {title:"下雨", type:"emoji", class:"emoji66"},
  {title:"多云", type:"emoji", class:"emoji67"},
  {title:"雪人", type:"emoji", class:"emoji68"},
  {title:"月亮", type:"emoji", class:"emoji69"},
  {title:"闪电", type:"emoji", class:"emoji70"},
  {title:"海浪", type:"emoji", class:"emoji71"},
  {title:"猫", type:"emoji", class:"emoji72"},
  {title:"小狗", type:"emoji", class:"emoji73"},
  {title:"老鼠", type:"emoji", class:"emoji74"},
  {title:"仓鼠", type:"emoji", class:"emoji75"},
  {title:"兔子", type:"emoji", class:"emoji76"},
  {title:"狗", type:"emoji", class:"emoji77"},
  {title:"青蛙", type:"emoji", class:"emoji78"},
  {title:"老虎", type:"emoji", class:"emoji79"},
  {title:"考拉", type:"emoji", class:"emoji80"},
  {title:"熊", type:"emoji", class:"emoji81"},
  {title:"猪", type:"emoji", class:"emoji82"},
  {title:"牛", type:"emoji", class:"emoji83"},
  {title:"野猪", type:"emoji", class:"emoji84"},
  {title:"猴子", type:"emoji", class:"emoji85"},
  {title:"马", type:"emoji", class:"emoji86"},
  {title:"蛇", type:"emoji", class:"emoji87"},
  {title:"鸽子", type:"emoji", class:"emoji88"},
  {title:"鸡", type:"emoji", class:"emoji89"},
  {title:"企鹅", type:"emoji", class:"emoji90"},
  {title:"毛虫", type:"emoji", class:"emoji91"},
  {title:"章鱼", type:"emoji", class:"emoji92"},
  {title:"鱼", type:"emoji", class:"emoji93"},
  {title:"鲸鱼", type:"emoji", class:"emoji94"},
  {title:"海豚", type:"emoji", class:"emoji95"},
  {title:"玫瑰", type:"emoji", class:"emoji96"},
  {title:"花", type:"emoji", class:"emoji97"},
  {title:"棕榈树", type:"emoji", class:"emoji98"},
  {title:"仙人掌", type:"emoji", class:"emoji99"},
  {title:"礼盒", type:"emoji", class:"emoji100"},
  {title:"南瓜灯", type:"emoji", class:"emoji101"},
  {title:"鬼魂", type:"emoji", class:"emoji102"},
  {title:"圣诞老人", type:"emoji", class:"emoji103"},
  {title:"圣诞树", type:"emoji", class:"emoji104"},
  {title:"礼物", type:"emoji", class:"emoji105"},
  {title:"铃", type:"emoji", class:"emoji106"},
  {title:"庆祝", type:"emoji", class:"emoji107"},
  {title:"气球", type:"emoji", class:"emoji108"},
  {title:"CD", type:"emoji", class:"emoji109"},
  {title:"相机", type:"emoji", class:"emoji110"},
  {title:"录像机", type:"emoji", class:"emoji111"},
  {title:"电脑", type:"emoji", class:"emoji112"},
  {title:"电视", type:"emoji", class:"emoji113"},
  {title:"电话", type:"emoji", class:"emoji114"},
  {title:"解锁", type:"emoji", class:"emoji115"},
  {title:"锁", type:"emoji", class:"emoji116"},
  {title:"钥匙", type:"emoji", class:"emoji117"},
  {title:"成交", type:"emoji", class:"emoji118"},
  {title:"灯泡", type:"emoji", class:"emoji119"},
  {title:"邮箱", type:"emoji", class:"emoji120"},
  {title:"浴缸", type:"emoji", class:"emoji121"},
  {title:"钱", type:"emoji", class:"emoji122"},
  {title:"炸弹", type:"emoji", class:"emoji123"},
  {title:"手枪", type:"emoji", class:"emoji124"},
  {title:"药丸", type:"emoji", class:"emoji125"},
  {title:"橄榄球", type:"emoji", class:"emoji126"},
  {title:"篮球", type:"emoji", class:"emoji127"},
  {title:"足球", type:"emoji", class:"emoji128"},
  {title:"棒球", type:"emoji", class:"emoji129"},
  {title:"高尔夫", type:"emoji", class:"emoji130"},
  {title:"奖杯", type:"emoji", class:"emoji131"},
  {title:"入侵者", type:"emoji", class:"emoji132"},
  {title:"唱歌", type:"emoji", class:"emoji133"},
  {title:"吉他", type:"emoji", class:"emoji134"},
  {title:"比基尼", type:"emoji", class:"emoji135"},
  {title:"皇冠", type:"emoji", class:"emoji136"},
  {title:"雨伞", type:"emoji", class:"emoji137"},
  {title:"手提包", type:"emoji", class:"emoji138"},
  {title:"口红", type:"emoji", class:"emoji139"},
  {title:"戒指", type:"emoji", class:"emoji140"},
  {title:"钻石", type:"emoji", class:"emoji141"},
  {title:"咖啡", type:"emoji", class:"emoji142"},
  {title:"啤酒", type:"emoji", class:"emoji143"},
  {title:"干杯", type:"emoji", class:"emoji144"},
  {title:"鸡尾酒", type:"emoji", class:"emoji145"},
  {title:"汉堡", type:"emoji", class:"emoji146"},
  {title:"薯条", type:"emoji", class:"emoji147"},
  {title:"意面", type:"emoji", class:"emoji148"},
  {title:"寿司", type:"emoji", class:"emoji149"},
  {title:"面条", type:"emoji", class:"emoji150"},
  {title:"煎蛋", type:"emoji", class:"emoji151"},
  {title:"冰激凌", type:"emoji", class:"emoji152"},
  {title:"蛋糕", type:"emoji", class:"emoji153"},
  {title:"苹果", type:"emoji", class:"emoji154"},
  {title:"飞机", type:"emoji", class:"emoji155"},
  {title:"火箭", type:"emoji", class:"emoji156"},
  {title:"自行车", type:"emoji", class:"emoji157"},
  {title:"高铁", type:"emoji", class:"emoji158"},
  {title:"警告", type:"emoji", class:"emoji159"},
  {title:"旗", type:"emoji", class:"emoji160"},
  {title:"男人", type:"emoji", class:"emoji161"},
  {title:"女人", type:"emoji", class:"emoji162"},
  {title:"O", type:"emoji", class:"emoji163"},
  {title:"X", type:"emoji", class:"emoji164"},
  {title:"版权", type:"emoji", class:"emoji165"},
  {title:"注册商标", type:"emoji", class:"emoji166"},
  {title:"商标", type:"emoji", class:"emoji167"}
];

const blankGif = require("../../../assets/images/app/blank.gif");
export function replaceImgByText(text) {
  for(let item of QQFACES) {
    if(item['title'] === text) {
      return `<img src='${blankGif}' class='${classnames("qqemoji", item["class"])}'/>`;
    }
  }
  for(let item of EMOJIFACES) {
    if(item['title'] === text) {
      return `<img src='${blankGif}' class='${classnames("emoji", item["class"])}'/>`;
    }
  }
  return null;
}


export function renderFormatContent(chat_content) {
  if(!!chat_content && chat_content.length > 0) {
    let reg = /\[(.+?)\]/g;
    let faceItems = chat_content.match(reg);
    if(faceItems && faceItems.length > 0) {

      chat_content = chat_content.replace(reg, function(a, b){
        //第三方表情
        if(b.startsWith("emoji:")) {
          return `<img src=${EMOJI_SERVER_URL.replace(/#/g, b.substr(6))} />`;
        } else {
          //微信自带表情
          for(let item of QQFACES.concat(EMOJIFACES)) {
            if(b === item['title']) {
              let faceClass;
              if("qq" === item["type"]){
                faceClass = classnames("qqemoji", item["class"])
              }else{
                faceClass = classnames("emoji", item["class"])
              }
              return `<img src='${blankGif}' class='${faceClass}' />`;
            }
          }
        }
        return a;
      });
    }
    return chat_content;
  }
  //后台发送过来的消息如果都是空格，会发空字符，这里用空格占位符
  return "&nbsp;&nbsp;";
}
export function renderFormatHTML(chat_content) {
  chat_content = renderFormatContent(chat_content);
  return <p dangerouslySetInnerHTML={{__html: chat_content}}></p>
}
