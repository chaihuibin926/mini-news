const axios = require('axios');
// const cheerio = require('cheerio');

// 目标 URL
const url = 'https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed?aid=2608&uuid=7194626781654451745&spider=0';
const articles = []
// 发送 HTTP 请求并获取页面内容
axios.post(url, {
  client_type: 2608,
  cursor: "0",
  id_type: 2,
  limit: 20,
  sort_type: 300
})
  .then(response => {
    const data = response.data;
    
    const list = data.data
    
    list.forEach(it => {
      if (it.item_info.article_id) {
        articles.push({
          id: it.item_info.article_id,
          title: it.item_info.article_info?.title,
          link: `https://juejin.cn/post/${it.item_info.article_id}`
        })
      }
    })
    console.log(articles)
    console.log(articles.length)
  })
  .catch(error => {
    console.error(`Error: ${error}`);
  });

require('http').createServer((req, res) => {
  if (req.url === '/juejin') {
    res.writeHead(200, 'ok', {
      "Access-Control-Allow-Origin": "*",
    })

    res.write(JSON.stringify(articles))
    res.end()
  }
}).listen(8020)