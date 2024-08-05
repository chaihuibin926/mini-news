<script setup lang="ts">
  import axios from 'axios'
  import { ref } from 'vue';

  let posts = ref<{
    id: string;
    title: string;
    link: string;
  }[]>([])

  axios
    .get('http://127.0.0.1:8020/juejin', {
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
  /* header {
    line-height: 1.5;
  }

  .logo {
    display: block;
    margin: 0 auto 2rem;
  }

  @media (min-width: 1024px) {
    header {
      display: flex;
      place-items: center;
      padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
      margin: 0 2rem 0 0;
    }

    header .wrapper {
      display: flex;
      place-items: flex-start;
      flex-wrap: wrap;
    }
  } */
</style>
