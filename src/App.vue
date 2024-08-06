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
    <ul class="article-list">
      <li v-bind:key="item.id" v-for="(item, index) in posts" class="article-item">
        <a target="_blank" :href="item.link" class="article-link">
          {{ index+1 }} - {{ item.title }}
        </a>
      </li>
    </ul>
  </main>
</template>

<style scoped>
  .article-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .article-item {
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .article-item:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .article-link {
    text-decoration: none;
    color: #333;
    font-weight: bold;
    transition: color 0.2s;
  }

  .article-link:hover {
    color: #007BFF;
  }
</style>
