<script setup lang="ts">
  import axios from 'axios'
  import { onMounted, ref } from 'vue';
  import IpInput from './components/IpInput.vue'

  type Site = {
    title: string;
    icon: string;
    children: {title: string; name: string}[]
  }

  const connected = ref(false)
  const siteList = ref<Site[]>([])

  const posts = ref<{
    id: string;
    title: string;
    link: string;
    brief_content?: string
    content: string;
  }[]>([])

  const activeSite = ref<Site>()
  const activeCategory = ref()

  function getData(name: string) {
    axios
      .get('http://127.0.0.1:9260/' + name, {
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
        const site = siteList.value.find(it => it.title === name)!
        activeSite.value = site
      }
      //@ts-ignore
      if (e.target && e.target.closest('.category')) {
        //@ts-ignore
        const target = e.target.closest('.category')
        const name = target.dataset.name
        const category = activeSite.value?.children.find(it => it.name === name)!
        activeCategory.value = category
        getData(name)
      }
    })
  })

  function onConnection(targetIp: string, targetPort: number) {
    axios
      .get(`http://${targetIp}:${targetPort}/connect`, {responseType: 'json'})
      .then(res => {
        if (res.status === 200) {
          const siteData = res.data.map((it: Site) => ({...it, icon: `${targetIp}:${targetPort}${it.icon}`}))
          siteList.value = siteData
          activeSite.value = siteData[0]
          activeCategory.value = siteData[0].children[0]
          connected.value = true
          getData(siteData[0].children[0].name)
        }
      })
  }

  const isToolbarVisible = ref(false);
  
  function toggleToolbar() {
    isToolbarVisible.value = !isToolbarVisible.value;
  }

  function disconnectServer() {
    // 清空数据和状态
    connected.value = false;
    siteList.value = [];
    activeSite.value = undefined;
    activeCategory.value = undefined;
  }

</script>

<template>
  <!-- 操作栏 -->
  <div class="toolbar" v-show="connected">
    <button @click="toggleToolbar" class="toolbar-toggle">
      <span v-if="isToolbarVisible">−</span>
      <span v-else>☰</span>
    </button>
    <div class="toolbar-content" :class="{ show: isToolbarVisible }">
      <button @click="disconnectServer" class="disconnect-btn">断开</button>
    </div>
  </div>

  <IpInput v-show="!connected" :onConnection="onConnection" />
  <header v-show="connected">
    <div class="dock">
      <div :class="'web-icon-box ' + (activeSite?.title === site.title ? 'active' : '')" :key="site.title" :data-title="site.title" v-for="(site) in siteList">
        <img class="web-icon" width="50" height="50" :src="`http://${site.icon}`" :alt="site.title" />
      </div>
    </div>
  </header>

  <ul v-show="connected" class="category-list">
    <li :class="'category ' + (activeCategory?.name === item.name ? 'active' : '')" :key="item.name" :data-name="item.name" v-for="(item) in activeSite?.children ?? []">{{ item.title }}</li>
  </ul>

  <main v-show="connected">
    <ul class="article-list">
      <li v-bind:key="item.id" v-for="(item, index) in posts" class="article-item">
        <a v-show="!!item.title" target="_blank" :href="item.link" class="article-link">
          {{ index+1 }} - {{ item.title }}
        </a>
        <a v-show="!!item.content" v-html="item.content" target="_blank" :href="!item.title ? item.link : undefined" class="article-link"></a>
        <p v-show="!!item.brief_content" class="brief-content">{{ item.brief_content }}</p>
      </li>
    </ul>
  </main>
</template>

<style scoped>

  .toolbar {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    padding: 5px;
    z-index: 1000;
    width: 60px; /* 更小的宽度 */
    text-align: center;
    transition: all 0.3s ease;
  }

  /* 切换按钮 */
  .toolbar-toggle {
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 8px;
    cursor: pointer;
    border-radius: 50%;
    font-size: 18px;
    line-height: 1;
    transition: background-color 0.3s;
  }

  /* 切换按钮悬停效果 */
  .toolbar-toggle:hover {
    background-color: #0056b3;
  }

  /* 内容区域 */
  .toolbar-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 5px;
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: opacity 0.3s ease, max-height 0.3s ease;
  }

  /* 显示状态 */
  .toolbar-content.show {
    opacity: 1;
    max-height: 50px; /* 根据内容调整 */
  }

  /* 断开连接按钮 */
  .disconnect-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 5px 8px;
    cursor: pointer;
    border-radius: 5px;
    font-size: 12px; /* 更小的字体 */
    margin-top: 5px;
    transition: background-color 0.3s;
  }

  /* 断开连接按钮悬停效果 */
  .disconnect-btn:hover {
    background-color: #c82333;
  }

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
  .web-icon-box.active .web-icon {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    border: 2px solid #007BFF; /* 增加一个蓝色边框 */
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
    overflow-x: auto;

    /* 美化滚动条 */
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: #b0b0b0 #f9f9f9; /* 滚动条颜色和背景 */
  }

  .category {
    padding: 10px 20px;
    background: linear-gradient(to bottom, #ffffff, #f1f1f1);
    border-right: 1px solid #ddd;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
    position: relative;
    white-space: nowrap;
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

  /* 为 .category 添加选中样式 */
  .category.active {
    background: #007BFF;
    color: #ffffff;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* 添加文本阴影 */
  }
  



  /* WebKit 浏览器中的滚动条样式 */
  .category-list::-webkit-scrollbar {
    height: 8px; /* 滚动条的高度 */
  }

  .category-list::-webkit-scrollbar-track {
    background: #f9f9f9; /* 滚动条轨道的背景颜色 */
    border-radius: 10px; /* 滚动条轨道的圆角 */
  }

  .category-list::-webkit-scrollbar-thumb {
    background: #b0b0b0; /* 滚动条的颜色 */
    border-radius: 10px; /* 滚动条的圆角 */
  }

  .category-list::-webkit-scrollbar-thumb:hover {
    background: #8c8c8c; /* 滚动条在悬停时的颜色 */
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
    font-size: 16px;
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
