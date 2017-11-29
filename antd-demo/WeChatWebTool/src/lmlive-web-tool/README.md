# 羚萌直播后台管理系统

## 实现技术

```
 react+antd
```


## Code Style

https://github.com/airbnb/javascript

## Develop

```
npm start
```

访问 http://127.0.0.1:3000

## Build

```
npm run build
```

## 启动说明
1、NODE_DEV
    production: 产品模式，会去掉console日志输出、debugger、压缩代码、去掉注释
    develop: 开发模式，也是默认模式
2、开发模式：scripts/start.js, config/webpack.config.dev.js
3、产品模式：scripts/build.js, config/webpack.config.prod.js
    所有文件打包成一个main.js文件，会带上随机数后缀，防止浏览器缓存


