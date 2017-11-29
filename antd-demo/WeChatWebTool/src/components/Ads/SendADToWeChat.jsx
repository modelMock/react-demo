/*发朋友圈广告*/
import React, { Component, PropTypes} from 'react';
import { Form, Input, Select, Button, Radio, DatePicker,InputNumber,Checkbox } from 'antd';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ImgTxtForm from './ImgTxtForm.jsx';
import FwdForm from './FwdForm.jsx';
import ChosenPutIn from './ChosenPutIn';
import NotChosenPutIn from './NotChosenPutIn';
import SelectSendFans from './SelectSendFans.jsx';
import TransferFriends from './TransferFriends';
import CustomDefineFriends from './CustomDefineFriends';
import PublishAdTotal from './PublishAdTotal';
import {queryAdConfigByName, getPublishOperationsTotal, getPublishOperationsConfirm, publishAd} from '../../services/ads';
import {queryAnchorByOptr,queryAnchorToAd} from '../../services/multManage';
import resourceManage from '../ResourceManage';
import './SendADToWeChat.less';
import {Confirm, Success, Errors} from '../Commons/CommonConstants';
import {Loading} from '../Commons/TipTools';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

class SendADToWeChat extends Component {

  static propTypes = {
    form: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state={
      adNameList: [],
      publishType: 'Transfer',    //发布类型：转发、自定义
      put_type: 'Chosen',      //投放类型：精粉、范粉
      isResetData: false,   //清空子组件state中数据

      ops_confirm: {
        friend_total_cnt: 0,    //投放粉丝数
        operation_cnt: 0,       //运营微信号
        operation_mobiles: ''   //运营号的手机字符串清单多个手机号用，分隔
      },
      isNotify:true,
      loading: false,
      anchorList: [],    //秀场主播列表
      isSelfsns:false,  //是否展示发朋友圈群自评论
    };

    this.fetchAdNameData = this.fetchAdNameData.bind(this);
    this.handlePublishType = this.handlePublishType.bind(this);
    this.handlePutType = this.handlePutType.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.onFetchChosenData = this.onFetchChosenData.bind(this);
    this.onChangeConfirm = this.onChangeConfirm.bind(this);
    this.onFetchImgUrl = this.onFetchImgUrl.bind(this);
    this.setLoading = this.setLoading.bind(this);
    this.onChangeshowSnsType=this.onChangeshowSnsType.bind(this);
    this.onChangeCheckbox=this.onChangeCheckbox.bind(this);
    this.filterAnchorOption=this.filterAnchorOption.bind(this);
    //上传图片url地址
    this.imgUrlList = [];

    const activedBtnIds = resourceManage.getActivedBtnIds();
    this.hasAnchorRole = activedBtnIds.indexOf("15-1") >= 0;
  }

  fetchAdNameData(ad_name) {
    console.log('SendADToWeChat => fetchAdNameData ', ad_name);
    if(!ad_name || ad_name.length < 2) {
      this.setState({ adNameList: [] });
    } else {
      queryAdConfigByName({ad_name}).then( ({ jsonResult }) => {
        this.setState({ adNameList: jsonResult });
      });
    }
  }

  handlePublishType(e) {
    let publishType = e.target.value;
    if(this.state.publishType != publishType) {
      this.setState({ publishType });
    }
  }

  onFetchImgUrl(imgUrlList) {
    this.imgUrlList = imgUrlList || [];
  }

  filterAnchorOption(input, option){
    if(!input) return true;
    const inputValue = input.toLowerCase();
    const {value, children} = option.props;
    return value.toLowerCase() == inputValue || children.toLowerCase().indexOf(inputValue) >= 0;
  }

  handleSubmit(e) {
    console.log('SendADToWeChat => handelSubmit');
    e.preventDefault();
    this.props.form.validateFieldsAndScroll( (errors, values) => {
      console.log("__save",values);
      if(!!errors) {
        console.log('发朋友圈广告 => 表单验证出错啦');
        return;
      }

      if(!this.__validate(values)) return;

      values['plan_send_time'] = values['plan_send_time'].format('YYYY-MM-DD HH:mm:ss')

      this.__delSubmitValues(values);

      this.__save(values);
    });
  }

  __showErrorModal(errorTxt) {
    Errors(errorTxt);
    return false;
  }

  __validate(values) {
    let errorTxt, isValid = true;
    const publishType = this.state.publishType;

    //转发：获取到的朋友圈内容对象
    if(publishType == 'Transfer') {
      const adPublishContent = this.refs.transferFriends.getAdPublishContent();
      console.debug('getAdPublishContent : ', adPublishContent);
      if(!!adPublishContent && !!adPublishContent['content_type']) {
        this.imgUrlList = [];
        Object.assign(values, adPublishContent);
      } else {
        return this.__showErrorModal("请点击预览朋友圈按钮，获取朋友圈中要转发的内容!");
      }
    } else if(publishType === 'CustomDefine' && this.imgUrlList.length == 0) {
      //自定义： 图文、链接转发 、上传的图片链接
      if(values['content_type']  == '1') {
        return this.__showErrorModal("请上传图片");
      } else if(values['content_type']  == '3') {
        return this.__showErrorModal("请上传链接封面图片");
      }
    }

    if(!this.operation_total_json) {
      return this.__showErrorModal("请先提取数据!");
    }
    // if(!values['publish_friends'] || values['publish_friends'] === 0) {
    if(this.state.ops_confirm.friend_total_cnt === 0) {
      return this.__showErrorModal("请先计算投放粉丝数!");
    }

    // if(!values['operation_mobiles']) {
    if(!this.state.ops_confirm.operation_mobiles) {
      return this.__showErrorModal("请先计算运营微信号个数!");
    }

    return true;
  }

  //删除不需要提交的form数据
  __delSubmitValues(values) {
    delete values['forward_user_name'];
    delete values['index'];
    delete values['mobiles'];
    delete values['friend_cnt'];
    let provinceList = values['province'];
    if(provinceList &&　provinceList.length > 0 ) {
      provinceList.forEach( province => {
          delete values['p_' + province];
          delete values['c_' + province];
      })
    }
    delete values['province'];
    delete values['gender_list'];
    delete values['friend_time'];
    delete values['forwardUserName'];
    delete values['anchorIds'];
  }

  //保存提交数据
  __save(values) {
    Confirm(function(){
        if(this.hasAnchorRole === true) {
        let keyAnchorIds=this.props.form.getFieldValue('anchorIds')
        values['show_anchor_id'] = keyAnchorIds.key;
        }
        values['ad_id'] = values['ad_id']['key'];
        values['operation_total_json'] = this.operation_total_json;
        values['publish_friends'] = this.state.ops_confirm['friend_total_cnt'];
        values['operation_mobiles'] = this.state.ops_confirm['operation_mobiles'];
        if(this.state.isSelfsns === true){
          let selfSnsTwo=document.getElementById("self_sns_two").value;
          let selfSnsThree=document.getElementById("self_sns_three").value;
          let selfSns=[];
          selfSns.push(values['self_sns'],selfSnsTwo,selfSnsThree);
          for(var i = 0 ;i<selfSns.length;i++){
            if(selfSns[i] == "" || typeof(selfSns[i]) == "undefined")
            {
              selfSns.splice(i,1);
              i= i-1;
            }
          }
          console.log("selfSns",selfSns);
          values['self_sns']=JSON.stringify(selfSns);
        }

        if(this.imgUrlList && this.imgUrlList.length > 0) {
          values['pic_url_json'] = JSON.stringify(this.imgUrlList);
        }

        publishAd(values).then(({jsonResult}) => {
          Success('发朋友圈广告成功!');
          this.handleReset();
        });

      }.bind(this), "确定提交吗?");
  }

  handleReset() {
    this.props.form.resetFields();
    this.setState({
      adNameList: [],
      publishType: 'Transfer',
      put_type: 'Chosen',
      ops_confirm: {},
      isResetData: true,
    });
    if(this.state.isSelfsns === true){
      document.getElementById("self_sns_two").value="";
      document.getElementById("self_sns_three").value="";
    }
    this.operation_total_json = null;
    this.imgUrlList = [];

    setTimeout(() => {
      this.setState({ isResetData: false });
    }, 10);
  }

  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  isSelectedAnchor() {
    if(this.hasAnchorRole === true) {
      const anchorIds = this.props.form.getFieldValue('anchorIds');
      console.log(anchorIds);
      if(!anchorIds) {
        Errors("请先选择秀场主播");
        return false;
      }
    }
    return true;
  }
  //投放类型 onChange
  //范粉：直接查询统计数据
  handlePutType(e) {
    if(!this.isSelectedAnchor()) return;
    let put_type = e.target.value;
    if(this.state.put_type != put_type) {
      this.setState({ put_type, ops_confirm: {} });
      this.operation_total_json = '';
      if(put_type === 'NotChosen') {
        //范粉，直接查询数据
        this.onFetchChosenData({put_type});
      }
    }
  }

  //获取统计数据
  //范粉：运营号数据集合 和 期望粉丝数输入框最大、最小值
  //精粉：期望粉丝数最大、最小值
  onFetchChosenData(params) {
    if(!this.isSelectedAnchor()) return;
    this.operation_total_json = null;
    this.setLoading(true);
    if(this.hasAnchorRole === true) {
      let a=[];
      a.push(this.props.form.getFieldValue('anchorIds')["key"]);
      params.anchorIds = a;
      console.log("params.anchorIds",params.anchorIds);
    }
    getPublishOperationsTotal(params).then(({jsonResult}) => {
      const {operation_total_json, ...others} = jsonResult;
      this.operation_total_json = operation_total_json;
      console.debug('onFetchChosenData: ', jsonResult, params);
      if(params['put_type'] == 'Chosen') {
        this.refs.chosenPutIn.setOperationsTotal({...others});
      } else {
        this.refs.notChosenPutIn.setOperationsTotal({...others});
      }
      this.setLoading(false);
    }).catch(function(err){
      this.setLoading(false);
      const total = { operation_mobiles: '', friend_min_cnt: 0, friend_max_cnt: 0 };
      if(params['put_type'] == 'Chosen') {
        this.refs.chosenPutIn.setOperationsTotal(total);
      } else {
        this.refs.notChosenPutIn.setOperationsTotal(total);
      }
    }.bind(this));
  }

  //范粉：按运营号 或 期望粉丝数 输入放生变化，获取后台数据
  onChangeConfirm(params) {
    console.debug('params: ', params);
    if(!this.operation_total_json) {
      console.error('发生错误啦！！');
    }
    console.log('params: ', params)
    params['operation_total_json'] = this.operation_total_json;
    this.setLoading(true);
    getPublishOperationsConfirm(params).then( ({jsonResult}) => {
      this.setState({ ops_confirm: jsonResult, loading: false })
    }).catch(function(err){
      this.setState({ ops_confirm: {}, loading: false });
    }.bind(this));
  }
  onChangeCheckbox(e){
    console.log(`checked = ${e.target.checked}`);
    this.setState({ isSelfsns:e.target.checked});
  }
  //显示、隐藏loading遮盖层
  setLoading(loading) {
    this.setState({ loading });
  }
  //当朋友圈类型 选择开播时 开播朋友圈延时可编辑，其他情况不可编辑
  onChangeshowSnsType(value){
         if(value=="notify"){
           this.setState({isNotify:false});
         }
         else{
           this.setState({isNotify:true});
         }
  }
  componentDidMount() {
    if(this.hasAnchorRole === true) {
      console.log("有选择秀场主播权限");
      queryAnchorToAd().then(({jsonResult}) => {
        if(jsonResult.length > 0) {
          this.setState({
            anchorList: jsonResult
          })
        }
      })
    }
  }
  render() {
    console.log('SendADToWeChat =>　render => ', this.state);
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 10 }
    };
    const { form } = this.props;
    const { getFieldDecorator } = form;

    const { adNameList, contentType, inputTxtLength, isResetData, put_type,
      publishType, ops_confirm, loading, anchorList } = this.state;
    return (
      <div>
        <Form horizontal onSubmit={ this.handleSubmit }>
          <FormItem {...formItemLayout} label="广告名称" required>
            {getFieldDecorator('ad_id',{
              rules: [{required: true, message:"请输入文本信息", type: 'object'}]
            })(
              <Select
                onSearch={this.fetchAdNameData}
                optionLabelProp="children" optionFilterProp="children"
                allowClear showSearch labelInValue defaultActiveFirstOption
                filterOption={false} dropdownMatchSelectWidth={false}
                dropdownMenuStyle={{ maxHeight: 500, overflow: 'auto' }} placeholder="请输入广告名搜索" notFoundContent="没有找到该广告名">
                  {
                    adNameList.map(ad => (
                      <Select.Option key={ad['ad_id']}>{ad['ad_name']}</Select.Option>
                    ))
                  }
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="发布类型" required
              style={{marginTop: 16, borderTop: '1px solid #e9e9e9', paddingTop: 16}}>
            {getFieldDecorator('publish_type', {
              initialValue: publishType,
              onChange: this.handlePublishType
            })(
              <RadioGroup>
                <Radio key="1" value="Transfer">转发</Radio>
                <Radio key="2" value="CustomDefine">自定义</Radio>
              </RadioGroup>
            )}
          </FormItem>

          {
            publishType == 'Transfer'
            ? <TransferFriends ref="transferFriends" form={form} isResetData={isResetData} setLoading={this.setLoading} />
            : <CustomDefineFriends form={form} isResetData={isResetData} onFetchImgUrl={this.onFetchImgUrl} />
          }
          {
            this.hasAnchorRole === true
            ? <FormItem {...formItemLayout} label="选择主播"
                style={{marginTop: 16, borderTop: '1px solid #e9e9e9', paddingTop: 16}}>
                  {getFieldDecorator('anchorIds')(
                    <Select
                      optionFilterProp="children"
                      allowClear
                      labelInValue
                      showSearch
                      filterOption={this.filterAnchorOption}
                       >
                      {
                        anchorList.map(anchor => (
                          <Select.Option value={anchor.anchor_id}>{anchor.anchor_name}</Select.Option>
                        ))
                      }
                    </Select>
                  )}
            </FormItem>
            : null
          }
          {
            this.hasAnchorRole === true
            ? <FormItem {...formItemLayout} label="朋友圈类型" required>
                  {getFieldDecorator('show_sns_type',  {initialValue:'',rules:[{required:true, message:"选择朋友圈类型"}]})(
                    <Select
                     onChange={this.onChangeshowSnsType}
                      allowClear
                      placeholder="请选择朋友圈类型">
                      <Option value="notify">开播</Option>
                      <Option value="common">日常</Option>
                      <Option value="lifephoto">生活照</Option>
                    </Select>
                  )}
            </FormItem>
            : null
          }
          {
            this.hasAnchorRole === true
            ?
            <FormItem label="朋友圈延时" {...formItemLayout}>
                {getFieldDecorator("show_play_minutes",{
                  initialValue:0
                })(
                  <InputNumber min={0}/>
                )}
                 <p className="ant-form-text">分钟</p>
            </FormItem>
            : null
          }
          <FormItem {...formItemLayout} label="投放类型"
                style={{marginTop: 16, borderTop: '1px solid #e9e9e9', paddingTop: 16}} required>
            <RadioGroup value={put_type} onChange={this.handlePutType}>
              <Radio key="1" value="Chosen">精粉</Radio>
              <Radio key="2" value="NotChosen">范粉</Radio>
            </RadioGroup>
          </FormItem>
          {
            put_type == 'Chosen'
            ? <ChosenPutIn ref="chosenPutIn" form={ form } onFetchChosenData={this.onFetchChosenData}
                isResetData={isResetData} onChangeConfirm={this.onChangeConfirm} />
            : <NotChosenPutIn ref="notChosenPutIn" form={ form } isResetData={isResetData}
                onChangeConfirm={this.onChangeConfirm} />
          }
          <PublishAdTotal ops_confirm={ops_confirm} />
          <FormItem wrapperCol={{span:10,offset:2}}>
            <Checkbox onChange={this.onChangeCheckbox}>开启发圈后自评论</Checkbox>
          </FormItem>
          {
            this.state.isSelfsns === true
            ?
            <div>
              <FormItem label="评论语第一条" {...formItemLayout}>
                  {getFieldDecorator("self_sns",{
                    initialValue:"",rules:[{required:true, message:"请输入评论语"}]
                  })(
                    <Input type="textarea"/>
                  )}
              </FormItem>
              <FormItem label="评论语第二条" {...formItemLayout}>
                    <Input type="textarea" id="self_sns_two"/>
              </FormItem>
              <FormItem label="评论语第三条" {...formItemLayout}>
                    <Input type="textarea" id="self_sns_three"/>
              </FormItem>
          </div>
          :null
         }
          <FormItem label="预定发圈时间" {...formItemLayout}>
            {getFieldDecorator("plan_send_time",{initialValue:""})(
              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss"/>
            )}
          </FormItem>
          <FormItem wrapperCol={{offset: 7 }} >
            <Button icon="check" type="primary" size="large" htmlType="submit">提交</Button>
            <Button icon="cross" type="ghost" size="large" onClick={ this.handleReset } style={{marginLeft:16}}>重置</Button>
          </FormItem>
        </Form>
        { loading ? <Loading layer={true}  /> : null   }
      </div>
    );
  }
}
export default Form.create()(SendADToWeChat);
