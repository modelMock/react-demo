/**
 *公会待结算工资
 * @author 谭亮红
 */
import React, {Component} from 'react';
import {Form, Row, Col, Button, Select, DatePicker, Table} from 'antd';
import SettlementService from '../../service/SettlementService';
import UnionService from '../../service/UnionService';
import {DateUtil} from '../../commons/utils/DateUtil';
import webUtils from '../../commons/utils/webUtils';
import commonUtils from '../../commons/utils/commonUtils'

const FormItem = Form.Item;
const Option = Select.Option

const GUILD_PAY_OFF_TYPE =  {
  PRIVATE: '对私',
  PUBLIC: '对公'
}

//搜索表单
class GuildAwaitSettlementForm extends Component{
  constructor(props){
    super(props)
    this.state = {
      guildCodes: [],
      loading: false
    }
  }
  //搜索
  handleSearch = () => {
		this.props.form.validateFields((err, values) => {
			if(!!err) return;
			values["settledStatus"] = "unSettled";
			//用户选择的是时间，需要转换为帐期传给后台
			values['billPeriod'] = DateUtil.whichBillPeriod(values['billPeriod'])
			this.props.onSearch(values);
		})
  }
  componentDidMount() {
		//获取公会id(不是公会代码)
		UnionService.queryAllGuild().then(guildCodes => {
			this.setState({ guildCodes })
		})
  }
  //公会薪资结算
  handleGuildSettlement=(e)=>{
    e.preventDefault();
    const selectedRows = this.props.selectedRows;
    if( typeof selectedRows == "undefined" || selectedRows.length <= 0 ){
      webUtils.alertFailure("请选择记录！");
      return;
    }
    //封装数据
    let bankChoosed = true
    selectedRows.forEach((item,idx) => {
      if( !item.guildBankId ){
        bankChoosed = false
        return;
      }
      let filterValue = item.bankList.find((filt,idx) => item.guildBankId == filt.recordId);
      item["bankType"] = filterValue.bankType;
    })
    if( !bankChoosed ){
      webUtils.alertFailure(`请选择所选记录的账户！`);
      return;
    }
    webUtils.confirm(()=>{
      this.setState({
        loading: true
      })
      selectedRows.forEach(it => {
        it.remainFee = !!it.remainFee ? it.remainFee : 0  //如果余额为null，设置为0
      })
      SettlementService.saveGuildSettlement(selectedRows, selectedRows[0].billPeriod).then(jsonResult=>{
        webUtils.alertSuccess("结算成功！");
        this.setState({
          loading: false
        })
        this.props.onClearSelectRows();
				this.handleSearch()
      }).catch(err => {
        this.setState({
          loading: false
        })
      })
    }, "确定结算吗?")
  }

  render(){
    const {form, disableSettleBtn} = this.props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 14},
    }
    return(
      <Form layout="horizontal" onSubmit={this.handleSearch} className="ant-advanced-search-form">
        <Row>
          <Col sm={8}>
            <FormItem label="账期时间" {...formItemLayout}>
              {getFieldDecorator("billPeriod")(
                <DatePicker
                  style={{width:'100%'}}
                  format={DateUtil.YMD}
                  placeholder="请选择账期时间" />
              )}
            </FormItem>
          </Col>
          <Col sm={8}>
            <FormItem label="公会" {...formItemLayout}>
              {getFieldDecorator("guildId")(
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  placeholder="请选择公会">
                  {
                    this.state.guildCodes.map(item => (
                      <Option key={item.guildId}>{item.guildId}({item.guildName})</Option>
                    ))
                  }
                </Select>)}
            </FormItem>
          </Col>
          <Col sm={8} style={{textAlign: 'right'}}>
            <Button type="primary" ghost size="large" disabled={disableSettleBtn} loading={this.state.loading} onClick={this.handleGuildSettlement}>公会薪酬结算</Button>
            <Button type="primary" icon="search" size="large" htmlType="submit">查询</Button>
          </Col>
        </Row>
      </Form>
    )
  }
}
GuildAwaitSettlementForm=Form.create()(GuildAwaitSettlementForm);

export default class GuildAwaitSettlement extends Component{
  constructor(props){
    super(props);
    this.state = {
      selectedRowKeys: [],  /*表格选中行*/
      selectedRows: [],   /*表格选中行的数据*/
      dataSource:[],    /*表格数据*/
      loading: false,
      disableSettleBtn: false
    }
    this.awaitColumns=[
      {title: '账期', dataIndex: 'billPeriod', width: 80, fixed: 'left'},
      {title: '公会ID', dataIndex: 'guildId', width: 80, fixed: 'left'},
      {title: '公会名称', dataIndex: 'guildName', width: 120},
      {title: '提成比例', dataIndex: 'commissionRate', width: 100,render : text => `${text}%`},
      {title: '提成', dataIndex: 'commissionFee', width: 80, render: text =>  commonUtils.getFormatCentToYuan(text)},
      {title: '奖励', dataIndex: 'awardFee', width: 80, render: text =>  commonUtils.getFormatCentToYuan(text)},
      {title: '惩罚', dataIndex: 'punishFee', width: 80, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '暂扣', dataIndex: 'detainFee', width: 80, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '暂扣解冻', dataIndex: 'thawFee', width: 80, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '公会代发工资', dataIndex: 'guildPayrollFee', width: 120, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '应发金额', dataIndex: 'shouldFee', width: 120, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '提成发放方式', dataIndex: 'guildPayoffType', width: 150, render: text => GUILD_PAY_OFF_TYPE[text]},
      {title: '账户', dataIndex: 'guildBankId', render: (text, record, index) => {
        const bankList = record['bankList']||[]
        const accountBank = bankList.find(item => item.recordId === record.guildBankId)
        const accoundBankId = accountBank ? String(accountBank.recordId) : ""
        return (
          <Select style={{width: '90%'}}
                  defaultValue={accoundBankId}
                  onChange={(value) => this.doGuildBankChange(index, 'guildBankId', value, record)}>
            {bankList.map((item, idx) => <Option
              key={String(item.recordId)}>{idx + 1} {item.accountName}({item.bankAccount})</Option>)}
          </Select>
        )
      }},
      {title: '税率', dataIndex: 'taxRate', width: 80, render: text => commonUtils.getFormatPercentOff(text)},
      {title: '税率扣除', dataIndex: 'taxFee', width: 120, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '实发金额', dataIndex: 'realFee', width: 120, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '发票余额', dataIndex: 'remainFee', width: 120, render: text => commonUtils.getFormatCentToYuan(text)},
      {title: '发票差额', dataIndex: 'notEnoughFee', width: 120, render: text => commonUtils.getFormatCentToYuan(text)},
    ];
  }
  //选择发放到的银行
  doGuildBankChange = (index, key, guildBankId, record) => {
    const dataSource = this.state.dataSource.concat([]);
		record[key] = guildBankId // 修改或添加data数据中的guildBankId的值
    // 取出当前被选中银行的信息
    const bankList = record.bankList
    let filterFee = bankList.find(fi => fi.recordId == guildBankId)
    // 结算按钮失效
    this.setState({ disableSettleBtn: true});

    SettlementService.queryInvoiceFee(filterFee.accountName, filterFee.guildId, guildBankId,record.shouldFee).then(result =>{
      const {remainFee, faxRate} = result
			record['remainFee'] = remainFee // 发票余额
			record['taxRate'] = faxRate //税率
      let shouldFee = record['shouldFee']
      // 税率扣除
			record['taxFee'] = shouldFee - parseInt(shouldFee*(100-faxRate)/100/100)*100  //保持跟后台算法一致

      // 实发金额
			record['realFee'] = record['shouldFee'] - record['taxFee']
      // 发票差额大于0 不显示  小于0 显示实际值
      const dissFee = remainFee - record['realFee']
      // 发票差额
			record['notEnoughFee'] = dissFee > 0 ? "" : dissFee
      // 重置dataSource，selectedRows，并恢复结算按钮
      this.setState({ dataSource, disableSettleBtn: false});
    }).catch(err => {
      debugger
      this.setState({ dataSource, disableSettleBtn: false});
    })
  }
  //所有选中行记录集合
  handleRowChange = (selectedRowKeys, selectedRows) => {
    this.setState({selectedRowKeys,selectedRows});
  }
  handleSearch = (value) => {
    // 查询之前，清空数据
    this.setState({
      loading: true,
      dataSource: [],
      selectedRowKeys:[],
      selectedRows:[]
    })
    SettlementService.queryGuildSettlementList(value).then(result => {
      this.setState({
        dataSource: result.records,
        loading: false
      })
    })
  }
  //清空选择记录
  handleClearSelectRows = () => {
    this.setState({
      selectedRowKeys: [],
      selectedRows: []
    })
  }
  render(){
    const {selectedRowKeys, selectedRows, dataSource, loading, disableSettleBtn} = this.state;
    return (
      <div>
        <GuildAwaitSettlementForm selectedRows={selectedRows}
                                  disableSettleBtn={disableSettleBtn}
                                  onClearSelectRows={this.handleClearSelectRows}
                                  onSearch={this.handleSearch}/>
        <Table bordered
               loading={loading}
               rowKey={record => record.billPeriod + "_" + record.guildId}
               rowSelection={{selectedRowKeys, onChange:this.handleRowChange}}
               columns={this.awaitColumns}
               scroll={{x: 2130}}
               dataSource={dataSource}/>
      </div>
    )
  }
}