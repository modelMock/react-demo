import React, {Component} from "react"
import {Form, Row, Col, Input, Select, Button, Modal, Dropdown, Menu, Radio, Icon, DatePicker, Pagination} from "antd"
import webUtils from "../../commons/utils/webUtils"
import CustomTable from '../../commons/widgets/CustomTable'
import CustomerService from '../../service/CustomerService'
import AnchorService from '../../service/AnchorService'
import "./AnchorMonitor.less"

const {RangePicker} = DatePicker;
const FormItem = Form.Item
const MenuItem = Menu.Item
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const IMP = "IMP"
const TMP = "TMP"
const NORMAL = "NORMAL"
const LOGLIST = "LOGLIST"
const x = document.body.clientWidth>1500 ?400:(document.body.clientWidth-210)/3;
const y = x*3/4;

const PAGE_SIZE = 15;

//客服操作类型
const __getMgrStr = code => {
  switch (code){
    case "WARN":
      return "节目警告"
      break
    case "STOP_LIVING":
      return "正常停播"
      break
    case "BLOCK":
      return "封禁24小时"
      break
    case "IMP_MONITOR":
      return "标记重点监播"
      break
    case "TMP_MONITOR":
      return "标记临时监播"
      break
    case "DE_IMP_MONITOR":
      return "取消重点监播"
      break
    case "DE_TMP_MONITOR":
      return "取消临时监播"
      break
    case "CHECKED_MARK":
      return "标记巡查"
      break
  }
}

//搜索框
const AnchorSearchForm = Form.create()(
  (props) => {
    const {form} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    const _handSearch = (e) => {
      e.preventDefault();
      props.onSearch(form.getFieldsValue());
    }
    return (
      <Form layout="horizontal" onSubmit={ _handSearch } className="ant-advanced-search-form">
        <Row>
          <Col sm={5}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("anchorId")(<Input placeholder="请输入主播ID查询" />)}
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label="房间ID" {...formItemLayout}>
              {getFieldDecorator("programId")(<Input placeholder="请输入房间ID查询" />)}
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label="昵称" {...formItemLayout}>
              {getFieldDecorator("nickname")(<Input placeholder="昵称支持模糊查询" />)}
            </FormItem>
          </Col>
          <Col sm={5}>
            <FormItem label="分组" {...formItemLayout}>
              {getFieldDecorator("modGroupType")(<Input placeholder="例：4-1或4-1,2" />)}
            </FormItem>
          </Col>
          <Col sm={4} style={{ textAlign: 'center' }}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
)
//巡查记录搜索框
const LogListSearchForm = Form.create()(
  (props) => {
    const {form, onSearch, kefuList} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    const _handSearch = (e) => {
      e.preventDefault();
      props.onSearch(form.getFieldsValue());
    }
    return (
      <Form layout="horizontal" onSubmit={ _handSearch } className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="操作时间" {...formItemLayout}>
              {getFieldDecorator("queryDate")(
                <RangePicker format="YYYY-MM-DD"  showTime={false} />
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="操作人" {...formItemLayout}>
              {getFieldDecorator("optrId")(
                <Select allowClear showSearch optionFilterProp="children" placeholder="请选择操作人员" >
                  {
                    kefuList.map(man => (
                      <Select.Option key={man.userId}>{man.nickname}</Select.Option>
                    ))
                  }
                </Select>
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="昵称" {...formItemLayout}>
              {getFieldDecorator("nickName")(<Input placeholder="昵称支持模糊查询" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <FormItem label="房间ID" {...formItemLayout}>
              {getFieldDecorator("programId")(<Input placeholder="请输入房间ID查询" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12} offset={12} style={{ textAlign: 'right' }}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
)
//警告主播模态框
class WarnAnchorForm extends Component{
  state = {
    loading: false
  }
  handleSave = ()=> {
    this.props.form.validateFields((errors, values) => {
      if(errors) return
      CustomerService.warningAnchor(values['programId'], values['warnMsg']).then(result => {
        webUtils.alertSuccess("警告信息已发送！");
        this.props.onClose(true)
      })
    })
  }
  render(){
    const {loading} = this.state;
    const { visible, form, onClose, record } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal
        visible={visible}
        title={`警告${record['anchorNickname']}`}
        onOk={this.handleSave}
        onCancel={() => onClose()}
        confirmLoading={loading}
        okText="提交"
        cancelText="取消">
        <Form>
          {getFieldDecorator("programId")(<Input type="hidden"/>)}
          <FormItem label="警告提示" {...formItemLayout} >
            {getFieldDecorator("warnMsg", {
              initialValue:"智能机器人检测到该直播间直播行为异常，系统已经截取相关视频提交人工审核，如违反主播管理规范行为，将受到相应处罚！如直播无异常请忽略此消息！",
              rules: [{
                required: true, message: '请输入警告内容'
              }]
            })(
              <Input type="textarea" rows={4} />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
WarnAnchorForm = Form.create()(WarnAnchorForm)
//主播事件日志模态框
class LogsOfEvents extends Component{
  constructor(props){
    super(props)
    this.columns = [
      {title: '时间', dataIndex: 'mgrTime'},
      {title: '操作', dataIndex: 'mgrCode',render: (text)=> __getMgrStr(text)},
      {title: '操作人', dataIndex: 'optrNickname'},
    ]
  }
  //查询操作日志
  handleSearch = ()=>{
    const values = this.props.form.getFieldsValue();
    let params = { 'programId': this.props.record.programId };
    const queryDate = values['queryDate'];
    if(queryDate && queryDate.length > 0){
      params.startTime = queryDate[0].format("YYYY-MM-DD HH:mm:ss");
      queryDate[1] && (params.endTime = queryDate[1].format("YYYY-MM-DD HH:mm:ss"));
    }
    this.customTable.queryTableData(params);
  }
  //退出模态框
  handleCancel = () => {
    this.props.onClose()
    this.customTable.resetTable()
  }
  render(){
    const {form, visible, record} = this.props
    const {getFieldDecorator} = form;
    return (
      <Modal
        visible={visible}
        title={`${record["anchorNickname"]}操作日志`}
        onCancel={this.handleCancel}
        width="60%"
        footer={[]}>
        <Form layout="inline" className="ant-advanced-search-form">
          {getFieldDecorator("queryDate")(
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss"
                         placeholder={['开播时间', '停播时间']} style={{marginLeft: '80px'}}/>
          )}
          <Button type="primary" icon="search" size="large"
                  style={{marginLeft: '50px'}} onClick={this.handleSearch}>搜索</Button>
        </Form>
        <CustomTable ref={obj=>this.customTable=obj} columns={this.columns} rowKey={record=>record['mgrId']}
                     fetchTableDataMethod={CustomerService.findProgramMgrLogs} />
      </Modal>
    )
  }
}
LogsOfEvents = Form.create()(LogsOfEvents)
//发送到朋友圈
class SendToWeChatForm extends Component{
  state = {
    loading: false,
    radioValue: {}
  }
  handleSave = ()=> {
    this.props.form.validateFields((errors, values) => {
      if(errors) return
      CustomerService.saveShowNotifySns(values).then(result => {
        webUtils.alertSuccess("信息已发送！");
        this.props.onClose(true)
      })
    })
  }
  radioChange = (e)=> {
    this.setState({
      radioValue: e.target.value
    });
  }
  render(){
    const { visible, form, onClose } = this.props
    const { textList=[], picList=[]} = this.props.record
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    const options = textList.map(obj => <Select.Option key={obj}>{obj}</Select.Option>)

    return (
      <Modal
        visible={visible}
        title="发送到朋友圈"
        onOk={this.handleSave}
        onCancel={() => onClose()}
        okText="提交"
        className="sendToWeChatModal"
        cancelText="取消">
        <Form>
          {getFieldDecorator("anchor_id")(<Input type="hidden"/>)}
          <FormItem label="请选择图片" {...formItemLayout}>
            {getFieldDecorator("pic", {
              rules: [{
                required: true, message: '请选择图片'
              }],
              setFieldsValue: this.state.radioValue
            })(
              <RadioGroup onChange={this.radioChange}>
                <Row>
                  {picList.map((obj, index)=>{
                    return <Col span={8} key={index}><Radio value={obj}><img src={obj.O} className="imgChecked" /></Radio></Col>
                  })}
                </Row>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label="标题" {...formItemLayout}>
            {getFieldDecorator("text_content", {
              rules: [{
                required: true, message: '请选择标题'
              }],
            })(
              <Select
                rows={4}
                showSearch
                placeholder="请选择"
                optionFilterProp="children"
                onChange={this.handleChange}
              >
                {options}
              </Select>
            )}
          </FormItem>
          <FormItem label="延迟时间" {...formItemLayout}>
            {getFieldDecorator("play_minutes", {
              rules: [{
                required: true, message: '请选择时间'
              }],
              initialValue: 0
            })(
              <Input rows={4} suffix="分钟" size="large"/>
            )}
            <p>0表示无延时，即时发送</p>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}
SendToWeChatForm = Form.create()(SendToWeChatForm);

//单个主播画面
class SingleMonitorInfo extends  Component{
  constructor(props){
    super(props)
    this.state = {
      ownIndex: props.ownIndex,
      soundMuted: true,
      vStatus: "loading"
    }
    this.handleMenuClick = this.handleMenuClick.bind(this)
  }
  componentDidMount(){
    this.__startPlay()
  }
  __startPlay(){
    // sourceType2:hls格式；sourceType：flv格式
    const {sourceType, sourceType2} = this.props.record;
    this.player = new window.qcVideo.Player(`id_video_container${this.state.ownIndex}`, {
      "width": x,
      "height": y,
      "live_url": sourceType2,
      // "live_url": sourceType.substring(0,sourceType.indexOf(".flv"))+".m3u8",
      "live_url2": sourceType,
      // 默认静音
      "volume": 0
    }, {
      playStatus: (status, type) => {
        if(status !== "playing" && status !== "ready") {
          console.log(this.state.ownIndex, status, type)
        }
      }
    });
  }
  componentWillUnMount(){
    this.player.stop();
    this.player = null;
  }
  //操作菜单
  handleMenuClick(e){
    const obj = this.props.record
    const key = e.key
    switch (key) {
      case "tingbo":
        this.dismissTheAnchor(obj)
        break
      case "ban24h":
        this.banADay(obj)
        break
      case "warn":
        this.props.onWarnningAnchor(obj)
        break
      case "share":
        this.props.onShowShareModal(obj)
        break
      case "cancelFocus":
        this.cancelFocus(obj)
        break
      case "markFocus":
        this.markFocus(obj)
        break
      case "cancelTemp":
        this.cancelTemp(obj)
        break
      case "markTemp":
        this.markTemp(obj)
        break

    }
  }
  //停播
  dismissTheAnchor(obj){
    webUtils.confirm(()=>{
      CustomerService.stopLiving({"programId":obj.programId}).then(result => {
        webUtils.alertSuccess("停播完成！")
      })
    },`确认将 [${obj['anchorNickname']}] 停播吗?`)
  }
  //封禁24小时
  banADay(obj){
    webUtils.confirm(()=>{
      CustomerService.blockProgram({"programId":obj.programId}).then(result => {
        webUtils.alertSuccess("完成封禁操作！")
      })
    },"操作完成后，主播在24小时内将不可再次开播，请谨慎操作",`确认将 [${obj['anchorNickname']}] 封禁24小时吗?`)
  }
  //取消重点监播
  cancelFocus(obj){
    webUtils.confirm(()=>{
      CustomerService.cancelMarkImportantMonitor(obj.programId, obj.anchorId).then(result => {
        webUtils.alertSuccess("完成取消操作！")
      })
    },`确认取消标记 [${obj['anchorNickname']}] 为重点监播主播吗?`)
  }
  //取消临时监播
  cancelTemp(obj){
    webUtils.confirm(()=>{
      CustomerService.cancelMarkTempMonitor(obj.programId, obj.anchorId).then(result => {
        webUtils.alertSuccess("完成取消操作！")
      })
    },`确认取消标记 [${obj['anchorNickname']}] 为临时监播主播吗?`)
  }
  //标记重点监播
  markFocus(obj){
    webUtils.confirm(()=>{
      CustomerService.markImportantMonitor(obj.programId, obj.anchorId).then(result => {
        webUtils.alertSuccess("完成标记操作！")
      })
    },`确认标记[${obj['anchorNickname']}]为重点监播主播吗？`)
  }
  //标记临时监播
  markTemp(obj){
    webUtils.confirm(()=>{
      CustomerService.markTempMonitor(obj.programId, obj.anchorId).then(result => {
        webUtils.alertSuccess("完成标记操作！")
      })
    },`确认标记[${obj['anchorNickname']}]为临时监播主播吗？`)
  }
  getShowTime(lastShowBeginTime){
    const nowTime = Date.now()
    const lastTime = new Date(lastShowBeginTime)
    const showTime = Math.floor(nowTime - lastTime)
    const showTotalMins = Math.floor(showTime/1000/60)
    const showHours = Math.floor(showTotalMins/60)
    const showMins = showTotalMins%60
    if (showHours > 0){
      return showHours + "时" + showMins + "分"
    } else {
      return showMins + "分"
    }

  }
  render(){
    const {record, currTab, isShowCancelFocusBtn} = this.props
    const {anchorId, anchorNickname, programId, roomUserCount, lastShowBeginTime, lastScheduleTime} = this.props.record
    const showTime = this.getShowTime(lastShowBeginTime)
    const overlay = (
      <Menu onClick={this.handleMenuClick}>
        <MenuItem key="tingbo">停播</MenuItem>
        <Menu.Divider />
        <MenuItem key="ban24h">封禁24小时</MenuItem>
        <Menu.Divider />
        <MenuItem key="warn">警告</MenuItem>
        <MenuItem key="share">发送到朋友圈</MenuItem>
        {currTab === TMP && <Menu.Divider />}
        {currTab === TMP && <MenuItem key="cancelTemp">取消临时监播</MenuItem>}
        {currTab === NORMAL && <Menu.Divider />}
        {currTab === NORMAL && <MenuItem key="markTemp">标记临时监播</MenuItem>}
        {(currTab === TMP || currTab === NORMAL) && <Menu.Divider />}
        {(currTab === TMP || currTab === NORMAL) && <MenuItem key="markFocus">标记重点监播</MenuItem>}
        {isShowCancelFocusBtn && currTab === IMP && <Menu.Divider />}
        {isShowCancelFocusBtn && currTab === IMP && <MenuItem key="cancelFocus" className="focusAnchorMarked">取消重点监播</MenuItem>}
      </Menu>
    )
    return (
      <div className="singleMonitorContainer" key={anchorId}>
        <div className="mheader">
          <span className="name" onClick={ () => this.props.onShowEventsLogs(record) }>{anchorNickname}</span>
          <span className="count">{roomUserCount}人</span>
          <span className="time">{lastScheduleTime}</span>
        </div>
        <div className="mheader">
          <span className="name">ID: {programId}</span>
          <span className="count">{showTime}</span>
          <Dropdown overlay={overlay} trigger={['click']}>
            <Button type="primary">
              操作<Icon type="down" />
            </Button>
          </Dropdown>
        </div>
        <div className="video-thumbnail">
          <div id={`id_video_container${this.state.ownIndex}`} className="video-container"/>
        </div>
      </div>
    )
  }
}
//主播监播
export default class AnchorMonitor extends Component{
  constructor(props){
    super(props)
    this.state = {
      show: 'empty',
      //当前所在监播类型，默认重点监播
      currTab: IMP,
      //主播事件弹出框
      anchorEventVisible: false,
      //警告主播弹出框
      anchorWarnVisible: false,
      //分享主播到朋友圈
      shareToWeChatVisible: false,
      //主播的数据
      anchorInfo: {},
      //巡查是否结束
      isAnchorsChecked: false,
      //列表数据
      anchorList:[],
      //发朋友圈数据
      toWeChatData: [],
      //客服数据
      kefuList:[],
      pagination:{
        current: 1,
        pageSize: PAGE_SIZE,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['15', '20', '25', '30'],
        showTotal: ( total => (`共 ${total} 条`))
      },
      // 是否有“取消重点监播”按钮权限
      isShowCancelFocusBtn: false
    }
    //查询条件数据备份
    this.searchParams = null
    this.logListSearchParams = null
    //当前页，待巡查主播pid集合
    this.currAnchors = []
    // 已经打开过的tab集合
    this.openTabsObj = {}
    //需要判断权限的btn集合
    this.btnResList = props.location.state ? props.location.state.btnResList||[] : []
    //是否有权限查看巡查记录
    this.isAccessToLogList = this.btnResList.includes("anchorMonitorLogs")
    //巡查记录列
    this.columns = [
      {title: '操作时间', dataIndex: 'mgrTime'},
      {title: '操作人', dataIndex: 'optrNickname'},
      {title: '操作', dataIndex: 'mgrCode',render: text=> __getMgrStr(text)},
      {title: '昵称', dataIndex: 'programName'},
      {title: '房间ID', dataIndex: 'programId'}
    ]
    this.handleSearch = this.handleSearch.bind(this)
    this.handleLogListSearch = this.handleLogListSearch.bind(this)
    this.handleBtnChange = this.handleBtnChange.bind(this)
    this.warnningAnchor = this.warnningAnchor.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleShowEventsLogs = this.handleShowEventsLogs.bind(this)
    this.handleCheckFinished = this.handleCheckFinished.bind(this)
    this.handleShowShareModal = this.handleShowShareModal.bind(this)
  }
  componentDidMount(){
    AnchorService.queryUserByType().then(result=>{
      //判断是否有权限取消重点监播
      if(this.btnResList.includes("cancelFocusBtnId")) {
        this.setState({
          isShowCancelFocusBtn: true,
          kefuList: result
        })
      }else{
        this.setState({
          kefuList: result
        })
      }
    })
  }
  handlePaginationChange = (current, pageSize) => {
    const pagination = {...this.state.pagination};
    pagination.current = current;
    pagination.pageSize = pageSize
    // 存储当前tab页对应分页数
    this.openTabsObj[this.state.currTab] = current
    this.setState({
      pagination,
      show: 'loading',
      isAnchorsChecked: false
    }, () => {
      this.searchMonitor(this.searchParams, this.state.currTab, current, pageSize)
    })
  }
  componentWillUnMount(){
    this._destoryTimer()
  }
  _destoryTimer(){
    this.timer && clearTimeout(this.timer)
  }
  //查询监播的主播列表
  searchMonitor(formParams={}, type, current = 1, pageSize = this.state.pagination.pageSize){
    //查询数据，列表需要更新，清空计时器
    this._destoryTimer()
    const params = {...formParams, type, offset: (current -1 )*pageSize, limit: pageSize}
    CustomerService.queryMonitorList(params).then(result => {
      const pagination = {...this.state.pagination};
      pagination.current = current;
      pagination.total = result["totalCount"];
      const anchorList = result.records;
      if(anchorList.length > 0){
        anchorList.forEach(obj => {
          this.currAnchors.push(obj.programId)
        })
      }
      this.setState({
        show: anchorList.length > 0 ? 'normal' : 'empty',
        currTab: type,
        isAnchorsChecked: false,
        anchorList,
        pagination
      })

      this._checkedAll();
    })
  }
  // 查询数据后10秒，可以一键巡查
  _checkedAll(){
    this.timer = setTimeout(() => {
      this.setState({ isAnchorsChecked: true });
    }, 1000 * 10)
  }
  // 搜索
  handleSearch(values) {
    if(this.state.show === 'loading'){
      webUtils.alertFailure("正在查询中，请稍后...")
      return
    }
    this.searchParams = values
    this.setState({ show: 'loading', isAnchorsChecked: false })
    this.searchMonitor(values, this.state.currTab)
  }
  //巡查记录查询
  handleLogListSearch(values) {
    let params = {}
    values['nickName'] && ( params.nickName = values['nickName'] )
    values['optrId'] && ( params.optrId  = values['optrId'] )
    values['programId'] && ( params.programId  = values['programId'] )
    const queryDate = values['queryDate'];
    if(queryDate && queryDate.length > 0){
      params.startTime = queryDate[0].format("YYYY-MM-DD HH:mm:ss");
      queryDate[1] && (params.endTime = queryDate[1].format("YYYY-MM-DD HH:mm:ss"));
    }
    this.logListSearchParams = params
    this._tableRef.queryTableData(params)
  }
  //监播类型切换
  handleBtnChange(e){
    const currTab = e.target.value
    const isNewTab = this.state.currTab !== currTab
    if(!isNewTab) return;
    //查询监播画面
    if (currTab !== LOGLIST) {
      this.setState({ currTab }, () => {
        // 没有查询过数据，切换tab页不重新查询
        if(this.searchParams && isNewTab){
          this.setState({
            show: 'loading',
            isAnchorsChecked: false
          })
          // 有存储上次分页当前页数
          const current = this.openTabsObj[currTab]
          if(current) {
            this.searchMonitor(this.searchParams, currTab, current);
          } else {
            this.searchMonitor(this.searchParams, currTab);
          }
        }
      })
    } else {
      //查询巡查记录
      this.setState({ currTab }, () => {
        this.logListSearchParams && this._tableRef.queryTableData(this.logListSearchParams)
      })
    }

  }
  //警告主播
  warnningAnchor(obj){
    this.setState({anchorWarnVisible:true, anchorInfo:obj})
    this.warnFormRef.setFieldsValue(obj)
  }
  handleCheckFinished(e){
    e.stopPropagation()
    webUtils.confirm(function(){
      CustomerService.checkedMark({programIds: this.currAnchors}).then(result => {
        webUtils.alertSuccessCallback("巡查完毕!",()=>{
          //如果当前页不是最后一页，则不翻页
          const {current, pageSize, total} = this.state.pagination;
          if (current < Math.floor(total/pageSize)+1 ){
            this.handlePaginationChange(current + 1, pageSize)
          }else{
            this.setState({
              isAnchorsChecked: false
            })
          }
        })
      }).catch(()=>{  });
    }.bind(this), `确定已经巡查完毕当前页主播吗?`)
  }
  //显示主播处理事件
  handleShowEventsLogs(obj){
    this.setState({
      anchorEventVisible: true,
      anchorInfo: obj
    });
  }
  //
  handleShowShareModal(obj){
    CustomerService.queryShowSnsTemplet({anchor_id: obj.anchorId}).then((result)=>{
      this.setState({
        toWeChatData: result,
        shareToWeChatVisible: true,
        anchorInfo: obj
      })
      this.sendWxFormRef.setFieldsValue({anchor_id: obj.anchorId})
    })
  }
  //关闭模态框
  handleClose(e){
    this.setState({
      anchorEventVisible: false,
      anchorWarnVisible: false,
      shareToWeChatVisible: false
    })
  }
  //渲染顶部标签选项
  renderNavBtn(){
    const {currTab} = this.state
    return (
      <div className="buttonNav">
        <RadioGroup onChange={this.handleBtnChange} value={currTab}>
          <RadioButton value={IMP}>重点监播主播</RadioButton>
          <RadioButton value={TMP}>临时监播主播</RadioButton>
          <RadioButton value={NORMAL}>正常监播主播</RadioButton>
          {this.isAccessToLogList && <RadioButton value={LOGLIST}>巡查记录</RadioButton>}
        </RadioGroup >
      </div>
    )
  }
  //渲染监播画面
  renderMonitor(){
    const {anchorEventVisible, anchorWarnVisible, shareToWeChatVisible, toWeChatData,
      isAnchorsChecked, show, anchorInfo, pagination} = this.state
    return (
      <div className="anchor-monitor-container">
        {this.renderNavBtn()}
        <AnchorSearchForm onSearch={this.handleSearch}/>
        <div className="anchor-monitor-pics">
          {this.renderBody()}
        </div>
        <LogsOfEvents visible={anchorEventVisible} record={anchorInfo} onClose={this.handleClose}/>
        <WarnAnchorForm ref={ form => this.warnFormRef = form} visible={anchorWarnVisible} record={anchorInfo} onClose={this.handleClose}/>
        <SendToWeChatForm ref={ form => this.sendWxFormRef = form} visible={shareToWeChatVisible} record={toWeChatData} onClose={this.handleClose} anchorId={anchorInfo.anchorId}/>
        {show === "normal" && <Pagination  showSizeChanger {...pagination}
                                           onShowSizeChange={this.handlePaginationChange}
                                           onChange={this.handlePaginationChange}/>}
        {show === "normal" && <div className="anchor-check-finished">
          <Button type="primary" onClick={this.handleCheckFinished} disabled={!isAnchorsChecked}>一键巡查</Button>
        </div>}
      </div>
    )
  }
  renderBody(){
    const {currTab, anchorList, show, isShowCancelFocusBtn} = this.state
    if(show === "loading"){
      return <p><Icon type="loading" /> 加载中...</p>
    } else if(show === "empty"){
      return <p><Icon type="frown-o" /> 暂无数据</p>
    } else if(show === "normal"){
      return anchorList.map((obj,index) => {
        return  <SingleMonitorInfo key={obj.anchorId}
                                   record={obj}
                                   currTab={currTab}
                                   ownIndex={index}
                                   isShowCancelFocusBtn={isShowCancelFocusBtn}
                                   onWarnningAnchor={this.warnningAnchor}
                                   onShowEventsLogs={this.handleShowEventsLogs}
                                   onShowShareModal={this.handleShowShareModal}/>
      })
    }
  }
  //渲染巡查记录
  renderLogList(){
    return (
      <div className="anchor-monitor-container">
        {this.renderNavBtn()}
        <LogListSearchForm onSearch={this.handleLogListSearch} kefuList={this.state.kefuList}/>
        <CustomTable ref={obj=>this._tableRef=obj}
                     rowKey="mgrId"
                     columns={this.columns}
                     fetchTableDataMethod={CustomerService.findProgramMgrLogs} />
      </div>
    )
  }
  render(){
    const {currTab} = this.state
    if (currTab !== LOGLIST) {
      //渲染监播页面
      return this.renderMonitor()
    } else {
      //渲染巡查记录页面
      return this.renderLogList()
    }
  }
}
