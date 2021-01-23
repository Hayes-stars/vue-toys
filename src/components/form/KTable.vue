<script>
export default {
  data() {
    return {
      orderField: '',
      orderBy: 'desc'
    }
  },
	props: {
		data: {
			type: Array,
			required: true,
		},
	},
	computed: {
		// 可以从内部KTableColumn定义中获取prop和label
		columns() {
			// 由于不一定有prop属性，内部如果出现了默认作用域插槽，则按照它来执行渲染
			console.log('默认插槽vnode结构：', this.$slots.default)
			return this.$slots.default.map(
				({ data: { attrs, scopedSlots } }) => {
					const column = { ...attrs }
					if (scopedSlots) {
						// 自定义列表模板，没有prop
						column.renderCell = (row, index) => (
							<div>{scopedSlots.default({ row, $index: index })}</div>
						)
					} else {
						// 有prop的情况
						column.renderCell = (row) => <div>{row[column.prop]}</div>
					}
					return column
				}
				// ({
				// 	prop: data.attrs.prop,
				// 	label: data.attrs.label,
				// })
			)
		},
		// rows() {
		// 	return this.data.map((item) => {
		// 		const ret = {}
		// 		this.columns.forEach(({ prop }) => {
		// 			ret[prop] = item[prop]
		// 		})
		// 		return ret
		// 	})
		// },
  },
  created () {
    this.columns.forEach(column => {
      // 如果存在sortable列，则头一个作为默认排序字段
      if (column.hasOwnProperty('sortable')) {
        if (column.prop && !this.orderField) {
          this.sort(column.prop, this.orderBy)
          // this.orderField = column.prop
        }
      }
    })
  },
	render() {
		return (
			<table>
				<thead>
					<tr>
						{this.columns.map((column) => {
              if (column.hasOwnProperty('sortable') && column.prop) {
                let orderArrow = '↓↑'
                if (this.orderField === column.prop) {
                  orderArrow = this.orderBy === 'desc' ? '↓' : '↑'
                }
                return <th key={column.label} onClick={() => this.toggleSort(column.prop)}>{column.label} <span>{orderArrow}</span></th>
              } else {
                return (
                  <th key={column.label}>{column.label}</th>
                )
              }
            })}
					</tr>
				</thead>
				<tbody>
					{this.data.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{this.columns.map((column, columnIndex) => (
								<td key={columnIndex}>{column.renderCell(row, rowIndex)}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		)
	},
	methods: {
    // 排序
    sort(field, by) {
      // this.orderField = column.prop
      this.orderBy = by
      this.orderField = field
      this.data.sort((obja, objb) => {
        const v1 = obja[this.orderField]
        const v2 = objb[this.orderField]
        if (typeof v1 === 'number') {
          return this.orderBy === 'desc' ? (v2-v1) : (v1 -v2)
        } else {
          return this.orderBy === 'desc' ? (v2.localeCompare(v1)) : (v1.localeCompare(v2))
        }
      })
    },
    // 排序事件
    toggleSort(field) {
      const by = this.orderBy === 'desc' ? 'asc' : 'desc'
      this.sort(field, by)
    }
  },
}
</script>

<style lang="scss" scoped></style>
