<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="订单号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="官方派单" prop="isOfficial">
        <el-select v-model="queryParams.isOfficial" placeholder="请选择官方派单" clearable>
          <el-option
            v-for="dict in dict.type.sys_yes_no"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="用户ID" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="利润" prop="grossProfit">
        <el-input
          v-model="queryParams.grossProfit"
          placeholder="请输入利润"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in dict.type.fb_user_plan_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
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
          v-hasPermi="['facebook:userPlan:add']"
        >新增</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['facebook:userPlan:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['facebook:userPlan:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['facebook:userPlan:export']"
        >导出</el-button>
      </el-col>
      <!-- 添加提前结算按钮 -->
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="el-icon-money"
          size="mini"
          :disabled="multiple"
          @click="handleEnterSettle"
          v-hasPermi="['facebook:userPlan:settle1']"
        >提前结算</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userPlanList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" v-if="true"/>
      <el-table-column label="订单号" align="center" prop="orderNo" />
      
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="简称" align="center" prop="fbNickname" />
      <el-table-column label="计划ID" align="center" prop="planId" />
      <el-table-column label="计划名称" align="center" prop="name" />
      <el-table-column label="最低投放金额" align="center" prop="lowInvAmount" />
      <el-table-column label="最高投放金额" align="center" prop="highInvAmount" />
      <el-table-column label="已投放金额" align="center" prop="putAmount" />
      <el-table-column label="优惠券" align="center" prop="isCoupons">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fb_coupon_status" :value="scope.row.isCoupons"/>
        </template>
      </el-table-column>
      <el-table-column label="投放进度" align="center" prop="putProgress" />
      <el-table-column label="已消耗金额" align="center" prop="spentAmount" />
      <el-table-column label="待消耗金额" align="center" prop="waitSpentAmount" />
      <el-table-column label="展示数" align="center" prop="showCount" />
      <el-table-column label="点击数" align="center" prop="clickCount" />
      <el-table-column label="点击单价" align="center" prop="clickPrice" />
      <el-table-column label="利润" align="center" prop="grossProfit" />
      <el-table-column label="官方派单" align="center" prop="isOfficial">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_yes_no" :value="scope.row.isOfficial"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fb_user_plan_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="派发时间" align="center" prop="distriTime" width="180" >
      <template slot-scope="scope">
          <span>{{ parseTime(scope.row.distriTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['facebook:userPlan:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['facebook:userPlan:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改用户计划列表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-alert
    title="提示:客户未付款也可修改状态，请注意核实好再修改！！"
    type="warning"
    :closable="false"
    show-icon
    style="margin-top: 5px;"
  />
        <!-- <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="官方派单" prop="isOfficial">
          <el-radio-group v-model="form.isOfficial">
            <el-radio
              v-for="dict in dict.type.sys_yes_no"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="简称" prop="fbNickname">
          <el-input v-model="form.fbNickname" placeholder="请输入简称" />
        </el-form-item>
        <el-form-item label="计划ID" prop="planId">
          <el-input v-model="form.planId" placeholder="请输入计划ID" />
        </el-form-item>
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入计划名称" />
        </el-form-item> -->
        <!-- <el-form-item label="最低投放金额" prop="lowInvAmount">
          <el-input v-model="form.lowInvAmount" placeholder="请输入最低投放金额" />
        </el-form-item>
        <el-form-item label="最高投放金额" prop="highInvAmount">
          <el-input v-model="form.highInvAmount" placeholder="请输入最高投放金额" />
        </el-form-item>
        <el-form-item label="已投放金额" prop="putAmount">
          <el-input v-model="form.putAmount" placeholder="请输入已投放金额" />
        </el-form-item>
        <el-form-item label="优惠券" prop="isCoupons">
          <el-radio-group v-model="form.isCoupons">
            <el-radio
              v-for="dict in dict.type.fb_coupon_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="投放进度" prop="putProgress">
          <el-input v-model="form.putProgress" placeholder="请输入投放进度" />
        </el-form-item>
        <el-form-item label="已消耗金额" prop="spentAmount">
          <el-input v-model="form.spentAmount" placeholder="请输入已消耗金额" />
        </el-form-item>
        <el-form-item label="待消耗金额" prop="waitSpentAmount">
          <el-input v-model="form.waitSpentAmount" placeholder="请输入待消耗金额" />
        </el-form-item> -->
        <el-form-item label="展示数" prop="showCount">
          <el-input v-model="form.showCount" placeholder="请输入展示数" />
        </el-form-item>
        <el-form-item label="点击数" prop="clickCount">
          <el-input v-model="form.clickCount" placeholder="请输入点击数" />
        </el-form-item>
        <el-form-item label="点击单价" prop="clickPrice">
          <el-input v-model="form.clickPrice" placeholder="请输入点击单价" />
        </el-form-item>
        <el-form-item label="消耗时间(秒)" prop="spendTime">
          <el-input v-model="form.spendTime" placeholder="请输入消耗时间" />
        </el-form-item>
        <!-- <el-form-item label="利润" prop="grossProfit">
          <el-input v-model="form.grossProfit" placeholder="请输入利润" />
        </el-form-item> -->
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.fb_user_plan_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="投放失败原因" prop="reason">
          <el-input v-model="form.reason" type="textarea" placeholder="请输入内容" />
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
import { listUserPlan, getUserPlan, delUserPlan, addUserPlan, updateUserPlan, enterSettleBatch } from "@/api/facebook/userPlan";

export default {
  name: "UserPlan",
  dicts: ['fb_coupon_status', 'sys_yes_no', 'fb_user_plan_status'],
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
      // 用户计划列表表格数据
      userPlanList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: undefined,
        isOfficial: undefined,
        userId: undefined,
        grossProfit: undefined,
        status: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [
          { required: true, message: "主键ID不能为空", trigger: "blur" }
        ],
        userId: [
          { required: true, message: "用户ID不能为空", trigger: "blur" }
        ],
        planId: [
          { required: true, message: "计划ID不能为空", trigger: "blur" }
        ],
        lowInvAmount: [
          { required: true, message: "最低投放金额不能为空", trigger: "blur" }
        ],
        highInvAmount: [
          { required: true, message: "最高投放金额不能为空", trigger: "blur" }
        ],
        grossProfit: [
          { required: true, message: "利润不能为空", trigger: "blur" }
        ],
        spendTime: [
          { required: true, message: "消耗时间不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询用户计划列表列表 */
    getList() {
      this.loading = true;
      listUserPlan(this.queryParams).then(response => {
        this.userPlanList = response.rows;
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
        orderNo: undefined,
        isOfficial: undefined,
        userDesc: undefined,
        userId: undefined,
        fbId: undefined,
        fbNickname: undefined,
        planId: undefined,
        name: undefined,
        lowInvAmount: undefined,
        highInvAmount: undefined,
        putAmount: undefined,
        isCoupons: undefined,
        putProgress: undefined,
        spentAmount: undefined,
        waitSpentAmount: undefined,
        showCount: undefined,
        clickCount: undefined,
        clickPrice: undefined,
        spendTime: undefined,
        adsIncome: undefined,
        grossProfit: undefined,
        status: undefined,
        payTime: undefined,
        distriTime: undefined,
        reason: undefined,
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
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加用户计划列表";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.loading = true;
      this.reset();
      const id = row.id || this.ids
      getUserPlan(id).then(response => {
        this.loading = false;
        this.form = response.data;
        this.open = true;
        this.title = "修改用户计划列表";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.buttonLoading = true;
          if (this.form.id != null) {
            updateUserPlan(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).finally(() => {
              this.buttonLoading = false;
            });
          } else {
            addUserPlan(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除用户计划列表编号为"' + ids + '"的数据项？').then(() => {
        this.loading = true;
        return delUserPlan(ids);
      }).then(() => {
        this.loading = false;
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      }).finally(() => {
        this.loading = false;
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('facebook/userPlan/export', {
        ...this.queryParams
      }, `userPlan_${new Date().getTime()}.xlsx`)
    },
    /** 提前结算按钮操作 */
    handleEnterSettle() {
      if (this.ids.length === 0) {
        this.$modal.msgError("请选择要提前结算的数据");
        return;
      }
      
      this.$modal.confirm('是否确认对选中的 ' + this.ids.length + ' 条数据进行提前结算？').then(() => {
        this.loading = true;
        return enterSettleBatch(this.ids);
      }).then(response => {
        this.loading = false;
        this.getList();
        this.$modal.msgSuccess("提前结算成功");
      }).catch(() => {
      }).finally(() => {
        this.loading = false;
      });
    }
  }
};
</script>