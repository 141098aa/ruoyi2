<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="昵称" prop="fbNickname">
        <el-input v-model="queryParams.fbNickname" placeholder="请输入昵称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="FB_ID" prop="fbId">
        <el-input v-model="queryParams.fbId" placeholder="请输入FB_ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="业务状态" prop="businessStatus">
        <el-select v-model="queryParams.businessStatus" placeholder="请选择业务状态" clearable>
          <el-option v-for="dict in dict.type.fb_user_business_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="代运营ID" prop="customId">
        <el-input v-model="queryParams.customId" placeholder="请输入代运营ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['facebook:user:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['facebook:user:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['facebook:user:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['facebook:user:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户ID" align="center" prop="id" v-if="true" />
      <el-table-column label="描述" align="center" prop="userDesc" />
      <el-table-column label="昵称" align="center" prop="fbNickname" />
      <el-table-column label="头像" align="center" prop="fbAvatar" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.fbAvatar" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="FB_ID" align="center" prop="fbId" />
      <el-table-column label="代运营ID" align="center" prop="customId" width="100" />
      <el-table-column label="可用资金" align="center" prop="availableFunds" />
      <el-table-column label="资产信息" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="showAssetInfo(scope.row)" :loading="scope.row.loading"
            icon="el-icon-wallet">查询</el-button>
        </template>
      </el-table-column>

      <!-- 添加资产详情对话框 -->
      <el-dialog title="资产详情" :visible.sync="assetInfoDialog" width="400px" append-to-body>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="可用资金">
            <span class="amount-text">{{
              formatAmount(currentAsset.availableFunds)
              }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="待消耗">
            <span class="amount-text">{{
              formatAmount(currentAsset.waitSpentAmount)
              }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="待结算">
            <span class="amount-text">{{
              formatAmount(currentAsset.toBeSettled)
              }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="总资产">
            <span class="amount-text total">{{
              formatAmount(getTotalAsset(currentAsset))
              }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>

      <el-table-column label="银行卡/usdt" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="showBankInfo(scope.row)">查看</el-button>
        </template>
      </el-table-column>
      <!-- 添加银行信息对话框 -->
      <el-dialog title="用户提现信息" :visible.sync="bankInfoDialog" width="600px" append-to-body>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="USDT-TRC地址">
            <div class="copy-content">
              <span class="content-text">{{ currentUser.usdtTrc || "-" }}</span>
              <el-button v-if="currentUser.usdtTrc" type="text" icon="el-icon-document-copy"
                @click="handleCopy(currentUser.usdtTrc)">复制</el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="USDT-ERC地址">
            <div class="copy-content">
              <span class="content-text">{{ currentUser.usdtErc || "-" }}</span>
              <el-button v-if="currentUser.usdtErc" type="text" icon="el-icon-document-copy"
                @click="handleCopy(currentUser.usdtErc)">复制</el-button>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="银行信息">
            <div class="bank-info">
              <p>
                <strong>银行名称：</strong>{{ currentUser.bankName || "-" }}
              </p>
              <p>
                <strong>账户名称：</strong>{{ currentUser.accountName || "-" }}
              </p>
              <p>
                <strong>银行账号：</strong>
                <span class="copy-content">
                  {{ currentUser.bankAccount || "-" }}
                  <el-button v-if="currentUser.bankAccount" type="text" icon="el-icon-document-copy"
                    @click="handleCopy(currentUser.bankAccount)">复制</el-button>
                </span>
              </p>
              <p>
                <strong>手机号码：</strong>{{ currentUser.phoneNumber || "-" }}
              </p>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="其他信息" v-if="hasAdditionalInfo">
            <div class="additional-info">
              <p v-if="currentUser.swiftCode">
                <strong>Swift代码：</strong>{{ currentUser.swiftCode }}
              </p>
              <p v-if="currentUser.bankCode">
                <strong>银行代码：</strong>{{ currentUser.bankCode }}
              </p>
              <p v-if="currentUser.bankAddress">
                <strong>银行地址：</strong>{{ currentUser.bankAddress }}
              </p>
              <p v-if="currentUser.recipientAddress">
                <strong>收款地址：</strong>{{ currentUser.recipientAddress }}
              </p>
              <p v-if="currentUser.postalCode">
                <strong>邮政编码：</strong>{{ currentUser.postalCode }}
              </p>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>

      <el-table-column label="业务状态" align="center" prop="businessStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fb_user_business_status" :value="scope.row.businessStatus" />
        </template>
      </el-table-column>
      <el-table-column label="信用分" align="center" prop="creditScore" />
      <el-table-column label="用户视角" align="center">
        <template #default="scope">
          <el-space>
            <el-link type="primary" :href="scope.row.planUrl" target="_blank">
              计划管理
            </el-link>
            <el-link type="primary" :href="scope.row.adsUrl" target="_blank">
              广告中心
            </el-link>
          </el-space>
        </template>
      </el-table-column>
      <el-table-column label="客服链接" align="center" prop="customerServiceUrl" />
      <el-table-column label="最后访问时间" align="center" prop="lastAccessTime" width="180">
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.lastAccessTime, "{y}-{m}-{d} {h}:{i}:{s}")
            }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}:{s}")
            }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.updateTime, "{y}-{m}-{d} {h}:{i}:{s}")
            }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-plus" @click="handleRecharge(scope.row)"
            v-hasPermi="['facebook:user:recharge']">充值</el-button>
          <el-button size="mini" type="text" icon="el-icon-minus" @click="handleDeduct(scope.row)"
            v-hasPermi="['facebook:user:deduct']">扣款</el-button>
          <el-button size="mini" type="text" icon="el-icon-s-order" @click="handleAssignOrder(scope.row)"
            v-hasPermi="['facebook:user:assign']">派单</el-button>
          <el-button size="mini" type="text" icon="el-icon-present" @click="handleAssignCoupon(scope.row)"
            v-hasPermi="['facebook:user:coupon']">派优惠券</el-button>
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['facebook:user:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['facebook:user:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改用户列表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="描述" prop="userDesc">
          <el-input v-model="form.userDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="昵称" prop="fbNickname">
          <el-input v-model="form.fbNickname" placeholder="请输入昵称" />
        </el-form-item>
        <!-- <el-form-item label="头像" prop="fbAvatar">
          <image-upload v-model="form.fbAvatar" />
        </el-form-item> -->
        <el-form-item label="FB_ID" prop="fbId">
          <el-input v-model="form.fbId" placeholder="请输入FB_ID" />
        </el-form-item>
        <el-form-item label="可用资金" prop="availableFunds">
          <el-input v-model="form.availableFunds" placeholder="请输入可用资金" />
        </el-form-item>
        <el-form-item label="业务状态" prop="businessStatus">
          <el-radio-group v-model="form.businessStatus">
            <el-radio v-for="dict in dict.type.fb_user_business_status" :key="dict.value"
              :label="parseInt(dict.value)">{{
              dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="信用分" prop="creditScore">
          <el-input v-model="form.creditScore" placeholder="请输入信用分" />
        </el-form-item>
        <el-form-item label="交易密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入交易密码" />
        </el-form-item>
        <el-form-item label="代运营ID" prop="customId">
          <el-input v-model="form.customId" placeholder="请输入代运营ID" />
        </el-form-item>
        <el-form-item label="等级" prop="level">
          <el-input v-model="form.level" placeholder="请输入等级" />
        </el-form-item>
        <el-form-item label="客服链接" prop="customerServiceUrl">
          <el-input v-model="form.customerServiceUrl" placeholder="请输入客服链接" />
        </el-form-item>
        <el-form-item label="最后访问时间" prop="lastAccessTime">
          <el-date-picker clearable v-model="form.lastAccessTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择最后访问时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="USDT-TRC地址" prop="usdtTrc">
          <el-input v-model="form.usdtTrc" placeholder="请输入USDT-TRC地址" />
        </el-form-item>
        <el-form-item label="USDT-ERC地址" prop="usdtErc">
          <el-input v-model="form.usdtErc" placeholder="请输入USDT-ERC地址" />
        </el-form-item>
        <el-form-item label="银行名称" prop="bankName">
          <el-input v-model="form.bankName" placeholder="请输入银行名称" />
        </el-form-item>
        <el-form-item label="用户姓名" prop="accountName">
          <el-input v-model="form.accountName" placeholder="请输入用户姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="form.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="银行账户" prop="bankAccount">
          <el-input v-model="form.bankAccount" placeholder="请输入银行账户" />
        </el-form-item>
        <el-form-item label="Swift 代码" prop="swiftCode">
          <el-input v-model="form.swiftCode" placeholder="请输入Swift 代码" />
        </el-form-item>
        <el-form-item label="银行代码" prop="bankCode">
          <el-input v-model="form.bankCode" placeholder="请输入银行代码" />
        </el-form-item>
        <el-form-item label="银行地址" prop="bankAddress">
          <el-input v-model="form.bankAddress" placeholder="请输入银行地址" />
        </el-form-item>
        <el-form-item label="收款人地址" prop="recipientAddress">
          <el-input v-model="form.recipientAddress" placeholder="请输入收款人地址" />
        </el-form-item>
        <el-form-item label="邮编" prop="postalCode">
          <el-input v-model="form.postalCode" placeholder="请输入邮编" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改充值对话框 -->
    <el-dialog title="充值" :visible.sync="rechargeOpen" width="500px" append-to-body>
      <el-form ref="rechargeForm" :model="rechargeForm" :rules="rechargeRules" label-width="120px">
        <el-form-item label="充值金额" prop="money">
          <el-input v-model="rechargeForm.money" placeholder="请输入充值金额" />
        </el-form-item>
        <el-form-item label="是否真实充值" prop="isReal">
          <el-select v-model="rechargeForm.isReal" placeholder="请选择">
            <el-option label="请选择" value="" />
            <el-option label="真实" value="1" />
            <el-option label="虚拟" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="后台备注" prop="remarks">
          <el-input v-model="rechargeForm.remarks" type="textarea" placeholder="请输入后台备注" />
        </el-form-item>
        <el-form-item label="用户端备注" prop="userRemarks">
          <el-input v-model="rechargeForm.userRemarks" type="textarea" placeholder="请输入用户端备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitRecharge">确 定</el-button>
        <el-button @click="rechargeOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改扣款对话框 -->
    <el-dialog title="扣款" :visible.sync="deductOpen" width="500px" append-to-body>
      <el-form ref="deductForm" :model="deductForm" :rules="deductRules" label-width="120px">
        <el-form-item label="扣款金额" prop="money">
          <el-input v-model="deductForm.money" placeholder="请输入扣款金额" />
        </el-form-item>
        <el-form-item label="后台备注" prop="remarks">
          <el-input v-model="deductForm.remarks" type="textarea" placeholder="请输入后台备注" />
        </el-form-item>
        <el-form-item label="用户端备注" prop="userRemarks">
          <el-input v-model="deductForm.userRemarks" type="textarea" placeholder="请输入用户端备注" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitDeduct">确 定</el-button>
        <el-button @click="deductOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改派单对话框 -->
    <el-dialog title="派单" :visible.sync="assignOrderOpen" width="500px" append-to-body>
      <el-form ref="assignOrderForm" :model="assignOrderForm" :rules="assignOrderRules" label-width="120px">
        <el-form-item label="选择计划" prop="planId">
          <el-select v-model="assignOrderForm.planId" placeholder="请选择计划" filterable>
            <el-option v-for="item in planOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="最低投放金额" prop="lowInvAmount">
          <el-input v-model="assignOrderForm.lowInvAmount" placeholder="请输入最低投放金额" />
        </el-form-item>
        <el-form-item label="最高投放金额" prop="highInvAmount">
          <el-input v-model="assignOrderForm.highInvAmount" placeholder="请输入最高投放金额" />
        </el-form-item>
        <el-form-item label="官方推送">
          <el-switch v-model="assignOrderForm.isOfficial" active-value="Y" inactive-value="N" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAssignOrder">确 定</el-button>
        <el-button @click="assignOrderOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 修改派发优惠券对话框，移除备注 -->
    <el-dialog title="派发优惠券" :visible.sync="assignCouponOpen" width="500px" append-to-body>
      <el-form ref="assignCouponForm" :model="assignCouponForm" :rules="assignCouponRules" label-width="100px">
        <el-form-item label="选择优惠券" prop="couponId">
          <el-select v-model="assignCouponForm.couponId" placeholder="请选择优惠券" filterable>
            <el-option v-for="item in couponOptions" :key="item.id" :label="item.couponName" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAssignCoupon">确 定</el-button>
        <el-button @click="assignCouponOpen = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  assignCoupon,
  rechargeUser,
  deductUser,
  assignOrder,
} from "@/api/facebook/user";
import { listCoupon } from "@/api/facebook/coupon";
import { listPlan } from "@/api/facebook/plan";
import Clipboard from 'clipboard'

export default {
  name: "User",
  dicts: ["fb_user_business_status"],
  data() {
    return {
      // 按钮loading
      buttonLoading: false,
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户列表表格数据
      userList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        fbNickname: undefined,
        fbId: undefined,
        businessStatus: undefined,
        customId: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [{ required: true, message: "用户ID不能为空", trigger: "blur" }],
      },
      // 充值表单参数
      rechargeForm: {
        userId: undefined,
        money: undefined,
        isReal: "",
        remarks: "",
        userRemarks: "",
      },
      // 充值表单校验
      rechargeRules: {
        money: [
          { required: true, message: "充值金额不能为空", trigger: "blur" },
        ],
        isReal: [
          { required: true, message: "请选择是否真实充值", trigger: "change" },
        ],
      },
      // 扣款表单参数
      deductForm: {
        userId: undefined,
        money: undefined,
        remarks: "",
        userRemarks: "",
      },
      // 扣款表单校验
      deductRules: {
        money: [
          { required: true, message: "扣款金额不能为空", trigger: "blur" },
        ],
      },
      // 派单表单参数
      assignOrderForm: {
        userId: undefined,
        planId: undefined,
        lowInvAmount: undefined,
        highInvAmount: undefined,
        isOfficial: "N",
      },
      // 派单表单校验
      assignOrderRules: {
        planId: [{ required: true, message: "请选择计划", trigger: "change" }],
        lowInvAmount: [
          { required: true, message: "请输入最低投放金额", trigger: "blur" },
        ],
        highInvAmount: [
          { required: true, message: "请输入最高投放金额", trigger: "blur" },
        ],
      },
      // 派发优惠券表单参数
      assignCouponForm: {
        userId: undefined,
        couponId: undefined,
      },
      // 派发优惠券表单校验
      assignCouponRules: {
        couponId: [
          { required: true, message: "请选择优惠券", trigger: "blur" },
        ],
      },
      // 充值对话框是否显示
      rechargeOpen: false,
      // 扣款对话框是否显示
      deductOpen: false,
      // 派单对话框是否显示
      assignOrderOpen: false,
      // 派发优惠券对话框是否显示
      assignCouponOpen: false,
      // 订单选项
      orderOptions: [],
      // 优惠券选项
      couponOptions: [],
      // 计划选项
      planOptions: [],

      bankInfoDialog: false,

      currentUser: {}, // 当前选中的用户
      assetInfoDialog: false,
      currentAsset: {},
    };
  },

  computed: {
    hasAdditionalInfo() {
      return (
        this.currentUser.swiftCode ||
        this.currentUser.bankCode ||
        this.currentUser.bankAddress ||
        this.currentUser.recipientAddress ||
        this.currentUser.postalCode
      );
    },
  },

  created() {
    this.getList();
  },
  methods: {
    /** 查询用户列表列表 */
    getList() {
      this.loading = true;
      listUser(this.queryParams).then((response) => {
        this.userList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        userDesc: undefined,
        fbNickname: undefined,
        fbAvatar: undefined,
        fbId: undefined,
        availableFunds: undefined,
        businessStatus: undefined,
        creditScore: undefined,
        password: undefined,
        customId: undefined,
        lang: undefined,
        timezone: undefined,
        oneClickPromotion: undefined,
        level: undefined,
        ip: undefined,
        customerServiceUrl: undefined,
        lastAccessTime: undefined,
        levelProfitRatio: undefined,
        levelCostRatio: undefined,
        usdtTrc: undefined,
        usdtErc: undefined,
        bankName: undefined,
        accountName: undefined,
        phoneNumber: undefined,
        bankAccount: undefined,
        swiftCode: undefined,
        bankCode: undefined,
        bankAddress: undefined,
        recipientAddress: undefined,
        postalCode: undefined,
        isTaxFiled: undefined,
        productClickSetting: undefined,
        delFlag: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加用户列表";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.loading = true;
      this.reset();
      const id = row.id || this.ids;
      getUser(id).then((response) => {
        this.loading = false;
        this.form = response.data;
        this.open = true;
        this.title = "修改用户列表";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.buttonLoading = true;
          if (this.form.id != null) {
            updateUser(this.form)
              .then((response) => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              })
              .finally(() => {
                this.buttonLoading = false;
              });
          } else {
            addUser(this.form)
              .then((response) => {
                this.$modal.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              })
              .finally(() => {
                this.buttonLoading = false;
              });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal
        .confirm('是否确认删除用户列表编号为"' + ids + '"的数据项？')
        .then(() => {
          this.loading = true;
          return delUser(ids);
        })
        .then(() => {
          this.loading = false;
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => { })
        .finally(() => {
          this.loading = false;
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "facebook/user/export",
        {
          ...this.queryParams,
        },
        `user_${new Date().getTime()}.xlsx`
      );
    },
    // 充值操作
    handleRecharge(row) {
      this.rechargeForm = {
        userId: row.id,
        money: undefined,
        isReal: "",
        remarks: "",
        userRemarks: "",
      };
      this.rechargeOpen = true;
    },
    // 提交充值
    submitRecharge() {
      this.$refs["rechargeForm"].validate((valid) => {
        if (valid) {
          this.buttonLoading = true;
          rechargeUser(this.rechargeForm)
            .then((response) => {
              this.$modal.msgSuccess("充值成功");
              this.rechargeOpen = false;
              this.getList();
            })
            .catch((error) => {
              this.$modal.msgError(error.response.data.msg || "充值失败");
            })
            .finally(() => {
              this.buttonLoading = false;
            });
        }
      });
    },
    // 扣款操作
    handleDeduct(row) {
      this.deductForm = {
        userId: row.id,
        money: undefined,
        remarks: "",
        userRemarks: "",
      };
      this.deductOpen = true;
    },
    // 提交扣款
    submitDeduct() {
      this.$refs["deductForm"].validate((valid) => {
        if (valid) {
          this.buttonLoading = true;
          deductUser(this.deductForm)
            .then((response) => {
              this.$modal.msgSuccess("扣款成功");
              this.deductOpen = false;
              this.getList();
            })
            .catch((error) => {
              this.$modal.msgError(error.response.data.msg || "扣款失败");
            })
            .finally(() => {
              this.buttonLoading = false;
            });
        }
      });
    },
    // 获取计划列表
    getPlanList() {
      listPlan({
        pageNum: 1,
        pageSize: 999,
        status: "0", // 状态正常的计划
      }).then((response) => {
        this.planOptions = response.rows;
      });
    },
    // 派单操作
    handleAssignOrder(row) {
      this.assignOrderForm = {
        userId: row.id,
        planId: undefined,
        lowInvAmount: undefined,
        highInvAmount: undefined,
        isOfficial: "N",
      };
      this.getPlanList();
      this.assignOrderOpen = true;
    },
    // 提交派单
    submitAssignOrder() {
      this.$refs["assignOrderForm"].validate((valid) => {
        if (valid) {
          this.buttonLoading = true;
          assignOrder(this.assignOrderForm)
            .then((response) => {
              this.$modal.msgSuccess("派单成功");
              this.assignOrderOpen = false;
              this.getList();
            })
            .catch((error) => {
              this.$modal.msgError(error.response.data.msg || "派单失败");
            })
            .finally(() => {
              this.buttonLoading = false;
            });
        }
      });
    },
    // 获取优惠券列表，添加筛选条件
    getCouponList() {
      listCoupon({
        pageNum: 1,
        pageSize: 999,
        status: "0", // 状态正常
        //isDefault: "0", // 非通用优惠券
      }).then((response) => {
        this.couponOptions = response.rows;
      });
    },
    // 派发优惠券操作
    handleAssignCoupon(row) {
      this.assignCouponForm = {
        userId: row.id,
        couponId: undefined,
      };
      this.getCouponList(); // 获取优惠券列表
      this.assignCouponOpen = true;
    },
    // 提交派发优惠券
    submitAssignCoupon() {
      this.$refs["assignCouponForm"].validate((valid) => {
        if (valid) {
          this.buttonLoading = true;
          assignCoupon(this.assignCouponForm)
            .then((response) => {
              this.$modal.msgSuccess("派发优惠券成功");
              this.assignCouponOpen = false;
              this.getList();
            })
            .catch((error) => {
              // 显示错误信息
              this.$modal.msgError(error.response.data.msg || "派发优惠券失败");
            })
            .finally(() => {
              this.buttonLoading = false;
            });
        }
      });
    },
    /** 显示银行信息 */
    showBankInfo(row) {
      this.currentUser = row;
      this.bankInfoDialog = true;
    },

    /** 复制内容 */
    handleCopy(text) {
      const clipboard = new Clipboard(".copy-btn", {
        text: () => text,
      });
      clipboard.on("success", () => {
        this.$modal.msgSuccess("复制成功");
        clipboard.destroy();
      });
      clipboard.on("error", () => {
        this.$modal.msgError("复制失败");
        clipboard.destroy();
      });
      document.body
        .appendChild(document.createElement("button"))
        .setAttribute("class", "copy-btn");
      document.querySelector(".copy-btn").click();
      document.querySelector(".copy-btn").remove();
    },

    /** 查询并显示资产详情 */
    showAssetInfo(row) {
      this.$set(row, 'loading', true);

      getUser(row.id).then(response => {
        if (!response.data) {
          this.$modal.msgError("未获取到用户信息");
          return;
        }
        this.currentAsset = response.data;
        if (this.isEmptyAsset(this.currentAsset)) {
          this.$modal.msgInfo("该用户暂无资产信息");
          return;
        }
        this.assetInfoDialog = true;
      }).catch(error => {
        this.$modal.msgError(error.message || "查询失败");
      }).finally(() => {
        this.$set(row, 'loading', false);
      });
    },

    /** 检查资产信息是否为空 */
    isEmptyAsset(asset) {
      return !asset.availableFunds &&
        !asset.waitSpentAmount &&
        !asset.toBeSettled;
    },

    /** 计算总资产 */
    getTotalAsset(data) {
      if (!data) return 0;
      const available = parseFloat(data.availableFunds || 0);
      const waiting = parseFloat(data.waitSpentAmount || 0);
      const settling = parseFloat(data.toBeSettled || 0);
      return (available + waiting + settling).toFixed(2);
    },

    /** 格式化金额 */
    formatAmount(amount) {
      if (!amount && amount !== 0) return '-';
      return '￥' + parseFloat(amount).toFixed(2);
    }
  },
};
</script>
<style scoped>
.copy-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.content-text {
  word-break: break-all;
  flex: 1;
}

.bank-info p,
.additional-info p {
  margin: 8px 0;
  display: flex;
  align-items: center;
}

.bank-info strong,
.additional-info strong {
  display: inline-block;
  width: 100px;
  flex-shrink: 0;
}

:deep(.el-descriptions__body) {
  background-color: #ffffff;
}

:deep(.el-descriptions-item__label) {
  width: 120px;
  background-color: #f5f7fa;
}

:deep(.el-descriptions-item__content) {
  padding: 12px 15px;
}

.additional-info {
  color: #666;
  font-size: 13px;
}




.amount-text {
  font-family: Arial, sans-serif;
  color: #606266;
}

.amount-text.total {
  color: #409EFF;
  font-weight: bold;
  font-size: 16px;
}

:deep(.el-descriptions__body) {
  background-color: #ffffff;
}

:deep(.el-descriptions-item__label) {
  width: 120px;
  background-color: #f5f7fa;
}

:deep(.el-descriptions-item__content) {
  padding: 12px 15px;
  text-align: right;
}

/* 添加一些动画效果 */
.el-dialog__body {
  transition: all 0.3s ease;
}

.amount-text {
  transition: color 0.3s ease;
}

/* 查询按钮样式 */
.el-button [class*="el-icon-"]+span {
  margin-left: 5px;
}
</style>
