<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="couponName">
        <el-input v-model="queryParams.couponName" placeholder="请输入优惠券名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="标签" prop="tag">
        <el-input v-model="queryParams.tag" placeholder="请输入标签" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否通用" prop="isDefault">
        <el-select v-model="queryParams.isDefault" placeholder="是否为通用优惠券" clearable>
          <el-option v-for="dict in dict.type.fb_is_default" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['facebook:coupon:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['facebook:coupon:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['facebook:coupon:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['facebook:coupon:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="couponList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" v-if="true" />
      <el-table-column label="优惠券名称" align="center" prop="couponName" />
      <el-table-column label="优惠券名称英语" align="center" prop="couponNameEn" />
      <el-table-column label="优惠券描述" align="center" prop="couponDesc" />
      <el-table-column label="优惠券描述英语" align="center" prop="couponDescEn" />
      <el-table-column label="过期时间" align="center" prop="expireTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.expireTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" align="center" prop="tag" />
      <el-table-column label="标签英语" align="center" prop="tagEn" />
      <el-table-column label="门槛" align="center" prop="couponLimit" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="是否通用优惠券" align="center" prop="isDefault">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fb_is_default" :value="scope.row.isDefault" />
        </template>
      </el-table-column>
      <el-table-column label="通用优惠券过期时长" align="center" prop="expireTimeDefault" />
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
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['facebook:coupon:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['facebook:coupon:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改优惠券库对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="优惠券名称" prop="couponName">
          <el-input v-model="form.couponName" placeholder="请输入优惠券名称,列如：折扣券" />
        </el-form-item>
        <el-form-item label="优惠券名称英语" prop="couponNameEn">
          <el-input v-model="form.couponNameEn" placeholder="请输入优惠券名称英语" />
        </el-form-item>
        <el-form-item label="优惠券描述" prop="couponDesc">
          <el-input v-model="form.couponDesc" placeholder="请输入优惠券描述，列如：展示量投放" />
        </el-form-item>
        <el-form-item label="优惠券描述英语" prop="couponDescEn">
          <el-input v-model="form.couponDescEn" placeholder="请输入优惠券描述英语" />
        </el-form-item>
        <el-form-item label="过期时间" prop="expireTime">
          <el-date-picker clearable v-model="form.expireTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="请选择过期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="标签" prop="tag">
          <el-input v-model="form.tag" placeholder="请输入标签，列如新用户扶持，50%折扣券则输入50" />
        </el-form-item>
        <el-form-item label="标签英语" prop="tagEn">
          <el-input v-model="form.tagEn" placeholder="请输入标签英语" />
        </el-form-item>
        <el-form-item label="门槛" prop="couponLimit">
          <el-input v-model="form.couponLimit" placeholder="请输入门槛，默认为：无门槛" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in dict.type.sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否设为通用优惠券" prop="isDefault">
          <el-radio-group v-model="form.isDefault">
            <el-radio v-for="dict in dict.type.fb_is_default" :key="dict.value" :label="dict.value">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="通用优惠券过期时长" prop="expireTimeDefault">
          <el-input v-model="form.expireTimeDefault" placeholder="请输入通用优惠券过期时长" />
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
  </div>
</template>

<script>
import { listCoupon, getCoupon, delCoupon, addCoupon, updateCoupon } from "@/api/facebook/coupon";

export default {
  name: "Coupon",
  dicts: ['fb_is_default', 'sys_normal_disable'],
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
      // 优惠券库表格数据
      couponList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        couponName: undefined,
        tag: undefined,
        status: undefined,
        isDefault: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [
          { required: true, message: "ID不能为空", trigger: "blur" }
        ],
        couponName: [
          { required: true, message: "优惠券名称不能为空", trigger: "blur" }
        ],
        couponDesc: [
          { required: true, message: "优惠券描述不能为空", trigger: "blur" }
        ],
        tag: [
          { required: true, message: "标签不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询优惠券库列表 */
    getList() {
      this.loading = true;
      listCoupon(this.queryParams).then(response => {
        this.couponList = response.rows;
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
        couponName: undefined,
        couponDesc: undefined,
        couponDescEn: undefined,
        expireTime: undefined,
        tag: undefined,
        tagEn: undefined,
        couponLimit: undefined,
        couponNameEn: undefined,
        status: undefined,
        isDefault: undefined,
        expireTimeDefault: undefined,
        delFlag: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined
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
      this.title = "添加优惠券库";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.loading = true;
      this.reset();
      const id = row.id || this.ids
      getCoupon(id).then(response => {
        this.loading = false;
        this.form = response.data;
        this.open = true;
        this.title = "修改优惠券库";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.buttonLoading = true;

          // 处理门槛字段，如果没填写则默认为"无门槛"
          if (!this.form.couponLimit || this.form.couponLimit.trim() === '') {
            this.form.couponLimit = "无门槛";
          }

          if (this.form.id != null) {
            updateCoupon(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).finally(() => {
              this.buttonLoading = false;
            });
          } else {
            addCoupon(this.form).then(response => {
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
      this.$modal.confirm('是否确认删除优惠券库编号为"' + ids + '"的数据项？').then(() => {
        this.loading = true;
        return delCoupon(ids);
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
      this.download('facebook/coupon/export', {
        ...this.queryParams
      }, `coupon_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
