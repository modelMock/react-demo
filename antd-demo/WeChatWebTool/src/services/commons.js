import xFetch from './xFetch';

export async function queryItemValueByKey(item){
  return xFetch('/common/queryItemValueByKey', item);
}
