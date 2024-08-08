import axios, { type AxiosResponse } from 'axios'
import http from 'http'
// const cheerio = require('cheerio');

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
      since_id: 1, // 貌似是页码
    },
    parseRes: res => {
      return res.data.data
    },
    parseData: data => {
      return data.cards.map(card => {
        return {
          id: card.mblog.id,
          title: card.mblog.page_info?.title,
          content: card.mblog.page_info?.text,
          link: 'https://m.weibo.cn/detail/' + card.mblog.id
        }
      })
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

http.createServer((req, res) => {
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
        res.end(JSON.stringify({msg: 'network error'}))
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