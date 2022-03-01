<template>
  <div id="app">

    <div id="fixedLogo">
    <img src="https://tonyyu.taipei/ico/logo@100.png" onclick="window.location.href ='../index.html'" id=logo style="cursor:pointer;"></div>
    <b-loading :is-full-page="isFullPage" v-model="isLoading" :can-cancel="false"></b-loading>
    <div id="menu">
  <b-button pill   @click="toggleMenu()" v-if="mobile" type="is-primary is-light">{{menuOptions}}</b-button>
    </div>
    <div id="left" v-if=showSel>
      
      <h1>明天健！</h1>
      <b-field label="選擇日期">
        <b-datepicker
          placeholder="Click to select..."
          :min-date="minDate"
          :mobile-native="false"
          :max-date="maxDate"
          v-model="selectedDate"
          :unselectable-dates="checkBanned"
          @input="clearChart('date')"
          :disable="dateChoose"
        >
        </b-datepicker>
      </b-field>
      

          <b-button v-for="(index, id) in locations" :key="id" v-on:click="selectLocation(index,id)"  :type="buttonType[id]" :disabled="showBtn" >{{ index }}</b-button>
    <div id="options">
          <b-button type="is-success"  v-show="dateChoose&&refresh" @click="clearChart('date')"><b-icon
                icon="sync"
                ></b-icon></b-button>
          <b-button type="is-danger" style="" v-if="clearToggle" @click="clearChart('all')"><b-icon
                icon="trash-alt"
                ></b-icon></b-button></div>
          <b-switch style="margin-top:1em;vertical-align:middle" v-model="predict" v-if="showPredict" @input="togglePredict()">顯示上週</b-switch><br>
          <b-switch style="margin-top:1em;vertical-align:middle" v-model="meme" v-show="!mobile" @input="toggleMeme()">迷因模式</b-switch>
        <div id='bottom'>
           <a href="https://tonyyu.taipei" style="color: rgb(200,200,200)">2022 Tony Yu </a>
          <a style="color:rgb(200,200,200);cursor:pointer" href="https://hackmd.io/@x9VPntxwQemm0h5ceTvAJw/rJrxViL0F">| 來源 </a>
          <br>
        <!--  <div id='resource' v-show="showResource">
            <a href="http://www.sporetrofit.com">智聯運動科技</a><br><a href="https://tycsc.cyc.org.tw">桃園國民運動中心</a><br><a href="https://lkcsc.cyc.org.tw">林口國民運動中心</a>
          </div>-->
         <a style="color:rgb(200,200,200);cursor:pointer" href="https://hackmd.io/@x9VPntxwQemm0h5ceTvAJw/rJrxViL0F">Ver. 2022-03-01</a>
    </div>
    </div>


    <div id="right" >
        <div id=meme v-if=meme>
        <img src="https://tonyyu.taipei/img/meme.3e0d41da.png" rel="preload">
        <h1>{{memeTxt[memeID]}}</h1>
     </div>
     
      <LineChart :chartData="chartData" :options="options" v-if="showChart" :key="ckey" style="width:97%;height:100%"/>
      <div id="rightload" v-else>
        <p v-text="loadingEl" style="color:white"></p>
      <b-progress></b-progress></div> <!--若需要實時進度表，可加:value="progress" -->
    </div>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core';
// internal icons
import { faCheck, faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle,
    faArrowUp, faAngleRight, faAngleLeft, faAngleDown,
    faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload, faSync, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faCheck, faCheckCircle, faInfoCircle, faExclamationTriangle, faExclamationCircle,
    faArrowUp, faAngleRight, faAngleLeft, faAngleDown,
    faEye, faEyeSlash, faCaretDown, faCaretUp, faUpload,faSync,faTrashAlt);
Vue.component('vue-fontawesome', FontAwesomeIcon);

import { mdiInformation } from '@mdi/js';
import Vue from "vue";
import Buefy from "buefy";
import axios from "axios";
import LineChart from "./components/LineChart";
import "buefy/dist/buefy.css";
import subDays from 'date-fns/subDays';
import isSameDay from 'date-fns/isSameDay';
const apiUrl = "https://tonyyu.taipei:1337"
Vue.use(Buefy,{
    defaultIconComponent: 'vue-fontawesome',
  defaultIconPack: 'fas',
  }, axios,mdiInformation);
export default {
  name: "App",
  components: {
    LineChart,
  },
  data() {
    return {
      alertUndefined: 0,
      showResource:false,
      bannedDays:["2022/1/31","2022/2/1","2022/2/2","2022/2/3","2022/2/4","2022/2/5"],
      showPredict:false,
      predict:false,
      refresh:false,
      dateChoose:true,
      reselectOK:false,
      memeID:0,
      memeTxt:["艦深分西濕","大樹距","孕動衷新","stonks","not stonks","such people",'於Gym學','helth'],
      meme:false,
      mobile:false,
      menuOptions:"☰",
      windowWidth:0,
      buttonType:[],
      isLoading:false,
      showBtn:false,
      date: new Date(),
      minDate: new Date(),
      maxDate: new Date(),
      clearToggle:false,
      allDate: [],
      locations: [],
      showSel:true,
      ckey:0,
      loadingEl:"載入中...",
      selShortID:0,
      chartID:0,
      locationsShort: [],
      selectedID:[],
      selectedLoc: [],
      selectedDate: new Date(),
      showChart: false,
      colorTemplate:['#ffbff5','#c4ff03','#ffa64d','#fa4d56','#9ef0f0','#f1c21b','#ff7eb6','#f1f1f1','#f1d4d4','#f0b8b8','#ec9c9d','#e67f83','#de6069','#d43d51','#05bcff','#c9ffb3'],
      progress:undefined,
      chartData: {
        labels: [], //時間軸

      },
        options: {
          responsive: true,
          spanGaps: true,

          maintainAspectRatio: false,
          legend:{
          align:"start",
          position:'top',
            labels:{
            fontSize:15,
            fontColor:'white',
            boxWidth:20,
            }
          },
          elements:{
            point:{
              radius:4,
              hitRadius:10,
              hoverRadius:10
            }
          },
          scales: {
          yAxes: [{
            ticks: {
                fontColor: 'white',
                fontSize:18,
                max:60,
                min:0
            },
            gridLines:{
              display:true,
              color:"rgba(255,255,255,.4)"
            }
          }],
          xAxes: [{
            ticks: {
                fontColor: 'white',
                fontSize:18
            },
            gridLines:{
              display:true,
              color:"rgba(255,255,255,.4)"
            }
          }]
          }
        },
    };
  },
  created: function () {
    this.getAllDate(), this.getAllLocations();this.windowWidth = window.innerWidth;if(this.windowWidth <1107){this.mobile=true}
  },
  computed: {
    console: () => console,
    window: () => window,
  },
  mounted() {
            window.onresize = () => {
                this.windowWidth = window.innerWidth
                if(this.windowWidth > 1107){
                  this.showSel = true;
                  this.mobile=false;
                }else if(!this.mobile){
                  this.showSel = true;
                  this.menuOptions = "Ｘ"
                  this.mobile = true;
                  this.meme = false

                }
            }
},
  methods: {
    checkBanned(days){
      this.bannedDays.forEach(data=>{
        if(`${new Date(data).getMonth()+1}/${new Date(data).getDate()}`==`${new Date(days).getMonth()+1}/${new Date(days).getDate()}`){
          return false
        }
      })
    },
    toggleResource(){
      this.showResource = !this.showResource;
    },
    togglePredict(){
      this.clearChart('date')
    },
    toggleMeme(){
      const randomNum = Math.floor(Math.random() * this.memeTxt.length)
      this.memeID = randomNum;
    },
    toggleMenu(){
      if(!this.showSel){
      this.showSel = true
      this.menuOptions = "Ｘ"
      }else{
      this.showSel = false
      this.menuOptions = "☰"

      }
    },
    getAllDate() {
      axios.get(`${apiUrl}/data/date`).then((res) => {
        let tempDate = new Date(res.data[0]);
        this.minDate = new Date(
          tempDate.getFullYear(),
          tempDate.getMonth(),
          tempDate.getDate()
        );
        this.maxDate = new Date(res.data[res.data.length - 1]);
        if(this.selectedDate.getTime() > this.maxDate.getTime()){
          this.selectedDate = this.maxDate
        }
        if(this.selectedDate.getDate() == this.maxDate.getDate() && this.selectedDate.getHours() < 6){
          this.selectedDate = new Date(this.selectedDate.getDate()-1)
        }
        if(new Date().getDate() == this.selectedDate.getDate()){
          if(new Date().getHours() <= 21 && new Date().getHours()>=6){
            if(new Date().getMinutes() < 45 && new Date().getHours() == 21){
                        this.showPredict = true;
            }else if(new Date().getHours() != 21){
                       this.showPredict = true;   
            }
          }
        }
        res.data.forEach((time) => {
          this.allDate.push(time);
        });
      });
    },
    getAllLocations() {

      this.isLoading = true;
      axios.get(`${apiUrl}/locations`).then((res) => {
        this.isLoading=false;
        res.data.forEach((location) => {
          this.locations.push(location.name);
          this.locationsShort.push(location.short);
          this.buttonType = new Array(this.locationsShort.length)
          this.showChart = true
        });
      });
      
    },
    async selectLocation(name,buttonId,reselect) {
      this.refresh = true
      this.menuOptions = "☰";
      if(this.windowWidth <=1107 ){
      this.showSel = false;
      this.showLogo = false;
      
      }


      this.buttonType[buttonId] = "is-primary";
      const randomNum = () => Math.floor(Math.random() * (235 - 140 + 1) + 140);
      
      if(this.selectedLoc.includes(name)&&!reselect){ //若已經選取則進行動作
        
          this.menuOptions = "☰";
          let index = this.selectedLoc.indexOf(name);
        this.colorTemplate[index] = `rgb(${randomNum()},${randomNum()},${randomNum()})`//換顏色，同時原陣列也更改
        if(this.predict&&this.showPredict){
        let predictColorIndex = this.selectedLoc.indexOf(name)*2;
        this.chartData.datasets[predictColorIndex].borderColor = this.colorTemplate[index]
        this.chartData.datasets[predictColorIndex+1].borderColor = this.colorTemplate[index]
        }else{
          this.chartData.datasets[index].borderColor = this.colorTemplate[index]
        }
        /*this.$buefy.notification.open({
          type: 'is-warning',
          position:'is-bottom-right',
          pauseOnHover:true,
          message:'顏色已更改'
        })*/
        this.chartData ={
        ... this.chartData
      }
        return 0;
        }
      
      this.selectedLoc.push(name);
      this.selectedID.push(buttonId)
      this.chartData.labels = [];
      if(this.chartID == 0)
      this.chartData.datasets = [];
      this.chartData.datasets.push({});
      this.chartData.datasets[this.chartID].data = [];
      if(!reselect){
        this.clearToggle = true;
        this.isLoading=true;
      }
       let res = await axios.get(`${apiUrl}/data/date`, {
          params: { date: this.selectedDate },
        })
        
          return new Promise(resolve =>{
          setTimeout(async() =>{
                let resData = res.data;
                if(resData.length === 0 ){
                  this.$buefy.notification.open({
                      type: 'is-warning',
                      position:'is-bottom-right',
                      pauseOnHover:true,
                      message:'此日期無資料'
                    })
                    this.isLoading = false;
                    this.showChart = true;
                    return 0;
                }
                resData.forEach(async(input) => { /*
                伺服器這時候回傳的數值會是[{time:new Date();locationPeople:[];id:id}
                ]

                所以每個陣列是使用日期時間來隔開，因此，下面要確定時間日期是否符合
                */
                //每次回傳出來的資料都會是一個時間，可以利用這些時間的資料來找出圖表的X軸
                let timeHour = `${new Date(input.time).getHours()}`
                if(timeHour < 10)
                timeHour = '0'+timeHour;
                let timeMin = `${new Date(input.time).getMinutes()}`
                if(timeMin <10)
                timeMin = '0'+timeMin;
                this.chartData.labels.push(
                  `${timeHour}:${timeMin}`
                );
                let indexOfShort = this.locations.indexOf(name)
                this.chartData.datasets[this.chartID].backgroundColor = "rgba(255,255,255,0.1)";
                this.chartData.datasets[this.chartID].label = name
                if(this.predict&&this.showPredict){
                  this.chartData.datasets[this.chartID].borderColor = this.colorTemplate[this.chartID/2];

                }
                else{
                  this.chartData.datasets[this.chartID].borderColor = this.colorTemplate[this.chartID];
                }
                let addedIn = false;
                let shortIndex = 0;
                input.locationPeople.forEach((secInput) => {
                  if (secInput.short == this.locationsShort[indexOfShort]) {
                    this.chartData.datasets[this.chartID].data.push(parseInt(secInput.peoNum));
                    if(secInput.peoNum > this.options.scales.yAxes[0].ticks.max){
                      this.options.scales.yAxes[0].ticks.max = secInput.peoNum;
                    }
                    addedIn = true;
                  }
                  if(!addedIn)
                  shortIndex = shortIndex + 1
                });
                this.selShortID = shortIndex;
                  if(!addedIn){
                    this.chartData.datasets[this.chartID].data.push(undefined)
                  }
              })
              let predictFun = async()=>{

                //下面得出最後兩筆資料的時間差
                let selectedFullDate = this.selectedDate.getFullYear()+"/"+(this.selectedDate.getMonth()+1)+"/"+this.selectedDate.getDate();

                let date1 = new Date(selectedFullDate+" "+this.chartData.labels[this.chartData.labels.length-1])
                let date2 = new Date(selectedFullDate+" "+this.chartData.labels[this.chartData.labels.length-2])
                let minDiff = new Date(date1-date2).getMinutes();
                let lastTime = this.chartData.labels[this.chartData.labels.length-1];
                let lastHour = lastTime.split(":")[0];
                let lastMin = lastTime.split(":")[1];
                let predictDateVal = [];
                predictDateVal.push(new Date(`${selectedFullDate} ${lastHour}:${lastMin}`)) //0128
                while(this.chartData.labels[this.chartData.labels.length-1].split(":")[0] < 22 && this.chartData.labels[this.chartData.labels.length-1].split(":")[0] > 5){

                    lastHour = parseInt(lastHour)
                    lastMin = parseInt(lastMin)

                    lastMin+=minDiff
                    if(lastMin >= 60){
                      lastHour++;
                    lastMin = lastMin - 60;
                    }
                    if(lastHour < 10){
                      lastHour = '0'+lastHour;
                    }
                    if(lastMin < 10){
                      lastMin = '0'+lastMin
                    }
                    if(lastHour != 22 ){
                  this.chartData.labels.push(`${lastHour}:${lastMin}`)
                  predictDateVal.push(new Date(`${selectedFullDate} ${lastHour}:${lastMin}`))
                    }else{
                      break;
                    }
                  }
              if(this.predict && this.showPredict && (new Date(this.selectedDate).getDate() == new Date().getDate())&&(new Date().getHours()<=21 )){
                 let setPredictDays = [];
                this.allDate.forEach(data=>{
        
                    for(let ban of this.bannedDays){
                    if(`${new Date(ban).getMonth()+1}/${new Date(ban).getDate()}`==`${subDays(this.selectedDate,7).getMonth()+1}}/${subDays(this.selectedDate,7).getDate()}`){
                      this.showPredict = false;
                      this.predict = false;
                    break;
                    }
                    if(new Date(data).getDate() == subDays(this.selectedDate,7).getDate()&&!isSameDay(new Date(setPredictDays[0]),new Date(data))){
                    // if(new Date(data).getDate() == subDays(this.selectedDate,7).getDate()&&(new Date(setPredictDays[0]).getDate() != new Date(data).getDate())){
                    setPredictDays[0] = data;
                    }
                  }
                  
                })
                if(setPredictDays.length == 0){
                  this.update(reselect)
                  resolve();
                }
                let predictMainData = [];
                let getSecDate = async(days)=>{
                      return await axios.get(`${apiUrl}/data/date`, {
                      params: { date: days },
                      }) //這裏存粹就是弄一個方法在這裡，後續不會調用此方法
                }
                await new Promise(resolve=>{
                  for(let days of setPredictDays){ 
                   getSecDate(days).then(res2 =>{
                         predictMainData.push(res2.data); //在這裡將欲預測資料push進predictMainData中，0第一週 1第二週 2第三週
                         if(predictMainData.length == setPredictDays.length){
                            resolve();
                            
                         }
                      })
                    }
                })

                let date = new Date();
                let dateOffset = 0;
                let processData = predictMainData[0]
                let processedData = [];
                for(let i = 1; i <= setPredictDays.length ; i++){
                let tempData = [];
                predictDateVal.forEach((dateVal)=>{
                  
                   date = new Date(dateVal)
                   dateOffset = (24*60*60*1000)*(7*i);
                   date.setTime(date - dateOffset)
                let ans = processData.reduce((prev,curr)=>{
                            return Math.abs( new Date(date)-new Date(prev.time)) < Math.abs(new Date(date)-new Date(curr.time)) ? prev: curr;
                          });
                tempData.push(ans);
                  
                })  
                processedData[i-1] = tempData
                
                }
                this.chartID++;
                this.chartData.datasets.push({});
                this.chartData.datasets[this.chartID].data = [];
                this.chartData.datasets[this.chartID].backgroundColor = "rgba(255,255,255,0.1)";
                this.chartData.datasets[this.chartID].label = name+"(預測)"
                this.chartData.datasets[this.chartID].borderColor = this.colorTemplate[(this.chartID-1)/2];
                for(let i = 1; i< this.chartData.datasets[this.chartID-1].data.length;i++){
                        this.chartData.datasets[this.chartID].data.push(undefined);
                }
                        this.chartData.datasets[this.chartID].data.push(this.chartData.datasets[this.chartID-1].data[this.chartData.datasets[this.chartID-1].data.length-1]);

                await new Promise(resolve=>{
                  var baselineEst = 0;
                  var baseline = 0;
                  var baseDiff = 0;
                  var maxPeo =processedData[0][0].locationPeople[this.selShortID].maxPeo;
                    for(let a = 0;a<processedData[0].length;a++){
                        var estPeo = 0;
                        for(let i = 0;i < processedData.length;i++){
                          estPeo += parseInt(processedData[i][a].locationPeople[this.selShortID].peoNum);
                        }
                        console.log("Array Counts:"+processedData.length)
                        console.log("Est. Poeple:"+estPeo)
                        estPeo = estPeo / processedData.length;
                        this.chartData.datasets[this.chartID].borderDash = [8,5] //點狀圖
                        if(a != 0){
                          let sendData = Math.round(estPeo-baseDiff);
                          if(sendData > maxPeo){
                            sendData = maxPeo;
                          }else if(sendData <=0){
                            sendData = 0;
                          }
                          this.chartData.datasets[this.chartID].data.push(sendData);
                        }else{
                          baselineEst = estPeo;
                          baseline = this.chartData.datasets[this.chartID-1].data[this.chartData.datasets[this.chartID-1].data.length-1];
                          baseDiff = baselineEst - baseline
                        }
                        if(a == processedData[0].length-1)
                        resolve();
                    }

                })

              }
            }
              predictFun().then(()=>{
                this.update(reselect)
                resolve();

            })


              },750);
          })   
      

    },
   async update(reselect){
              this.chartData.datasets.forEach(data=>{
                let alreadyShown = false;
               data.data.forEach(num=>{
                 if(num == undefined){
                   this.alertUndefined++;
                   //use buefy alert

                 }else{
                    this.alertUndefined = 0;
                 }
                 if(this.alertUndefined != 0 && alreadyShown == false){
                    this.$buefy.notification.open({
                              type: 'is-warning',
                              position:'is-top',
                              pauseOnHover:true,
                              message:`${data.label}在此日期無資料`,
                              hasIcon: true
                            })
                     alreadyShown = true;
                 }
               })
              })
              this.chartData ={
                ... this.chartData
              }
              this.chartID++;
              this.ckey++
              if(!reselect){
              this.isLoading=false
              this.showChart = true;
              this.reselectOK = true;
              if(this.selectedLoc.length==this.locations.length){
                this.meme=true
               }

              }
    },
    async clearChart(type){


      if(type == "all"){
        this.clearToggle = false;
        this.ckey= 0;
        this.chartID=0;
        this.chartData.datasets = [];
        this.selectedLoc = [];
        this.selectedID = [];
          this.buttonType.forEach((data,index)=>{
          if(data== "is-info is-light")
            this.buttonType[index]=undefined;
          })
        this.buttonType.forEach((data,index)=>{
          if(data== "is-primary")
            this.buttonType[index]="is-info is-light";
          })
                this.chartData ={
          ... this.chartData
        }
      }
      if(type=='date' && (new Date(this.selectedDate).getTime() >= new Date(this.minDate).getTime()) && new Date(this.selectedDate).getTime()<= new Date(this.maxDate).getTime()){
        if(new Date().getDate()!=new Date(this.selectedDate).getDate()){
            this.showPredict = false
            this.predict = false
          }else if(new Date().getHours()< 21){
              for(let ban of this.bannedDays){
                    if(`${new Date(ban).getMonth()}/${new Date(ban).getDate()}`==`${new Date(new Date(this.selectedDate).getDate())}/${new Date(this.selectedDate).getDate()}`){
                      this.showPredict = false;
                      this.predict = false;
                
                    break;
                    }else{
                      this.showPredict = true;
                      // this.predict = true;
                    }
              }
          }else if(new Date().getHours()==21 && new Date().getMinutes() < 45){
              for(let ban of this.bannedDays){
                    if(`${new Date(ban).getMonth()}/${new Date(ban).getDate()}`==`${new Date(new Date(this.selectedDate).getDate()).getMonth()}/${new Date(this.selectedDate).getDate()}`){
                      this.showPredict = false;
                      this.predict = false
                    break;
                    }else{
                      this.showPredict = true;
                      this.predict = true;
                    }
              }
          //this.showPredict = true;
          }else{
          this.showPredict = false;
          this.predict = false
          }
      

        this.dateChoose = false;
        this.clearToggle = false;
        this.ckey= 0;
        this.chartID=0;
        this.chartData.datasets = [];
        this.chartData ={
          ... this.chartData
        }
        this.menuOptions = "☰";
        let random = (min,max)=>{
          return Math.floor((Math.random()*(max-min)+min));
        }
        this.clearToggle = false
        this.showBtn=true;
        this.isLoading = false
        this.showChart = false
        let origIDArr=Array.from(this.selectedID);
        let origSelLocArr = Array.from(this.selectedLoc);
        this.selectedID = [];
        this.selectedLoc = [];
        let index = 0;
        let divide = 100 / origIDArr.length;
        this.progress = 0;
        //const timer = ms => new Promise(res => setTimeout(res, ms))
          for (let button of origIDArr){
            this.progress+=random(0,5)
            this.loadingEl = `正在載入${origSelLocArr[index]}...（${index+1}/${origIDArr.length}）`
           await this.selectLocation(origSelLocArr[index],button,true)
            //await timer(100)
            
            this.progress += divide;
            index++
            
          }
          this.dateChoose = true;
          this.clearToggle=true
          this.showBtn = false
          this.progress = undefined;
          this.showChart = true
      }
    }

  },
};
</script>

<style>

#app h1{
  color:rgb(240,240,240)
}
#app label{
  color:rgb(240,240,240)

}
#fixedLogo{
  position:fixed;
  /*display:inline-block;*/
  display:none;
  float:right;
  right:0;
  z-index: 9;
  top:0;
}
#logo{
  height:50px;
  margin-top:10px;

}
#logo:hover{
  filter: opacity(.5);
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;

}
html{
background: linear-gradient(90deg, rgba(170,102,232,1) 0%, rgba(0,61,124,1) 100%);

}
@media (min-width:1108px){
  #app{
    display:inline;
    overflow-y:hidden;

  }
  #left{
    width: 20%;
    margin-right: 0;
    padding-left:4%;
    padding-right:4%;
    padding-top:3em;
    display: inline-block;
    height:100vh;
    background-color:rgba(0,0,0,0.5);


    margin-bottom: 0px;
  }
  #right{
    width:70vw;
    height:100vh;
    float:right;
    overflow-y:hidden;
    margin-left:0;
  }
  #rightload{
  width:87%;
  margin-top:40vh;
  overflow-y:hidden;

}
}
@media (max-width:1107px){
  #menu{
    position: fixed;
    top:15px;
    left:8px;
    z-index: 2;

  }
  #left{
    width: 100%;
    height:100%;
    left:0;
    top:0;
    margin-top:0;
    padding-top:3em;
    padding-left: 6vw;
    padding-right:6vw;
    display: inline-block;
    position:absolute;
    z-index: 1;
    -webkit-animation: slideIn .5s forwards;
    -moz-animation: slideIn .5s forwards;
    animation: slideIn .5s forwards;
    backdrop-filter: blur(8px);
    overflow:auto

  }
  #right{
    margin-top:60px;
    position:absolute;
    width:100vw;
    height:calc(100% - 60px);
    z-index:0;
    top:0;

  }
  #rightload{
  width:87%;
  margin-top:40%;
  margin-left:7%
}

}
#meme{
  z-index: 10;
  position:absolute;
  left:24%;
  bottom:0vh;
  display:flex;
  animation : slideInX .5s ease-in-out

}
#meme img{
  bottom:0;
  display:flex-end
}
#meme h1{
  color:#FFF;
  text-shadow: 1px 1px 10px #fff, 1px 1px 10px #ccc;
  -webkit-text-stroke-color: #000;
  -webkit-text-stroke-width: 3px;
  font-size:9em;
  float:left;
  text-align: left;
}
.progress{
  background-color:midnightblue
}
.progress-bar {
  transition: width 0.6s ease-out;
}
canvas{
  color:white
}
#options{
  margin-top:1em;display:block;margin-left:auto;margin-right:auto;
}
@keyframes slideInX {
  0% {
    transform: translateX(-70vh);
    opacity:0;

  }
  100% {
    transform: translateX(0);
    opacity:1;

  }
}
@keyframes slideIn {
  0% {
    transform: translateY(-110vh);
    opacity:0;

  }
  100% {
    transform: translateY(0);
    opacity:1;

  }
}
#resource{
  float:left;
  color:white;
  background-color: rgba(255,255,255,.4);
  padding: 1em 1em 1em 1em;
  display:block;
  width:100%;
  animation: slideInX .5s
}
#resource a:hover{
  color:slateblue
}
#resource a{
  color:white;
  cursor: pointer;
}
#bottom{
  text-align: left;
  margin-top:40%;
  margin-left:auto;
  width:100%;
  margin-right:auto;
  height: 30px;
  
  
}
</style>