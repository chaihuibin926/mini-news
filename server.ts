import axios, { type AxiosResponse } from 'axios'
import http from 'http'
import { title } from 'process';
// const cheerio = require('cheerio');

type ApiParams = {
  url: string;
  method: "POST" | "GET";
  data?: any,
  params?: any,
  parseData: (data: any) => any[];
  parseRes: (res: AxiosResponse<any, any>) => any[];
}

const apiMap: Record<string, ApiParams> = {
  'juejin-latest': {
    url: `https://api.juejin.cn/recommend_api/v1/article/recommend_all_feed`,
    method: "POST",
    data: {
      client_type: 2608,
      cursor: "0",
      id_type: 2,
      limit: 20,
      sort_type: 300,
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
            link: `https://juejin.cn/post/${it.item_info.article_id}`
          }
        }
      }).filter(it => it)
    },
    parseRes: res => {
      return res.data.data
    }
  }
}

const tagList = [
  {
    title: '掘金',
    children: [
      {
        title: '最新',
        name: 'juejin-latest'
      }
    ]
  }
]

function getData(apiName: keyof typeof apiMap) {
  const {method, data, params, url} = apiMap[apiName]
  return axios({
    method,
    data,
    params,
    url,
  })
}

http.createServer((req, res) => {
  if (req.url === '/tags') {
    res.writeHead(200)
    res.end(JSON.stringify(tagList))
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
  } else {
    res.writeHead(404)
    res.end()
  }
}).listen(8020)