<script setup lang="ts">
  import axios from 'axios'
  import { ref } from 'vue';

  let posts = ref<{
    id: string;
    title: string;
    link: string;
  }[]>([])

  axios
    .get('http://127.0.0.1:8020/juejin-latest', {
      responseType: 'json'
    })
    .then(res => {
      posts.value = res.data
    })
</script>

<template>
  <header>
  </header>

  <main>
    <li v-bind:key="item.id" v-for="(item, index) in posts">
      <a target="_blank" :href="item.link">
        {{ index+1 }} - {{ item.title }}
      </a>
    </li>
  </main>
</template>

<style scoped>
</style>
