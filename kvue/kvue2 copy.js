function defineReactive(obj, key, val) {
  // 递归
  observe(val)

  // Dep在这创建
  const dep = new Dep()

  Object.defineProperty(obj, key, {
    get() {
      console.log('get', key)
      // 依赖收集
      Dep.target && dep.addDep(Dep.target)
      return val
    },
    set(v) {
      if (val !== v) {
        console.log('set', key)
        // 传入新值v可能还是对象
        observe(v)
        val = v
        console.log('set', key, v)
        dep.notify()
      }
    },
  })
}

// 递归遍历obj，动态拦截obj的所有key
function observe(obj) {
  if (typeof obj !== 'object' || obj == null) {
    return obj
  }

  // 每出现一个对象，创建一个Ob实例
  new Observer(obj)
}

// Observer: 判断传入obj类型，做对应的响应式处理
class Observer {
  constructor(obj) {
    this.value = obj

    // 判断对象类型
    if (Array.isArray(obj)) {
      // todo
    } else {
      this.walk(obj)
    }
  }

  // 对象响应式
  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }
}

// proxy代理函数：让⽤户可以直接访问data中的key
function proxy(vm) {
  Object.keys(vm.$data).forEach(key => {
    Object.defineProperty(vm, key, {
      get() {
        return vm.$data[key]
      },
      set(v) {
        vm.$data[key] = v
      },
    })
  })
}

class KVue {
  constructor(options) {
    // 保存选项
    this.$options = options
    this.$data = options.data

    // 2.响应式处理
    observe(this.$data)

    // 3.代理data到KVue实例上
    proxy(this)

    // 4.编译
    // new Compile(options.el, this)

    // 20210114-vue2 作业
    // 第一步 实现$mount()
    if (options.el) {
      this.$mount(options.el)
    }
  }

  // 转换vnode为dom
  $mount(el) {
    // 第一，获取宿主
    this.$el = document.querySelector(el)

    // 第二，updateComponent   此方法执行渲染函数并且执行update  watcher调用它
    // 全量更新
    const updateComponent = () => {
      const {render} = this.$options
      // this指当前上下文
      // const el = render.call(this)
      // const parent = this.$el.parentElement
      // parent.insertBefore(el, this.$el.nextSibling)
      // // 清除老的
      // parent.removeChild(this.$el)
      // // 重新覆盖
      // this.$el = el

      // vnode $createElement 对应的就是render(h) 的h函数
      const vnode = render.call(this, this.$createElement)
      // 把vnode转换成真是节点  最后在追加到$el
      this._update(vnode)
    }

    // 第三，Watcher实例创建   一个vue实例  一个Watcher
    // 任何数据发生变化都执行
    new Watcher(this, updateComponent)
  }

  // $createElement 返回vnode
  // h函数最小版本
  $createElement(tag, props, children) {
    return {tag, props, children}
  }

  // 转换真是dom
  _update(vnode) {
    // init
    // update
    const preVnode = this._vnode
    if (!preVnode) {
      // init
      this.__patch__(this.$el, vnode)
    } else {
      // update
      this.__patch__(preVnode, vnode)
    }
  }

  // 节点逻辑处理
  __patch__(oldVnode, newVnode) {
    // init
    if (oldVnode.nodeType) {
      // 初始化
      // 是否是真是节点

      const parent = oldVnode.parentElement
      const refElm = oldVnode.nextSibling

      // 递归创建dom tree  解决嵌套情况
      const el = this.createElm(newVnode)

      // 当前元素放在这个参考原生的后面
      parent.insertBefore(el, refElm)
      // 删除老节点
      parent.removeChild(oldVnode)

      // 保存newVnode
      this._vnode = newVnode
    } else {
      // 更新逻辑
      // 虚拟dom-拿出真实节点
      const el = (newVnode.el = oldVnode.el)

      //更新 props
      // ...

      // diff 逻辑  children
      // 此场景：默认收尾是相同节点
      const oldChild = oldVnode.children
      const newChild = newVnode.children
      if (typeof newChild === 'string') {
        if (typeof oldChild === 'string') {
          // 文本更新
          if (newChild !== oldChild) {
            el.textContent === newChild
          }
        } else {
          // 老的可能有孩子，则替换老的孩子
          el.textContent = newChild
        }
      } else {
        // children  递归
        if (typeof oldChild === 'string') {
          // 老节点字符串   清空，批量创建
          el.innerHTML = ''
          newChild.forEach(item => {
            // 创建子元素
            const child = this.createElm(item)
            el.appendChild(child)
          })
        } else {
          // 更新子元素
          this.updateChildren(el, oldChild, newChild)
        }
      }
    }
  }

  // 更新子元素 重排操作
  updateChildren(parentElm, oldChild, newChild) {
    // 对应位置直接更新：老的数组length长，批量删除；新的数组length长，批量创建
    const len = Math.min(oldChild.length, newChild.length)
    for (let index = 0; index < len; index++) {
      this.__patch__(oldChild[index], newChild[index])
    }
    // 如果newChild length长  批量追加
    if (newChild.length > oldChild.length) {
      newChild.slice(len).forEach(item => {
        // 创建元素并且追加
        const child = this.createElm(item)
        parentElm.appendChild(child)
      })
    } else if (newChild.length < oldChild.length) {
      // 批量删除
      oldChild.slice(len).forEach(item => {
        // 清除老的
        // 清除item关联的真实节点
        parentElm.removeChild(item.el)
      })
    }
  }

  // 创建虚拟标签
  createElm(vnode) {
    const el = document.createElement(vnode.tag)
    // props
    // ...

    // 当前 vnode 是否存在 children
    if (vnode.children) {
      if (typeof vnode.children === 'string') {
        el.textContent = vnode.children
      } else {
        // 多层嵌套  存在多个子原生
        vnode.children.forEach(item => {
          // 递归
          const child = this.createElm(item)
          el.appendChild(child)
        })
      }
    }

    // 真是节点保存在虚拟节点，更新时使用
    vnode.el = el
    return el
  }
}

// class Compile {
//   // el-宿主，vm-KVue实例
//   constructor(el, vm) {
//     this.$vm = vm
//     this.$el = document.querySelector(el)

//     this.compile(this.$el)
//   }

//   compile(el) {
//     // 遍历el dom树
//     el.childNodes.forEach(node => {
//       if (this.isElement(node)) {
//         // element
//         // 需要处理属性和子节点
//         // console.log("编译元素", node.nodeName);
//         this.compileElement(node)

//         // 递归子节点
//         if (node.childNodes && node.childNodes.length > 0) {
//           this.compile(node)
//         }
//       } else if (this.isInter(node)) {
//         // console.log("编译插值表达式", node.textContent);
//         // 获取表达式的值并赋值给node
//         this.compileText(node)
//       }
//     })
//   }

//   // 校验节点
//   isElement(node) {
//     return node.nodeType === 1
//   }

//   // 校验data渲染值 {{xxx}}
//   isInter(node) {
//     return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
//   }

//   // 校验属性
//   isDir(attr) {
//     return attr.startsWith('k-')
//   }

//   // 校验事件
//   isEventDirective(dir) {
//     console.log('isEventDirective===on:click====', dir)
//     return dir.indexOf('on') === 0
//   }

//   // v-model 获取old-value
//   getVMVal(vm, exp) {
//     console.log('getVMVal===', vm, exp)
//     var val = vm
//     exp = exp.split('.')
//     exp.forEach(k => {
//       val = val[k]
//     })
//     return val
//   }

//   // v-model 设置new-value
//   setVMVal(vm, exp, value) {
//     console.log('setVMVal===', vm, exp, value)
//     var val = vm
//     exp = exp.split('.')
//     exp.forEach(function(k, i) {
//       // 非最后一个key，更新val的值
//       if (i < exp.length - 1) {
//         val = val[k]
//       } else {
//         val[k] = value
//       }
//     })
//   }

//   // 事件处理
//   eventHandler(node, vm, exp, dir) {
//     console.log('eventHandler===', node, vm, exp, dir)
//     var eventType = dir.split(':')[1],
//       fn = vm.$options.methods && vm.$options.methods[exp]

//     if (eventType && fn) {
//       node.addEventListener(eventType, fn.bind(vm), false)
//     }
//   }

//   // 更新函数，
//   update(node, exp, dir) {
//     // init
//     const fn = this[dir + 'Updater']
//     fn && fn(node, this.$vm[exp])

//     // update: 创建Watcher
//     new Watcher(this.$vm, exp, function(val) {
//       fn && fn(node, val)
//     })
//   }

//   // 编译文本，将{{ooxx}}
//   compileText(node) {
//     this.update(node, RegExp.$1, 'text')
//   }

//   textUpdater(node, val) {
//     node.textContent = val
//   }

//   // 处理元素所有动态属性
//   compileElement(node) {
//     Array.from(node.attributes).forEach(attr => {
//       const attrName = attr.name
//       const exp = attr.value
//       const dir = attrName.substring(2)

//       // 判断是否是一个指令
//       if (this.isDir(attrName)) {
//         // 执行指令处理函数
//         // k-text, 关心text
//         this[dir] && this[dir](node, exp)
//       } else if (this.isEventDirective(dir)) {
//         // 事件指令
//         this.eventHandler(node, this.$vm, exp, dir)
//       }
//     })
//   }

//   // k-text处理函数
//   text(node, exp) {
//     this.update(node, exp, 'text')
//   }

//   // k-html处理函数
//   html(node, exp) {
//     this.update(node, exp, 'html')
//   }

//   htmlUpdater(node, val) {
//     node.innerHTML = val
//   }

//   // k-model
//   model(node, exp) {
//     console.log('model', node, exp)
//     this.update(node, exp, 'model')
//     var _self = this,
//       val = _self.getVMVal(this.$vm, exp)
//     node.addEventListener('input', function(e) {
//       console.error('input===', e)
//       var newValue = e.target.value
//       if (val === newValue) {
//         return
//       }

//       _self.setVMVal(_self.$vm, exp, newValue)
//       val = newValue
//     })
//   }

//   modelUpdater(node, value) {
//     node.value = typeof value == 'undefined' ? '' : value
//   }
// }

// 小秘书：做dom更新
class Watcher {
  constructor(vm, fn) {
    this.vm = vm
    this.getter = fn
    // 初始化调用
    this.get()
  }

  get() {
    // 组件更新函数
    // 读取一下key的值，触发其get，从而收集依赖
    Dep.target = this
    // 触发方式变化：updateComponent  => render => data[key]
    this.getter.call(this.vm)
    Dep.target = null
  }

  update() {
    this.get()
  }
}

// 依赖：和响应式对象的每个key一一对应
class Dep {
  constructor() {
    // this.deps = []
    // 解决重复问题
    this.deps = new Set()
  }

  addDep(dep) {
    this.deps.add(dep)
  }

  notify() {
    this.deps.forEach(dep => dep.update())
  }
}
