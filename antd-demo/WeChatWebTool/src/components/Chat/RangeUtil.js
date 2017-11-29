// 保存编辑前的光标信息
let __selectionRange;
const RangeUtil = {
  getSelectionRange: function() {
    return __selectionRange;
  },
  isPre: function(node){
    return "PRE" === node.nodeName && "editArea" === node.className
  },
  saveCurrentSelection: function(){
    if (window.getSelection) {
        let sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            __selectionRange = sel.getRangeAt(0);
            let sc = __selectionRange.startContainer
            if(!RangeUtil.isPre(sc) && !RangeUtil.isPre(sc.parentNode)){
              __selectionRange = null
            }
            return
        }
    } else if (document.selection && document.selection.createRange) {
        __selectionRange = document.selection.createRange();
        return
    }
    __selectionRange = null
  },
  // 恢复到之前的光标区域
  restoreLastSelection: function(){
    if (__selectionRange) {
        if (window.getSelection) {
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(__selectionRange);
        } else if (document.selection && __selectionRange.select) {
            __selectionRange.select();
        }
    }
  },
  // 插入元素
  insertElement: function(element){
    var sel, range, html
    if (window.getSelection) {
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(element);
      }
    } else if (document.selection && document.selection.createRange) {
      document.selection.createRange().text = text;
    }
  },
  //元素中显示光标
  showSelectionRang(ele) {
    if(window.getSelection) {
      var range = document.createRange();
      range.selectNodeContents(ele);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      var textRange = document.body.createTextRange();
      textRange.moveToElementText(ele);
      textRange.collapse(false);
      textRange.select();
    }
  }
}

export default RangeUtil;
