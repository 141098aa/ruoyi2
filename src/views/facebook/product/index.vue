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
      <el-form-item label="产品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入产品名称"
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
          v-hasPermi="['facebook:product:add']"
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
          v-hasPermi="['facebook:product:edit']"
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
          v-hasPermi="['facebook:product:remove']"
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
          v-hasPermi="['facebook:product:export']"
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
      :data="productList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" v-if="true" />
      <el-table-column label="产品名称" align="center" prop="name" />
      <el-table-column label="logo" align="center" prop="logo" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.logo" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="产品图片" align="center" prop="image" width="100">
        <template slot-scope="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="产品简介" align="center" prop="description">
        <template slot-scope="scope">
          <el-tooltip
            v-if="scope.row.description && scope.row.description.length > 8"
            :content="scope.row.description"
            placement="top"
          >
            <span>{{ formatDescription(scope.row.description) }}</span>
          </el-tooltip>
          <span v-else>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
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
            v-hasPermi="['facebook:product:edit']"
            >修改</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['facebook:product:remove']"
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

    <!-- 添加或修改产品库对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="logo" prop="logo">
          <image-upload v-model="form.logo" />
        </el-form-item>
        <el-form-item label="Google_Play" prop="googlePlay">
          <el-input
            v-model="form.googlePlay"
            placeholder="请输入Google Play下载链接"
          />
        </el-form-item>
        <el-form-item label="App_Store" prop="appStore">
          <el-input
            v-model="form.appStore"
            placeholder="请输入App Store下载链接"
          />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <image-upload v-model="form.image" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="产品信息">
          <div class="product-info-container">
            <div
              v-for="(item, index) in form.productInfoObj"
              :key="index"
              class="product-info-item"
            >
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-form-item
                    label="标题"
                    :prop="'productInfoObj.' + index + '.title'"
                    label-width="50px"
                  >
                    <el-input v-model="item.title" placeholder="请输入标题" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    label="内容"
                    :prop="'productInfoObj.' + index + '.value'"
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
                    @click="removeProductInfoItem(index)"
                  ></el-button>
                </el-col>
              </el-row>
            </div>
            <div class="add-button-container">
              <el-button
                type="primary"
                plain
                icon="el-icon-plus"
                @click="addProductInfoItem"
                >添加产品信息</el-button
              >
            </div>
          </div>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
              v-for="dict in dict.type.sys_normal_disable"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="公司" prop="company">
          <el-input v-model="form.company" placeholder="请输入关联公司名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-input v-model="form.type" placeholder="请输入产品类型" />
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
  listProduct,
  getProduct,
  delProduct,
  addProduct,
  updateProduct,
} from "@/api/facebook/product";

export default {
  name: "Product",
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
      // 产品库表格数据
      productList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        status: undefined,
      },
      // 表单参数
      form: {
        id: undefined,
        name: undefined,
        logo: undefined,
        googlePlay: undefined,
        appStore: undefined,
        image: undefined,
        description: undefined,
        productInfo: undefined,
        status: undefined,
        delFlag: undefined,
        type: undefined,
        company: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined,
        productInfoObj: [],
      },
      // 表单校验
      rules: {
        id: [
          { required: true, message: "产品唯一标识不能为空", trigger: "blur" },
        ],
        name: [
          { required: true, message: "产品名称不能为空", trigger: "blur" },
        ],
        googlePlay: [
          {
            required: true,
            message: "Google Play下载链接不能为空",
            trigger: "blur",
          },
        ],
        appStore: [
          {
            required: true,
            message: "App Store下载链接不能为空",
            trigger: "blur",
          },
        ],
        description: [
          { required: true, message: "产品简介不能为空", trigger: "blur" },
        ],
        type: [
          { required: true, message: "产品类型不能为空", trigger: "change" },
        ],
        company: [
          { required: true, message: "关联公司名称不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    getJsonData(jsonStr) {
      try {
        const data =
          typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
        return Array.isArray(data) ? data : [];
      } catch (e) {
        return [];
      }
    },
    /** 查询产品库列表 */
    getList() {
      this.loading = true;
      listProduct(this.queryParams).then((response) => {
        this.productList = response.rows;
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
        name: undefined,
        logo: undefined,
        googlePlay: undefined,
        appStore: undefined,
        image: undefined,
        description: undefined,
        productInfo: undefined,
        status: undefined,
        delFlag: undefined,
        type: undefined,
        company: undefined,
        createBy: undefined,
        createTime: undefined,
        updateBy: undefined,
        updateTime: undefined,
        remark: undefined,
        productInfoObj: [],
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
      this.$nextTick(() => {
        this.$set(this.form, "productInfoObj", []);
      });
      this.open = true;
      this.title = "添加产品库";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getProduct(id).then((response) => {
        // 先创建一个新的对象，包含所有必要的字段
        const formData = {
          ...response.data,
          productInfoObj: [], // 初始化为空数组
        };

        // 解析 productInfo
        try {
          if (response.data.productInfo) {
            const parsedInfo = JSON.parse(response.data.productInfo);
            formData.productInfoObj = Array.isArray(parsedInfo)
              ? parsedInfo
              : [];
          }
        } catch (e) {
          console.error("JSON解析错误:", e);
        }

        // 使用 $set 更新整个表单对象
        this.$nextTick(() => {
          Object.keys(formData).forEach((key) => {
            this.$set(this.form, key, formData[key]);
          });
        });

        this.open = true;
        this.title = "修改产品库";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          // 验证产品信息
          if (
            !Array.isArray(this.form.productInfoObj) ||
            this.form.productInfoObj.length === 0
          ) {
            this.$modal.msgError("请至少添加一条产品信息");
            return;
          }

          // 验证每条产品信息
          for (const item of this.form.productInfoObj) {
            if (!item.title || !item.value) {
              this.$modal.msgError("产品信息的标题和内容都不能为空");
              return;
            }
          }

          this.buttonLoading = true;
          // 转换为JSON字符串
          this.form.productInfo = JSON.stringify(this.form.productInfoObj);

          if (this.form.id != null) {
            updateProduct(this.form)
              .then((response) => {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              })
              .finally(() => {
                this.buttonLoading = false;
              });
          } else {
            addProduct(this.form)
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
        .confirm('是否确认删除产品库编号为"' + ids + '"的数据项？')
        .then(() => {
          this.loading = true;
          return delProduct(ids);
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
        "facebook/product/export",
        {
          ...this.queryParams,
        },
        `product_${new Date().getTime()}.xlsx`
      );
    },
    // 添加产品信息项
    addProductInfoItem() {
      if (!Array.isArray(this.form.productInfoObj)) {
        this.$set(this.form, "productInfoObj", []);
      }

      const newItem = {
        title: "",
        value: "",
      };

      // 使用 $set 添加新项
      this.$set(
        this.form.productInfoObj,
        this.form.productInfoObj.length,
        newItem
      );
    },
    // 删除产品信息项
    removeProductInfoItem(index) {
      // 使用数组方法删除项
      this.form.productInfoObj.splice(index, 1);
      // 强制更新视图
      this.$forceUpdate();
    },

    
    formatDescription(description) {
      if (!description) return '';
      return description.length > 8 ? description.substr(0, 12) + '...' : description;
    }
  },

  
  
};
</script>

<style scoped>
.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.product-info-form {
  padding: 10px 20px;
  background: #f9f9f9;
  border-radius: 4px;
}

.form-item-wrapper {
  margin-bottom: 18px;
}

.form-item-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.form-item-content {
  width: 100%;
}

.form-item-content .el-input {
  width: 100%;
}

/* 最后一个表单项不需要底部间距 */
.form-item-wrapper:last-child {
  margin-bottom: 0;
}

.product-info-item {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
}

.el-button + .el-button {
  margin-left: 10px;
}

.text-center {
  text-align: center;
  line-height: 32px;
}

.product-info-container {
  background-color: #f8f9fb;
  padding: 15px;
  border-radius: 4px;
}

.product-info-item {
  position: relative;
  margin-bottom: 15px;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.product-info-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-info-item:last-child {
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
