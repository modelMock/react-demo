import React from 'react';
import { Form, Row, Col, Input, Select, Button, Table, Tag,Modal,Upload,Icon } from 'antd';
import {
  queryAssignOptrsAndFromAnchors,
  queryAssignAnchors,
  queryAnchoreAssignOptr,
  queryAssignOperFromAnchors,
  queryAssignOperationList,
  queryProvince,
  queryCity,
  queryItemValueByKey,
  saveAssignOperToAnchor,
} from '../../services/showAnchor';
import {Errors} from '../Commons/CommonConstants';
import {Confirm, Success} from '../Commons/CommonConstants';
import UploadField from '../Ads/UploadField';
import RecycleOperationModal from './RecycleOperationModal'
const FormItem = Form.Item;
const Option = Select.Option;


class ShowHostAllocation extends React.Component{
  constructor(props){
    super(props)
    this.state={
      anchorList: [],            //秀场主播列表
      anchoreAssignOptr: [],       //分配所属客服
      assignOperFromAnchors: [],   //运营号来源
      assignOperationList: [],     // 表格数据
      provinceList: [],                //省下拉框
      cityList: [],                    //市下拉框
      anchorOperType: [],         //资料修改类型(默认不选)
      fileList: [],              //上传的图片集合
      dataUrl: null ,              //后台返回的二维码图片地址
      selectedRowKeys: [],    //表格选中行
      selectedRows: [],
      selectedAnchor: {},       //选中的主播
      selectedOperationId: '',      //选中的运营号id
      recycleOperationVisible: false,
      anchorInfo: {}
    }
    this.onBeforeUpload = this.onBeforeUpload.bind(this)
    this.onFileChange = this.onFileChange.bind(this)
    this.handlePreview = this.handlePreview.bind(this)
    this.handleRemove = this.handleRemove.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChangeAnchor = this.handleChangeAnchor.bind(this)
    this.handleChangeOperation = this.handleChangeOperation.bind(this)
    this.handleQueryAssignOperations = this.handleQueryAssignOperations.bind(this)
    this.handleChangeProvince = this.handleChangeProvince.bind(this)
    this.filterAnchorOption = this.filterAnchorOption.bind(this)
    this.handleCloseModal = this.handleCloseModal.bind(this)
    this.handleRecycleOperation = this.handleRecycleOperation.bind(this)
    this.columns=[
      {title: '运营号', dataIndex: 'mobile', width: 130},
      {title: '分配渠道时间', dataIndex: 'assign_channel_time', width: 150},
      {title: '创建时间', dataIndex: 'create_time', width: 150},
      {title: '组号', dataIndex: 'wechat_group', width: 130},
      {title: '好友数', dataIndex: 'valid_friend_cnt',width: 130},
      {title: '3日平均加粉数', dataIndex: 'day3_friend_cnt', width: 130},
      {title: '昵称', dataIndex: 'nickname', width: 250}
    ]
  }

  handleSubmit(e){
    e.preventDefault()
    this.props.form.validateFields(( errors, values ) => {
      if( errors ) return false

      if( !this.state.dataUrl ) return Errors("头像不能为空!")

      if(this.state.selectedRowKeys.length === 0) return Errors("请至少选择一个运营号!")

      values['head_url'] = this.state.dataUrl
      values['operationSnList'] = this.state.selectedRowKeys

      Confirm(()=>{
        saveAssignOperToAnchor( values ).then(({ jsonResult }) => {
          if(jsonResult) {
            Success("系统将在15分钟内完成主播资料修改")
            const anchorList = this.state.anchorList.concat([])
            const uptIndex = anchorList.findIndex( val => val.anchor_id === jsonResult.anchor_id )
            anchorList[uptIndex] = jsonResult
            this.setState({
              anchorList,
              selectedAnchor: jsonResult,
              assignOperationList: [],         // 表格数据
              cityList: [],                    //市下拉框
              selectedRowKeys: [],             //表格选中行
              selectedRows: [],
              selectedOperationId: ''          //选中的运营号id
            })
            this.props.form.setFieldsValue({
              service_optr_id: '',
              operationSnList: '',
              anchorOperUpdateType: ''
            })
          }
        })
      }, "确定修改主播资料信息吗?")
    })
  }

  //当选择主播改变时，对应下面的组件值相应改变
  handleChangeAnchor( value ){
    this.queryOptrAndOperationInfo( value )
  }

// 根据主播查询客服和运营号数据
  queryOptrAndOperationInfo( anchorId ) {
    queryAssignOptrsAndFromAnchors( anchorId ).then(({ jsonResult }) => {
      const baseInfo = jsonResult["baseInfo"]
      // 当前选中的主播数据对象
      const selectedAnchor = this.state.anchorList.find( anchor => anchor.anchor_id == anchorId)
      this.setState({
        selectedAnchor,
        anchoreAssignOptr: jsonResult['AssignOptrs'],
        assignOperFromAnchors: jsonResult['FromAnchors'],
        selectedOperationId: '',
        selectedRowKeys: [],
        selectedRows: [],
        assignOperationList: [],
        dataUrl: baseInfo["head_url"],
        fileList: baseInfo["head_url"] ? [{
          uid: -1,
          name: "a.png",
          url: baseInfo["head_url"],
        }] : []
      })
      this.props.form.setFieldsValue({
        service_optr_id: '',
        operationSnList: '',
        anchorOperUpdateType: '',
        province: baseInfo["province_id"],
        city: baseInfo["city_id"],
        signature: baseInfo["signature"]
      })
    })

  }
// 清空除了 选择主播外的form表单数据
  clearFormData(){
    this.props.form.setFieldsValue({
      service_optr_id: '',
      operationSnList: '',
      province: '',
      city: '',
      signature: '',
      anchorOperUpdateType: ''
    })
  }

//运营号来源 下拉框更改的时候获取对应的值 提供给查询表格值
  handleChangeOperation( value, option ){
    if( this.state.selectedOperationId === value ) return false
    const anchorInfo = {
      assign_anchor_id: value,
      anchor_name: option.props.children
    }
    this.setState({
      anchorInfo,
      selectedOperationId: value,
      assignOperationList: []
    })
  }

//提取客服和来源对应的运营号
  handleQueryAssignOperations(){
    if( this.state.selectedOperationId ) {
      queryAssignOperationList( this.state.selectedOperationId ).then(({ jsonResult }) => {
        this.setState({
          assignOperationList: jsonResult,
          selectedRowKeys: [],
          selectedRows:[]
        })
      })
    } else {
      Errors("请选择运营号来源")
    }
  }
//省级联动，这是市查询方法
  handleChangeProvince( value ){
    queryCity( value ).then(({ jsonResult }) => {
      this.setState({
        cityList: jsonResult
      })
      this.props.form.setFieldsValue({
        city: ''
      })
    })
  }

  filterAnchorOption( input, option ){
    if(!input) return true
    const inputValue = input.toLowerCase()
    const {value, children} = option.props
    return value.toLowerCase() == inputValue || children.toLowerCase().indexOf(inputValue) >= 0
  }

  componentDidMount() {
    Promise.all([queryProvince(), queryItemValueByKey(), queryAssignAnchors()]).then( results =>{
      this.setState({
        provinceList: results[0]['jsonResult'],
        anchorOperType: results[1]['jsonResult'],
        anchorList: results[2]['jsonResult']
      })
      this.queryOptrAndOperationInfo( results[2]['jsonResult'][0].anchor_id )
    })
  }
  onBeforeUpload(file) {
    // headers['X-Requested-With']跨域，这里设置为null
    console.log("上传文件类型 => ", file);
    if(file.type !== 'image/jpeg' && file.type !== 'image/png') {
      return Errors('只能上传 JPG或PNG 文件哦！')
    }

    if(file.size > 10*1024*1024) {
      return Errors('只能上传 小于10M 的文件哦！')
    }

    if(this.state.fileList.length > this.props.maxFileSize - 1) {
      return Errors(`只能上传最多${this.props.maxFileSize}张图片`)
    }
    return true
  }

  onFileChange({ event, file, fileList }) {
    fileList = fileList.filter( file => {
      const res = file.response
      if (res) {
        if(res['code'] === 200) {
          let data = res['data'][0]
          this.setState({dataUrl:data})
          return true;
        } else {
          Errors("上传失败,请重新上传:"+res['message'])
        }
        return false
      }
      return true
    })
    this.setState({ fileList })
  }

  handlePreview(file) {
    window.open('javascript:window.name;', '<script>location.replace("'+file['url']+'")<\/script>')
  }

  handleRemove(file) {
    let fileList = []
    this.state.fileList.forEach( f => {
      if( f.uid !== file.uid ) {
        fileList.push(f)
      }
    })
    this.setState({ fileList })
  }
  handleRecycleOperation(){
    if(!this.props.form.getFieldValue("operationSnList")) return Errors('请选择运营来源！')
    this.setState({
      recycleOperationVisible: true
    })
  }
  // 关闭模态框
  handleCloseModal( type ){
    type && this.handleQueryAssignOperations()
    this.setState({
      selectedRows: [],
      selectedRowKeys: type ? [] : this.state.selectedRowKeys,
      assignOperationList: [],
      recycleOperationVisible: false
    })
  }
  componentWillReceiveProps(nextProps) {
    if('isResetData' in nextProps && nextProps['isResetData'] === true) {
      this.setState({
        fileList: []
      })
    }
  }
//所有选中行记录集合
  handleRowChange(selectedRowKeys, selectedRows) {
    this.setState({selectedRowKeys,selectedRows})
  }

  render(){
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16}
    }
    const {getFieldDecorator} = this.props.form
    const action = AppName + "/common/upload2"
    const {anchorList, anchoreAssignOptr, assignOperFromAnchors , provinceList, cityList, recycleOperationVisible,
      anchorOperType, selectedRowKeys, selectedRows, selectedAnchor, anchorInfo} = this.state

    return (
      <div>
        <RecycleOperationModal visible={recycleOperationVisible}
                               onClose={this.handleCloseModal}
                               anchorInfo={anchorInfo}
                               selectedRows={selectedRows}
                               operationSn={selectedRowKeys}/>
        <Form horizontal onSubmit={this.handleSubmit}>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem {...formItemLayout} label="选择主播" required>
                {getFieldDecorator('assign_anchor_id', {initialValue: selectedAnchor.anchor_id})(
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    onChange={this.handleChangeAnchor}
                    filterOption={this.filterAnchorOption}>
                    {anchorList.map( anchor => <Option value={anchor.anchor_id}>{anchor.anchor_name}</Option> )}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem label="好友数" {...formItemLayout}>
                <p style={{color: 'red'}}>
                  <span>{selectedAnchor.friendCnt || 0}</span>,运营号数：
                  <span>{selectedAnchor.operationCnt || 0}</span>,近3日平均加粉数：
                  <span>{selectedAnchor.friendDay3Cnt || 0}</span>
                </p>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem label="分配客服" {...formItemLayout}>
                {getFieldDecorator("service_optr_id", {rules: [{required:true, message: '分配客服不能为空'}]})(
                  <Select allowClear placeholder="请选择客服">
                    {anchoreAssignOptr.map( optr => <Option key={optr.optr_id}>{optr.optr_name}</Option> )}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem label="运营号来源" {...formItemLayout}>
                {getFieldDecorator("operationSnList", {rules:[{required:true, message: '运营号来源不能为空'}]})(
                  <Select
                    optionLabelProp="children"
                    optionFilterProp="children"
                    showSearch
                    dropdownMatchSelectWidth={false}
                    onSelect={this.handleChangeOperation}>
                    {assignOperFromAnchors.map( optr => <Option key={String(optr.anchor_id)}>{optr.anchor_name}</Option> )}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={4} offset={1}>
              <Button type="primary" icon="check" size="large" onClick={this.handleQueryAssignOperations} >查询</Button>
              <Button type="primary" size="large" style={{marginLeft: '10px'}} onClick={this.handleRecycleOperation} >主播运营号回收</Button>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem {...formItemLayout} label="选择运营号">
                <p className="ant-form-text" id="userName" name="userName" style={{ color:'red' }}>已选择{selectedRows.length}个运营号</p>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={16} offset={1}>
              <Table
                bordered
                rowSelection={{
                  selectedRowKeys,
                  onChange: this.handleRowChange.bind(this),
                }}
                rowKey="operation_sn"
                columns={this.columns}
                dataSource={this.state.assignOperationList}/>
            </Col>
          </Row>

          <Row gutter={16} style={{marginTop: 16, borderTop: '2px solid #e9e9e9', paddingTop: 16}}>
            <Col span={8} >
              <FormItem label="地区"  {...formItemLayout}>
                {getFieldDecorator("province", {rules: [{required: true, message: '地区不能为空'}]})(
                  <Select
                    placeholder="请选择地区"
                    onChange={this.handleChangeProvince}
                    optionFilterProp="children"
                    allowClear showSearch dropdownMatchSelectWidth={false}>
                    {provinceList.map( province => <Option key={province}>{province}</Option> )}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem label="城市"  {...formItemLayout}>
                {getFieldDecorator("city", {rules: [{required: true, message: '城市不能为空'}]})(
                  <Select allowClear placeholder="请选择城市">
                    {cityList.map( city => <Option key={city}>{city}</Option> )}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem label="个性签名" {...formItemLayout}>
                {getFieldDecorator("signature", {rules: [{required: true, message: '个性签名不能为空'}]})(
                  <Input placeholder="请输入个性签名" />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem {...formItemLayout} label="头像" isRequired>
                <Upload
                  multiple
                  action={action}
                  data={{
                    sessionId: localStorage.getItem('sessionId'),
                    upload_type:"QrCode"
                  }}
                  className="upload-list-inline"
                  listType="picture"
                  fileList={this.state.fileList}
                  beforeUpload={this.onBeforeUpload}
                  onChange={this.onFileChange}
                  onPreview={this.handlePreview}
                  onRemove={this.handleRemove}>
                  <Button type="ghost" >
                    <Icon type="upload" /> 点击上传
                  </Button>
                </Upload>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem label="修改类型" {...formItemLayout}>
                {getFieldDecorator("anchorOperUpdateType")(
                  <Select allowClear placeholder="请选择修改类型">
                    {anchorOperType.map( Optr => <Option key={Optr.item_value}>{Optr.item_name}</Option> )}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <FormItem style={{textAlign: "right"}}>
                <Button type="primary" icon="check" size="large" htmlType="submit">提交</Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }
}
export default Form.create()(ShowHostAllocation);
