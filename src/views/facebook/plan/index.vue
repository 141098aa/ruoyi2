<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      size="small"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="计划名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入计划名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="计划编号" prop="number">
        <el-input
          v-model="queryParams.number"
          placeholder="请输入计划编号"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
        >
          <el-option
            v-for="dict in dict.type.sys_normal_disable"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['facebook:plan:add']"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['facebook:plan:edit']"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['facebook:plan:remove']"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['facebook:plan:export']"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="planList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" v-if="true" />
      <el-table-column label="计划名称" align="center" prop="name" />
      <el-table-column label="计划编号" align="center" prop="number" />
      <el-table-column label="产品ID" align="center" prop="productId" />
      <el-table-column label="主图" align="center" prop="mainImg" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.mainImg" :width="50" :height="50" />
        </template>
      </el-table-column>
      <!-- <el-table-column label="简介" align="center" prop="summary" /> -->
      <el-table-column label="简介" align="center" prop="summary">
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.summary && scope.row.summary.length > 8"
            :content="scope.row.summary"
            placement="top"
          >
            <span>{{ formatSummary(scope.row.summary) }}</span>
          </el-tooltip>
          <span v-else>{{ scope.row.summary }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="投放内容" align="center" prop="content" />
      <el-table-column label="投放规则" align="center" prop="rule" />
      <el-table-column label="用户定向" align="center" prop="target" /> -->
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag
            :options="dict.type.sys_normal_disable"
            :value="scope.row.status"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.createTime, "{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="更新时间"
        align="center"
        prop="updateTime"
        width="180"
      >
        <template slot-scope="scope">
          <span>{{
            parseTime(scope.row.updateTime, "{y}-{m}-{d} {h}:{i}:{s}")
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['facebook:plan:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['facebook:plan:remove']"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改计划库对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="计划名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入计划名称" />
        </el-form-item>
        <el-form-item label="选择产品" prop="productId">
          <el-select
            v-model="form.productId"
            placeholder="请选择产品"
            filterable
            clearable
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="计划编号" prop="number">
          <el-input v-model="form.number" placeholder="请输入计划编号" />
        </el-form-item>
        <el-form-item label="主图" prop="mainImg">
          <image-upload v-model="form.mainImg" />
        </el-form-item>
        <el-form-item label="简介" prop="summary">
          <el-input v-model="form.summary" placeholder="请输入简介" />
        </el-form-item>
        <el-form-item label="投放内容">
          <div class="info-container">
            <div
              v-for="(item, index) in form.contentObj"
              :key="index"
              class="info-item"
            >
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-form-item
                    label="标题"
                    :prop="'contentObj.' + index + '.title'"
                    label-width="50px"
                  >
                    <el-input v-model="item.title" placeholder="请输入标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    label="内容"
                    :prop="'contentObj.' + index + '.value'"
                    label-width="50px"
                  >
                    <el-input v-model="item.value" placeholder="请输入内容" />
                  </el-form-item>
                </el-col>
                <el-col :span="2" class="text-center">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    size="mini"
                    @click="removeContentItem(index)"
                  ></el-button>
                </el-col>
              </el-row>
            </div>
            <div class="add-button-container">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                @click="addContentItem"
                >添加投放内容</el-button
              >
            </div>
          </div>
        </el-form-item>
        <el-form-item label="投放规则">
          <div class="info-container">
            <div
              v-for="(item, index) in form.ruleObj"
              :key="index"
              class="info-item"
            >
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-form-item
                    label="标题"
                    :prop="'ruleObj.' + index + '.title'"
                    label-width="50px"
                  >
                    <el-input v-model="item.title" placeholder="请输入标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    label="内容"
                    :prop="'ruleObj.' + index + '.value'"
                    label-width="50px"
                  >
                    <el-input v-model="item.value" placeholder="请输入内容" />
                  </el-form-item>
                </el-col>
                <el-col :span="2" class="text-center">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    size="mini"
                    @click="removeRuleItem(index)"
                  ></el-button>
                </el-col>
              </el-row>
            </div>
            <div class="add-button-container">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                @click="addRuleItem"
                >添加投放规则</el-button
              >
            </div>
          </div>
        </el-form-item>
        <el-form-item label="用户定向">
          <div class="info-container">
            <div
              v-for="(item, index) in form.targetObj"
              :key="index"
              class="info-item"
            >
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-form-item
                    label="标题"
                    :prop="'targetObj.' + index + '.title'"
                    label-width="50px"
                  >
                    <el-input v-model="item.title" placeholder="请输入标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    label="内容"
                    :prop="'targetObj.' + index + '.value'"
                    label-width="50px"
                  >
                    <el-input v-model="item.value" placeholder="请输入内容" />
                  </el-form-item>
                </el-col>
                <el-col :span="2" class="text-center">
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    circle
                    size="mini"
                    @click="removeTargetItem(index)"
                  ></el-button>
                </el-col>
              </el-row>
            </div>
            <div class="add-button-container">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                @click="addTargetItem"
                >添加用户定向</el-button
              >
            </div>
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.value"
              >{{ dict.label }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="submitForm"
          >确 定</el-button
        >
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listPlan,
  getPlan,
  delPlan,
  addPlan,
  updatePlan,
} from "@/api/facebook/plan";
import { listProduct } from "@/api/facebook/product";

export default {
  name: "Plan",
  dicts: ["sys_normal_disable"],
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
      // 计划库表格数据
      planList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        number: undefined,
        status: undefined,
      },
      // 表单参数
      form: {
        id: undefined,
        productId: undefined,
        name: undefined,
        number: undefined,
        mainImg: undefined,
        summary: undefined,
        content: undefined,
        rule: undefined,
        target: undefined,
        status: undefined,
        delFlag: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined,
        contentObj: [],
        ruleObj: [],
        targetObj: [],
      },
      // 表单校验
      rules: {
        id: [{ required: true, message: "ID不能为空", trigger: "blur" }],
        name: [
          { required: true, message: "计划名称不能为空", trigger: "blur" },
        ],
        productId: [
          { required: true, message: "请选择产品", trigger: "change" },
        ],
        // mainImg: [
        //   { required: true, message: "主图不能为空", trigger: "blur" }
        // ],
        summary: [{ required: true, message: "简介不能为空", trigger: "blur" }],
        "contentObj.title": [
          { required: true, message: "标题不能为空", trigger: "blur" },
        ],
        "contentObj.value": [
          { required: true, message: "内容不能为空", trigger: "blur" },
        ],
        "ruleObj.title": [
          { required: true, message: "标题不能为空", trigger: "blur" },
        ],
        "ruleObj.value": [
          { required: true, message: "内容不能为空", trigger: "blur" },
        ],
        "targetObj.title": [
          { required: true, message: "标题不能为空", trigger: "blur" },
        ],
        "targetObj.value": [
          { required: true, message: "内容不能为空", trigger: "blur" },
        ],
      },
      // 添加产品选项数据
      productOptions: [],
    };
  },
  created() {
    this.getList();
    this.getProductList();
  },
  methods: {
    /** 查询计划库列表 */
    getList() {
      this.loading = true;
      listPlan(this.queryParams).then((response) => {
        this.planList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 获取产品列表 */
    getProductList() {
      listProduct({ pageNum: 1, pageSize: 999 }).then((response) => {
        this.productOptions = response.rows;
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
        productId: undefined,
        name: undefined,
        number: undefined,
        mainImg: undefined,
        summary: undefined,
        content: undefined,
        rule: undefined,
        target: undefined,
        status: undefined,
        delFlag: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined,
        contentObj: [],
        ruleObj: [],
        targetObj: [],
      };
      this.$nextTick(() => {
        this.resetForm("form");
      });
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
      this.title = "添加计划库";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getPlan(id).then((response) => {
        const formData = {
          ...response.data,
          contentObj: [],
          ruleObj: [],
          targetObj: [],
        };

        try {
          if (response.data.content) {
            formData.contentObj = JSON.parse(response.data.content);
          }
          if (response.data.rule) {
            formData.ruleObj = JSON.parse(response.data.rule);
          }
          if (response.data.target) {
            formData.targetObj = JSON.parse(response.data.target);
          }
        } catch (e) {
          console.error("JSON解析错误:", e);
        }

        this.$nextTick(() => {
          Object.keys(formData).forEach((key) => {
            this.$set(this.form, key, formData[key]);
          });
        });

        this.open = true;
        this.title = "修改计划库";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          // 验证并转换数据
          if (!this.validateInfoData()) {
            return;
          }

          this.buttonLoading = true;
          // 转换为JSON字符串
          this.form.content = JSON.stringify(this.form.contentObj);
          this.form.rule = JSON.stringify(this.form.ruleObj);
          this.form.target = JSON.stringify(this.form.targetObj);

          if (this.form.id != null) {
            updatePlan(this.form)
              .then((response) => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              })
              .finally(() => {
                this.buttonLoading = false;
              });
          } else {
            addPlan(this.form)
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
        .confirm('是否确认删除计划库编号为"' + ids + '"的数据项？')
        .then(() => {
          this.loading = true;
          return delPlan(ids);
        })
        .then(() => {
          this.loading = false;
          this.getList();
          this.$modal.msgSuccess("删除成功");
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download(
        "facebook/plan/export",
        {
          ...this.queryParams,
        },
        `plan_${new Date().getTime()}.xlsx`
      );
    },
    // 投放内容相关方法
    addContentItem() {
      if (!Array.isArray(this.form.contentObj)) {
        this.$set(this.form, "contentObj", []);
      }
      const newItem = { title: "", value: "" };
      this.$set(this.form.contentObj, this.form.contentObj.length, newItem);
    },
    removeContentItem(index) {
      this.form.contentObj.splice(index, 1);
      this.$forceUpdate();
    },
    // 投放规则相关方法
    addRuleItem() {
      if (!Array.isArray(this.form.ruleObj)) {
        this.$set(this.form, "ruleObj", []);
      }
      const newItem = { title: "", value: "" };
      this.$set(this.form.ruleObj, this.form.ruleObj.length, newItem);
    },
    removeRuleItem(index) {
      this.form.ruleObj.splice(index, 1);
      this.$forceUpdate();
    },
    // 用户定向相关方法
    addTargetItem() {
      if (!Array.isArray(this.form.targetObj)) {
        this.$set(this.form, "targetObj", []);
      }
      const newItem = { title: "", value: "" };
      this.$set(this.form.targetObj, this.form.targetObj.length, newItem);
    },
    removeTargetItem(index) {
      this.form.targetObj.splice(index, 1);
      this.$forceUpdate();
    },
    // 添加数据验证方法
    validateInfoData() {
      // 验证投放内容
      if (!this.validateItems(this.form.contentObj, "投放内容")) return false;
      // 验证投放规则
      if (!this.validateItems(this.form.ruleObj, "投放规则")) return false;
      // 验证用户定向
      if (!this.validateItems(this.form.targetObj, "用户定向")) return false;
      return true;
    },
    validateItems(items, name) {
      if (!Array.isArray(items) || items.length === 0) {
        this.$modal.msgError(`请至少添加一条${name}`);
        return false;
      }
      for (const item of items) {
        if (!item.title || !item.value) {
          this.$modal.msgError(`${name}的标题和内容都不能为空`);
          return false;
        }
      }
      return true;
    },

    formatSummary(summary) {
      if (!summary) return '';
      return summary.length > 12 ? summary.substr(0, 12) + '...' : summary;
    },
  },
};
</script>

<style scoped>
.info-container {
  background-color: #f8f9fb;
  padding: 15px;
  border-radius: 4px;
}

.info-item {
  position: relative;
  margin-bottom: 15px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.info-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.info-item:last-child {
  margin-bottom: 15px;
}

.add-button-container {
  text-align: center;
  padding-top: 10px;
}

.text-center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.el-form-item {
  margin-bottom: 18px;
}

.el-form-item:last-child {
  margin-bottom: 0;
}

/* 删除按钮样式优化 */
.el-button.el-button--danger.is-circle {
  padding: 7px;
}

/* 添加按钮样式优化 */
.add-button-container .el-button {
  padding: 10px 20px;
  font-size: 14px;
}

/* 输入框样式优化 */
.el-input__inner {
  border-radius: 4px;
}

/* 标题和内容的label样式 */
.el-form-item__label {
  font-weight: normal;
  color: #606266;
}
</style>
