import xFetch from './xFetch';

export async function queryUserChannelList(values){
  return xFetch('/channel/queryUserChannelList', values);
}

//修改渠道名
export async function updateChannelName(values){
  return xFetch('/channel/updateChannelName', values);
}

//根据输入模糊查询渠道集合
export async function queryChannelByName(channelName) {
  return xFetch('/channel/queryChannelByName', channelName);
}

//根据输入模糊查询渠道集合 和 渠道统计数据
export async function queryChannelAndOpCountByName(channelName) {
  return xFetch( '/channel/queryChannelAndOpCountByName', {channel_name: channelName});
}
