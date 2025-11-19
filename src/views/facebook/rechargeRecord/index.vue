<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户ID" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="fb_ID" prop="fbId">
        <el-input v-model="queryParams.fbId" placeholder="请输入fb_ID" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="是否真实" prop="isReal">
        <el-select v-model="queryParams.isReal" placeholder="请选择是否真实" clearable>
          <el-option v-for="dict in dict.type.fb_recharge_is_real" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付状态" prop="payStatus">
        <el-select v-model="queryParams.payStatus" placeholder="请选择支付状态" clearable>
          <el-option v-for="dict in dict.type.sys_common_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="充值类型" prop="rechargeType">
        <el-select v-model="queryParams.rechargeType" placeholder="请选择充值类型" clearable>
          <el-option v-for="dict in dict.type.fb_recharge_type" :key="dict.value" :label="dict.label"
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
          v-hasPermi="['facebook:rechargeRecord:add']"
        >新增</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['facebook:rechargeRecord:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['facebook:rechargeRecord:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['facebook:rechargeRecord:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="rechargeRecordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="充值记录ID" align="center" prop="id" v-if="true" />
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="fb_ID" align="center" prop="fbId" />
      <el-table-column label="用户描述" align="center" prop="userDesc" />
      <el-table-column label="充值金额" align="center" prop="money" />
      <el-table-column label="充值金额转USDT" align="center" prop="moneyChange" min-width="140">
        <template slot-scope="scope">
          {{ format2(scope.row.moneyChange) }}
        </template>
      </el-table-column>
      <el-table-column label="是否真实" align="center" prop="isReal">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fb_recharge_is_real" :value="scope.row.isReal" />
        </template>
      </el-table-column>
      <el-table-column label="支付状态" align="center" prop="payStatus">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_common_status" :value="scope.row.payStatus" />
        </template>
      </el-table-column>
      <el-table-column label="充值截图" align="center" prop="screenshot" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.screenshot" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="充值类型" align="center" prop="rechargeType">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fb_recharge_type" :value="scope.row.rechargeType" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="后台备注" align="center" prop="remarks" />
      <el-table-column label="用户端备注" align="center" prop="userRemarks" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['facebook:rechargeRecord:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['facebook:rechargeRecord:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改充值记录对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="fb_ID" prop="fbId">
          <el-input v-model="form.fbId" placeholder="请输入fb_ID" />
        </el-form-item>
        <el-form-item label="代运营ID" prop="customId">
          <el-input v-model="form.customId" placeholder="请输入代运营ID" />
        </el-form-item>
        <el-form-item label="用户描述" prop="userDesc">
          <el-input v-model="form.userDesc" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="充值金额" prop="money">
          <el-input v-model="form.money" placeholder="请输入充值金额" />
        </el-form-item>
        <el-form-item label="充值金额转USDT">
          <span>{{ format2(form.moneyChange) }}</span>
        </el-form-item>
        <el-form-item label="后台备注" prop="remarks">
          <el-input v-model="form.remarks" placeholder="请输入后台备注" />
        </el-form-item>
        <el-form-item label="用户端备注" prop="userRemarks">
          <el-input v-model="form.userRemarks" placeholder="请输入用户端备注" />
        </el-form-item>
        <el-form-item label="是否真实" prop="isReal">
          <el-radio-group v-model="form.isReal">
            <el-radio v-for="dict in dict.type.fb_recharge_is_real" :key="dict.value" :label="dict.value">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="支付状态" prop="payStatus">
          <el-radio-group v-model="form.payStatus">
            <el-radio v-for="dict in dict.type.sys_common_status" :key="dict.value" :label="dict.value">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="充值截图" prop="screenshot">
          <image-upload v-model="form.screenshot" />
        </el-form-item>
        <el-form-item label="充值类型" prop="rechargeType">
          <el-radio-group v-model="form.rechargeType">
            <el-radio v-for="dict in dict.type.fb_recharge_type" :key="dict.value" :label="dict.value">{{ dict.label
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
import { listRechargeRecord, getRechargeRecord, delRechargeRecord, addRechargeRecord, updateRechargeRecord } from "@/api/facebook/rechargeRecord";

export default {
  name: "RechargeRecord",
  dicts: ['sys_common_status', 'fb_recharge_is_real', 'fb_recharge_type'],
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
      // 充值记录表格数据
      rechargeRecordList: [],
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
        isReal: undefined,
        payStatus: undefined,
        rechargeType: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [
          { required: true, message: "充值记录ID不能为空", trigger: "blur" }
        ],
        userId: [
          { required: true, message: "用户ID不能为空", trigger: "blur" }
        ],
        money: [
          { required: true, message: "充值金额不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询充值记录列表 */
    getList() {
      this.loading = true;
      listRechargeRecord(this.queryParams).then(response => {
        this.rechargeRecordList = response.rows;
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
        moneyChange: undefined,
        remarks: undefined,
        userRemarks: undefined,
        isReal: undefined,
        payStatus: undefined,
        screenshot: undefined,
        rechargeType: undefined,
        delFlag: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加充值记录";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.loading = true;
      this.reset();
      const id = row.id || this.ids
      getRechargeRecord(id).then(response => {
        this.loading = false;
        this.form = response.data;
        this.open = true;
        this.title = "修改充值记录";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.buttonLoading = true;
          if (this.form.moneyChange !== '' && this.form.moneyChange !== undefined && this.form.moneyChange !== null) {
            this.form.moneyChange = Number(this.form.moneyChange).toFixed(2);
          }
          if (this.form.id != null) {
            updateRechargeRecord(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).finally(() => {
              this.buttonLoading = false;
            });
          } else {
            addRechargeRecord(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            }).finally(() => {
              this.buttonLoading = false;
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除充值记录编号为"' + ids + '"的数据项？').then(() => {
        this.loading = true;
        return delRechargeRecord(ids);
      }).then(() => {
        this.loading = false;
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      }).finally(() => {
        this.loading = false;
      });
    },
    format2(val) {
      if (val === null || val === undefined || val === '') return '';
      const n = Number(val);
      if (Number.isNaN(n)) return val;
      return n.toFixed(2);
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('facebook/rechargeRecord/export', {
        ...this.queryParams
      }, `rechargeRecord_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
