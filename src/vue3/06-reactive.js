// vue3利用Proxy实现响应式
function reactive(obj) {
  if (typeof obj !== 'object') {
    return obj
  }
  return new Proxy(obj, {
    get(target, key) {
      console.log('get: ', key);
      const val = Reflect.get(target, key)
      // return target[key]
      // return val
      track(target, key) // 建立关系
      // 懒处理，递归遍历嵌套
      return (typeof val =='object') ? reactive(val) : val
    },
    set(target, key, val) {
      console.log('set: ', key);
      // target[key] = val
      const ret = Reflect.set(target, key, val)
      trigger(target, key) // 获取出来后触发
      return ret
    },
    deleteProperty(target, key) {
      console.log('delete: ', key);
      // delete target.key
      const ret = Reflect.deleteProperty(target, key)
      trigger(target, key) // 获取出来后触发
      return ret
    },
  })
}


// 临时保存副作用函数
const effectStack = []

/**
 * 添加副作用
 */
function effect(fn) {
  // 包装高阶函数，处理错误，放入stack
  const eFn = createReactiveEffect(fn)
  // 立刻执行一次
  eFn()
  return eFn
}

// 高阶函数  处理fn可能出现的错误
function createReactiveEffect(fn) {
  const effect = function () {
    try {
      // 存入高阶函数到临时数组
      effectStack.push(effect)
      // 执行fn
      return fn()
    } finally {
      // 跳出
      effectStack.pop()
    }
  } 
  return effect
}



// 映射关系表
const targetMap = new WeakMap()

/**
 * 依赖收集【收集关系】
 */
function track(target, key) {
  // 首先尝试获取effect函数
  // 有可能嵌套，所以数组倒着取
  const effect = effectStack[effectStack.length -1] // 获取当前的effect
  if (effect) {
    // 获取target对应的map
    let depMap = targetMap.get(target)

    // 初始化时需要创建，只执行一次
    if (!depMap) {
      depMap = new Map()
      targetMap.set(target, depMap)
    }

    let deps = depMap.get(key)
    if (!deps) {
      deps = new Set()
      depMap.set(key, deps)
    }

    deps.add(effect)
  }
}



/**
 * 依赖触发【获取关系】
 */
function trigger(target, key) {
  // 获取target对应的map
  const depMap = targetMap.get(target)
  if (!depMap) {
    return
  }
  const deps = depMap.get(key)
  if (deps) {
    // 遍历执行
    deps.forEach(dep => {
      dep()
    })
  }
}

const state = reactive({
  foo: 'foo',
  n: {
    a: 1
  }
})

effect(() => {
  console.log('effect 001:', state.foo);
})

effect(() => {
  console.log('effect 002: ', state.n.a, state.foo);
})

// state.foo
// state.foo = 'fooooooo111111'
// state.bar = 'bar'
// delete state.foo

state.n.a = 700

