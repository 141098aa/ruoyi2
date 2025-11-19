<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <!-- <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item> -->
      <el-form-item label="fb_ID" prop="fbId">
        <el-input v-model="queryParams.fbId" placeholder="请输入fb_ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in dict.type.fb_withdraw_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="提现类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择提现类型" clearable>
          <el-option v-for="dict in dict.type.fb_withdraw_type" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['facebook:withdrawRecord:add']"
          >新增</el-button
        >
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['facebook:withdrawRecord:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['facebook:withdrawRecord:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['facebook:withdrawRecord:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="withdrawRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="提现记录ID" align="center" prop="id" v-if="true" />
      <!-- <el-table-column label="用户ID" align="center" prop="userId" /> -->
      <el-table-column label="fb_ID" align="center" prop="fbId" />
      <el-table-column label="用户描述" align="center" prop="userDesc" />
      <el-table-column label="提现金额" align="center" prop="money" />
      <el-table-column label="实际到账" align="center" prop="actualMoney" />
      <el-table-column label="银行卡/usdt" align="center" width="100">
        <template slot-scope="scope">
          <el-button type="text" @click="handleQueryBankInfo(scope.row)" :loading="scope.row.loading">查询</el-button>
        </template>
      </el-table-column>
      <!-- 银行信息对话框 -->
      <el-dialog title="用户提现信息" :visible.sync="bankInfoDialog" width="600px" append-to-body
        v-if="dialogType === 'bank'">
        <el-descriptions :column="1" border>
          <!-- <el-descriptions-item label="USDT-TRC地址">
        <div class="copy-content">
          <span class="content-text">{{ bankInfo.usdtTrc || '-' }}</span>
          <el-button
            v-if="bankInfo.usdtTrc"
            type="text"
            icon="el-icon-document-copy"
            @click="handleCopy(bankInfo.usdtTrc)"
          >复制</el-button>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="USDT-ERC地址">
        <div class="copy-content">
          <span class="content-text">{{ bankInfo.usdtErc || '-' }}</span>
          <el-button
            v-if="bankInfo.usdtErc"
            type="text"
            icon="el-icon-document-copy"
            @click="handleCopy(bankInfo.usdtErc)"
          >复制</el-button>
        </div>
      </el-descriptions-item> -->
          <el-descriptions-item label="银行信息">
            <div class="bank-info">
              <p><strong>银行名称：</strong>{{ bankInfo.bankName || '-' }}</p>
              <p><strong>账户名称：</strong>{{ bankInfo.accountName || '-' }}</p>
              <p><strong>银行账号：</strong>
                <span class="copy-content">
                  {{ bankInfo.bankAccount || '-' }}
                  <el-button v-if="bankInfo.bankAccount" type="text" icon="el-icon-document-copy"
                    @click="handleCopy(bankInfo.bankAccount)">复制</el-button>
                </span>
              </p>
              <p><strong>手机号码：</strong>{{ bankInfo.phoneNumber || '-' }}</p>
            </div>
          </el-descriptions-item>
          <!-- <el-descriptions-item label="其他信息" v-if="hasAdditionalInfo">
        <div class="additional-info">
          <p v-if="bankInfo.swiftCode"><strong>Swift代码：</strong>{{ bankInfo.swiftCode }}</p>
          <p v-if="bankInfo.bankCode"><strong>银行代码：</strong>{{ bankInfo.bankCode }}</p>
          <p v-if="bankInfo.bankAddress"><strong>银行地址：</strong>{{ bankInfo.bankAddress }}</p>
          <p v-if="bankInfo.recipientAddress"><strong>收款地址：</strong>{{ bankInfo.recipientAddress }}</p>
          <p v-if="bankInfo.postalCode"><strong>邮政编码：</strong>{{ bankInfo.postalCode }}</p>
        </div>
      </el-descriptions-item> -->
        </el-descriptions>

        <div slot="footer" class="dialog-footer">
          <el-button @click="bankInfoDialog = false">关 闭</el-button>
        </div>
      </el-dialog>
      <!-- 新增：区块链信息对话框 -->
      <el-dialog title="用户提现信息" :visible.sync="bankInfoDialog" width="600px" append-to-body
        v-if="dialogType === 'blockchain'">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="区块链信息">
            <p><strong>链路：</strong>{{ bankInfo.chain || '-' }}</p>
            <p><strong>地址：</strong>{{ bankInfo.address || '-' }}</p>
          </el-descriptions-item>



          
        </el-descriptions>
        <div slot="footer" class="dialog-footer">
          <el-button @click="bankInfoDialog = false">关 闭</el-button>
        </div>
      </el-dialog>

      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fb_withdraw_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="提现类型" align="center" prop="type">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fb_withdraw_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remarks" />
      <el-table-column label="驳回原因" align="center" prop="reason" />
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
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['facebook:withdrawRecord:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['facebook:withdrawRecord:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改提现记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" disabled />
        </el-form-item> -->
        <el-form-item label="fb_ID" prop="fbId">
          <el-input v-model="form.fbId" placeholder="请输入fb_ID" disabled />
        </el-form-item>
        <el-form-item label="用户描述" prop="userDesc">
          <el-input v-model="form.userDesc" type="textarea" placeholder="请输入内容" disabled />
        </el-form-item>
        <el-form-item label="提现金额" prop="money">
          <el-input v-model="form.money" placeholder="请输入提现金额" disabled />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in dict.type.fb_withdraw_status" :key="dict.value" :label="dict.value">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="驳回原因" prop="reason">
          <el-input v-model="form.reason" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="提现类型" prop="type">
          <el-radio-group v-model="form.type" disabled>
            <el-radio v-for="dict in dict.type.fb_withdraw_type" :key="dict.value" :label="dict.value">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listWithdrawRecord,
  getWithdrawRecord,
  delWithdrawRecord,
  addWithdrawRecord,
  updateWithdrawRecord,
  getUserInfo,
  getAddressByUser,
} from "@/api/facebook/withdrawRecord";
import Clipboard from 'clipboard'

export default {
  name: "WithdrawRecord",
  dicts: ["fb_withdraw_status", "fb_withdraw_type"],
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
      // 提现记录表格数据
      withdrawRecordList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        fbId: undefined,
        status: undefined,
        type: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [
          { required: true, message: "提现记录ID不能为空", trigger: "blur" },
        ],
        // userId: [
        //   { required: true, message: "用户ID不能为空", trigger: "blur" },
        // ],
        money: [
          { required: true, message: "提现金额不能为空", trigger: "blur" },
        ],
      },
      // 添加对话框显示控制
      bankInfoDialog: false,
      // 用户银行信息
      bankInfo: {},
      dialogType: 'bank', // 新增：'bank' 或 'blockchain'
    };
  },
  computed: {
    hasAdditionalInfo() {
      return this.bankInfo.swiftCode ||
        this.bankInfo.bankCode ||
        this.bankInfo.bankAddress ||
        this.bankInfo.recipientAddress ||
        this.bankInfo.postalCode;
    }
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询提现记录列表 */
    getList() {
      this.loading = true;
      listWithdrawRecord(this.queryParams).then((response) => {
        this.withdrawRecordList = response.rows;
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
        userId: undefined,
        fbId: undefined,
        customId: undefined,
        userDesc: undefined,
        money: undefined,
        status: undefined,
        remarks: undefined,
        reason: undefined,
        type: undefined,
        delFlag: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
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
      this.title = "添加提现记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.loading = true;
      this.reset();
      const id = row.id || this.ids;
      getWithdrawRecord(id).then((response) => {
        this.loading = false;
        this.form = response.data;
        this.open = true;
        this.title = "修改提现记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.buttonLoading = true;
          if (this.form.id != null) {
            updateWithdrawRecord(this.form)
              .then((response) => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              })
              .finally(() => {
                this.buttonLoading = false;
              });
          } else {
            addWithdrawRecord(this.form)
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
        .confirm('是否确认删除提现记录编号为"' + ids + '"的数据项？')
        .then(() => {
          this.loading = true;
          return delWithdrawRecord(ids);
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
        "facebook/withdrawRecord/export",
        {
          ...this.queryParams,
        },
        `withdrawRecord_${new Date().getTime()}.xlsx`
      );
    },
    /** 查询用户银行信息 */
    // handleQueryBankInfo(row) {
    //   this.$set(row, 'loading', true);

    //   getUserInfo(row.userId).then(response => {
    //     if (!response || !response.data) {
    //       this.$modal.msgError("未获取到用户信息");
    //       return;
    //     }
    //     this.bankInfo = response.data;
    //     this.bankInfoDialog = true;
    //   }).catch(error => {
    //     this.$modal.msgError(error.message || "查询失败");
    //   }).finally(() => {
    //     this.$set(row, 'loading', false);
    //   });
    // },

    /** 查询用户银行信息（优先按 addressId 查地址，否则查用户信息） */
    async handleQueryBankInfo(row) {
      if (!row) return;
      this.$set(row, 'loading', true);
      try {
        let res;
        if (row.addressId) {
          res = await getAddressByUser(row.addressId);
          // 按地址查询时，强制显示区块链信息页面
          this.dialogType = 'blockchain';
        } else {
          res = await getUserInfo(row.userId);
          this.dialogType = 'bank';
        }

        const code = res?.code ?? 200;
        const msg = res?.msg || "查询失败";
        if (code !== 200) {
          this.$modal.msgError(msg);
          return;
        }

        // 设置数据，即使为null也设置
        this.bankInfo = res.data || {};
        this.bankInfoDialog = true;

        // 如果数据为null，显示提示信息
        if (!res?.data) {
          this.$modal.msgWarning("未获取到地址信息");
        }
      } catch (e) {
        this.$modal.msgError(e?.message || "查询失败");
      } finally {
        this.$set(row, 'loading', false);
      }
    },


    /** 复制内容 */
    handleCopy(text) {
      const clipboard = new Clipboard('.copy-btn', {
        text: () => text
      });
      clipboard.on('success', () => {
        this.$modal.msgSuccess("复制成功");
        clipboard.destroy();
      });
      clipboard.on('error', () => {
        this.$modal.msgError("复制失败");
        clipboard.destroy();
      });
      document.body.appendChild(document.createElement('button'))
        .setAttribute('class', 'copy-btn');
      document.querySelector('.copy-btn').click();
      document.querySelector('.copy-btn').remove();
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
</style>