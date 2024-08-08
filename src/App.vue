<script setup lang="ts">
  import axios from 'axios'
  import { onMounted, ref } from 'vue';
  import juejin_icon from './icon/juejin.png'
  import xinlangweibo_icon from './icon/xinlangweibo.png'

  const siteList = ref([
    {
      title: '掘金',
      icon: juejin_icon,
      children: [
        {
          title: '综合',
          name: 'juejin-complex',
        },
        {
          title: '排行榜',
          name: 'juejin-rank',
        },
        {
          title: '前端',
          name: 'juejin-front-end',
        },
        {
          title: '后端',
          name: 'juejin-back-end',
        },
        {
          title: '人工智能',
          name: 'juejin-ai',
        },
        {
          title: '阅读',
          name: 'juejin-read',
        },
      ]
    },
    {
      title: '微博',
      icon: xinlangweibo_icon,
      children: [
        {
          title: '热门',
          name: 'weibo-hot',
        }
      ]
    }
  ])


  const posts = ref<{
    id: string;
    title: string;
    link: string;
    brief_content?: string
  }[]>([])

  const categoryList = ref<{title: string; name: string}[]>([])
  // const sortList = ref<{title: string; value: string}[]>([
  //   {
  //     title: '最新',
  //     value: 'latest'
  //   },
  //   {
  //     title: '推荐',
  //     value: 'recommend'
  //   }
  // ])

  function getData(name: string) {
    axios
      .get('http://127.0.0.1:8020/' + name, {
        responseType: 'json'
      })
      .then(res => {
        posts.value = res.data
      })
  }

  onMounted(() => {
    
    document.addEventListener('click', e => {
      //@ts-ignore
      if (e.target && e.target.closest('.web-icon-box')) {
        //@ts-ignore
        const target = e.target.closest('.web-icon-box')
        const name = target.dataset.title
        const categorys = siteList.value.find(it => it.title === name)!.children
        categoryList.value = categorys
      }
      //@ts-ignore
      if (e.target && e.target.closest('.category')) {
        //@ts-ignore
        const target = e.target.closest('.category')
        const name = target.dataset.name
        getData(name)
      }
    })
  })
</script>

<template>
  <header>
    <div class="dock">
      <div class="web-icon-box" :key="site.title" :data-title="site.title" v-for="(site) in siteList">
        <img class="web-icon" width="50" height="50" :src="site.icon" :alt="site.title" />
      </div>
    </div>
  </header>

  <ul class="category-list">
    <li class="category" :key="item.name" :data-name="item.name" v-for="(item) in categoryList">{{ item.title }}</li>
  </ul>

  <!-- <ul class="sroter">
    <li :key="item.value" v-for="(item) in sortList">{{ item.title }}</li>
  </ul> -->

  <main>
    <ul class="article-list">
      <li v-bind:key="item.id" v-for="(item, index) in posts" class="article-item">
        <a target="_blank" :href="item.link" class="article-link">
          {{ index+1 }} - {{ item.title }}
        </a>
        <p v-show="!!item.brief_content" class="brief-content">{{ item.brief_content }}</p>
      </li>
    </ul>
  </main>
</template>

<style scoped>
  .dock {
    display: flex;
    align-items: center;
    background-color: #f9f9f9;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .web-icon-box {
    margin: 0 10px;
    transition: transform 0.3s ease;
    cursor: pointer;
  }

  .web-icon {
    border-radius: 15%;
    transition: transform 0.3s ease;
  }

  .web-icon-box:hover .web-icon {
    transform: scale(1.1);
  }

  .category-list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0 0 20px 0;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .category {
    padding: 10px 20px;
    background: linear-gradient(to bottom, #ffffff, #f1f1f1);
    border-right: 1px solid #ddd;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
    position: relative;
  }

  .category::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent);
    transition: opacity 0.3s;
    opacity: 0;
  }

  .category:last-child {
    border-right: none;
  }

  .category:hover {
    background-color: #e0e0e0;
    color: #007BFF;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .category:hover::after {
    opacity: 1;
  }

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

  .brief-content {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
  }

  main {
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
</style>
