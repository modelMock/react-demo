/*发朋友圈详情*/
import React/*, { Component, PropTypes }*/ from 'react';
import { Form, Tag } from 'antd';
import './WeChatADDetailInfo.less';
const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {　span: 5　},
  wrapperCol: {　span: 16　}
};

const hideFormItem = (value) => {
  return {display: (!!value ? 'block' : 'none'), marginBottom: 0}
}

const AdPublishDetailInfo = (props) => {
  const adPubContent = props['adPublishContent'];
  console.log('adPubContent: ', adPubContent);
  const imgUrlList = !!adPubContent['pic_url_json'] ? JSON.parse(adPubContent['pic_url_json']) : [];
  const videoUrlList = !!adPubContent['video_url_json'] ? JSON.parse(adPubContent['video_url_json']) : [];

  let needMobiles = [], hasMobiles = [];
  if(!!props['need_publish_mobiles'] && props['need_publish_mobiles'].length > 0) {
    needMobiles = props['need_publish_mobiles'].split(",");
    needMobiles.pop();  //删除最后一个空字符
  }
  if(!!props['has_publish_mobiles'] && props['has_publish_mobiles'].length > 0) {
    hasMobiles = props['has_publish_mobiles'].split(",");
    hasMobiles.pop();  //删除最后一个空字符
  }

  return (
    <div>
      <FormItem {...formItemLayout} label="广告名称" style={ hideFormItem(props['ad_name']) }>
        <p className="ant-form-text">{props['ad_name']}</p>
      </FormItem>
      <FormItem {...formItemLayout} label="文本信息" style={ hideFormItem(adPubContent['text_content']) }>
        <p className="ant-form-text">{adPubContent['text_content']}</p>
      </FormItem>
      <FormItem {...formItemLayout} label="评论信息" >
        <p className="ant-form-text">{props['self_sns']}</p>
      </FormItem>
      <FormItem {...formItemLayout} label="图片信息" style={ hideFormItem(imgUrlList.length > 0) }>
        <div className="clearfix">
          {
            imgUrlList.map( (imgUrl, idx) => (
              <a key={idx} href={imgUrl['B']} rel="noreferrer" target="_blank" className="upload-example">
                <img src={imgUrl['O']} />
                {/* <span>示例</span> */}
              </a>
            ))
          }
        </div>
      </FormItem>
      <FormItem {...formItemLayout} label="小视屏信息" style={ hideFormItem(adPubContent['video_url_json']) }>
        <div className="clearfix">
          {
            videoUrlList.map( (video, idx) => (
              <a key={idx} href={video['B']} target="_blank" className="upload-example">
                <img src={video['O']} />
              </a>
            ))
          }
        </div>
      </FormItem>
      <FormItem {...formItemLayout} label="转发链接" style={ hideFormItem(adPubContent['title']) }>
        <p className="ant-form-text"><a href={adPubContent['transpond_link']} target="_blank">{adPubContent['title']}</a></p>
      </FormItem>
      <FormItem {...formItemLayout} label="投放类型" style={ hideFormItem(props['put_type_text']) }>
        <p className="ant-form-text">
          {`${props['put_type_text']}(时长：${adPubContent['friend_time_text'] || '空'};
              性别：${adPubContent['gender_list'] || '空'}; 地区：${adPubContent['city_map'] || '空'})`}
        </p>
      </FormItem>
      <FormItem {...formItemLayout} label="投放粉丝数">
        <p className="ant-form-text">
          <span style={{ 'color':'red', margin: '0 8px 0 8px' }}>{props['need_friend_cnt']}</span>人
        </p>
      </FormItem>
      <FormItem {...formItemLayout} label="需发运营微信号">
        <p className="ant-form-text">
          <span style={{ 'color':'red', margin: '0 8px 0 8px' }}>{props['need_publish_cnt']}</span>个
        </p>
      </FormItem>
      <FormItem wrapperCol={{span: 20, offset: 2}} style={ hideFormItem(props['need_publish_mobiles']) }>
        {
        needMobiles.map( (mobile,idx) => (
            <Tag key={idx}>{mobile}</Tag>
          ))
        }
      </FormItem>
      <FormItem {...formItemLayout} label="实际发运营微信号">
        <p className="ant-form-text">
          <span style={{ 'color':'red', margin: '0 8px 0 8px' }}>{props['has_publish_cnt']}</span>个
        </p>
      </FormItem>
      <FormItem wrapperCol={{span: 20, offset: 2}} style={ hideFormItem(props['has_publish_mobiles']) }>
        {
          hasMobiles.map( (mobile,idx) => (
            <Tag key={idx}>{mobile}</Tag>
          ))
        }
      </FormItem>
      <FormItem {...formItemLayout} label="实际投放粉丝数">
        <p className="ant-form-text">
          <span style={{ 'color':'red', margin: '0 8px 0 8px' }}>{props['has_friend_cnt']}</span>个
        </p>
      </FormItem>
    </div>
  )
}

export default AdPublishDetailInfo;
