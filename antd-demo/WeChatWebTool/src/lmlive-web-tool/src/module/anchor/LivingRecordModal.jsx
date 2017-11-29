import React, {Component} from 'react';
import {Modal, Form, DatePicker, Button} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import commonUtils from '../../commons/utils/commonUtils';
import AnchorService from '../../service/AnchorService';

const {RangePicker} = DatePicker;
/**
 * 开播记录
 */
class LivingRecordModal extends Component{
  constructor(props){
    super(props);
    this.handleSearch = this.handleSearch.bind(this);
  }
  handleSearch(){
    const values = this.props.form.getFieldsValue();
    let params = { 'programId': this.props.record.programId };
    const queryDate = values['queryDate'];
    if(queryDate && queryDate.length > 0){
      params.beginTime = queryDate[0].format("YYYY-MM-DD HH:mm:ss");
      queryDate[1] && (params.endTime = queryDate[1].format("YYYY-MM-DD HH:mm:ss"));
    }
    this.refs.customTable.queryTableData(params);
  }
  handleCancel = () => {
    this.props.onClose()
    this.refs.customTable.resetTable();
  }
  __getColumns() {
    return [
      {title: '流水号', dataIndex: 'showDoneCode'},
      {title: '播放时长', dataIndex: 'playSeconds', render:(text) => commonUtils.getFormatTime(text)},
      {title: '开播时间', dataIndex: 'beginTime'},
      {title: '结束时间', dataIndex: 'endTime'},
      {title: '结束流水号', dataIndex: 'closeDoneCode'}
    ];
  }
  render(){
    const {form, visible, record} = this.props;
    const {getFieldDecorator} = form;
    return (
      <Modal visible={visible}
             maskClosable={false}
             width={650}
             title={`[${record['nickname']}] 开播记录`}
             onCancel={this.handleCancel}
             footer={[]}>
        <Form layout="inline" className="ant-advanced-search-form">
          {getFieldDecorator("queryDate")(
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss"
                         placeholder={['开播时间', '停播时间']} style={{marginLeft: '80px'}}/>
          )}
          <Button type="primary" icon="search" size="large"
                  style={{marginLeft: '50px'}} onClick={this.handleSearch}>搜索</Button>
        </Form>
        <CustomTable ref="customTable"
                     rowKey={record => record.programId+"_"+record.showDoneCode}
                     columns={this.__getColumns()}
                     fetchTableDataMethod={AnchorService.queryAnchorShowList}/>
      </Modal>
    );
  }
}
LivingRecordModal = Form.create()(LivingRecordModal);
export default LivingRecordModal