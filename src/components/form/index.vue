<template>
  <div>
    <!-- <ElementTest></ElementTest> -->

    <!-- KForm -->
    <KForm :model="model" :rules="rules" ref="loginForm">
      <KFormItem label="用户名" prop="username">
        <KInput v-model="model.username" placeholder="用户名"></KInput>
        <!-- 等效于 -->
        <!-- <KInput :value="model.username" @input="model.username=$event"></KInput> -->
      </KFormItem>
      <KFormItem><button @click="onLogin">登录</button></KFormItem>
    </KForm>

    <!-- KTable -->
    <k-table :data="tableData">
      <k-table-column prop="date" label="日期"> </k-table-column>
      <k-table-column prop="name" label="姓名"> </k-table-column>
      <k-table-column prop="address" label="地址"> </k-table-column>
    </k-table>
    <!-- 自定义列模板 -->
    <k-table :data="tableData">
      <k-table-column prop="date" label="日期"> </k-table-column>
      <k-table-column prop="name" label="姓名"> </k-table-column>
      <k-table-column prop="address" label="地址"> </k-table-column>
      <k-table-column label="操作">
        <template v-slot:default="scope">
          <button @click="handleEdit(scope.$index, scope.row)">编辑</button>
          <button @click="handleDelete(scope.$index, scope.row)">删除</button>
        </template>
      </k-table-column>
    </k-table>

    <!-- 排序功能 -->    
    <k-table :data="tableData">
      <k-table-column sortable prop="date" label="日期"> </k-table-column>
      <k-table-column sortable prop="name" label="姓名"> </k-table-column>
      <k-table-column prop="address" label="地址"> </k-table-column>
      <k-table-column label="操作">
        <template v-slot:default="scope">
          <button @click="handleEdit(scope.$index, scope.row)">编辑</button>
          <button @click="handleDelete(scope.$index, scope.row)">删除</button>
        </template>
      </k-table-column>
    </k-table>
  </div>
</template>

<script>
import ElementTest from "@/components/form/ElementTest.vue";
import KInput from "@/components/form/KInput.vue";
import KFormItem from "@/components/form/KFormItem.vue";
import KForm from "@/components/form/KForm.vue";
import KTable from "@/components/form/KTable.vue";
import KTableColumn from "@/components/form/KTableColumn.vue";


// 没有实现插件，需要导入弹窗和create

export default {
  components: {
    ElementTest,
    KInput,
    KFormItem,
    KForm,
    KTable,
    KTableColumn
  },
  data() {
    return {
      model: {
        username: "tom",
      },
      rules: {
        username: [{ required: true, message: "用户名为必填项" }],
      },
      tableData: [{
        date: '2020-12-31',
        name: '王小虎',
        address: '湖南长沙岳麓区金星路 1888号'
      },{
        date: '2020-12-30',
        name: '王小二',
        address: '湖南长沙岳麓区金星路 1888号'
      },{
        date: '2020-12-29',
        name: '王小虎',
        address: '湖南长沙岳麓区金星路 1888号'
      },{
        date: '2020-12-28',
        name: '王小虎',
        address: '湖南长沙岳麓区金星路 1888号'
      }]
    };
  },
  methods: {
    onLogin() {
      // 全局校验
      this.$refs.loginForm.validate((isValid) => {
        this.$notice({
          title: "abc",
          message: isValid ? "过" : "不过",
        });
        // if (isValid) {
        //   console.log("submit login");
        // } else {
        //   alert("校验失败");
        // }
      });
    },
  },
};
</script>

<style scoped></style>
