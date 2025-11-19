<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户id" prop="userId">
        <el-input v-model="queryParams.userId" placeholder="请输入用户id" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="真实名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入真实名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="身份编号" prop="number">
        <el-input v-model="queryParams.number" placeholder="请输入身份编号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="图1" prop="idImg1">
        <el-input v-model="queryParams.idImg1" placeholder="请输入图1" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="图2" prop="idImg2">
        <el-input v-model="queryParams.idImg2" placeholder="请输入图2" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="国籍" prop="nationality">
        <el-input v-model="queryParams.nationality" placeholder="请输入国籍" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="驳回原因" prop="message">
        <el-input v-model="queryParams.message" placeholder="请输入驳回原因" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd"
          v-hasPermi="['facebook:kyc:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate"
          v-hasPermi="['facebook:kyc:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['facebook:kyc:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-download" size="mini" @click="handleExport"
          v-hasPermi="['facebook:kyc:export']">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="kycList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" v-if="true" />
      <el-table-column label="用户id" align="center" prop="userId" />
      <el-table-column label="真实名称" align="center" prop="name" />
      <el-table-column label="身份编号" align="center" prop="number" />
      <!-- <el-table-column label="图1" align="center" prop="idImg1" />
      <el-table-column label="图2" align="center" prop="idImg2" /> -->
      <el-table-column label="图1" align="center" prop="idImg1" width="100">
        <template slot-scope="scope">
          <image-preview v-if="scope.row.idImg1" :src="scope.row.idImg1" :width="50" :height="50" />
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="图2" align="center" prop="idImg2" width="100">
        <template slot-scope="scope">
          <image-preview v-if="scope.row.idImg2" :src="scope.row.idImg2" :width="50" :height="50" />
          <span v-else>无图片</span>
        </template>
      </el-table-column>
      <el-table-column label="国籍" align="center" prop="nationality" />
      <el-table-column label="性别" align="center" prop="sex" />
      <el-table-column label="驳回原因" align="center" prop="message" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.fb_kyc_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['facebook:kyc:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)"
            v-hasPermi="['facebook:kyc:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改实名对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户id" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户id" />
        </el-form-item>
        <el-form-item label="真实名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入真实名称" />
        </el-form-item>
        <el-form-item label="身份编号" prop="number">
          <el-input v-model="form.number" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <!-- <el-form-item label="图1" prop="idImg1">
          <el-input v-model="form.idImg1" placeholder="请输入图1" />
        </el-form-item>
        <el-form-item label="图2" prop="idImg2">
          <el-input v-model="form.idImg2" placeholder="请输入图2" />
        </el-form-item> -->

        <el-form-item label="身份证正面" prop="idImg1">
          <!-- 新增时显示上传组件 -->
          <image-upload v-model="form.idImg1" v-if="!form.id" />

          <div v-if="form.id" style="display: flex; align-items: flex-start; gap: 16px;">
            <div v-if="form.idImg1" style="flex-shrink: 0;">
              <image-preview :src="form.idImg1" :width="200" :height="120" />
            </div>
            <div v-else
              style="color: #c0c4cc; text-align: center; padding: 40px 20px; border: 1px dashed #dcdfe6; border-radius: 4px;">
              <i class="el-icon-picture-outline" style="font-size: 24px; display: block; margin-bottom: 8px;"></i>
              暂无图片
            </div>
            <!-- <div style="flex-shrink: 0;">
              <el-button type="primary" @click="handleReupload('idImg1')">重新上传</el-button>
            </div> -->
          </div>
        </el-form-item>

        <!-- 身份证反面 -->
        <el-form-item label="身份证反面" prop="idImg2">
          <!-- 新增时显示上传组件 -->
          <image-upload v-model="form.idImg2" v-if="!form.id" />

          <!-- 修改时显示图片-->
          <div v-if="form.id" style="display: flex; align-items: flex-start; gap: 16px;">
            <div v-if="form.idImg2" style="flex-shrink: 0;">
              <image-preview :src="form.idImg2" :width="200" :height="120" />
            </div>
            <div v-else
              style="color: #c0c4cc; text-align: center; padding: 40px 20px; border: 1px dashed #dcdfe6; border-radius: 4px;">
              <i class="el-icon-picture-outline" style="font-size: 24px; display: block; margin-bottom: 8px;"></i>
              暂无图片
            </div>
          </div>
        </el-form-item>

        <el-form-item label="国籍" prop="nationality">
          <el-input v-model="form.nationality" placeholder="请输入国籍" />
        </el-form-item>
        <el-form-item label="驳回原因" prop="message">
          <el-input v-model="form.message" placeholder="请输入驳回原因" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="0">提交待审核</el-radio>
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="-1">拒绝</el-radio>
          </el-radio-group>
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
import { listKyc, getKyc, delKyc, addKyc, updateKyc } from "@/api/facebook/kyc";

export default {
  name: "Kyc",
  dicts: ['fb_kyc_status'],
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
      // 实名表格数据
      kycList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: undefined,
        name: undefined,
        number: undefined,
        idImg1: undefined,
        idImg2: undefined,
        nationality: undefined,
        sex: undefined,
        message: undefined,
        status: undefined,
      },
      // statusOptions: [
      //   { label: '提交待审核', value: 0, raw: { listClass: 'default', cssClass: '' } },
      //   { label: '通过', value: 1, raw: { listClass: 'success', cssClass: '' } },
      //   { label: '拒绝', value: -1, raw: { listClass: 'danger', cssClass: '' } }
      // ],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [
          { required: true, message: "id不能为空", trigger: "blur" }
        ],
        userId: [
          { required: true, message: "用户id不能为空", trigger: "blur" }
        ],
        name: [
          { required: true, message: "真实名称不能为空", trigger: "blur" }
        ],
        number: [
          { required: true, message: "身份编号不能为空", trigger: "blur" }
        ],
        idImg1: [
          { required: true, message: "图1不能为空", trigger: "blur" }
        ],
        idImg2: [
          { required: true, message: "图2不能为空", trigger: "blur" }
        ],
        nationality: [
          { required: true, message: "国籍不能为空", trigger: "blur" }
        ],
        sex: [
          { required: true, message: "性别不能为空", trigger: "change" }
        ],
        // message: [
        //   { required: true, message: "驳回原因不能为空", trigger: "blur" }
        // ],
        message: [
          {
            validator: (rule, value, callback) => {
              // 如果状态是拒绝(-1)，则驳回原因必填
              if (this.form.status === -1 && (!value || value.trim() === '')) {
                callback(new Error('驳回原因不能为空'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ],
        status: [
          { required: true, message: "状态不能为空", trigger: "change" }
        ],
        // remark: [
        //   { required: true, message: "备注不能为空", trigger: "blur" }
        // ]
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 重新上传图片 */
    handleReupload(field) {
      this.$prompt('请输入新的图片URL', '重新上传', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '图片URL不能为空'
      }).then(({ value }) => {
        this.form[field] = value;
        this.$modal.msgSuccess("图片更新成功");
      }).catch(() => { });
    },
    /** 查询实名列表 */
    getList() {
      this.loading = true;
      listKyc(this.queryParams).then(response => {
        this.kycList = response.rows;
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
        name: undefined,
        number: undefined,
        idImg1: undefined,
        idImg2: undefined,
        nationality: undefined,
        sex: undefined,
        message: undefined,
        status: 0, // 默认设置为提交待审核
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
      this.title = "添加实名";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.loading = true;
      this.reset();
      const id = row.id || this.ids
      getKyc(id).then(response => {
        this.loading = false;
        this.form = response.data;
        // 确保状态值是数字类型
        if (this.form.status !== undefined && this.form.status !== null) {
          this.form.status = Number(this.form.status);
        } else {
          this.form.status = 0; // 如果没有状态值，默认设为提交待审核
        }
        this.open = true;
        this.title = "修改实名";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.buttonLoading = true;
          // 确保 status 是数字类型
          const submitData = { ...this.form };
          submitData.status = Number(this.form.status);
          if (this.form.id != null) {
            updateKyc(submitData).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            }).finally(() => {
              this.buttonLoading = false;
            });
          } else {
            addKyc(submitData).then(response => {
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
      this.$modal.confirm('是否确认删除实名编号为"' + ids + '"的数据项？').then(() => {
        this.loading = true;
        return delKyc(ids);
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
      this.download('facebook/kyc/export', {
        ...this.queryParams
      }, `kyc_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
