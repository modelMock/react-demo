import fetchUtils from './fetchUtils';

/**
 * 账单相关的接口
 */
class BillService {
	// 初始化编辑礼物参数

	rollbackBills( param ) {//回退账单的审核
		return fetchUtils.json( "/bill/rollbackBills", param )
	}

	lockBillCashier( param ) {//锁定待发记录
		return fetchUtils.json( "/bill/lockBillCashier", param )
	}

	lockAllBillCashier() {//锁定所有的待发记录
		return fetchUtils.json( "/bill/lockAllBillCashier", {} )
	}

	unLockBillCashier( param ) {//解锁待发记录
		return fetchUtils.json( "/bill/unLockBillCashier", param )
	}

	queryBillForCashier( param ) {//查询可发放账单
		return fetchUtils.json( "/bill/queryBillForCashier", param )
	}

	importBillCashier( param ) {//导入发放记录
		return fetchUtils.json( "/bill/importBillCashier", param )
	}

	queryAnchorBills( param ) {//查询主播的账单
		return fetchUtils.json( "/bill/queryAnchorBills", param )
	}

	auditBills( param ) {//审核账单
		return fetchUtils.json( "/bill/auditBills", param )
	}

	queryGuildBills( param ) {//查询公会的账单
		return fetchUtils.json( "/bill/queryGuildBills", param )
	}

	exportGuildBill( param ) {//导出账单
		return fetchUtils.json( "/bill/exportGuildBill", param )
	}

	exportLockedBill( param ) {//导出锁定的发放记录
		return fetchUtils.json( "/bill/exportLockedBill", param )
	}

	//~~~~~~~~~~~~~~~~
	commitBillsToAduit( param ) {//对公账单提交运营主管审核
		return fetchUtils.json( "/bill/commitBillsToAduit", param )
	}
	urgeTheInvoice( param ) {//批量提醒开发票
		return fetchUtils.json( "/bill/urgeTheInvoice", param )
	}
	queryForBillPrint( param ) {//打印支付单的数据查询
		return fetchUtils.json( "/bill/queryForBillPrint", param )
	}
	savePrint( recordIds,bill ) {//打印支付单,发票后记录次数
		return fetchUtils.json( "/bill/savePrint", {recordIds,bill} )
	}
	auditBillsCashier( param ) {//财务二次审核
		return fetchUtils.json( "/bill/auditBillsCashier", param )
	}
	rollbackBillsCashier( param ) {//财务回退二次审核
		return fetchUtils.json( "/bill/rollbackBillsCashier", param )
	}

}

export default new BillService()
