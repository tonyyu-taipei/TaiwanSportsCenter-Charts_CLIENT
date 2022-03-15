# 運動中心健身房圖表查詢系統（用戶端）

<img src="https://github.com/tonyyu-taipei/TaiwanSportsCenter-Charts_CLIENT/raw/master/pwa-192x192.png" />

[系統網址](https://tonyyu.taipei/gym-stats)
[Changelog與Known Bugs](https://hackmd.io/@x9VPntxwQemm0h5ceTvAJw/rJrxViL0F)

網站架構含此客戶端、[Sails.js後端](https://github.com/tonyyu-taipei/TaiwanSportsCenter-Charts_SAILS-SERVER)與[資料庫抓取程式](https://github.com/tonyyu-taipei/TaiwanSportsCenter-Charts_FETCH-SERVER)（共三個程式）
資料庫使用MongoDB

預設API網址將會是
```
https://tonyyu.taipei:1337
```
可在 /src/App.vue中，修改您的apiURL

後端將在近期內開源上傳GitHub

## 介接方式
1. /data：抓取所有資料庫內資料，以JSON表示，如： 
```json
[
	{
		"time": "2022-01-17T13:09:29.038Z",
		"locationPeople": [
			{
				"short": "BTSC",
				"peoNum": "13",
				"maxPeo": "20"
			},
			{
				"short": "DASC",
				"peoNum": "23",
				"maxPeo": "65"
			},
		],
		"id": "61e56a897c23449eb3acdd9b"
	},
]
```
short為運動中心縮寫、peoNum為當下人數、maxPeo為最多人數

2. /data/date：將抓取所有資料之日期與時間（上方time）
```json
["2022-01-17T13:09:29.038Z","2022-01-17T13:10:28.701Z","2022-01-17T14:32:20.472Z","2022-01-17T14:42:20.534Z","2022-01-17T23:29:20.435Z","2022-01-17T23:49:20.463Z",]
```

3. /data/date?date=***[日期]***

日期格式需JS new Date()可辨識，將回傳符合該日的資料（如1.）。

4. /locations：將抓取所有運動中心名稱（縮寫與中文名）
```json
[
    {"short":"DASC","name":"大安","id":"61e5499321650236cb94f8e9"},
    {"short":"NGSC","name":"南港","id":"61e5499321650236cb94f8ec"},
    {"short":"WSSC","name":"文山","id":"61e5499321650236cb94f8f1"}
]
```



## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
