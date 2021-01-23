<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
    <FormExample/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import FormExample from '@/components/form/index.vue';

export default {
  name: 'Home',
  components: {
    HelloWorld,
    FormExample
  }
}
</script>
