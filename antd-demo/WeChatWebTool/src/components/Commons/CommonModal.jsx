import React from 'react';
import Modal from 'antd/lib/modal';
import Button from 'antd/lib/button';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default class CommonModal extends React.Component {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
    width: React.PropTypes.number,
    onOk: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    footer: React.PropTypes.array,
  }
  static defaultProps = {
    // width: "520",
    onOk: () => {this.hide()},
    onCancel: () => {this.hide()},
  }
  constructor(props) {
    super(props);
    this.state={
      visible: false
    }
  }
  isShow() {
    return this.state.visible;
  }
  show() {
    this.setState({ visible: true });
  }
  hide() {
    this.setState({ visible: false });
  }
  shouldComponentUpdate(...args) {
    return PureRenderMixin.shouldComponentUpdate.apply(this, args);
  }
  render() {
    // if(this.state.visible === false) return null;
    console.debug('CommonModal => render');
    let footer = this.props.footer;
    if(footer === undefined) {
      footer = [
        <Button key="cancel" icon="cross" size="large" onClick={this.props.onCancel}>取消</Button>,
        <Button key="submit" type="primary" icon="check" size="large" onClick={this.props.onOk}>提交</Button>
      ];
    }
    return (
      <Modal {...this.props}
        visible={this.state.visible}
        maskClosable={false}
        footer={footer}>
          {this.props.children}
        </Modal>
    );
  }

}
