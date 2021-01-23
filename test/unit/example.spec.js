import {mount} from '@vue/test-utils'
import KTable from '@/components/form/KTable.vue'
import KTableColumn from '@/components/form/KTableColumn.vue'

describe('KTable.vue', () => {
  test('基本表格', () => {
    const template = `<k-table :data="tableData">
    <k-table-column prop="date" label="日期"> </k-table-column>
    <k-table-column prop="name" label="姓名"> </k-table-column>
    <k-table-column prop="address" label="地址"> </k-table-column>
  </k-table>`
    const comp = {
      template,
      components: {
        KTable,
        KTableColumn,
      },
      data() {
        return {
          tableData: [
            {
              date: '2020-12-31',
              name: '王小虎',
              address: '湖南长沙岳麓区金星路 1888号',
            },
            {
              date: '2020-12-30',
              name: '王小二',
              address: '湖南长沙岳麓区金星路 1888号',
            },
            {
              date: '2020-12-29',
              name: '王小虎',
              address: '湖南长沙岳麓区金星路 1888号',
            },
            {
              date: '2020-12-28',
              name: '王小虎',
              address: '湖南长沙岳麓区金星路 1888号',
            },
          ],
        }
      },
    }
    const wrapper = mount(comp)
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('th').length).toBe(3)
    expect(wrapper.findAll('tbody>tr').length).toBe(4)
    expect(wrapper.find('tbody>tr').text()).toMatch("湖南长沙岳麓区金星路 1888号")
  })
})
