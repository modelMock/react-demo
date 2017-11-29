import {RECALL_MSG, TIME} from './Utils';
import {format, isToday, differenceInCalendarDays, differenceInMinutes,
  startOfHour, getHours, getMonth, getDate} from 'date-fns';
import {Map, fromJS} from 'immutable';
const MINUS_INTERVAL = 3; //3分钟间隔

function getTimePrint(date) {
  const hour = getHours(date);
  if(hour > 18 && hour <= 24) {
    return "晚上";
  } else if(hour > 12 && hour <= 18) {
    return "下午";
  } else {
    return "早上";
  }
}

function getFormatDateForNow(chatTime) {
  const dateStr = format(chatTime, 'HH:mm');
  if(isToday(chatTime)) {
    return dateStr;
  } else if(differenceInCalendarDays(new Date(), chatTime) == 1){
    return `昨天 ${dateStr}`;
  } else {
    return `${getMonth(chatTime) + 1}月${getDate(chatTime)}日 ${getTimePrint(chatTime)}${dateStr}`;
  }
}

const getGlobalId = function(){
  let globalId = 0;
  return function(){
    return globalId++;
  }
}();

// 时间消息chat_sn
function getTimeChatSn(){
  return "t_"+getGlobalId()
}

// 运营号本地消息chat_sn
function getTextChatSn(){
  return "l_"+getGlobalId()
}

function generateTimeMsg(preDate = new Date(), lastDate) {
  //相差分钟数（大的时间在前面）
  const minutes = differenceInMinutes(lastDate, preDate);
  if(minutes >= MINUS_INTERVAL) {
    return {
      chat_sn: getTimeChatSn(),
      chat_content: getFormatDateForNow(lastDate),
      chat_type: TIME
    };
  }
  return null;
}

function getCurrentTimeMsg(){
  return {
    chat_sn: getTimeChatSn(),
    chat_content: getFormatDateForNow(new Date()),
    chat_type: TIME
  };
}

const FN = {

  processAllMessageList: function(messageList) {
    let list = [];
    for(let [index, msg] of messageList.entries()) {
      const preDate = index > 0 ? messageList[index - 1]['chat_time'] : null;
      const timeMsg = generateTimeMsg(preDate, msg['chat_time']);
      if(!!timeMsg) {
        list.push(timeMsg);
      }
      list.push(msg);
    }
    return list;
  },
  //处理附加一条新消息
  processAppendSignMsg: function(messageList, newMsg) {
    //在推送的新消息中会有
    if(newMsg['chat_type'] === RECALL_MSG){
      let msg = messageList.find(message=>message['message_id']===newMsg['message_id'])
      msg['withdraw_flag'] = 'T'
    }else{
    // 没有chat_sn，生成一个
      !newMsg['chat_sn'] && (newMsg['chat_sn'] = getTextChatSn())
      if(messageList.length > 0) {
        const lastMsg = messageList[messageList.length - 1];
        const timeMsg = generateTimeMsg(lastMsg['chat_time'], newMsg['chat_time']);
        if(!!timeMsg) {
          messageList.push(timeMsg);
        }
        messageList.push(newMsg);
      } else {
      //原消息列表为空，在第一条消息前插入时间标记消息
        messageList.push(getCurrentTimeMsg());
        messageList.push(newMsg);
      }
    }
    return messageList;
  },

  //加载更多：新增消息列表插入最前面
  processAddFrontMessageList: function(oldMessageList, newMessageList) {
    let preDate, lastDate;
    //如果原消息列表不为空
    if(oldMessageList.length > 0) {
      //前一条消息为新消息最后一条
      preDate = newMessageList[newMessageList.length - 1]['chat_time'];
      //后一条消息为原消息第一条
      const msg = oldMessageList[0];
      //原消息列表第一条可能是时间标记消息
      if(msg['chat_type'] !== TIME) {
        lastDate = msg['chat_time'];
      } else {
        //删除第一条时间标记消息
        oldMessageList.splice(0, 1);
        lastDate = oldMessageList[0]['chat_time'];
      }
    } else {
      //前一条消息为null
      //后一条消息为新消息第一条
      lastDate = newMessageList[0]['chat_time'];
    }

    //给新消息列表添加时间消息标记
    newMessageList =  this.processAllMessageList(newMessageList);

    const timeMsg = generateTimeMsg(preDate, lastDate);
    if(timeMsg) {
      newMessageList.push(timeMsg);
    }
    return newMessageList.concat(oldMessageList);
  },
  //加载更多：新增消息列表插入最前面
  processImmutableAddFrontMessageList: function(oldMessageList, newMessageList) {
    let preDate, lastDate;
    //如果原消息列表不为空
    if(oldMessageList.size > 0) {
      //前一条消息为新消息最后一条
      preDate = newMessageList[newMessageList.length - 1]['chat_time'];
      //后一条消息为原消息第一条
      const msg = oldMessageList.first();
      //原消息列表第一条可能是时间标记消息
      if(msg['chat_type'] !== TIME) {
        lastDate = msg['chat_time'];
      } else {
        //删除第一条时间标记消息
        oldMessageList = oldMessageList.delete(0);
        lastDate = oldMessageList.get(0).get('chat_time');
      }
    } else {
      //前一条消息为null
      //后一条消息为新消息第一条
      lastDate = newMessageList[0]['chat_time'];
    }

    //给新消息列表添加时间消息标记
    newMessageList =  fromJS(this.processAllMessageList(newMessageList));

    const timeMsg = generateTimeMsg(preDate, lastDate);
    if(timeMsg) {
      return newMessageList.push(Map(timeMsg)).concat(oldMessageList);
    }
    return newMessageList.concat(oldMessageList);
  },
  //多窗口聊天，处理附加一条新消息
  processImmutableAppendSignMsg: function(messageList, newMsg) {
    newMsg.chat_sn = getTextChatSn()
    if(messageList.size > 0) {
      const lastMsg = messageList.last();
      const timeMsg = generateTimeMsg(lastMsg.get('chat_time'), newMsg['chat_time']);
      if(!!timeMsg) {
        return messageList.push(Map(timeMsg), Map(newMsg));
      }
      return messageList.push(Map(newMsg));
    } else {
      //原消息列表为空，在第一条消息前插入时间标记消息
      return messageList.push(Map({
        chat_content: getFormatDateForNow(new Date()),
        chat_type: TIME
      }), Map(newMsg));
    }
  },

}

export default FN;
