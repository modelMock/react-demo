import React, {Component} from 'react';
import {Table, Form, Row, Col, Input, Button} from 'antd';
import CustomTable from '../../commons/widgets/CustomTable';
import './AnchorDetailInfo.less';

const FormItem = Form.Item;
const AnchorSearchForm = Form.create()(
  (props) => {
    const {form, onSearch} = props;
    const {getFieldDecorator} = form;
    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 16},
    }
    return (
      <Form layout="horizontal" onSubmit={ onSearch } className="ant-advanced-search-form">
        <Row>
          <Col sm={7}>
            <FormItem label="主播ID" {...formItemLayout}>
              {getFieldDecorator("userId")(<Input placeholder="请输入主播ID查询" />)}
            </FormItem>
          </Col>
          <Col sm={7}>
            <FormItem label="房间ID" {...formItemLayout}>
              {getFieldDecorator("programId")(<Input placeholder="请输入房间ID查询" />)}
            </FormItem>
          </Col>
          <Col sm={7}>
            <FormItem label="昵称" {...formItemLayout}>
              {getFieldDecorator("nickname")(<Input placeholder="昵称支持模糊查询" />)}
            </FormItem>
          </Col>
          <Col sm={3}>
            <Button type="primary" icon="search" size="large" htmlType="submit">搜索</Button>
          </Col>
        </Row>
      </Form>
    )
  }
)

export default class AnchorDetailInfo extends Component {
  constructor(props){
    super(props);
    this.columns = [
      {title: '日期', dataIndex: ''},
      {title: '主播', dataIndex: ''},
      {title: '事件类型', dataIndex: ''},
      {title: '描述', dataIndex: ''},
      {title: '操作', dataIndex: ''}
    ]
  }

  render(){
    return (
      <div className="anchor-detailinfo-container">
        <AnchorSearchForm />
        <p className="anchor-table-title">主播信息</p>
        <table className="anchor-info">
          <tr>
            <td rowSpan={3}>
              <img src="http://lingmeng.img-cn-hangzhou.aliyuncs.com/anchorimg/ea3396e5340c4ea1bd8e4e4117c753f3.jpg" />
            </td>
            <td>昵称:</td>
            <td>小丽酱</td>
            <td>姓名:</td>
            <td>王晓丽</td>
            <td>id:</td>
            <td>1231231</td>
            <td>房间号:</td>
            <td>1231231</td>
          </tr>
          <tr>
            <td className="hidden"></td>
            <td>年龄:</td>
            <td>23</td>
            <td>城市:</td>
            <td>四川 成都</td>
            <td>归属:</td>
            <td>星空传媒 小红推荐</td>
            <td>推广数:</td>
            <td>0</td>
          </tr>
          <tr>
            <td className="hidden"></td>
            <td>标签:</td>
            <td>高颜值 歌神</td>
            <td>是否独家:</td>
            <td>否</td>
            <td>节目类型:</td>
            <td>PC直播</td>
            <td></td>
            <td></td>
          </tr>
        </table>
        <p className="anchor-table-title">播出情况</p>
        <table className="live-info">
          <tr>
            <td>首播日期:</td>
            <td>2017-03-12</td>
            <td>末播日期:</td>
            <td>2017-03-22</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>总累计:</td>
            <td>70天 120场 423小时</td>
            <td>用户消费:</td>
            <td>45870</td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={4}>
              <div className="live-info-div1">
                8场  250小时
                6532 元
              </div>
              <div className="live-info-div2">
                8场  250小时
                6532 元
              </div>
              <div className="live-info-div3">
                8场  250小时
                6532 元
              </div>
              <div className="live-info-div4">
                8场  250小时
                6532 元
              </div>
            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td>近30天累计:</td>
            <td>22天 35场 423小时</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td colSpan={4}>
              <div className="live-info-div1">
                8场  250小时
                6532 元
              </div>
              <div className="live-info-div2">
                8场  250小时
                6532 元
              </div>
              <div className="live-info-div3">
                8场  250小时
                6532 元
              </div>
              <div className="live-info-div4">
                8场  250小时
                6532 元
              </div>
            </td>
            <td>
            </td>
          </tr>
          <tr>
            <td colSpan={6}>近10天详情:</td>
          </tr>
          <tr>
            <td colSpan={6}>
              <table className="table-recent-info table-border">
                <tr>
                  <td>指标\日期</td>
                  <td>21</td>
                  <td>20</td>
                  <td>19</td>
                  <td>18</td>
                  <td>17</td>
                  <td>16</td>
                  <td>15</td>
                  <td>14</td>
                  <td>13</td>
                  <td>12</td>
                </tr>
                <tr>
                  <td>时长</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>消费额</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>消费人数</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>在线用户数</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>开通守护</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>明细</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p className="anchor-table-title">大粉丝</p>
        <table className="fans-info table-border">
          <tr>
            <td>id</td>
            <td>最后一次消费</td>
            <td>近七日消费</td>
            <td>2月消费</td>
            <td>1月消费</td>
            <td>12月消费</td>
            <td>总充值/消费</td>
            <td>操作</td>
          </tr>
          <tr>
            <td>啊是待机(1232333)</td>
            <td>2017-02-25</td>
            <td>0/0</td>
            <td></td>
            <td></td>
            <td></td>
            <td>320000/114000</td>
            <td></td>
          </tr>
        </table>
        <div className="anchor-flow">
          <div className="anchor-parts">
            <p className="anchor-table-title">荣誉</p>
            <table className="honor-info table-border">
              <tr>
                <td>日期</td>
                <td>活动</td>
                <td>名次</td>
              </tr>
              <tr>
                <td>2017-02-25</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>2017-02-25</td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </div>
          <div className="anchor-parts">
            <p className="anchor-table-title">流量</p>
            <table className="honor-info table-border">
              <tr>
                <td>日期</td>
                <td>变动量</td>
                <td>变化后</td>
              </tr>
              <tr>
                <td>2017-02-25</td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>2017-02-25</td>
                <td></td>
                <td></td>
              </tr>
            </table>
          </div>
        </div>
        <p className="anchor-table-title">事件</p>
        <table className="eve-info table-border">
          <tr>
            <td>事件类型</td>
            <td>日期</td>
            <td>详情</td>
            <td>处理人</td>
            <td>处理时间</td>
            <td>处理说明</td>
          </tr>
          <tr>
            <td></td>
            <td>2017-02-25</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td>2017-02-25</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </table>
        <CustomTable rowKeys="eventSn" columns={this.columns}/>
      </div>
    )
  }
}