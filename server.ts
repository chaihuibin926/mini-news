import axios, { type AxiosResponse } from 'axios'
import http from 'http'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

type ApiParams = {
  url: string;
  method: "POST" | "GET";
  data?: any,
  params?: any,
  parseData: (data: any) => any[];
  parseRes: (res: AxiosResponse<any, any>) => any[];
}

const sorts = {
  'juejin': {
    'recommend': 200,
    'latest': 300,
  }
}

const apiMap: Record<string, ApiParams> = {
  'juejin-complex': {
    url: `https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed`,
    method: "POST",
    data: (sort: string) => {
      return {
        client_type: 2608,
        cursor: "0",
        id_type: 2,
        limit: 20,
        sort_type: sorts.juejin[sort],
      }
    },
    params: {
      aid: 2608,
      uuid: '7194626781654451745',
      spider: 0,
    },
    parseData: data => {
      return data.map(it => {
        if (it.item_info.article_id) {
          return {
            id: it.item_info.article_id,
            title: it.item_info.article_info?.title,
            link: `https://juejin.cn/post/${it.item_info.article_id}`,
            brief_content: it.item_info.article_info?.brief_content
          }
        }
      }).filter(it => it)
    },
    parseRes: res => res.data.data
  },
  'juejin-rank': {
    url: 'https://api.juejin.cn/content_api/v1/content/article_rank',
    method: 'GET',
    params: {
      category_id: 1,
      type: 'hot',
      aid: 2608,
      uuid: '7368466501496079922',
      spider: 0,
    },
    parseRes: (res) => res.data.data,
    parseData: (data) => {
      return data.map(it => {
        return {
          id: it.content.content_id,
          title: it.content.title,
          link: `https://juejin.cn/post/${it.content.content_id}`
        }
      })
    }
  },
  'juejin-front-end': {
    url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed',
    method: 'POST',
    params: {
      aid: 2608,
      uuid: '7194626781654451745',
      spider: 0,
    },
    data: (sort: string) => {
      return {
        cate_id: "6809637767543259144",
        cursor: "0",
        id_type: 2,
        limit: 20,
        sort_type: sorts.juejin[sort],
      }
    },
    parseRes: res => res.data.data,
    parseData: (data) => {
      return data.map(it => {
        return {
          id: it.article_id,
          title: it.article_info.title,
          link: `https://juejin.cn/post/${it.article_id}`,
          brief_content: it.article_info.brief_content
        }
      })
    }
  },
  'juejin-back-end': {
    url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed',
    method: 'POST',
    params: {
      aid: 2608,
      uuid: '7194626781654451745',
      spider: 0,
    },
    data: (sort: string) => {
      return {
        cate_id: "6809637769959178254",
        cursor: "0",
        id_type: 2,
        limit: 20,
        sort_type: sorts.juejin[sort],
      }
    },
    parseRes: res => res.data.data,
    parseData: (data) => {
      return data.map(it => {
        return {
          id: it.article_id,
          title: it.article_info.title,
          link: `https://juejin.cn/post/${it.article_id}`,
          brief_content: it.article_info.brief_content
        }
      })
    }
  },
  'juejin-ai': {
    url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed',
    method: 'POST',
    params: {
      aid: 2608,
      uuid: '7194626781654451745',
      spider: 0,
    },
    data: (sort: string) => {
      return {
        cate_id: "6809637773935378440",
        cursor: "0",
        id_type: 2,
        limit: 20,
        sort_type: sorts.juejin[sort],
      }
    },
    parseRes: res => res.data.data,
    parseData: (data) => {
      return data.map(it => {
        return {
          id: it.article_id,
          title: it.article_info.title,
          link: `https://juejin.cn/post/${it.article_id}`,
          brief_content: it.article_info.brief_content
        }
      })
    }
  },
  'juejin-read': {
    url: 'https://api.juejin.cn/recommend_api/v1/article/recommend_cate_feed',
    method: 'POST',
    params: {
      aid: 2608,
      uuid: '7194626781654451745',
      spider: 0,
    },
    data: (sort: string) => {
      return {
        cate_id: "6809637772874219534",
        cursor: "0",
        id_type: 2,
        limit: 20,
        sort_type: sorts.juejin[sort],
      }
    },
    parseRes: res => res.data.data,
    parseData: (data) => {
      return data.map(it => {
        return {
          id: it.article_id,
          title: it.article_info.title,
          link: `https://juejin.cn/post/${it.article_id}`,
          brief_content: it.article_info.brief_content
        }
      })
    }
  },
  "weibo-hot": {
    url: "https://m.weibo.cn/api/container/getIndex",
    method: 'GET',
    params: {
      containerid: 102803,
      openApp: 0,
      // since_id: 1, // 貌似是页码
    },
    parseRes: res => {
      return res.data.data
    },
    parseData: data => {
      return data.cards.map(card => {
        return {
          id: card.mblog.id,
          // title: card.mblog.text,
          content: card.mblog.text,
          link: 'https://m.weibo.cn/detail/' + card.mblog.id
        }
      })
    }
  },
  "woshipm-recommend": {
    method: 'GET',
    url: 'https://www.woshipm.com/',
    parseRes: res => res.data,
    parseData: html => {
      const $ = cheerio.load(html)
      const articles = $('.js-postlist article')
      const titles = $('.js-postlist article .content .post-title a')
      const des = $('.js-postlist article .content .des')

      const data = []
      Object.keys(articles).forEach(key => {
        if (!Number.isNaN(Number(key))) {
          const article = articles[key]
          data.push(
            {
              id: article.attribs['data-id'],
              title: titles[key].attribs.title,
              brief_content: des[key].children[0].data,
              link: `https://www.woshipm.com/class/${article.attribs['data-id']}.html`,
            }
          )
        }
      })
      return data
    }
  },
  "woshipm-product-rank": {
    url: 'https://zt.woshipm.com/author/2023/pmResult.html',
    method: 'GET',
    parseRes: res => res.data,
    parseData: html => {
      const $ = cheerio.load(html)
      // const productImgSrcs = $('.product--rankList .product--rankItem .product--rankItem__left img')
      const productNames = $('.product--rankList .product--rankItem .name')
      const productBriefContents = $('.product--rankList .product--rankItem ul')
      const productBriefLinis = $('.product--rankList .product--rankItem a')
      const data = []
      Object.keys(productNames).forEach(key => {
        if (!Number.isNaN(Number(key))) {
          const productName = productNames[key].children[0].data
          const liList = productBriefContents[key].children.filter(it => it.type === 'tag').map(it => it.children[0].data)
          data.push({
            id: productName,
            title: productName,
            link: productBriefLinis[key].attribs.href,
            content: `
              <ul>
                ${
                  liList.map(it => `<li>${it}</li>`).join('')
                }
              </ul>
            `
          })
        }
      })
      return data
    }
  }
}

function getData(apiName: keyof typeof apiMap) {
  const {method, data, params, url} = apiMap[apiName]
  return axios({
    method,
    data: typeof data === 'function' ? data('latest') : data,
    params,
    url,
  })
}

// getData('woshipm-product-rank')
// .then(apiMap['woshipm-product-rank'].parseRes)
// .then(apiMap['woshipm-product-rank'].parseData)

const siteList = [

  {
    title: '人人都是产品经理',
    icon: '/icon/woshipm.jpg',
    children: [
      {
        title: '推荐',
        name: 'woshipm-recommend',
      },
      {
        title: '年度产品榜',
        name: 'woshipm-product-rank',
      },
    ]
  },
  {
    title: '掘金',
    icon: '/icon/juejin.png',
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
    icon: '/icon/xinlangweibo.png',
    children: [
      {
        title: '热门',
        name: 'weibo-hot',
      }
    ]
  },
]

http.createServer((req, res) => {
  let ip;

  // 通过 `x-forwarded-for` 头部获取真实 IP（用于代理服务器）
  if (req.headers['x-forwarded-for']) {
    ip = req.headers['x-forwarded-for'].split(',')[0].trim();
  } else {
    // 直接从连接获取 IP 地址
    ip = req.connection.remoteAddress || req.socket.remoteAddress;
  }
  console.log(ip, req.url)
  if (req.url?.startsWith('/icon')) {
    const iconPath = path.join(__dirname, req.url); // 假设你要返回一个名为 `icon.png` 的图标

    fs.readFile(iconPath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Icon not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(data);
      }
    });
    return
  }
  if (req.url === '/connect') {
    res.writeHead(200, {"Access-Control-Allow-Origin": "*",})
    res.end(JSON.stringify(siteList))
    return
  }

  const requestApiName = req.url?.split('/').slice(-1)[0];
  if (requestApiName && (requestApiName in apiMap)) {
    getData(requestApiName)
      .then(apiMap[requestApiName].parseRes)
      .then(apiMap[requestApiName].parseData)
      .then(data => {
        res.writeHead(200, 'ok', {"Access-Control-Allow-Origin": "*",})
        res.end(JSON.stringify(data))
      })
      .catch((err) => {
        console.error(err)
        res.writeHead(500, {"Access-Control-Allow-Origin": "*",})
        const newLocal = 'network error';
        res.end(JSON.stringify({msg: newLocal}))
      })
  } else {
    res.writeHead(404)
    res.end()
  }
}).listen(9260, () => {
  // ANSI 24-bit RGB 颜色码 
  // 祖母绿
  const EMERALD_GREEN = '\x1b[38;2;80;200;120m';
  const RESET = '\x1b[0m';
  console.log(`${EMERALD_GREEN}mini-news server listen to the port 9260${RESET}`)
})